
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { NotificationSettingsData } from '@/types/notifications';

const defaultSettings: NotificationSettingsData = {
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
};

export const useNotificationSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettingsData>(defaultSettings);
  const [loading, setLoading] = useState(false);

  const loadSettings = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.matching_criteria && typeof data.matching_criteria === 'object' && data.matching_criteria !== null) {
        const criteria = data.matching_criteria as Record<string, any>;
        if (criteria.notification_settings && typeof criteria.notification_settings === 'object') {
          setSettings(prev => ({
            ...prev,
            ...criteria.notification_settings
          }));
        }
      }
    } catch (error: any) {
      console.error('Error loading notification settings:', error);
    }
  }, [user]);

  const saveSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Create the matching_criteria object with proper typing
      const matchingCriteria = {
        notification_settings: settings
      };

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          matching_criteria: matchingCriteria as any // Cast to any to satisfy Json type
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

  const updateSetting = useCallback((key: keyof NotificationSettingsData, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    saveSettings,
    updateSetting
  };
};
