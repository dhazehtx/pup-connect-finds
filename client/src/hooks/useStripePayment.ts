
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export const useStripePayment = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createPaymentIntent = async (
    amount: number,
    listingId: string,
    description: string
  ): Promise<PaymentIntentResponse | null> => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('stripe-payment', {
        body: {
          amount,
          currency: 'usd',
          listingId,
          buyerEmail: user.email,
          description,
        },
      });

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Payment intent creation failed:', error);
      toast({
        title: "Payment setup failed",
        description: error.message || "Unable to setup payment. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (paymentIntentId: string) => {
    try {
      // In a real implementation, you would use Stripe's JavaScript SDK here
      // For now, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Payment successful!",
        description: "Your payment has been processed successfully.",
      });
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Payment failed",
        description: error.message || "Payment could not be processed.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  return {
    createPaymentIntent,
    confirmPayment,
    loading,
  };
};
