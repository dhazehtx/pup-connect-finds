
import React, { useState } from 'react';
import { Phone, Heart, UserPlus, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ContactDialog from './ContactDialog';

interface ProfileActionsProps {
  profile?: {
    id: string;
    full_name: string;
    email?: string;
    phone?: string;
  };
  isOwnProfile?: boolean;
}

const ProfileActions = ({ profile, isOwnProfile }: ProfileActionsProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFollow = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to follow users",
        variant: "destructive",
      });
      return;
    }

    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Unfollowed" : "Following",
      description: isFollowing 
        ? `You have unfollowed ${profile?.full_name}` 
        : `You are now following ${profile?.full_name}`,
    });
  };

  const handleContact = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to contact users",
        variant: "destructive",
      });
      return;
    }
    setShowContactDialog(true);
  };

  // Don't show actions for own profile
  if (isOwnProfile) {
    return null;
  }

  return (
    <>
      <div className="flex gap-2 mb-4">
        <Button 
          onClick={handleContact}
          className="flex-1 bg-blue-500 text-white hover:bg-blue-600"
        >
          <Phone size={16} className="mr-2" />
          Contact
        </Button>
        <Button 
          onClick={handleFollow}
          className={`flex-1 ${
            isFollowing 
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isFollowing ? (
            <>
              <UserCheck size={16} className="mr-2" />
              Following
            </>
          ) : (
            <>
              <UserPlus size={16} className="mr-2" />
              Follow
            </>
          )}
        </Button>
      </div>

      {profile && (
        <ContactDialog
          isOpen={showContactDialog}
          onClose={() => setShowContactDialog(false)}
          profile={profile}
        />
      )}
    </>
  );
};

export default ProfileActions;
