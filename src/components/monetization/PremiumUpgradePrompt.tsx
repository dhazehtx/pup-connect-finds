
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Zap, Shield, Heart } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface PremiumUpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: 'contact' | 'filters' | 'favorites' | 'matchmaker';
}

const PremiumUpgradePrompt = ({ isOpen, onClose, trigger }: PremiumUpgradePromptProps) => {
  const { createCheckout } = useSubscription();

  const triggerMessages = {
    contact: "Want unlimited breeder contacts?",
    filters: "Looking for more search options?",
    favorites: "Want to save more favorites?",
    matchmaker: "Ready for personalized matches?"
  };

  const features = [
    { icon: Heart, text: "Unlimited breeder contacts", highlight: trigger === 'contact' },
    { icon: Star, text: "Early access to new puppies", highlight: false },
    { icon: Zap, text: "Smart puppy matchmaker", highlight: trigger === 'matchmaker' },
    { icon: Shield, text: "Premium educational content", highlight: false },
    { icon: Crown, text: "Verified premium badge", highlight: false }
  ];

  const handleUpgrade = () => {
    createCheckout('Pro');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            {triggerMessages[trigger]}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 mb-2">
              Upgrade to Premium
            </Badge>
            <p className="text-gray-600 text-sm">
              Unlock all premium features and find your perfect pup faster
            </p>
          </div>

          <div className="space-y-3">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`flex items-center space-x-3 p-2 rounded-lg ${
                  feature.highlight ? 'bg-yellow-50 border border-yellow-200' : ''
                }`}
              >
                <feature.icon className={`w-5 h-5 ${
                  feature.highlight ? 'text-yellow-600' : 'text-gray-500'
                }`} />
                <span className={`text-sm ${
                  feature.highlight ? 'text-yellow-800 font-medium' : 'text-gray-700'
                }`}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">$14.99</div>
              <div className="text-sm text-gray-600">per month</div>
              <div className="text-xs text-green-600 font-medium mt-1">14-day free trial</div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Maybe Later
            </Button>
            <Button 
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
            >
              Start Free Trial
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumUpgradePrompt;
