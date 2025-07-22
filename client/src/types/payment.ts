
export interface PaymentMethod {
  id: string;
  user_id: string;
  stripe_payment_method_id: string;
  type: 'card' | 'bank_account' | 'apple_pay' | 'google_pay';
  brand?: string;
  last_four?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface EscrowTransaction {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  seller_amount: number;
  commission_amount: number;
  commission_rate: number;
  status: 'pending' | 'funded' | 'confirmed' | 'released' | 'cancelled' | 'disputed' | 'refunded';
  stripe_payment_intent_id: string;
  buyer_confirmed_at?: string;
  seller_confirmed_at?: string;
  meeting_location?: string;
  meeting_scheduled_at?: string;
  funds_released_at?: string;
  dispute_reason?: string;
  dispute_resolution?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentPlan {
  id: string;
  user_id: string;
  listing_id: string;
  total_amount: number;
  down_payment: number;
  monthly_payment: number;
  number_of_payments: number;
  payments_made: number;
  next_payment_date: string;
  status: 'active' | 'completed' | 'cancelled' | 'defaulted';
  created_at: string;
  updated_at: string;
}

export interface RefundRequest {
  id: string;
  escrow_transaction_id: string;
  requester_id: string;
  refund_reason: string;
  refund_type: 'full' | 'partial';
  refund_amount: number;
  status: 'pending' | 'approved' | 'denied' | 'processed';
  admin_notes?: string;
  processed_by?: string;
  processed_at?: string;
  stripe_refund_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DisputeResolution {
  id: string;
  escrow_transaction_id: string;
  dispute_type: 'quality' | 'delivery' | 'fraud' | 'other';
  description: string;
  evidence_urls: string[];
  resolution: 'buyer_favor' | 'seller_favor' | 'partial_refund' | 'mediation';
  resolution_amount?: number;
  resolved_by: string;
  resolved_at?: string;
  created_at: string;
}
