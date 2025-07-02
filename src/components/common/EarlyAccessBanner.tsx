
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Heart } from 'lucide-react';
import { EARLY_ACCESS_CONFIG } from '@/config/earlyAccess';

const EarlyAccessBanner = () => {
  if (!EARLY_ACCESS_CONFIG.isEarlyAccess) return null;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full">
              <Star className="w-4 h-4 text-white" />
            </div>
            <div>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-1">
                Early Access
              </Badge>
              <p className="text-sm text-gray-700 font-medium">
                {EARLY_ACCESS_CONFIG.messages.freeAccess}
              </p>
            </div>
          </div>
          <Heart className="w-5 h-5 text-purple-500" />
        </div>
      </CardContent>
    </Card>
  );
};

export default EarlyAccessBanner;
