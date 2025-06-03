
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeData } from './useRealtimeData';

interface Story {
  id: string;
  user_id: string;
  content_type: 'image' | 'video' | 'ai-generated';
  content_url: string;
  caption?: string;
  ai_prompt?: string;
  view_count: number;
  expires_at: string;
  created_at: string;
  profile?: {
    full_name: string;
    username: string;
    avatar_url: string;
  };
}

export const useStories = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time updates for stories
  useRealtimeData({
    table: 'stories',
    onInsert: (payload) => {
      if (payload.new) {
        fetchStories(); // Refetch to get profile data
      }
    },
    onUpdate: (payload) => {
      if (payload.new) {
        setStories(prev => prev.map(story => 
          story.id === payload.new.id ? { ...story, ...payload.new } : story
        ));
      }
    },
    onDelete: (payload) => {
      if (payload.old) {
        setStories(prev => prev.filter(story => story.id !== payload.old.id));
      }
    }
  });

  const fetchStories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          profiles:user_id (
            full_name,
            username,
            avatar_url
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedStories = data?.map(story => ({
        ...story,
        profile: story.profiles
      })) || [];

      setStories(formattedStories);
    } catch (err: any) {
      console.error('Error fetching stories:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createStory = async (
    contentType: 'image' | 'video' | 'ai-generated',
    contentUrl: string,
    caption?: string,
    aiPrompt?: string
  ) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const { data, error } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          content_type: contentType,
          content_url: contentUrl,
          caption,
          ai_prompt: aiPrompt
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error creating story:', err);
      throw err;
    }
  };

  const viewStory = async (storyId: string) => {
    try {
      const { error } = await supabase
        .from('stories')
        .update({ view_count: stories.find(s => s.id === storyId)?.view_count + 1 || 1 })
        .eq('id', storyId);

      if (error) throw error;

      // Update local state
      setStories(prev => prev.map(story => 
        story.id === storyId 
          ? { ...story, view_count: story.view_count + 1 }
          : story
      ));
    } catch (err: any) {
      console.error('Error updating story view count:', err);
    }
  };

  const deleteStory = async (storyId: string) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (err: any) {
      console.error('Error deleting story:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return {
    stories,
    loading,
    error,
    createStory,
    viewStory,
    deleteStory,
    refetch: fetchStories
  };
};
