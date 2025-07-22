
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Check, Loader2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StripeCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  productType: 'premium' | 'pupbox';
  planDetails?: {
    name: string;
    price: number;
    features: string[];
    popular?: boolean;
    purchaseType?: 'subscription' | 'one-time';
  };
}

const StripeCheckout = ({ isOpen, onClose, productType, planDetails }: StripeCheckoutProps) => {
  const [loading, setLoading] = useState(false);
  const { user, session } = useAuth();
  const { toast } = useToast();

  const defaultPlans = {
    premium: {
      name: 'Pup Pro',
      price: 14.99,
      features: [
        'Unlimited breeder contacts',
        'Early access to new puppies',
        'Smart puppy matchmaker',
        'Premium educational content',
        'Verified premium badge',
        'Priority customer support'
      ],
      popular: true,
      purchaseType: 'subscription' as const
    },
    pupbox: {
      name: 'Monthly Pup Box',
      price: 29.99,
      features: [
        'Monthly surprise box delivery',
        'Premium toys and treats',
        'Customized for your dog\'s size',
        'Educational content included',
        'Free shipping nationwide',
        'Cancel anytime'
      ],
      popular: false,
      purchaseType: 'subscription' as const
    }
  };

  const plan = planDetails || defaultPlans[productType];
  const isOneTime = plan.purchaseType === 'one-time';

  const handleCheckout = async () => {
    if (!user || !session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to subscribe",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const checkoutData = {
        tier: productType === 'premium' ? 'Pro' : 'PupBox',
        productType,
        trialDays: productType === 'premium' && !isOneTime ? 14 : 0,
        purchaseType: plan.purchaseType || 'subscription',
        price: plan.price
      };

      const functionName = isOneTime ? 'create-payment' : 'create-checkout';
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: checkoutData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        
        toast({
          title: `Redirecting to ${isOneTime ? 'payment' : 'checkout'}`,
          description: "Opening Stripe checkout in a new tab...",
        });
        
        onClose();
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: error.message || "Unable to start checkout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {productType === 'premium' ? (
                <Crown className="w-5 h-5 text-yellow-600" />
              ) : (
                <Star className="w-5 h-5 text-blue-600" />
              )}
              {isOneTime ? 'Purchase' : 'Subscribe to'} {plan.name}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <Card className="border-2 border-blue-200">
          <CardHeader className="text-center pb-4">
            {plan.popular && (
              <Badge className="mx-auto mb-2 bg-blue-600 text-white">Most Popular</Badge>
            )}
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <div className="text-3xl font-bold text-blue-600">
              ${plan.price}
              {!isOneTime && <span className="text-base font-normal text-gray-600">/month</span>}
            </div>
            {productType === 'premium' && !isOneTime && (
              <p className="text-sm text-green-600 font-medium">14-day free trial</p>
            )}
            {isOneTime && (
              <p className="text-sm text-purple-600 font-medium">One-time purchase</p>
            )}
          </CardHeader>

          <CardContent>
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : isOneTime ? (
                `Buy Now for $${plan.price}`
              ) : (
                `Subscribe for $${plan.price}/month`
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-3">
              {isOneTime ? 'One-time payment' : 'Cancel anytime'} • Secure payment by Stripe
            </p>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default StripeCheckout;
