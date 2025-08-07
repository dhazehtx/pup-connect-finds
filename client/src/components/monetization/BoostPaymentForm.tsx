import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Zap, Star, TrendingUp } from 'lucide-react';

interface BoostPaymentFormProps {
  clientSecret: string;
  boostType: 'featured_product' | 'boosted_service' | 'premium_listing';
  amount: number;
  itemName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BoostPaymentForm({ 
  clientSecret, 
  boostType, 
  amount, 
  itemName,
  onSuccess,
  onCancel 
}: BoostPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const boostConfig = {
    featured_product: {
      icon: Star,
      title: 'Featured Product',
      description: 'Boost your product to the top of search results',
      benefits: ['Premium placement', 'Increased visibility', '30-day boost'],
      color: 'bg-yellow-100 text-yellow-800',
    },
    boosted_service: {
      icon: TrendingUp,
      title: 'Boosted Service',
      description: 'Increase your service visibility and bookings',
      benefits: ['Priority listing', 'More customer views', '30-day boost'],
      color: 'bg-blue-100 text-blue-800',
    },
    premium_listing: {
      icon: Zap,
      title: 'Premium Listing',
      description: 'Get maximum exposure for your listing',
      benefits: ['Top placement', 'Featured badge', '30-day promotion'],
      color: 'bg-purple-100 text-purple-800',
    },
  };

  const config = boostConfig[boostType];
  const IconComponent = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/marketplace`,
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
          title: "Boost Activated!",
          description: `Your ${itemName} is now boosted for 30 days.`,
        });
        onSuccess?.();
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <IconComponent className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            {config.title}
            <Badge className={config.color}>
              ${amount}
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {config.description}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">What you get:</h4>
              <ul className="space-y-1">
                {config.benefits.map((benefit, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Boosting:</strong> {itemName}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Active for 30 days from payment confirmation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            
            <div className="flex gap-3">
              <Button 
                type="submit" 
                disabled={!stripe || isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Processing...' : `Pay $${amount}`}
              </Button>
              
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={onCancel}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-muted-foreground">
        <p>Payments are securely processed by Stripe</p>
        <p>Boost activates immediately upon successful payment</p>
      </div>
    </div>
  );
}