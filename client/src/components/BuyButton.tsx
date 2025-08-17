import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface BuyButtonProps {
  productId: string;
  priceId: string;
  quantity?: number;
  className?: string;
  children?: React.ReactNode;
}

export default function BuyButton({ 
  productId, 
  priceId, 
  quantity = 1, 
  className = "",
  children
}: BuyButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleBuyNow = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to make a purchase",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiRequest('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          price_id: priceId,
          quantity,
          user_id: user.id
        })
      });

      if (response.url) {
        // Redirect to Stripe checkout
        window.location.href = response.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: "Unable to start checkout process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleBuyNow}
      disabled={isLoading}
      className={`btn--primary ${className}`}
      size="sm"
      data-testid="button-buy-now"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          {children || 'Buy Now'}
        </>
      )}
    </Button>
  );
}