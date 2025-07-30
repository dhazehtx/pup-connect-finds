import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface SavePostButtonProps {
  postId: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const SavePostButton: React.FC<SavePostButtonProps> = ({
  postId,
  size = 'sm',
  showText = false,
  className = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSaved, setIsSaved] = useState(false);

  // Check if post is saved
  const { data: savedStatus } = useQuery({
    queryKey: ['saved-post', postId],
    queryFn: async () => {
      if (!user) return false;
      const response = await apiRequest('GET', `/api/saved-posts/check/${postId}`);
      return response.json();
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (savedStatus !== undefined) {
      setIsSaved(savedStatus.isSaved || false);
    }
  }, [savedStatus]);

  // Save/unsave mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isSaved) {
        // Unsave post
        return apiRequest('DELETE', `/api/saved-posts/${postId}`);
      } else {
        // Save post
        return apiRequest('POST', '/api/saved-posts', { post_id: postId });
      }
    },
    onSuccess: () => {
      const newSavedState = !isSaved;
      setIsSaved(newSavedState);
      
      // Update cache
      queryClient.setQueryData(['saved-post', postId], { isSaved: newSavedState });
      queryClient.invalidateQueries({ queryKey: ['saved-posts'] });
      
      toast({
        title: newSavedState ? "Post saved!" : "Post unsaved",
        description: newSavedState 
          ? "Added to your saved posts" 
          : "Removed from your saved posts",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save post",
        variant: "destructive",
      });
    },
  });

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to save posts",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate();
  };

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';
  const buttonSize = size === 'sm' ? 'sm' : size === 'md' ? 'sm' : 'default';

  return (
    <Button
      variant="ghost"
      size={buttonSize}
      onClick={handleSaveToggle}
      disabled={saveMutation.isPending}
      className={`p-0 h-auto text-muted-foreground hover:text-primary transition-colors ${className}`}
      aria-label={isSaved ? "Unsave post" : "Save post"}
    >
      {isSaved ? (
        <BookmarkCheck className={`${iconSize} text-primary fill-current`} />
      ) : (
        <Bookmark className={iconSize} />
      )}
      {showText && (
        <span className="ml-1 text-sm">
          {isSaved ? 'Saved' : 'Save'}
        </span>
      )}
    </Button>
  );
};

export default SavePostButton;