
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingState from '@/components/ui/loading-state';
import UnifiedProfileView from '@/components/profile/UnifiedProfileView';

const Profile = () => {
  const { userId } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Auth guard - redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);
  
  // Determine if this is the current user's profile
  const isCurrentUser = !userId || (user && userId === user.id);
  
  if (loading) {
    return <LoadingState message="Loading profile..." />;
  }

  if (!user) {
    return <LoadingState message="Redirecting..." />;
  }

  return <UnifiedProfileView userId={userId} isCurrentUser={isCurrentUser || false} />;
};

export default Profile;
