
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Truck, Heart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DoggyBoxPromotion = () => {
  const navigate = useNavigate();

  return (
    <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Gift className="h-6 w-6" />
          <Badge className="bg-white/20 text-white">NEW!</Badge>
        </div>
        <CardTitle className="text-2xl">Doggy Subscription Boxes</CardTitle>
        <p className="text-purple-100">
          Monthly curated boxes of toys, treats, and essentials tailored for your dog
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-purple-200" />
            <span>Size & breed customized</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-purple-200" />
            <span>Free shipping included</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-purple-200" />
            <span>100% satisfaction guarantee</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="text-3xl font-bold">Starting at $19.99/month</div>
            <div className="text-purple-100 text-sm">Skip or cancel anytime</div>
          </div>
          <Button 
            onClick={() => navigate('/doggy-boxes')}
            className="bg-white text-purple-600 hover:bg-purple-50 font-semibold"
          >
            Explore Boxes
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoggyBoxPromotion;
