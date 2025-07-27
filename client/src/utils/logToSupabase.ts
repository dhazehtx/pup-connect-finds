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

    // Insert log entry
    const { error } = await supabase
      .from('admin_logs')
      .insert({
        admin_id: session.user.id,
        action,
        metadata: metadata || null
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
 * Retrieve admin logs from Supabase
 */
export async function getAdminLogs(options: {
  limit?: number;
  adminId?: string;
  startDate?: string;
  endDate?: string;
} = {}): Promise<AdminLogEntry[]> {
  try {
    let query = supabase
      .from('admin_logs')
      .select(`
        id,
        admin_id,
        action,
        metadata,
        created_at,
        profiles:admin_id (
          username,
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.adminId) {
      query = query.eq('admin_id', options.adminId);
    }

    if (options.startDate) {
      query = query.gte('created_at', options.startDate);
    }

    if (options.endDate) {
      query = query.lte('created_at', options.endDate);
    }

    const { data, error } = await query;

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