
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck } from 'lucide-react';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Likes</DialogTitle>
        </DialogHeader>
        
        <div className="max-h-80 overflow-y-auto">
          <div className="space-y-3">
            {likes.map((likedUser) => (
              <div key={likedUser.id} className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => onProfileClick(likedUser.id)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={likedUser.avatar} />
                    <AvatarFallback>{likedUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-sm truncate">{likedUser.username}</p>
                      {likedUser.verified && (
                        <span className="text-blue-500">✓</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-xs truncate">{likedUser.name}</p>
                  </div>
                </div>
                
                {user && user.id !== likedUser.id && (
                  <Button
                    size="sm"
                    variant={likedUser.isFollowing ? "outline" : "default"}
                    onClick={() => handleFollow(likedUser.id, likedUser.isFollowing || false)}
                    className="ml-2"
                  >
                    {likedUser.isFollowing ? (
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
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LikesModal;
