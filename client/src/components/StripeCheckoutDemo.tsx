import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// SOL:CHECKOUT:START
const StripeCheckoutDemo = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { url } = await response.json();
      
      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Error',
        description: error.message || 'Failed to start checkout process',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 md:px-6 py-6">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 md:p-8 text-center">
        <div className="space-y-4">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 grid place-content-center">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          
          {/* Heading */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Stripe Checkout Demo</h2>
            <p className="text-sm text-gray-600">My Pup Service Example</p>
          </div>

          {/* Price Display */}
          <div className="flex justify-center">
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-3 w-fit">
              <p className="text-2xl font-bold tracking-tight text-gray-900">$20.00</p>
            </div>
          </div>
          
          {/* Primary CTA Button */}
          <Button 
            onClick={handleCheckout}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white h-11 rounded-xl px-5 inline-flex items-center gap-2"
            data-testid="button-checkout"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 text-white" />
                <span>Checkout with Stripe</span>
              </>
            )}
          </Button>
          
          {/* Test Mode Note */}
          <p className="text-xs text-gray-500 mt-3">
            Test mode • No real charges will be made
          </p>
        </div>
      </div>
    </div>
  );
};
// SOL:CHECKOUT:END

export default StripeCheckoutDemo;
