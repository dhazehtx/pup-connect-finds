
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigation, Share, Vibrate, Bell } from 'lucide-react';

interface QuickActionsProps {
  onGetLocation: () => void;
  onShare: () => void;
  onVibrate: () => void;
  onRequestNotifications: () => void;
}

export const QuickActions = ({ 
  onGetLocation, 
  onShare, 
  onVibrate, 
  onRequestNotifications 
}: QuickActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={onGetLocation}
            className="flex flex-col gap-2 h-16"
          >
            <Navigation className="h-5 w-5" />
            <span className="text-xs">Get Location</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={onShare}
            className="flex flex-col gap-2 h-16"
          >
            <Share className="h-5 w-5" />
            <span className="text-xs">Share App</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={onVibrate}
            className="flex flex-col gap-2 h-16"
          >
            <Vibrate className="h-5 w-5" />
            <span className="text-xs">Vibrate</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={onRequestNotifications}
            className="flex flex-col gap-2 h-16"
          >
            <Bell className="h-5 w-5" />
            <span className="text-xs">Notifications</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
