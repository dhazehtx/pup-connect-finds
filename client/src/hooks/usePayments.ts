import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CreateSubscriptionParams {
  productType: 'premium' | 'pupbox';
  priceId: string;
  trialDays?: number;
}

interface CreatePaymentParams {
  amount: number;
  productType: 'pupbox_onetime' | 'rehoming_feature';
  metadata?: Record<string, string>;
}

export const usePayments = () => {
  const [processing, setProcessing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const createSubscriptionCheckout = useCallback(async ({ productType, priceId, trialDays = 0 }: CreateSubscriptionParams) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe",
        variant: "destructive"
      });
      return null;
    }

    setProcessing(true);
    try {
      const response = await apiRequest('/api/create-subscription-checkout', {
        method: 'POST',
        body: {
          userId: user.id,
          productType,
          priceId,
          trialDays
        }
      });

      const data = await response.json();
      
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
        return { success: true, sessionId: data.sessionId };
      }
      
      return data;
    } catch (error: any) {
      console.error('Subscription checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: error.message || "Unable to start checkout. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setProcessing(false);
    }
  }, [user?.id, toast]);

  const createPaymentIntent = useCallback(async ({ amount, productType, metadata }: CreatePaymentParams) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make a purchase",
        variant: "destructive"
      });
      return null;
    }

    setProcessing(true);
    try {
      const response = await apiRequest('/api/payments/create-payment-intent', {
        method: 'POST',
        body: {
          userId: user.id,
          amount,
          productType,
          metadata
        }
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Payment intent error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Unable to create payment. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setProcessing(false);
    }
  }, [user?.id, toast]);

  const getSubscriptionStatus = useCallback(async () => {
    if (!user?.id) return null;

    try {
      const response = await apiRequest(`/api/payments/subscription-status/${user.id}`);
      const data = await response.json();
      setSubscriptionStatus(data);
      return data;
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      return null;
    }
  }, [user?.id]);

  const createSubscription = useCallback(async ({ priceId }: { priceId: string }) => {
    if (!user?.id || !user.email) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe",
        variant: "destructive"
      });
      return null;
    }

    setProcessing(true);
    try {
      const response = await apiRequest('/api/payments/create-subscription', {
        method: 'POST',
        body: {
          userId: user.id,
          email: user.email,
          priceId
        }
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Create subscription error:', error);
      toast({
        title: "Subscription Failed",
        description: error.message || "Unable to create subscription. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setProcessing(false);
    }
  }, [user?.id, user?.email, toast]);

  return {
    processing,
    subscriptionStatus,
    createSubscriptionCheckout,
    createPaymentIntent,
    getSubscriptionStatus,
    createSubscription
  };
};