
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
    table: 'dog_listings', // Use existing table for now
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
      
      // Mock stories data for now since stories table doesn't exist in types
      const mockStories: Story[] = [
        {
          id: '1',
          user_id: user?.id || 'mock-user',
          content_type: 'image',
          content_url: '/placeholder.svg',
          caption: 'My lovely pup!',
          view_count: 10,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          profile: {
            full_name: 'Demo User',
            username: 'demo_user',
            avatar_url: '/placeholder.svg'
          }
        }
      ];

      setStories(mockStories);
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
      // For now, just add to local state since table doesn't exist in types
      const newStory: Story = {
        id: Date.now().toString(),
        user_id: user.id,
        content_type: contentType,
        content_url: contentUrl,
        caption,
        ai_prompt: aiPrompt,
        view_count: 0,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      };

      setStories(prev => [newStory, ...prev]);
      return newStory;
    } catch (err: any) {
      console.error('Error creating story:', err);
      throw err;
    }
  };

  const viewStory = async (storyId: string) => {
    try {
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
      setStories(prev => prev.filter(story => story.id !== storyId));
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
