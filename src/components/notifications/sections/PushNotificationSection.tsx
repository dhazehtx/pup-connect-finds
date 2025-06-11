
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Smartphone } from 'lucide-react';
import { NotificationSectionProps } from '@/types/notifications';

const PushNotificationSection = ({ settings, updateSetting }: NotificationSectionProps) => {
  return (
    <>
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="w-4 h-4" />
          <h3 className="font-semibold">Push Notifications</h3>
        </div>
        
        <div className="space-y-4 ml-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="push_enabled">Enable push notifications</Label>
            <Switch
              id="push_enabled"
              checked={settings.push_enabled}
              onCheckedChange={(checked) => updateSetting('push_enabled', checked)}
            />
          </div>
          
          {settings.push_enabled && (
            <div className="space-y-3 pl-4 border-l-2 border-gray-100">
              <div className="flex items-center justify-between">
                <Label htmlFor="push_messages">New messages</Label>
                <Switch
                  id="push_messages"
                  checked={settings.push_messages}
                  onCheckedChange={(checked) => updateSetting('push_messages', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push_likes">Likes and reactions</Label>
                <Switch
                  id="push_likes"
                  checked={settings.push_likes}
                  onCheckedChange={(checked) => updateSetting('push_likes', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push_comments">Comments</Label>
                <Switch
                  id="push_comments"
                  checked={settings.push_comments}
                  onCheckedChange={(checked) => updateSetting('push_comments', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push_follows">New followers</Label>
                <Switch
                  id="push_follows"
                  checked={settings.push_follows}
                  onCheckedChange={(checked) => updateSetting('push_follows', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push_payments">Payment confirmations</Label>
                <Switch
                  id="push_payments"
                  checked={settings.push_payments}
                  onCheckedChange={(checked) => updateSetting('push_payments', checked)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <Separator />
    </>
  );
};

export default PushNotificationSection;
