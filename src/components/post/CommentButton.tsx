
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CommentButtonProps {
  postId: string;
  onCommentClick: () => void;
}

const CommentButton = ({ postId, onCommentClick }: CommentButtonProps) => {
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    const fetchCommentCount = async () => {
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);
      
      setCommentCount(count || 0);
    };

    fetchCommentCount();

    // Set up real-time subscription for comment count
    const channel = supabase
      .channel(`comment-count-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        () => {
          fetchCommentCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="p-0 h-auto flex items-center gap-1"
      onClick={onCommentClick}
    >
      <MessageCircle className="w-6 h-6" />
      {commentCount > 0 && (
        <span className="text-sm">{commentCount}</span>
      )}
    </Button>
  );
};

export default CommentButton;
