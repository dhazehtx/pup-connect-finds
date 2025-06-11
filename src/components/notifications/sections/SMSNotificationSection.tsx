
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { MessageSquare } from 'lucide-react';
import { NotificationSectionProps } from '@/types/notifications';

const SMSNotificationSection = ({ settings, updateSetting }: NotificationSectionProps) => {
  return (
    <>
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4" />
          <h3 className="font-semibold">SMS Notifications</h3>
        </div>
        
        <div className="space-y-4 ml-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="sms_enabled">Enable SMS notifications</Label>
            <Switch
              id="sms_enabled"
              checked={settings.sms_enabled}
              onCheckedChange={(checked) => updateSetting('sms_enabled', checked)}
            />
          </div>
          
          {settings.sms_enabled && (
            <div className="space-y-3 pl-4 border-l-2 border-gray-100">
              <div className="flex items-center justify-between">
                <Label htmlFor="sms_critical_only">Critical notifications only</Label>
                <Switch
                  id="sms_critical_only"
                  checked={settings.sms_critical_only}
                  onCheckedChange={(checked) => updateSetting('sms_critical_only', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sms_payments">Payment confirmations</Label>
                <Switch
                  id="sms_payments"
                  checked={settings.sms_payments}
                  onCheckedChange={(checked) => updateSetting('sms_payments', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sms_security">Security alerts</Label>
                <Switch
                  id="sms_security"
                  checked={settings.sms_security}
                  onCheckedChange={(checked) => updateSetting('sms_security', checked)}
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

export default SMSNotificationSection;
