
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MessageTemplate {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  is_public: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export const useMessageTemplates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('message_templates')
        .select('*')
        .or(`user_id.eq.${user.id},is_public.eq.true`)
        .order('usage_count', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setTemplates(data || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to fetch message templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createTemplate = useCallback(async (templateData: {
    title: string;
    content: string;
    category?: string;
    is_public?: boolean;
  }) => {
    if (!user) return null;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('message_templates')
        .insert({
          user_id: user.id,
          title: templateData.title,
          content: templateData.content,
          category: templateData.category || 'general',
          is_public: templateData.is_public || false
        })
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Message template created successfully",
      });

      return data;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to create message template",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const updateTemplate = useCallback(async (id: string, updates: Partial<MessageTemplate>) => {
    if (!user) return null;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('message_templates')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => prev.map(t => t.id === id ? data : t));
      toast({
        title: "Success",
        description: "Message template updated successfully",
      });

      return data;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to update message template",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const deleteTemplate = useCallback(async (id: string) => {
    if (!user) return false;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTemplates(prev => prev.filter(t => t.id !== id));
      toast({
        title: "Success",
        description: "Message template deleted successfully",
      });

      return true;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to delete message template",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const useTemplate = useCallback(async (id: string) => {
    try {
      // Get current usage count first
      const currentTemplate = templates.find(t => t.id === id);
      if (!currentTemplate) return;

      const newUsageCount = currentTemplate.usage_count + 1;

      // Update usage count in database
      const { error } = await supabase
        .from('message_templates')
        .update({ usage_count: newUsageCount })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setTemplates(prev => prev.map(t => 
        t.id === id ? { ...t, usage_count: newUsageCount } : t
      ));
    } catch (err: any) {
      console.error('Error updating template usage:', err);
    }
  }, [templates]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    useTemplate
  };
};
