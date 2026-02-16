import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, UserMinus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface FollowButtonProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showText?: boolean;
  className?: string;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  size = 'sm',
  variant = 'default',
  showText = true,
  className = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Don't show follow button for own profile
  if (user?.id === userId) {
    return null;
  }

  const { data: followStatus } = useQuery({
    queryKey: ['follow-status', userId],
    queryFn: async () => {
      if (!user) return { isFollowing: false };
      return apiRequest(`/api/follows/check/${userId}`);
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (followStatus !== undefined) {
      setIsFollowing(followStatus.isFollowing || false);
    }
  }, [followStatus]);

  const followMutation = useMutation({
    mutationFn: async () => {
      console.log('[FOLLOW] mutationFn fired, isFollowing:', isFollowing, 'userId:', userId);
      if (isFollowing) {
        const result = await apiRequest(`/api/follows/${userId}`, { method: 'DELETE' });
        console.log('[FOLLOW] unfollow response:', result);
        return result;
      } else {
        const result = await apiRequest('/api/follows', { method: 'POST', body: { followed_id: userId } });
        console.log('[FOLLOW] follow response:', result);
        return result;
      }
    },
    onSuccess: () => {
      const newFollowingState = !isFollowing;
      setIsFollowing(newFollowingState);
      queryClient.setQueryData(['follow-status', userId], { isFollowing: newFollowingState });
      queryClient.invalidateQueries({ queryKey: ['follow-status'] });
      queryClient.invalidateQueries({ queryKey: ['follows'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      toast({
        title: newFollowingState ? "Now following!" : "Unfollowed",
        description: newFollowingState 
          ? "You'll see their posts in your feed" 
          : "You won't see their posts in your feed anymore",
      });
    },
    onError: (error: any) => {
      console.error('[FOLLOW] mutation error:', error);
      const msg = error?.message || "Failed to update follow status";
      toast({
        title: "Couldn't update follow",
        description: msg.includes('404') ? "That user's profile wasn't found" : msg,
        variant: "destructive",
      });
    },
  });

  const handleFollowToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[FOLLOW_CLICK] handler fired, user:', user?.id, 'target:', userId);
    
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to follow users",
        variant: "destructive",
      });
      return;
    }

    followMutation.mutate();
  };

  const getButtonVariant = () => {
    if (isFollowing) {
      return isHovered ? 'destructive' : 'outline';
    }
    return variant;
  };

  const getButtonText = () => {
    if (!showText) return '';
    
    if (isFollowing) {
      return isHovered ? 'Unfollow' : 'Following';
    }
    return 'Follow';
  };

  const getIcon = () => {
    if (isFollowing) {
      return isHovered ? (
        <UserMinus className={size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'} />
      ) : (
        <UserCheck className={size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'} />
      );
    }
    return <UserPlus className={size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'} />;
  };

  return (
    <Button
      variant={getButtonVariant()}
      size={size === 'md' ? 'default' : size}
      onClick={handleFollowToggle}
      disabled={followMutation.isPending}
      className={`transition-all duration-200 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={isFollowing ? "Unfollow user" : "Follow user"}
    >
      {getIcon()}
      {showText && (
        <span className="ml-1">
          {getButtonText()}
        </span>
      )}
    </Button>
  );
};

export default FollowButton;