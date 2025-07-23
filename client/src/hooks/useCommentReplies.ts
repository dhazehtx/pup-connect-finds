import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface CommentReply {
  id: string;
  comment_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

export const useCommentReplies = (commentId: string | null) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch replies for a specific comment
  const { data: replies = [], isLoading, error } = useQuery({
    queryKey: ['comment-replies', commentId],
    queryFn: async () => {
      if (!commentId) return [];
      
      const response = await fetch(`/api/comments/${commentId}/replies`);
      if (!response.ok) {
        throw new Error('Failed to fetch replies');
      }
      return response.json();
    },
    enabled: !!commentId,
  });

  // Create a new reply
  const createReplyMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const response = await fetch('/api/comment-replies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment_id: commentId,
          user_id: user.id,
          content,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create reply');
      }
      
      return response.json();
    },
    onSuccess: (newReply, variables) => {
      // Invalidate and refetch the replies for this comment
      queryClient.invalidateQueries({ queryKey: ['comment-replies', variables.commentId] });
      
      toast({
        title: "Reply posted",
        description: "Your reply has been added to the comment",
      });
    },
    onError: (error) => {
      console.error('Error creating reply:', error);
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addReply = (commentId: string, content: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to reply to comments",
        variant: "destructive",
      });
      return;
    }
    
    if (!content.trim()) {
      toast({
        title: "Invalid input",
        description: "Reply cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    createReplyMutation.mutate({ commentId, content: content.trim() });
  };

  return {
    replies,
    isLoading,
    error,
    addReply,
    isCreatingReply: createReplyMutation.isPending,
  };
};

// Hook for managing all replies across multiple comments
export const useCommentsWithReplies = (postId: string) => {
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  
  // Fetch comments for the post
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      if (!postId) return [];
      
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      return response.json();
    },
    enabled: !!postId,
  });

  const toggleReplies = (commentId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  return {
    comments,
    commentsLoading,
    expandedComments,
    toggleReplies,
    isCommentExpanded: (commentId: string) => expandedComments.has(commentId),
  };
};