import React, { useState } from 'react';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from "@/lib/queryClient";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface Product {
  id: string;
  name: string;
  unit_price: string;
  stripe_price_id: string;
}

interface StripeProductCheckoutProps {
  product: Product;
  quantity?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CheckoutForm: React.FC<{ product: Product; quantity: number; onSuccess?: () => void; onCancel?: () => void }> = ({ 
  product, 
  quantity, 
  onSuccess, 
  onCancel 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/marketplace?success=true`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: `Thank you for purchasing ${product.name}!`,
        });
        onSuccess?.();
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const totalPrice = (parseFloat(product.unit_price) * quantity).toFixed(2);

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Complete Your Purchase</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>{product.name}</strong></p>
          <p>Quantity: {quantity}</p>
          <p>Unit Price: ${product.unit_price}</p>
          <p className="text-lg font-semibold">Total: ${totalPrice}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PaymentElement />
        
        <div className="flex gap-3">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={processing}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={!stripe || processing}
            className="flex-1"
          >
            {processing ? 'Processing...' : `Pay $${totalPrice}`}
          </Button>
        </div>
      </form>
    </div>
  );
};

const StripeProductCheckout: React.FC<StripeProductCheckoutProps> = ({ 
  product, 
  quantity = 1, 
  onSuccess, 
  onCancel 
}) => {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await apiRequest(`/api/products/${product.id}/checkout`, {
          method: 'POST',
          body: { quantity },
        });
        
        if (response?.checkout_url) {
          // Redirect to Stripe Checkout
          window.location.href = response.checkout_url;
          return;
        }

        const secret = response?.clientSecret || response?.client_secret || response?.data?.clientSecret;
        if (secret) {
          setClientSecret(secret);
        } else {
          throw new Error('No client secret returned from checkout endpoint');
        }
      } catch (error) {
        console.error('Error creating checkout:', error);
        toast({
          title: "Checkout Error",
          description: "Failed to initialize payment. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [product.id, quantity, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Failed to initialize payment</p>
        {onCancel && (
          <Button onClick={onCancel} className="mt-4">
            Go Back
          </Button>
        )}
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm 
        product={product} 
        quantity={quantity} 
        onSuccess={onSuccess} 
        onCancel={onCancel} 
      />
    </Elements>
  );
};

export default StripeProductCheckout;