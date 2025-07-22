
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail } from 'lucide-react';
import { NotificationSectionProps } from '@/types/notifications';

const EmailNotificationSection = ({ settings, updateSetting }: NotificationSectionProps) => {
  return (
    <>
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-4 h-4" />
          <h3 className="font-semibold">Email Notifications</h3>
        </div>
        
        <div className="space-y-4 ml-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="email_enabled">Enable email notifications</Label>
            <Switch
              id="email_enabled"
              checked={settings.email_enabled}
              onCheckedChange={(checked) => updateSetting('email_enabled', checked)}
            />
          </div>
          
          {settings.email_enabled && (
            <div className="space-y-3 pl-4 border-l-2 border-gray-100">
              <div className="flex items-center justify-between">
                <Label htmlFor="email_messages">Important messages</Label>
                <Switch
                  id="email_messages"
                  checked={settings.email_messages}
                  onCheckedChange={(checked) => updateSetting('email_messages', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email_weekly_digest">Weekly digest</Label>
                <Switch
                  id="email_weekly_digest"
                  checked={settings.email_weekly_digest}
                  onCheckedChange={(checked) => updateSetting('email_weekly_digest', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email_marketing">Marketing emails</Label>
                <Switch
                  id="email_marketing"
                  checked={settings.email_marketing}
                  onCheckedChange={(checked) => updateSetting('email_marketing', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email_security">Security alerts</Label>
                <Switch
                  id="email_security"
                  checked={settings.email_security}
                  onCheckedChange={(checked) => updateSetting('email_security', checked)}
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

export default EmailNotificationSection;
