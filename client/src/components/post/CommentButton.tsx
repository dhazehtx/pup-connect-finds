
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { apiRequest } from '@/lib/api';

interface CommentButtonProps {
  postId: string;
  onCommentClick: () => void;
}

const CommentButton = ({ postId, onCommentClick }: CommentButtonProps) => {
  const [commentCount, setCommentCount] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const data = await apiRequest(`/api/posts/${postId}/comments/count`);
        setCommentCount(data?.count || 0);
      } catch {
        // silent fail for count
      }
    };

    fetchCommentCount();

    pollRef.current = setInterval(fetchCommentCount, 30000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
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
