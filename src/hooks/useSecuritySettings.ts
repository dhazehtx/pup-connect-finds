
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { SecuritySettings } from '@/types/security';

export const useSecuritySettings = () => {
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadSecuritySettings = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('two_factor_enabled, privacy_settings')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const privacySettings = data.privacy_settings || {};
      
      setSettings({
        two_factor_enabled: data.two_factor_enabled || false,
        login_notifications: privacySettings.login_notifications !== false,
        suspicious_activity_alerts: privacySettings.suspicious_activity_alerts !== false,
        device_tracking: privacySettings.device_tracking !== false,
        session_timeout: privacySettings.session_timeout || 30,
        allowed_ip_ranges: privacySettings.allowed_ip_ranges || []
      });
    } catch (error) {
      console.error('Error loading security settings:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateSecuritySettings = useCallback(async (newSettings: Partial<SecuritySettings>) => {
    if (!user || !settings) return;

    setLoading(true);
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      const { error } = await supabase
        .from('profiles')
        .update({
          two_factor_enabled: updatedSettings.two_factor_enabled,
          privacy_settings: {
            login_notifications: updatedSettings.login_notifications,
            suspicious_activity_alerts: updatedSettings.suspicious_activity_alerts,
            device_tracking: updatedSettings.device_tracking,
            session_timeout: updatedSettings.session_timeout,
            allowed_ip_ranges: updatedSettings.allowed_ip_ranges
          }
        })
        .eq('id', user.id);

      if (error) throw error;

      setSettings(updatedSettings);
      
      toast({
        title: "Settings Updated",
        description: "Your security settings have been saved",
      });
    } catch (error) {
      console.error('Error updating security settings:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update security settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, settings, toast]);

  const enableTwoFactor = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('enable-two-factor', {
        body: { user_id: user.id }
      });

      if (error) throw error;

      await updateSecuritySettings({ two_factor_enabled: true });
      
      return data.qr_code;
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast({
        title: "2FA Setup Failed",
        description: "Failed to enable two-factor authentication",
        variant: "destructive",
      });
      return null;
    }
  }, [user, updateSecuritySettings, toast]);

  const disableTwoFactor = useCallback(async (verificationCode: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase.functions.invoke('disable-two-factor', {
        body: { 
          user_id: user.id,
          verification_code: verificationCode
        }
      });

      if (error) throw error;

      await updateSecuritySettings({ two_factor_enabled: false });
      
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled",
      });
      
      return true;
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast({
        title: "Disable Failed",
        description: "Failed to disable two-factor authentication",
        variant: "destructive",
      });
      return false;
    }
  }, [user, updateSecuritySettings, toast]);

  useEffect(() => {
    if (user) {
      loadSecuritySettings();
    }
  }, [user, loadSecuritySettings]);

  return {
    settings,
    loading,
    loadSecuritySettings,
    updateSecuritySettings,
    enableTwoFactor,
    disableTwoFactor
  };
};
