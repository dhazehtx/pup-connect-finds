
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id?: string | null;
  content: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
  replies?: Comment[];
}

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchComments = async () => {
    if (!postId) {
      setComments([]);
      setLoading(false);
      return;
    }

    try {
      const data = await apiRequest(`/api/posts/${postId}/comments`);
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string, parentCommentId?: string) => {
    if (!postId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const newComment = await apiRequest('/api/comments', {
        method: 'POST',
        body: {
          post_id: postId,
          user_id: user.id,
          content,
        },
      });

      if (parentCommentId) {
        try {
          const parentComments = comments.filter(c => c.id === parentCommentId);
          const originalComment = parentComments[0];

          if (originalComment && originalComment.user_id !== user.id) {
            await apiRequest('/api/notifications', {
              method: 'POST',
              body: {
                type: 'comment_reply',
                toUserId: originalComment.user_id,
                fromUserId: user.id,
                relatedId: postId,
                title: 'Comment Reply',
                message: 'replied to your comment',
              },
            });
          }
        } catch (notificationError) {
          console.error('Error creating notification:', notificationError);
        }
      }
      
      setComments(prev => [...prev, newComment]);
      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchComments();

    if (!postId) return;

    pollIntervalRef.current = setInterval(() => {
      fetchComments();
    }, 10000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [postId]);

  return {
    comments,
    loading,
    addComment,
    fetchComments
  };
};
