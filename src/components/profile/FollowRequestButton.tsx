
import React, { useState } from 'react';
import { UserPlus, UserCheck, Clock, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface FollowRequestButtonProps {
  targetUserId: string;
  isPrivateAccount: boolean;
  currentStatus: 'not_following' | 'following' | 'pending' | 'blocked';
  onStatusChange?: (newStatus: string) => void;
}

const FollowRequestButton = ({ 
  targetUserId, 
  isPrivateAccount, 
  currentStatus,
  onStatusChange 
}: FollowRequestButtonProps) => {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAction = async () => {
    setLoading(true);
    
    try {
      let newStatus = status;
      
      switch (status) {
        case 'not_following':
          if (isPrivateAccount) {
            // Send follow request
            newStatus = 'pending';
            toast({
              title: "Follow request sent",
              description: "Your follow request has been sent and is awaiting approval.",
            });
          } else {
            // Follow immediately for public accounts
            newStatus = 'following';
            toast({
              title: "Following",
              description: "You are now following this user.",
            });
          }
          break;
          
        case 'following':
          // Unfollow
          newStatus = 'not_following';
          toast({
            title: "Unfollowed",
            description: "You have unfollowed this user.",
          });
          break;
          
        case 'pending':
          // Cancel follow request
          newStatus = 'not_following';
          toast({
            title: "Request cancelled",
            description: "Your follow request has been cancelled.",
          });
          break;
      }
      
      setStatus(newStatus);
      onStatusChange?.(newStatus);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getButtonContent = () => {
    switch (status) {
      case 'following':
        return {
          icon: <UserCheck size={16} />,
          text: 'Following',
          variant: 'outline' as const,
          className: 'border-green-500 text-green-600 hover:bg-green-50'
        };
        
      case 'pending':
        return {
          icon: <Clock size={16} />,
          text: 'Requested',
          variant: 'outline' as const,
          className: 'border-yellow-500 text-yellow-600 hover:bg-yellow-50'
        };
        
      case 'blocked':
        return {
          icon: <UserX size={16} />,
          text: 'Blocked',
          variant: 'outline' as const,
          className: 'border-red-500 text-red-600 cursor-not-allowed',
          disabled: true
        };
        
      default:
        return {
          icon: <UserPlus size={16} />,
          text: isPrivateAccount ? 'Request to Follow' : 'Follow',
          variant: 'default' as const,
          className: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
    }
  };

  const buttonContent = getButtonContent();

  return (
    <Button
      size="sm"
      variant={buttonContent.variant}
      className={`flex items-center gap-2 ${buttonContent.className}`}
      onClick={handleAction}
      disabled={loading || buttonContent.disabled}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      ) : (
        buttonContent.icon
      )}
      {buttonContent.text}
    </Button>
  );
};

export default FollowRequestButton;
