
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified?: boolean;
  isFollowing?: boolean;
}

interface LikesModalProps {
  isOpen: boolean;
  onClose: () => void;
  likes: User[];
  onProfileClick: (userId: string) => void;
}

const LikesModal = ({ isOpen, onClose, likes, onProfileClick }: LikesModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset to first user when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, likes.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : likes.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < likes.length - 1 ? prev + 1 : 0));
  };

  const handleFollow = (userId: string, isFollowing: boolean) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to follow users",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: isFollowing ? "Unfollowed" : "Following",
      description: isFollowing 
        ? "You have unfollowed this user" 
        : "You are now following this user",
    });
  };

  if (likes.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Likes</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 text-gray-500">
            No likes yet
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const currentUser = likes[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Likes</span>
            <span className="text-sm font-normal text-gray-500">
              {currentIndex + 1} of {likes.length}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {/* Navigation arrows */}
          {likes.length > 1 && (
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevious}
                className="p-2"
              >
                <ChevronLeft size={20} />
              </Button>
              
              <div className="flex space-x-1">
                {likes.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNext}
                className="p-2"
              >
                <ChevronRight size={20} />
              </Button>
            </div>
          )}

          {/* Current user display */}
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-3 cursor-pointer flex-1"
              onClick={() => onProfileClick(currentUser.id)}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="font-medium text-base truncate">{currentUser.username}</p>
                  {currentUser.verified && (
                    <span className="text-blue-500">✓</span>
                  )}
                </div>
                <p className="text-gray-600 text-sm truncate">{currentUser.name}</p>
              </div>
            </div>
            
            {user && user.id !== currentUser.id && (
              <Button
                size="sm"
                variant={currentUser.isFollowing ? "outline" : "default"}
                onClick={() => handleFollow(currentUser.id, currentUser.isFollowing || false)}
                className="ml-2"
              >
                {currentUser.isFollowing ? (
                  <>
                    <UserCheck size={14} className="mr-1" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus size={14} className="mr-1" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Navigation instructions */}
          {likes.length > 1 && (
            <div className="mt-4 text-xs text-gray-500 text-center">
              Use arrow keys or buttons to navigate
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LikesModal;
