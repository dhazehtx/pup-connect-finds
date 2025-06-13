
export interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: 'suspicious_login' | 'unusual_activity' | 'fraud_attempt' | 'security_breach' | 'policy_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: any;
  ip_address?: string;
  user_agent?: string;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

export interface FraudDetectionResult {
  fraud_event_id: string;
  risk_score: number;
  risk_factors: string[];
  auto_actions: string[];
  recommendation: 'approve' | 'monitor' | 'manual_review' | 'block_transaction';
}

export interface SecuritySettings {
  two_factor_enabled: boolean;
  login_notifications: boolean;
  suspicious_activity_alerts: boolean;
  device_tracking: boolean;
  session_timeout: number;
  allowed_ip_ranges?: string[];
}
