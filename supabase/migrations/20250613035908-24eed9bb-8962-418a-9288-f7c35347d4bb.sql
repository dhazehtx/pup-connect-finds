
-- Add refund tracking columns to escrow_transactions table
ALTER TABLE public.escrow_transactions 
ADD COLUMN IF NOT EXISTS dispute_resolution TEXT,
ADD COLUMN IF NOT EXISTS dispute_resolution_notes TEXT,
ADD COLUMN IF NOT EXISTS refund_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_processed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refund_stripe_id TEXT,
ADD COLUMN IF NOT EXISTS fraud_flags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS auto_refund_eligible BOOLEAN DEFAULT false;

-- Create refund_requests table for tracking refund history
CREATE TABLE IF NOT EXISTS public.refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_transaction_id UUID REFERENCES public.escrow_transactions(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL,
  refund_reason TEXT NOT NULL,
  refund_type TEXT NOT NULL CHECK (refund_type IN ('full', 'cancelled', 'fraud', 'admin_approved')),
  admin_notes TEXT,
  processed_by UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
  refund_amount NUMERIC NOT NULL,
  stripe_refund_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create fraud_detection_events table
CREATE TABLE IF NOT EXISTS public.fraud_detection_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  listing_id UUID,
  escrow_transaction_id UUID REFERENCES public.escrow_transactions(id),
  event_type TEXT NOT NULL,
  risk_score NUMERIC NOT NULL DEFAULT 0,
  detection_method TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  auto_action_taken TEXT,
  reviewed_by UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'false_positive', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- Enable RLS on new tables
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_detection_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for refund_requests
CREATE POLICY "Users can view their own refund requests"
  ON public.refund_requests
  FOR SELECT
  USING (
    requester_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.escrow_transactions et 
      WHERE et.id = refund_requests.escrow_transaction_id 
      AND (et.buyer_id = auth.uid() OR et.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can create refund requests for their transactions"
  ON public.refund_requests
  FOR INSERT
  WITH CHECK (
    requester_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.escrow_transactions et 
      WHERE et.id = refund_requests.escrow_transaction_id 
      AND (et.buyer_id = auth.uid() OR et.seller_id = auth.uid())
    )
  );

-- RLS policies for fraud_detection_events (admin/system only for most operations)
CREATE POLICY "Users can view fraud events related to their transactions"
  ON public.fraud_detection_events
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.escrow_transactions et 
      WHERE et.id = fraud_detection_events.escrow_transaction_id 
      AND (et.buyer_id = auth.uid() OR et.seller_id = auth.uid())
    )
  );

-- Function to automatically process eligible refunds
CREATE OR REPLACE FUNCTION public.process_automatic_refund(
  escrow_transaction_id_param UUID,
  refund_reason TEXT,
  refund_type TEXT DEFAULT 'cancelled'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  transaction_record RECORD;
  refund_request_id UUID;
  result JSONB;
BEGIN
  -- Get transaction details
  SELECT * INTO transaction_record
  FROM public.escrow_transactions
  WHERE id = escrow_transaction_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;
  
  -- Check if auto refund is eligible
  IF NOT transaction_record.auto_refund_eligible THEN
    RAISE EXCEPTION 'Transaction not eligible for automatic refund';
  END IF;
  
  -- Create refund request
  INSERT INTO public.refund_requests (
    escrow_transaction_id,
    requester_id,
    refund_reason,
    refund_type,
    status,
    refund_amount
  ) VALUES (
    escrow_transaction_id_param,
    COALESCE(auth.uid(), transaction_record.buyer_id),
    refund_reason,
    refund_type,
    'approved',
    transaction_record.amount
  ) RETURNING id INTO refund_request_id;
  
  -- Update escrow transaction
  UPDATE public.escrow_transactions
  SET 
    status = 'refunded',
    refund_amount = transaction_record.amount,
    dispute_resolution = 'automatic_refund',
    dispute_resolution_notes = refund_reason,
    updated_at = now()
  WHERE id = escrow_transaction_id_param;
  
  result := jsonb_build_object(
    'success', true,
    'refund_request_id', refund_request_id,
    'amount', transaction_record.amount,
    'message', 'Automatic refund processed successfully'
  );
  
  RETURN result;
END;
$$;

-- Function to detect and flag potential fraud
CREATE OR REPLACE FUNCTION public.flag_potential_fraud(
  transaction_id UUID,
  event_type TEXT,
  risk_score NUMERIC,
  details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  fraud_event_id UUID;
  transaction_record RECORD;
BEGIN
  -- Get transaction details
  SELECT * INTO transaction_record
  FROM public.escrow_transactions
  WHERE id = transaction_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;
  
  -- Create fraud detection event
  INSERT INTO public.fraud_detection_events (
    escrow_transaction_id,
    user_id,
    listing_id,
    event_type,
    risk_score,
    detection_method,
    details,
    auto_action_taken
  ) VALUES (
    transaction_id,
    transaction_record.buyer_id,
    transaction_record.listing_id,
    event_type,
    risk_score,
    'system_automated',
    details,
    CASE 
      WHEN risk_score >= 0.8 THEN 'transaction_flagged'
      WHEN risk_score >= 0.6 THEN 'manual_review_required'
      ELSE 'logged_only'
    END
  ) RETURNING id INTO fraud_event_id;
  
  -- Update transaction with fraud flags if high risk
  IF risk_score >= 0.6 THEN
    UPDATE public.escrow_transactions
    SET fraud_flags = fraud_flags || jsonb_build_object(
      'event_id', fraud_event_id,
      'risk_score', risk_score,
      'flagged_at', now()
    )
    WHERE id = transaction_id;
  END IF;
  
  RETURN fraud_event_id;
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_refund_requests_escrow_transaction ON public.refund_requests(escrow_transaction_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON public.refund_requests(status);
CREATE INDEX IF NOT EXISTS idx_fraud_events_transaction ON public.fraud_detection_events(escrow_transaction_id);
CREATE INDEX IF NOT EXISTS idx_fraud_events_risk_score ON public.fraud_detection_events(risk_score);
CREATE INDEX IF NOT EXISTS idx_escrow_fraud_flags ON public.escrow_transactions USING gin(fraud_flags);
