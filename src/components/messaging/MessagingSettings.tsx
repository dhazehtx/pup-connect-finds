
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Moon, 
  Shield, 
  Download, 
  Trash2, 
  Volume2,
  MessageSquare,
  Eye,
  Lock
} from 'lucide-react';

const MessagingSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    notifications: {
      enablePush: true,
      enableSound: true,
      enableDesktop: true,
      enableEmail: false,
    },
    privacy: {
      readReceipts: true,
      typingIndicators: true,
      onlineStatus: true,
      messagePreview: true,
    },
    appearance: {
      darkMode: false,
      fontSize: 'medium',
      compactMode: false,
    },
    security: {
      encryptMessages: false,
      autoDeleteMessages: 'never',
      requireAuth: false,
    }
  });

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    
    toast({
      title: "Setting updated",
      description: "Your preferences have been saved",
    });
  };

  const exportData = () => {
    toast({
      title: "Export started",
      description: "Your message data will be downloaded shortly",
    });
  };

  const clearAllData = () => {
    toast({
      title: "Data cleared",
      description: "All message data has been removed",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Messaging Settings</h2>
        <p className="text-muted-foreground">Customize your messaging experience</p>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications">Push Notifications</Label>
            <Switch
              id="push-notifications"
              checked={settings.notifications.enablePush}
              onCheckedChange={(checked) => updateSetting('notifications', 'enablePush', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-notifications">Sound Notifications</Label>
            <Switch
              id="sound-notifications"
              checked={settings.notifications.enableSound}
              onCheckedChange={(checked) => updateSetting('notifications', 'enableSound', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="desktop-notifications">Desktop Notifications</Label>
            <Switch
              id="desktop-notifications"
              checked={settings.notifications.enableDesktop}
              onCheckedChange={(checked) => updateSetting('notifications', 'enableDesktop', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <Switch
              id="email-notifications"
              checked={settings.notifications.enableEmail}
              onCheckedChange={(checked) => updateSetting('notifications', 'enableEmail', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="read-receipts">Read Receipts</Label>
            <Switch
              id="read-receipts"
              checked={settings.privacy.readReceipts}
              onCheckedChange={(checked) => updateSetting('privacy', 'readReceipts', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="typing-indicators">Typing Indicators</Label>
            <Switch
              id="typing-indicators"
              checked={settings.privacy.typingIndicators}
              onCheckedChange={(checked) => updateSetting('privacy', 'typingIndicators', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="online-status">Online Status</Label>
            <Switch
              id="online-status"
              checked={settings.privacy.onlineStatus}
              onCheckedChange={(checked) => updateSetting('privacy', 'onlineStatus', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="message-preview">Message Preview in Notifications</Label>
            <Switch
              id="message-preview"
              checked={settings.privacy.messagePreview}
              onCheckedChange={(checked) => updateSetting('privacy', 'messagePreview', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Font Size</Label>
            <Select
              value={settings.appearance.fontSize}
              onValueChange={(value) => updateSetting('appearance', 'fontSize', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="compact-mode">Compact Mode</Label>
            <Switch
              id="compact-mode"
              checked={settings.appearance.compactMode}
              onCheckedChange={(checked) => updateSetting('appearance', 'compactMode', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="encrypt-messages">End-to-End Encryption</Label>
            <Switch
              id="encrypt-messages"
              checked={settings.security.encryptMessages}
              onCheckedChange={(checked) => updateSetting('security', 'encryptMessages', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Auto-Delete Messages</Label>
            <Select
              value={settings.security.autoDeleteMessages}
              onValueChange={(value) => updateSetting('security', 'autoDeleteMessages', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="7days">7 Days</SelectItem>
                <SelectItem value="30days">30 Days</SelectItem>
                <SelectItem value="90days">90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Export Message Data</Label>
              <p className="text-sm text-muted-foreground">Download all your messages</p>
            </div>
            <Button variant="outline" onClick={exportData}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-destructive">Clear All Data</Label>
              <p className="text-sm text-muted-foreground">This action cannot be undone</p>
            </div>
            <Button variant="destructive" onClick={clearAllData}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagingSettings;
