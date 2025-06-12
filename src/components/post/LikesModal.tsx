
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            Likes ({likes.length})
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {likes.map((currentUser, index) => (
              <div key={index} className="flex items-center justify-between">
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
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default LikesModal;
