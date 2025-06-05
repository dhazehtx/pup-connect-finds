
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AddCommentInputProps {
  onAddComment: (comment: string) => void;
  disabled?: boolean;
}

const AddCommentInput = ({ onAddComment, disabled = false }: AddCommentInputProps) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (disabled) {
    return (
      <div className="text-gray-500 text-sm py-4 text-center">
        Comments have been disabled for this post
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-4 pt-4 border-t">
      <Input
        placeholder="Add a comment..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        onKeyPress={handleKeyPress}
        className="flex-1 border-none focus:ring-0"
      />
      <Button 
        onClick={handleSubmit}
        disabled={!newComment.trim()}
        variant="ghost"
        size="sm"
        className="text-blue-500 hover:text-blue-600 disabled:text-gray-400"
      >
        Post
      </Button>
    </div>
  );
};

export default AddCommentInput;
