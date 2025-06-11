
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import PushNotificationSection from './sections/PushNotificationSection';
import EmailNotificationSection from './sections/EmailNotificationSection';
import SMSNotificationSection from './sections/SMSNotificationSection';
import AppSettingsSection from './sections/AppSettingsSection';

const NotificationSettings = () => {
  const { settings, loading, saveSettings, updateSetting } = useNotificationSettings();

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <PushNotificationSection settings={settings} updateSetting={updateSetting} />
          <EmailNotificationSection settings={settings} updateSetting={updateSetting} />
          <SMSNotificationSection settings={settings} updateSetting={updateSetting} />
          <AppSettingsSection settings={settings} updateSetting={updateSetting} />

          <div className="pt-4">
            <Button 
              onClick={saveSettings} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
