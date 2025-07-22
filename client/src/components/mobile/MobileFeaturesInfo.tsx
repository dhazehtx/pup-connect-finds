
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const MobileFeaturesInfo = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mobile Features</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Badge variant="outline" className="w-full justify-start">
            Touch gestures enabled
          </Badge>
          <Badge variant="outline" className="w-full justify-start">
            Swipe navigation active
          </Badge>
          <Badge variant="outline" className="w-full justify-start">
            Mobile-optimized layouts
          </Badge>
          <Badge variant="outline" className="w-full justify-start">
            Offline support available
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
