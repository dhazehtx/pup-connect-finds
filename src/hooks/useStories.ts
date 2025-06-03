
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Story {
  id: string;
  user_id: string;
  content_type: string;
  content_url: string;
  caption?: string;
  expires_at: string;
  created_at: string;
  user_profile?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

export const useStories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchActiveStories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          user_profile:profiles!user_id (
            full_name,
            username,
            avatar_url
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast({
        title: "Error",
        description: "Failed to load stories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStories = async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;

    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', targetUserId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserStories(data || []);
    } catch (error) {
      console.error('Error fetching user stories:', error);
    }
  };

  const createStory = async (contentUrl: string, caption?: string, contentType: string = 'image') => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create stories",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('stories')
        .insert([{
          user_id: user.id,
          content_type: contentType,
          content_url: contentUrl,
          caption
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Story created successfully!",
      });

      // Refresh stories
      await fetchActiveStories();
      await fetchUserStories();

      return data;
    } catch (error: any) {
      console.error('Error creating story:', error);
      toast({
        title: "Error",
        description: "Failed to create story",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteStory = async (storyId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Story deleted",
      });

      // Refresh stories
      await fetchActiveStories();
      await fetchUserStories();

      return true;
    } catch (error: any) {
      console.error('Error deleting story:', error);
      toast({
        title: "Error",
        description: "Failed to delete story",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchActiveStories();
    if (user) {
      fetchUserStories();
    }
  }, [user]);

  return {
    stories,
    userStories,
    loading,
    createStory,
    deleteStory,
    fetchActiveStories,
    fetchUserStories
  };
};
