import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PaymentIntentRequest {
  amount: number;
  currency?: string;
  productType: 'pup_box' | 'rehoming_feature';
  metadata?: Record<string, string>;
}

interface SubscriptionRequest {
  priceId?: string;
}

interface PaymentHistory {
  id: string;
  type: string;
  amount: string;
  currency: string;
  status: string;
  product_type: string;
  created_at: string;
}

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  plan: 'free' | 'premium';
  subscription?: {
    id: string;
    status: string;
    current_period_end: number;
    cancel_at_period_end: boolean;
  };
}

export const usePayments = () => {
  const [processing, setProcessing] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const createPaymentIntent = async (request: PaymentIntentRequest) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to make a purchase",
        variant: "destructive",
      });
      return null;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          userId: user.id,
          metadata: {
            userEmail: user.email,
            ...request.metadata,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payment intent');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : 'Failed to process payment',
        variant: "destructive",
      });
      return null;
    } finally {
      setProcessing(false);
    }
  };

  const createSubscription = async (request: SubscriptionRequest = {}) => {
    if (!user) {
      toast({
        title: "Authentication required", 
        description: "Please log in to subscribe",
        variant: "destructive",
      });
      return null;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          priceId: request.priceId || 'price_premium_monthly',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create subscription');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        title: "Subscription Error",
        description: error instanceof Error ? error.message : 'Failed to create subscription',
        variant: "destructive",
      });
      return null;
    } finally {
      setProcessing(false);
    }
  };

  const getSubscriptionStatus = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/payments/subscription-status/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus(data);
        return data;
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
  };

  const cancelSubscription = async (subscriptionId: string) => {
    if (!user) return false;

    setProcessing(true);
    try {
      const response = await fetch('/api/payments/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          subscriptionId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel subscription');
      }

      toast({
        title: "Subscription Canceled",
        description: "Your subscription will end at the end of the current billing period",
      });

      // Refresh subscription status
      await getSubscriptionStatus();
      return true;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: "Cancellation Error",
        description: error instanceof Error ? error.message : 'Failed to cancel subscription',
        variant: "destructive",
      });
      return false;
    } finally {
      setProcessing(false);
    }
  };

  const getPaymentHistory = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/payments/history/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setPaymentHistory(data);
        return data;
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  return {
    processing,
    paymentHistory,
    subscriptionStatus,
    createPaymentIntent,
    createSubscription,
    getSubscriptionStatus,
    cancelSubscription,
    getPaymentHistory,
  };
};