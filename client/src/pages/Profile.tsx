
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingState from '@/components/ui/loading-state';
import UnifiedProfileView from '@/components/profile/UnifiedProfileView';

const Profile = () => {
  const { userId } = useParams();
  const { user, loading } = useAuth();
  
  // Determine if this is the current user's profile
  const isCurrentUser = !userId || (user && userId === user.id);
  
  if (loading) {
    return <LoadingState message="Loading profile..." />;
  }

  return <UnifiedProfileView userId={userId} isCurrentUser={isCurrentUser} />;
};

export default Profile;
