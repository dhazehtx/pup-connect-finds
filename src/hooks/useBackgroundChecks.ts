
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BackgroundCheck {
  id: string;
  user_id: string;
  provider: string;
  check_type: string;
  status: string;
  external_id?: string;
  results: any;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export const useBackgroundChecks = (userId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [checks, setChecks] = useState<BackgroundCheck[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChecks = useCallback(async () => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('background_checks')
        .select('*')
        .order('created_at', { ascending: false });

      // If specific user ID provided, filter by it
      if (userId) {
        query = query.eq('user_id', userId);
      } else if (user?.email !== 'admin@example.com') {
        // If not admin and no specific user, show only own checks
        query = query.eq('user_id', user.id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setChecks(data || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to fetch background checks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, userId, toast]);

  const requestCheck = useCallback(async (checkType: string, provider: string = 'internal') => {
    if (!user) return null;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('background_checks')
        .insert({
          user_id: user.id,
          provider,
          check_type: checkType,
          status: 'pending',
          results: {}
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh the list
      await fetchChecks();

      toast({
        title: "Success",
        description: "Background check requested successfully",
      });

      return data;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to request background check",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, fetchChecks, toast]);

  const updateCheckStatus = useCallback(async (checkId: string, status: string, results?: any) => {
    try {
      setLoading(true);

      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (results) {
        updateData.results = results;
      }

      const { error } = await supabase
        .from('background_checks')
        .update(updateData)
        .eq('id', checkId);

      if (error) throw error;

      // Refresh the list
      await fetchChecks();

      toast({
        title: "Success",
        description: "Background check updated successfully",
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to update background check",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [fetchChecks, toast]);

  const getCheckStats = useCallback(() => {
    return {
      total: checks.length,
      pending: checks.filter(c => c.status === 'pending').length,
      completed: checks.filter(c => c.status === 'completed').length,
      failed: checks.filter(c => c.status === 'failed').length,
      inProgress: checks.filter(c => c.status === 'in_progress').length
    };
  }, [checks]);

  useEffect(() => {
    fetchChecks();
  }, [fetchChecks]);

  return {
    checks,
    loading,
    error,
    fetchChecks,
    requestCheck,
    updateCheckStatus,
    getCheckStats
  };
};
