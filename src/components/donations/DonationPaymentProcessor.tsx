
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Heart } from 'lucide-react';

interface DonationPaymentProcessorProps {
  recipientId: string;
  recipientName: string;
  amount: number;
  onSuccess?: () => void;
}

const DonationPaymentProcessor = ({
  recipientId,
  recipientName,
  amount,
  onSuccess
}: DonationPaymentProcessorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const processDonation = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make a donation",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create donation payment session
      const { data, error } = await supabase.functions.invoke('create-donation-payment', {
        body: {
          amount: amount * 100, // Convert to cents
          recipientId,
          recipientName,
          donorEmail: user.email,
          description: `Donation to ${recipientName}`
        }
      });

      if (error) throw error;

      // Redirect to Stripe checkout
      if (data?.url) {
        window.open(data.url, '_blank');
        onSuccess?.();
      }

    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Unable to process donation",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={processDonation}
      disabled={isProcessing}
      className="bg-green-500 hover:bg-green-600 text-white"
    >
      {isProcessing ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          Processing...
        </>
      ) : (
        <>
          <Heart className="w-4 h-4 mr-2" />
          Donate ${amount}
        </>
      )}
    </Button>
  );
};

export default DonationPaymentProcessor;
