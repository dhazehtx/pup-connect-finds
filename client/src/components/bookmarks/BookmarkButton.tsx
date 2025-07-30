import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface BookmarkButtonProps {
  contentId: string;
  contentType: 'post' | 'listing';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  contentId,
  contentType,
  size = 'sm',
  showText = false,
  className = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Check if content is bookmarked
  const { data: bookmarkStatus } = useQuery({
    queryKey: ['bookmark', contentId, contentType],
    queryFn: async () => {
      if (!user) return false;
      const response = await apiRequest('GET', `/api/bookmarks/check/${contentId}/${contentType}`);
      return response.json();
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (bookmarkStatus !== undefined) {
      setIsBookmarked(bookmarkStatus.isBookmarked || false);
    }
  }, [bookmarkStatus]);

  // Bookmark/unbookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (isBookmarked) {
        // Remove bookmark
        return apiRequest('DELETE', `/api/bookmarks/${contentId}/${contentType}`);
      } else {
        // Add bookmark
        return apiRequest('POST', '/api/bookmarks', { 
          content_id: contentId, 
          content_type: contentType 
        });
      }
    },
    onSuccess: () => {
      const newBookmarkedState = !isBookmarked;
      setIsBookmarked(newBookmarkedState);
      
      // Update cache
      queryClient.setQueryData(['bookmark', contentId, contentType], { isBookmarked: newBookmarkedState });
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      
      toast({
        title: newBookmarkedState ? "Bookmarked!" : "Bookmark removed",
        description: newBookmarkedState 
          ? `${contentType === 'post' ? 'Post' : 'Listing'} added to your bookmarks` 
          : `${contentType === 'post' ? 'Post' : 'Listing'} removed from bookmarks`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update bookmark",
        variant: "destructive",
      });
    },
  });

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to bookmark content",
        variant: "destructive",
      });
      return;
    }

    bookmarkMutation.mutate();
  };

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';
  const buttonSize = size === 'sm' ? 'sm' : size === 'md' ? 'sm' : 'default';

  return (
    <Button
      variant="ghost"
      size={buttonSize}
      onClick={handleBookmarkToggle}
      disabled={bookmarkMutation.isPending}
      className={`p-0 h-auto text-muted-foreground hover:text-primary transition-colors ${className}`}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      {isBookmarked ? (
        <BookmarkCheck className={`${iconSize} text-primary fill-current`} />
      ) : (
        <Bookmark className={iconSize} />
      )}
      {showText && (
        <span className="ml-1 text-sm">
          {isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </span>
      )}
    </Button>
  );
};

export default BookmarkButton;