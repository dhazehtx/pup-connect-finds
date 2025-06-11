
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, MessageSquare, Smartphone, Volume2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettingsData {
  // Push Notifications
  push_enabled: boolean;
  push_messages: boolean;
  push_likes: boolean;
  push_comments: boolean;
  push_follows: boolean;
  push_payments: boolean;
  
  // Email Notifications
  email_enabled: boolean;
  email_messages: boolean;
  email_weekly_digest: boolean;
  email_marketing: boolean;
  email_security: boolean;
  
  // SMS Notifications
  sms_enabled: boolean;
  sms_critical_only: boolean;
  sms_payments: boolean;
  sms_security: boolean;
  
  // In-App Settings
  sound_enabled: boolean;
  desktop_notifications: boolean;
  notification_frequency: string;
}

const NotificationSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettingsData>({
    // Push Notifications
    push_enabled: true,
    push_messages: true,
    push_likes: true,
    push_comments: true,
    push_follows: true,
    push_payments: true,
    
    // Email Notifications
    email_enabled: true,
    email_messages: true,
    email_weekly_digest: true,
    email_marketing: false,
    email_security: true,
    
    // SMS Notifications
    sms_enabled: false,
    sms_critical_only: true,
    sms_payments: true,
    sms_security: true,
    
    // In-App Settings
    sound_enabled: true,
    desktop_notifications: true,
    notification_frequency: 'immediate'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.matching_criteria && typeof data.matching_criteria === 'object' && data.matching_criteria !== null) {
        const criteria = data.matching_criteria as any;
        if (criteria.notification_settings) {
          setSettings(prev => ({
            ...prev,
            ...criteria.notification_settings
          }));
        }
      }
    } catch (error: any) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          matching_criteria: {
            notification_settings: settings
          }
        });

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof NotificationSettingsData, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

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
          {/* Push Notifications */}
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

          {/* Email Notifications */}
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

          {/* SMS Notifications */}
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

          {/* App Settings */}
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
