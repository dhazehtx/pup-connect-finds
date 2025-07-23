
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { useComments } from '@/hooks/useComments';
import { useCommentsWithReplies } from '@/hooks/useCommentReplies';
import CommentWithReplies from './CommentWithReplies';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  onProfileClick: (userId: string) => void;
}

const CommentsModal = ({ isOpen, onClose, postId, onProfileClick }: CommentsModalProps) => {
  const { comments, loading, addComment } = useComments(postId);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    await addComment(newComment.trim());
    setNewComment('');
    setSubmitting(false);
  };

  const handleProfileClick = (userId: string) => {
    onProfileClick(userId);
    onClose(); // Close modal when navigating to profile
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {loading ? (
            <div className="flex justify-center">
              <div className="text-sm text-gray-500">Loading comments...</div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No comments yet</p>
              <p className="text-sm">Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentWithReplies
                key={comment.id}
                comment={comment}
                onProfileClick={handleProfileClick}
              />
            ))
          )}
        </div>

        {user && (
          <form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t">
            <Input
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submitting}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!newComment.trim() || submitting}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CommentsModal;
