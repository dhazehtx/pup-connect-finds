
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const PushNotificationManager = () => {
  const { 
    permission, 
    isSupported, 
    requestPermission, 
    subscribeToNotifications 
  } = usePushNotifications();
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (permission === 'granted') {
      subscribeToNotifications();
      setIsSubscribed(true);
    }
  }, [permission, subscribeToNotifications]);

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      setIsSubscribed(true);
      toast({
        title: "Notifications Enabled",
        description: "You'll now receive push notifications for new messages and updates.",
      });
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="w-5 h-5" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Push notifications are not supported in this browser.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {permission === 'granted' ? (
            <Bell className="w-5 h-5 text-green-600" />
          ) : (
            <BellOff className="w-5 h-5" />
          )}
          Push Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {permission === 'granted' ? (
          <div className="flex items-center gap-2 text-green-600">
            <Check className="w-4 h-4" />
            <span className="text-sm">Notifications are enabled</span>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Enable push notifications to get instant alerts for:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 mb-4">
              <li>• New messages from buyers/sellers</li>
              <li>• Interest in your listings</li>
              <li>• Payment confirmations</li>
              <li>• Listing updates</li>
            </ul>
            <Button 
              onClick={handleEnableNotifications}
              className="w-full"
            >
              Enable Push Notifications
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PushNotificationManager;
