import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

    // Use RPC call to insert into admin_logs table
    const { error } = await supabase.rpc('insert_admin_log', {
      p_admin_id: session.user.id,
      p_action: action,
      p_metadata: metadata || null
    });

    if (error) {
      console.error('Failed to log admin action to Supabase:', error);
      return false;
    }

    console.log(`[Admin Log] ${action}`, metadata || '');
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
    // Use RPC call to query admin_logs table
    const { data, error } = await supabase.rpc('get_admin_logs', {
      p_limit: options.limit || 100,
      p_admin_id: options.adminId || null,
      p_start_date: options.startDate || null,
      p_end_date: options.endDate || null,
      p_action_type: options.actionType || null
    });

    if (error) {
      console.error('Failed to fetch admin logs:', error);
      return [];
    }

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