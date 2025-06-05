
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, UserPlus } from 'lucide-react';

interface User {
  id: string;
  full_name: string;
  username: string;
  avatar_url?: string;
  verified: boolean;
  user_type: string;
}

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'followers' | 'following';
  users: User[];
  currentUserId?: string;
}

const FollowersModal = ({ isOpen, onClose, type, users, currentUserId }: FollowersModalProps) => {
  const title = type === 'followers' ? 'Followers' : 'Following';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {title}
            <Badge variant="secondary">{users.length}</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No {type} yet
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>
                      {user.full_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.full_name || user.username}</span>
                      {user.verified && (
                        <CheckCircle size={14} className="text-blue-500" />
                      )}
                      {user.user_type === 'breeder' && (
                        <Badge variant="secondary" className="text-xs">
                          Breeder
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">@{user.username}</p>
                  </div>
                </div>
                
                {user.id !== currentUserId && (
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <UserPlus size={14} />
                    Follow
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowersModal;
