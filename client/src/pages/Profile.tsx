
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingState from '@/components/ui/loading-state';
import UnifiedProfileView from '@/components/profile/UnifiedProfileView';
import { useEnsureConsent } from '@/hooks/useEnsureConsent';

const Profile = () => {
  const { userId } = useParams();
  const { user, loading, loaded } = useAuth();
  const navigate = useNavigate();

  useEnsureConsent();

  if (!loaded || loading) {
    return <LoadingState message="Loading profile..." />;
  }

  // "My profile" (/profile) requires a signed-in user
  if (!userId && !user) {
    navigate('/greeting', { replace: true });
    return <LoadingState message="Redirecting..." />;
  }

  const isCurrentUser = Boolean(user && (!userId || userId === user.id));

  return <UnifiedProfileView key={userId || user?.id || 'me'} userId={userId} isCurrentUser={isCurrentUser} />;
};

export default Profile;
