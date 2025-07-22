
export interface NotificationSettingsData {
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

export interface NotificationSectionProps {
  settings: NotificationSettingsData;
  updateSetting: (key: keyof NotificationSettingsData, value: boolean | string) => void;
}
