
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RefundRequest {
  id: string;
  escrow_transaction_id: string;
  requester_id: string;
  refund_reason: string;
  refund_type: 'full' | 'cancelled' | 'fraud' | 'admin_approved';
  admin_notes?: string;
  processed_by?: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  refund_amount: number;
  stripe_refund_id?: string;
  created_at: string;
  processed_at?: string;
  escrow_transactions?: {
    stripe_payment_intent_id: string;
    amount: number;
    buyer_id: string;
    seller_id: string;
    dog_listings?: {
      dog_name: string;
      breed: string;
    } | null;
  };
}

export interface FraudEvent {
  id: string;
  escrow_transaction_id: string;
  user_id: string;
  event_type: string;
  risk_score: number;
  detection_method: string;
  details: any;
  auto_action_taken?: string;
  status: 'pending' | 'confirmed' | 'false_positive' | 'resolved';
  created_at: string;
  reviewed_at?: string;
}

export const useRefundManagement = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFlagginFraud, setIsFlagginFraud] = useState(false);
  const { toast } = useToast();

  const createRefundRequest = async (
    escrowTransactionId: string,
    refundReason: string,
    refundType: RefundRequest['refund_type'] = 'full'
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get transaction details to determine refund amount
      const { data: transaction, error: txError } = await supabase
        .from('escrow_transactions')
        .select('amount, buyer_id, seller_id')
        .eq('id', escrowTransactionId)
        .single();

      if (txError || !transaction) throw new Error('Transaction not found');

      // Verify user is involved in the transaction
      if (transaction.buyer_id !== user.id && transaction.seller_id !== user.id) {
        throw new Error('Unauthorized to request refund for this transaction');
      }

      const { data, error } = await supabase
        .from('refund_requests')
        .insert({
          escrow_transaction_id: escrowTransactionId,
          requester_id: user.id,
          refund_reason: refundReason,
          refund_type: refundType,
          refund_amount: transaction.amount, // Always full refund
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Refund Request Created",
        description: "Your refund request has been submitted for review.",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Failed to Create Refund Request",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const processRefund = async (refundRequestId: string, adminApproval = false) => {
    try {
      setIsProcessing(true);

      const { data, error } = await supabase.functions.invoke('process-refund', {
        body: {
          refundRequestId,
          adminApproval
        }
      });

      if (error) throw error;

      toast({
        title: "Refund Processed",
        description: `Refund of $${data.amount} has been processed successfully.`,
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Failed to Process Refund",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const processAutomaticRefund = async (
    escrowTransactionId: string,
    refundReason: string,
    refundType: string = 'cancelled'
  ) => {
    try {
      const { data, error } = await supabase.rpc('process_automatic_refund', {
        escrow_transaction_id_param: escrowTransactionId,
        refund_reason: refundReason,
        refund_type: refundType
      });

      if (error) throw error;

      const responseData = data as { message?: string; success?: boolean };
      toast({
        title: "Automatic Refund Processed",
        description: responseData.message || "Refund processed successfully",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Failed to Process Automatic Refund",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const flagFraud = async (
    transactionId: string,
    eventType: string,
    userBehavior?: any,
    transactionDetails?: any
  ) => {
    try {
      setIsFlagginFraud(true);

      const { data, error } = await supabase.functions.invoke('fraud-detection', {
        body: {
          transactionId,
          eventType,
          userBehavior,
          transactionDetails
        }
      });

      if (error) throw error;

      if (data.risk_score >= 0.6) {
        toast({
          title: "Fraud Risk Detected",
          description: `Risk Score: ${(data.risk_score * 100).toFixed(0)}% - ${data.recommendation}`,
          variant: "destructive",
        });
      }

      return data;
    } catch (error: any) {
      toast({
        title: "Failed to Process Fraud Detection",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsFlagginFraud(false);
    }
  };

  const fetchRefundRequests = async (status?: string): Promise<RefundRequest[]> => {
    try {
      let query = supabase
        .from('refund_requests')
        .select(`
          *,
          escrow_transactions!inner (
            stripe_payment_intent_id,
            amount,
            buyer_id,
            seller_id,
            dog_listings!listing_id (
              dog_name,
              breed
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Transform the data to match our interface
      const transformedData: RefundRequest[] = (data || []).map(item => ({
        id: item.id,
        escrow_transaction_id: item.escrow_transaction_id,
        requester_id: item.requester_id,
        refund_reason: item.refund_reason,
        refund_type: item.refund_type,
        admin_notes: item.admin_notes,
        processed_by: item.processed_by,
        status: item.status,
        refund_amount: item.refund_amount,
        stripe_refund_id: item.stripe_refund_id,
        created_at: item.created_at,
        processed_at: item.processed_at,
        escrow_transactions: item.escrow_transactions ? {
          stripe_payment_intent_id: item.escrow_transactions.stripe_payment_intent_id,
          amount: item.escrow_transactions.amount,
          buyer_id: item.escrow_transactions.buyer_id,
          seller_id: item.escrow_transactions.seller_id,
          dog_listings: item.escrow_transactions.dog_listings ? {
            dog_name: item.escrow_transactions.dog_listings.dog_name,
            breed: item.escrow_transactions.dog_listings.breed
          } : null
        } : undefined
      }));

      return transformedData;
    } catch (error: any) {
      toast({
        title: "Failed to Fetch Refund Requests",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  const fetchFraudEvents = async (status?: string): Promise<FraudEvent[]> => {
    try {
      let query = supabase
        .from('fraud_detection_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []) as FraudEvent[];
    } catch (error: any) {
      toast({
        title: "Failed to Fetch Fraud Events",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  return {
    createRefundRequest,
    processRefund,
    processAutomaticRefund,
    flagFraud,
    fetchRefundRequests,
    fetchFraudEvents,
    isProcessing,
    isFlagginFraud
  };
};
