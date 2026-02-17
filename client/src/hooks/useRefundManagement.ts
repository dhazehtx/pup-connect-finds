import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
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
      const res = await apiRequest('/api/refunds/request', {
        method: 'POST',
        body: JSON.stringify({
          transaction_id: escrowTransactionId,
          reason: refundReason === 'full' ? 'other' : refundReason,
          detailed_reason: refundReason,
          refund_amount: 0,
          refund_type: refundType,
        }),
      });
      const data = await res.json();

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

      const res = await apiRequest(`/api/refunds/admin/${refundRequestId}/action`, {
        method: 'POST',
        body: JSON.stringify({
          action: adminApproval ? 'approve' : 'decline',
          admin_notes: adminApproval ? 'Admin approved' : undefined,
        }),
      });
      const data = await res.json();

      toast({
        title: "Refund Processed",
        description: data.message || "Refund has been processed successfully.",
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
      const res = await apiRequest('/api/refunds/request', {
        method: 'POST',
        body: JSON.stringify({
          transaction_id: escrowTransactionId,
          reason: 'canceled_order',
          detailed_reason: refundReason,
          refund_amount: 0,
          refund_type: refundType,
        }),
      });
      const data = await res.json();

      toast({
        title: "Automatic Refund Processed",
        description: data.message || "Refund processed successfully",
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

      const res = await apiRequest('/api/fraud/flag', {
        method: 'POST',
        body: JSON.stringify({
          transactionId,
          eventType,
          userBehavior,
          transactionDetails,
        }),
      });
      const data = await res.json();

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
      const url = status
        ? `/api/refunds/user?status=${status}`
        : '/api/refunds/user';
      const res = await apiRequest(url);
      const data = await res.json();
      return data.refunds || [];
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
      const url = status
        ? `/api/fraud/events?status=${status}`
        : '/api/fraud/events';
      const res = await apiRequest(url);
      const data = await res.json();
      return data.events || [];
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
