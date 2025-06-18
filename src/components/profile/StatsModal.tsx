
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, UserPlus } from 'lucide-react';

interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  verified?: boolean;
  isFollowing?: boolean;
}

interface Puppy {
  id: string;
  name: string;
  breed: string;
  age: string;
  price: number;
  image: string;
}

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'followers' | 'following' | 'puppies';
  data: User[] | Puppy[];
  onFollowToggle?: (userId: string) => void;
  onPuppyClick?: (puppyId: string) => void;
}

const StatsModal = ({ 
  isOpen, 
  onClose, 
  type, 
  data, 
  onFollowToggle,
  onPuppyClick 
}: StatsModalProps) => {
  const getTitle = () => {
    switch (type) {
      case 'followers': return 'Followers';
      case 'following': return 'Following';
      case 'puppies': return 'Puppies Listed';
      default: return '';
    }
  };

  const renderUserList = (users: User[]) => (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                {user.name?.charAt(0) || user.username?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{user.name || user.username}</span>
                {user.verified && (
                  <CheckCircle size={14} className="text-blue-500" />
                )}
              </div>
              <p className="text-sm text-gray-600">@{user.username}</p>
            </div>
          </div>
          
          <Button 
            size="sm" 
            variant={user.isFollowing ? "outline" : "default"}
            onClick={() => onFollowToggle?.(user.id)}
            className="flex items-center gap-1"
          >
            <UserPlus size={14} />
            {user.isFollowing ? 'Following' : 'Follow'}
          </Button>
        </div>
      ))}
    </div>
  );

  const renderPuppyList = (puppies: Puppy[]) => (
    <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
      {puppies.map((puppy) => (
        <div 
          key={puppy.id} 
          className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onPuppyClick?.(puppy.id)}
        >
          <img 
            src={puppy.image} 
            alt={puppy.name}
            className="w-full h-32 object-cover"
          />
          <div className="p-3">
            <h4 className="font-medium text-sm">{puppy.name}</h4>
            <p className="text-xs text-gray-600">{puppy.breed}</p>
            <p className="text-xs text-gray-600">{puppy.age}</p>
            <p className="font-semibold text-sm text-blue-600">${puppy.price}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTitle()}
            <Badge variant="secondary">{data.length}</Badge>
          </DialogTitle>
        </DialogHeader>
        
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No {type} yet
          </div>
        ) : type === 'puppies' ? (
          renderPuppyList(data as Puppy[])
        ) : (
          renderUserList(data as User[])
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StatsModal;
