
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Bell, 
  Zap, 
  Database, 
  Users, 
  MessageSquare,
  Settings,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessagingSettings {
  encryption: {
    enabled: boolean;
    autoEncrypt: boolean;
    keyRotationDays: number;
  };
  notifications: {
    soundEnabled: boolean;
    desktopNotifications: boolean;
    emailNotifications: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  performance: {
    messageLimit: number;
    autoOptimize: boolean;
    compressionEnabled: boolean;
    cacheSize: number;
  };
  privacy: {
    readReceipts: boolean;
    typingIndicators: boolean;
    lastSeenVisible: boolean;
    messageHistory: number;
  };
}

const MessagingSettingsPanel = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<MessagingSettings>({
    encryption: {
      enabled: true,
      autoEncrypt: false,
      keyRotationDays: 30
    },
    notifications: {
      soundEnabled: true,
      desktopNotifications: true,
      emailNotifications: false,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    },
    performance: {
      messageLimit: 1000,
      autoOptimize: true,
      compressionEnabled: true,
      cacheSize: 50
    },
    privacy: {
      readReceipts: true,
      typingIndicators: true,
      lastSeenVisible: true,
      messageHistory: 90
    }
  });

  const handleSaveSettings = () => {
    // Save settings logic here
    console.log('Saving settings:', settings);
    toast({
      title: "Settings saved",
      description: "Your messaging preferences have been updated.",
    });
  };

  const updateSetting = (category: keyof MessagingSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Messaging Settings</h2>
          <p className="text-muted-foreground">Configure your messaging preferences and features</p>
        </div>
        <Button onClick={handleSaveSettings} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Settings
        </Button>
      </div>

      <Tabs defaultValue="encryption" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="encryption" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Encryption
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="encryption">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Encryption Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Enable Message Encryption</h4>
                  <p className="text-sm text-muted-foreground">Encrypt all messages for enhanced security</p>
                </div>
                <Switch
                  checked={settings.encryption.enabled}
                  onCheckedChange={(checked) => updateSetting('encryption', 'enabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto-Encrypt New Conversations</h4>
                  <p className="text-sm text-muted-foreground">Automatically enable encryption for new chats</p>
                </div>
                <Switch
                  checked={settings.encryption.autoEncrypt}
                  onCheckedChange={(checked) => updateSetting('encryption', 'autoEncrypt', checked)}
                  disabled={!settings.encryption.enabled}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Key Rotation Period</h4>
                  <Badge variant="secondary">{settings.encryption.keyRotationDays} days</Badge>
                </div>
                <Slider
                  value={[settings.encryption.keyRotationDays]}
                  onValueChange={([value]) => updateSetting('encryption', 'keyRotationDays', value)}
                  max={365}
                  min={1}
                  step={1}
                  disabled={!settings.encryption.enabled}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Encryption keys will be rotated every {settings.encryption.keyRotationDays} days
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Sound Notifications</h4>
                  <p className="text-sm text-muted-foreground">Play sound when receiving messages</p>
                </div>
                <Switch
                  checked={settings.notifications.soundEnabled}
                  onCheckedChange={(checked) => updateSetting('notifications', 'soundEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Desktop Notifications</h4>
                  <p className="text-sm text-muted-foreground">Show browser notifications for new messages</p>
                </div>
                <Switch
                  checked={settings.notifications.desktopNotifications}
                  onCheckedChange={(checked) => updateSetting('notifications', 'desktopNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive email notifications for important messages</p>
                </div>
                <Switch
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Quiet Hours</h4>
                  <Switch
                    checked={settings.notifications.quietHours.enabled}
                    onCheckedChange={(checked) => updateSetting('notifications', 'quietHours', { ...settings.notifications.quietHours, enabled: checked })}
                  />
                </div>
                {settings.notifications.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-muted">
                    <div>
                      <label className="text-sm font-medium">Start Time</label>
                      <input
                        type="time"
                        value={settings.notifications.quietHours.start}
                        onChange={(e) => updateSetting('notifications', 'quietHours', { ...settings.notifications.quietHours, start: e.target.value })}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">End Time</label>
                      <input
                        type="time"
                        value={settings.notifications.quietHours.end}
                        onChange={(e) => updateSetting('notifications', 'quietHours', { ...settings.notifications.quietHours, end: e.target.value })}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Performance Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Message Load Limit</h4>
                  <Badge variant="secondary">{settings.performance.messageLimit} messages</Badge>
                </div>
                <Slider
                  value={[settings.performance.messageLimit]}
                  onValueChange={([value]) => updateSetting('performance', 'messageLimit', value)}
                  max={5000}
                  min={100}
                  step={100}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum number of messages to load at once
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto-Optimization</h4>
                  <p className="text-sm text-muted-foreground">Automatically optimize performance</p>
                </div>
                <Switch
                  checked={settings.performance.autoOptimize}
                  onCheckedChange={(checked) => updateSetting('performance', 'autoOptimize', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Message Compression</h4>
                  <p className="text-sm text-muted-foreground">Compress messages to save bandwidth</p>
                </div>
                <Switch
                  checked={settings.performance.compressionEnabled}
                  onCheckedChange={(checked) => updateSetting('performance', 'compressionEnabled', checked)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Cache Size</h4>
                  <Badge variant="secondary">{settings.performance.cacheSize} MB</Badge>
                </div>
                <Slider
                  value={[settings.performance.cacheSize]}
                  onValueChange={([value]) => updateSetting('performance', 'cacheSize', value)}
                  max={500}
                  min={10}
                  step={10}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum cache size for storing message data
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Read Receipts</h4>
                  <p className="text-sm text-muted-foreground">Show when you've read messages</p>
                </div>
                <Switch
                  checked={settings.privacy.readReceipts}
                  onCheckedChange={(checked) => updateSetting('privacy', 'readReceipts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Typing Indicators</h4>
                  <p className="text-sm text-muted-foreground">Show when you're typing</p>
                </div>
                <Switch
                  checked={settings.privacy.typingIndicators}
                  onCheckedChange={(checked) => updateSetting('privacy', 'typingIndicators', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Last Seen Status</h4>
                  <p className="text-sm text-muted-foreground">Show your last online time</p>
                </div>
                <Switch
                  checked={settings.privacy.lastSeenVisible}
                  onCheckedChange={(checked) => updateSetting('privacy', 'lastSeenVisible', checked)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Message History Retention</h4>
                  <Badge variant="secondary">{settings.privacy.messageHistory} days</Badge>
                </div>
                <Slider
                  value={[settings.privacy.messageHistory]}
                  onValueChange={([value]) => updateSetting('privacy', 'messageHistory', value)}
                  max={365}
                  min={1}
                  step={1}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Messages older than {settings.privacy.messageHistory} days will be automatically deleted
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MessagingSettingsPanel;
