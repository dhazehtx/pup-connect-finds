
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Bell, Mail, Smartphone, Clock, Shield } from 'lucide-react';
import { useEnhancedNotifications } from '@/hooks/useEnhancedNotifications';
import { NotificationSettings as SettingsType } from '@/types/messaging';

const NotificationSettings = () => {
  const { settings, updateSettings, requestNotificationPermission } = useEnhancedNotifications();

  const handleSettingChange = async (key: keyof SettingsType, value: boolean | string) => {
    await updateSettings({ [key]: value });
  };

  const enablePushNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      await updateSettings({ push_enabled: true });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2 mb-2">
          <Bell className="h-6 w-6" />
          Notification Settings
        </h1>
        <p className="text-muted-foreground">
          Customize how and when you receive notifications
        </p>
      </div>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Push Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive instant notifications in your browser
              </p>
            </div>
            <div className="flex gap-2">
              {!settings.push_enabled && (
                <Button onClick={enablePushNotifications} size="sm">
                  Enable
                </Button>
              )}
              <Switch
                checked={settings.push_enabled}
                onCheckedChange={(checked) => handleSettingChange('push_enabled', checked)}
              />
            </div>
          </div>

          {settings.push_enabled && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Message Notifications</p>
                  <p className="text-sm text-muted-foreground">New messages from other users</p>
                </div>
                <Switch
                  checked={settings.message_notifications}
                  onCheckedChange={(checked) => handleSettingChange('message_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Payment Notifications</p>
                  <p className="text-sm text-muted-foreground">Transaction and payment updates</p>
                </div>
                <Switch
                  checked={settings.payment_notifications}
                  onCheckedChange={(checked) => handleSettingChange('payment_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Security Alerts</p>
                  <p className="text-sm text-muted-foreground">Account security and login alerts</p>
                </div>
                <Switch
                  checked={settings.security_notifications}
                  onCheckedChange={(checked) => handleSettingChange('security_notifications', checked)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={settings.email_enabled}
              onCheckedChange={(checked) => handleSettingChange('email_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Marketing Emails</p>
              <p className="text-sm text-muted-foreground">Tips, updates, and promotions</p>
            </div>
            <Switch
              checked={settings.marketing_notifications}
              onCheckedChange={(checked) => handleSettingChange('marketing_notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            SMS Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable SMS Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive critical notifications via text message
              </p>
            </div>
            <Switch
              checked={settings.sms_enabled}
              onCheckedChange={(checked) => handleSettingChange('sms_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Timing & Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timing & Frequency
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Notification Frequency
            </label>
            <Select 
              value={settings.notification_frequency}
              onValueChange={(value) => handleSettingChange('notification_frequency', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="hourly">Hourly Digest</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Quiet Hours Start
              </label>
              <Select 
                value={settings.quiet_hours_start || ''}
                onValueChange={(value) => handleSettingChange('quiet_hours_start', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                      {`${i.toString().padStart(2, '0')}:00`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Quiet Hours End
              </label>
              <Select 
                value={settings.quiet_hours_end || ''}
                onValueChange={(value) => handleSettingChange('quiet_hours_end', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                      {`${i.toString().padStart(2, '0')}:00`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm">
                <strong>Privacy Notice:</strong> We only send notifications related to your account activity and preferences. 
                Your notification settings are encrypted and stored securely. You can update these preferences at any time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
