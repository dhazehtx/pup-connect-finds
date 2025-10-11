import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    <div className="w-full max-w-md bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
          <CreditCard className="h-6 w-6 text-primary" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Stripe Checkout Demo</h3>
          <p className="text-sm text-muted-foreground">My Pup Service Example</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-3xl font-bold text-foreground">$20.00</p>
        </div>
        
        <Button 
          onClick={handleCheckout}
          disabled={loading}
          className="w-full h-11 bg-primary text-white hover:bg-primary/90"
          data-testid="button-checkout"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4 text-white" />
              Checkout with Stripe
            </>
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground">
          Test mode • No real charges will be made
        </p>
      </div>
    </div>
  );
};

export default StripeCheckoutDemo;