import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface BuyButtonProps {
  productId: string;
  priceId?: string;
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
  const navigate = useNavigate();

  const handleBuyNow = async () => {
    if (!user) {
      toast({
        title: "Please sign in to checkout",
        description: "You need an account to complete your purchase.",
        variant: "destructive"
      });
      navigate('/greeting');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          cartItems: [{ id: productId, quantity }],
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.error('BuyButton API error:', data);
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: error.message || "Unable to start checkout process. Please try again.",
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
      className={className}
      size="sm"
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