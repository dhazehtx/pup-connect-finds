
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
      
      // For now, we'll simulate stories with local storage since the table doesn't exist yet
      const localStories = JSON.parse(localStorage.getItem('app_stories') || '[]');
      const activeStories = localStories.filter((story: Story) => 
        new Date(story.expires_at) > new Date()
      );
      
      setStories(activeStories);
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
      // For now, we'll simulate user stories with local storage
      const localStories = JSON.parse(localStorage.getItem('app_stories') || '[]');
      const activeUserStories = localStories.filter((story: Story) => 
        story.user_id === targetUserId && new Date(story.expires_at) > new Date()
      );
      
      setUserStories(activeUserStories);
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
      const newStory: Story = {
        id: Date.now().toString(),
        user_id: user.id,
        content_type: contentType,
        content_url: contentUrl,
        caption,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        created_at: new Date().toISOString()
      };

      // For now, store in local storage
      const localStories = JSON.parse(localStorage.getItem('app_stories') || '[]');
      localStories.push(newStory);
      localStorage.setItem('app_stories', JSON.stringify(localStories));

      toast({
        title: "Success",
        description: "Story created successfully!",
      });

      // Refresh stories
      await fetchActiveStories();
      await fetchUserStories();

      return newStory;
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
      // For now, remove from local storage
      const localStories = JSON.parse(localStorage.getItem('app_stories') || '[]');
      const updatedStories = localStories.filter((story: Story) => 
        story.id !== storyId || story.user_id !== user.id
      );
      localStorage.setItem('app_stories', JSON.stringify(updatedStories));

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
