
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Star, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface PromotionTier {
  id: string;
  name: string;
  price: number;
  duration: number; // days
  features: string[];
  boost: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface PromotionManagerProps {
  listingId: string;
  listingTitle: string;
}

const PromotionManager = ({ listingId, listingTitle }: PromotionManagerProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const promotionTiers: PromotionTier[] = [
    {
      id: 'basic',
      name: 'Basic Boost',
      price: 25,
      duration: 7,
      features: ['2x visibility', 'Search priority', '7 days featured'],
      boost: '2x',
      icon: Star,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'featured',
      name: 'Featured',
      price: 45,
      duration: 14,
      features: ['4x visibility', 'Top search results', '14 days featured', 'Homepage placement'],
      boost: '4x',
      icon: Zap,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'premium',
      name: 'Premium Spotlight',
      price: 75,
      duration: 30,
      features: ['10x visibility', 'Premium placement', '30 days featured', 'Social media boost', 'Analytics report'],
      boost: '10x',
      icon: Crown,
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const purchasePromotion = async (tier: PromotionTier) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to promote your listing",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-promotion-payment', {
        body: {
          listingId,
          listingTitle,
          tierName: tier.name,
          amount: tier.price * 100, // Convert to cents
          duration: tier.duration,
          userEmail: user.email
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }

    } catch (error: any) {
      toast({
        title: "Promotion Failed",
        description: error.message || "Unable to process promotion",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Boost Your Listing</h3>
        <p className="text-gray-600">Get more views and faster results with promoted listings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {promotionTiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <Card key={tier.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tier.color}`} />
              
              <CardHeader className="text-center pb-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${tier.color} flex items-center justify-center mx-auto mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <div className="text-3xl font-bold text-primary">${tier.price}</div>
                <Badge variant="secondary" className="w-fit mx-auto">
                  {tier.boost} boost for {tier.duration} days
                </Badge>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => purchasePromotion(tier)}
                  disabled={isProcessing}
                  className={`w-full bg-gradient-to-r ${tier.color} hover:opacity-90 text-white`}
                >
                  {isProcessing ? 'Processing...' : `Promote for $${tier.price}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-6 text-center">
          <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h4 className="text-lg font-semibold mb-2">Why Promote?</h4>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Promoted listings get 5-10x more views and sell 3x faster. 
            Stand out from the competition and find the perfect home for your dog sooner.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromotionManager;
