import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CommentReplyInputProps {
  commentId: string;
  onSubmitReply: (content: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  placeholder?: string;
}

const CommentReplyInput: React.FC<CommentReplyInputProps> = ({
  commentId,
  onSubmitReply,
  onCancel,
  isSubmitting = false,
  placeholder = "Write a reply..."
}) => {
  const [replyText, setReplyText] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to reply to comments",
        variant: "destructive",
      });
      return;
    }

    if (!replyText.trim()) {
      toast({
        title: "Invalid input",
        description: "Reply cannot be empty",
        variant: "destructive",
      });
      return;
    }

    onSubmitReply(replyText.trim());
    setReplyText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="pl-8 pt-2">
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <Input
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 text-sm"
          disabled={isSubmitting}
          autoFocus
        />
        <Button
          type="submit"
          size="sm"
          disabled={!replyText.trim() || isSubmitting}
          className="px-3 py-2"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="px-3 py-2"
          disabled={isSubmitting}
        >
          <X className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default CommentReplyInput;