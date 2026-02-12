
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingState from '@/components/ui/loading-state';
import UnifiedProfileView from '@/components/profile/UnifiedProfileView';
import { useEnsureConsent } from '@/hooks/useEnsureConsent';

const DEBUG = import.meta.env.DEV && false;

const Profile = () => {
  const { userId } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Auto-post consent after login
  useEnsureConsent();
  
  // Debug logging - throttled to avoid excessive re-renders
  useEffect(() => {
    if (DEBUG) console.debug('[PROFILE PAGE] Component state changed', { userId, user: !!user, loading });
  }, [userId, user, loading]);

  useEffect(() => {
    if (DEBUG) console.debug('[PROFILE PAGE] Component mounted', { userId });
  }, [userId]);

  useEffect(() => {
    if (DEBUG) console.debug('[PROFILE PAGE] Auth state changed:', { user: !!user, loading });
  }, [user, loading]);
  
  // Force redirect when signed out - adapted for React Router  
  useEffect(() => {
    if (!loading && !user) {
      if (DEBUG) console.debug('[PROFILE PAGE] Redirecting to greeting - no user');
      navigate('/greeting');
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

  return <UnifiedProfileView key={userId || user.id} userId={userId} isCurrentUser={isCurrentUser || false} />;
};

export default Profile;
