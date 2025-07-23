import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Reply {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_comment_id: string;
  profiles?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export const useCommentReplies = (parentCommentId: string) => {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchReplies = async () => {
    if (!parentCommentId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          parent_comment_id,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('parent_comment_id', parentCommentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (error) {
      console.error('Error fetching replies:', error);
      toast({
        title: "Error",
        description: "Failed to load replies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addReply = async (content: string) => {
    if (!user || !content.trim()) return false;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          content: content.trim(),
          user_id: user.id,
          parent_comment_id: parentCommentId,
          post_id: null, // This will be set by the parent component
        })
        .select(`
          id,
          content,
          created_at,
          user_id,
          parent_comment_id,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      if (data) {
        setReplies(prev => [...prev, data]);
        toast({
          title: "Reply posted",
          description: "Your reply has been added",
        });
        return true;
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive",
      });
    }
    return false;
  };

  useEffect(() => {
    fetchReplies();
  }, [parentCommentId]);

  // Subscribe to real-time updates for new replies
  useEffect(() => {
    if (!parentCommentId) return;

    const subscription = supabase
      .channel(`replies_${parentCommentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `parent_comment_id=eq.${parentCommentId}`,
        },
        async (payload) => {
          // Fetch the complete reply with profile data
          const { data, error } = await supabase
            .from('comments')
            .select(`
              id,
              content,
              created_at,
              user_id,
              parent_comment_id,
              profiles:user_id (
                username,
                full_name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (!error && data) {
            setReplies(prev => {
              // Avoid duplicates
              if (prev.some(reply => reply.id === data.id)) return prev;
              return [...prev, data];
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [parentCommentId]);

  return {
    replies,
    loading,
    addReply,
    fetchReplies,
  };
};