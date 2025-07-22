
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Zap } from 'lucide-react';
import { useSubscriptionTiers } from '@/hooks/useSubscriptionTiers';
import { useSubscription } from '@/hooks/useSubscription';
import { Link } from 'react-router-dom';

interface TierGateProps {
  requiredTier: 'pro' | 'business';
  feature: string;
  description: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const TierGate = ({ requiredTier, feature, description, children, fallback }: TierGateProps) => {
  const { subscription_tier } = useSubscriptionTiers();
  const { createCheckout } = useSubscription();

  const tierLevels = { basic: 0, pro: 1, business: 2 };
  const currentLevel = tierLevels[subscription_tier];
  const requiredLevel = tierLevels[requiredTier];

  const hasAccess = currentLevel >= requiredLevel;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-yellow-100">
            {requiredTier === 'pro' ? (
              <Crown className="w-8 h-8 text-yellow-600" />
            ) : (
              <Zap className="w-8 h-8 text-purple-600" />
            )}
          </div>
        </div>
        
        <div className="flex justify-center mb-3">
          <Badge variant="outline" className="text-sm">
            <Lock className="w-3 h-3 mr-1" />
            {requiredTier === 'pro' ? 'Pup Pro' : 'Pup Partner'} Feature
          </Badge>
        </div>
        
        <h3 className="text-lg font-semibold mb-2">{feature}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        
        <div className="flex gap-2 justify-center">
          <Button
            onClick={() => createCheckout(requiredTier === 'pro' ? 'Pro' : 'Enterprise')}
            className={`${requiredTier === 'pro' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-purple-500 hover:bg-purple-600'} text-white`}
          >
            Upgrade to {requiredTier === 'pro' ? 'Pup Pro' : 'Pup Partner'}
          </Button>
          <Button variant="outline" asChild>
            <Link to="/monetization">View All Plans</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TierGate;
