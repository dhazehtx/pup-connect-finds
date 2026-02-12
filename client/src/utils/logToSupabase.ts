import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const DEBUG = import.meta.env.DEV && false;

export interface AdminLogEntry {
  id?: string;
  admin_id: string;
  action: string;
  metadata?: any;
  created_at?: string;
}

/**
 * Log admin actions to Supabase for persistent audit trail
 */
export async function logToSupabase(action: string, metadata?: any): Promise<boolean> {
  try {
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      console.warn('No active session for admin logging');
      return false;
    }

    // Use backend endpoint instead of direct RPC call for security
    const response = await fetch('/api/admin/log-action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        admin_id: session.user.id,
        action: action,
        event_type: metadata?.event_type || 'ACTION',
        event_detail: metadata?.event_detail || action,
        metadata: metadata || null
      })
    });
    
    if (!response.ok) {
      console.error('Failed to log admin action:', response.status, response.statusText);
      return false;
    }

    if (DEBUG) console.debug(`[Admin Log] ${action}`, metadata || '');
    return true;
  } catch (error) {
    console.error('Error logging to Supabase:', error);
    return false;
  }
}

/**
 * Retrieve admin logs from Supabase with navigation tracking
 */
export async function getAdminLogs(options: {
  limit?: number;
  adminId?: string;
  startDate?: string;
  endDate?: string;
  actionType?: string;
} = {}): Promise<AdminLogEntry[]> {
  try {
    // Get current session for authorization
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      console.warn('No active session for fetching admin logs');
      return [];
    }

    // Use backend endpoint for admin logs query
    const response = await fetch('/api/admin/logs?' + new URLSearchParams({
      limit: (options.limit || 100).toString(),
      ...(options.adminId && { admin_id: options.adminId }),
      ...(options.startDate && { start_date: options.startDate }),
      ...(options.endDate && { end_date: options.endDate }),
      ...(options.actionType && { action_type: options.actionType })
    }), {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch admin logs:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    return [];
  }
}

/**
 * React hook for admin logging
 */
export function useAdminLogger() {
  const { user, profile } = useAuth();

  const logAction = async (action: string, metadata?: any) => {
    // Only log if user is authenticated and is admin
    if (!user || !profile?.is_admin) {
      return false;
    }

    return await logToSupabase(action, metadata);
  };

  return { logAction, isAdmin: !!profile?.is_admin };
}