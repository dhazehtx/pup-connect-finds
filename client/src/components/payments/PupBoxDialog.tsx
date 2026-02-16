import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, Heart, Star, Truck, Shield, Package } from 'lucide-react';
import { usePayments } from '@/hooks/usePayments';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PupBoxDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const PupBoxDialog: React.FC<PupBoxDialogProps> = ({ isOpen, onClose }) => {
  const [selectedBox, setSelectedBox] = useState<'starter' | 'deluxe' | 'premium'>('deluxe');
  const { createPaymentIntent, processing } = usePayments();
  const { user } = useAuth();
  const { toast } = useToast();

  const boxes = {
    starter: {
      name: 'Starter Pup Box',
      price: 29.99,
      description: 'Perfect for new puppy parents',
      items: ['Premium puppy food sample', 'Training treats', 'Chew toy', 'Waste bags', 'Puppy care guide'],
      value: '$45',
    },
    deluxe: {
      name: 'Deluxe Pup Box',
      price: 49.99,
      description: 'Most popular choice for growing pups',
      items: ['Premium puppy food (1lb bag)', 'Training treats variety pack', '2 interactive toys', 'Grooming supplies', 'Health supplements', 'Training guide', 'Surprise treats'],
      value: '$80',
      popular: true,
    },
    premium: {
      name: 'Premium Pup Box',
      price: 79.99,
      description: 'Ultimate care package for your beloved pup',
      items: ['Premium puppy food (2lb bag)', 'Gourmet treat selection', '3 premium toys', 'Complete grooming kit', 'Health & wellness supplements', 'Training accessories', 'Personalized care plan', 'Monthly follow-up'],
      value: '$120',
    },
  };

  const features = [
    {
      icon: <Gift className="w-5 h-5 text-purple-500" />,
      title: 'Curated Items',
      description: 'Hand-picked products by pet experts',
    },
    {
      icon: <Shield className="w-5 h-5 text-green-500" />,
      title: 'Quality Guaranteed', 
      description: 'Premium brands and safety tested',
    },
    {
      icon: <Truck className="w-5 h-5 text-blue-500" />,
      title: 'Fast Shipping',
      description: 'Delivered to your door in 3-5 days',
    },
    {
      icon: <Heart className="w-5 h-5 text-red-500" />,
      title: 'Puppy Approved',
      description: 'Loved by thousands of happy pups',
    },
  ];

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase a Pup Box",
        variant: "destructive",
      });
      return;
    }

    const currentBox = boxes[selectedBox];
    
    const result = await createPaymentIntent({
      amount: currentBox.price,
      productType: 'pup_box',
      metadata: {
        boxType: selectedBox,
        boxName: currentBox.name,
      },
    });

    if (result?.clientSecret) {
      // Here you would normally integrate with Stripe Elements
      // For now, we'll just show a success message
      toast({
        title: "Payment Initiated",
        description: `Processing payment for ${currentBox.name}`,
      });
      onClose();
    }
  };

  const currentBox = boxes[selectedBox];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Package className="w-6 h-6 text-purple-500" />
            Choose Your Pup Box
          </DialogTitle>
        </DialogHeader>

        {/* Box Selection */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {Object.entries(boxes).map(([key, box]) => (
            <Card
              key={key}
              className={`p-4 cursor-pointer border-2 transition-colors relative ${
                selectedBox === key
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedBox(key as any)}
            >
              {box.popular && (
                <Badge className="absolute -top-2 left-4 bg-purple-500">
                  Most Popular
                </Badge>
              )}
              <div className="text-center">
                <h3 className="font-semibold text-lg">{box.name}</h3>
                <div className="text-3xl font-bold text-purple-600 my-2">
                  ${box.price}
                </div>
                <p className="text-sm text-gray-600 mb-3">{box.description}</p>
                <div className="text-xs text-green-600 font-medium mb-4">
                  Value: {box.value}
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm mb-2">Includes:</p>
                  <ul className="text-xs space-y-1">
                    {box.items.map((item, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <Star className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Features */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Why Choose Pup Box?</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  {feature.icon}
                </div>
                <h4 className="font-medium text-sm">{feature.title}</h4>
                <p className="text-xs text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-left">
            <p className="font-semibold">{currentBox.name}</p>
            <p className="text-sm text-gray-600">One-time purchase: ${currentBox.price}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handlePurchase}
              disabled={processing}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {processing ? 'Processing...' : `Purchase $${currentBox.price}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PupBoxDialog;