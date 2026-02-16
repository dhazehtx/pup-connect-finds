import React from 'react';
import { Users, MessageSquare, Calendar, Crown, Shield, Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface GroupCardProps {
  group: any;
  variant?: 'grid' | 'list';
  isJoined?: boolean;
  userRole?: string;
  onJoin?: (groupId: string) => void;
  isJoining?: boolean;
  getBreedEmoji: (breedTag: string) => string;
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  variant = 'grid',
  isJoined = false,
  userRole,
  onJoin,
  isJoining = false,
  getBreedEmoji
}) => {
  const handleJoinClick = () => {
    if (onJoin && !isJoined) {
      onJoin(group.id);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-3 h-3 text-blue-600" />;
      case 'moderator':
        return <Shield className="w-3 h-3 text-blue-600" />;
      default:
        return null;
    }
  };

  const formatBreedName = (breedTag: string) => {
    return breedTag?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General';
  };

  if (variant === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              {/* Group Icon/Avatar */}
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={group.cover_image} />
                  <AvatarFallback className="text-lg">
                    {group.breed_tag ? getBreedEmoji(group.breed_tag) : '🐕'}
                  </AvatarFallback>
                </Avatar>
                {group.is_verified && (
                  <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                    <Star className="w-2 h-2 text-white" />
                  </div>
                )}
              </div>

              {/* Group Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {group.name}
                  </h3>
                  {userRole && getRoleIcon(userRole)}
                  {group.privacy === 'private' && (
                    <Badge variant="secondary" className="text-xs">Private</Badge>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {group.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{group.member_count} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{group.post_count} posts</span>
                  </div>
                  {group.breed_tag && (
                    <Badge variant="outline" className="text-xs">
                      {getBreedEmoji(group.breed_tag)} {formatBreedName(group.breed_tag)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="ml-4">
              {isJoined ? (
                <Button 
                  onClick={() => window.location.href = `/community/groups/${group.id}`}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  View Group
                </Button>
              ) : (
                <Button
                  onClick={handleJoinClick}
                  disabled={isJoining}
                  variant="outline"
                  className="hover:bg-blue-50 hover:border-blue-300"
                >
                  {isJoining ? 'Joining...' : 'Join Group'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid layout
  return (
    <Card className="hover:shadow-md transition-shadow group cursor-pointer">
      <div onClick={() => window.location.href = `/community/groups/${group.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={group.cover_image} />
                  <AvatarFallback className="text-lg">
                    {group.breed_tag ? getBreedEmoji(group.breed_tag) : '🐕'}
                  </AvatarFallback>
                </Avatar>
                {group.is_verified && (
                  <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                    <Star className="w-2 h-2 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 truncate text-sm">
                    {group.name}
                  </h3>
                  {userRole && getRoleIcon(userRole)}
                </div>
                {group.breed_tag && (
                  <p className="text-xs text-gray-500">
                    {getBreedEmoji(group.breed_tag)} {formatBreedName(group.breed_tag)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {group.privacy === 'private' && (
                <Badge variant="secondary" className="text-xs">Private</Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
            {group.description}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{group.member_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>{group.post_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDistanceToNow(new Date(group.created_at), { addSuffix: true })}</span>
            </div>
          </div>

          {/* Creator info */}
          {group.creator_name && (
            <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
              <Avatar className="h-6 w-6">
                <AvatarImage src={group.creator_avatar} />
                <AvatarFallback className="text-xs">
                  {group.creator_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-600">
                Created by {group.creator_name}
              </span>
            </div>
          )}
        </CardContent>
      </div>

      {/* Join button outside the clickable area */}
      <div className="px-6 pb-4">
        {isJoined ? (
          <Button 
            onClick={() => window.location.href = `/community/groups/${group.id}`}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            View Group
          </Button>
        ) : (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleJoinClick();
            }}
            disabled={isJoining}
            variant="outline"
            className="w-full hover:bg-blue-50 hover:border-blue-300"
            size="sm"
          >
            {isJoining ? 'Joining...' : 'Join Group'}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default GroupCard;