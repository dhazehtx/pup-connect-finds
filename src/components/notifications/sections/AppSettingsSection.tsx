
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Volume2 } from 'lucide-react';
import { NotificationSectionProps } from '@/types/notifications';

const AppSettingsSection = ({ settings, updateSetting }: NotificationSectionProps) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Volume2 className="w-4 h-4" />
        <h3 className="font-semibold">App Settings</h3>
      </div>
      
      <div className="space-y-4 ml-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="sound_enabled">Notification sounds</Label>
          <Switch
            id="sound_enabled"
            checked={settings.sound_enabled}
            onCheckedChange={(checked) => updateSetting('sound_enabled', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="desktop_notifications">Desktop notifications</Label>
          <Switch
            id="desktop_notifications"
            checked={settings.desktop_notifications}
            onCheckedChange={(checked) => updateSetting('desktop_notifications', checked)}
          />
        </div>
      </div>
    </div>
  );
};

export default AppSettingsSection;
