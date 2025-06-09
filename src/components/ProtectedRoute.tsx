
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import GuestPrompt from '@/components/GuestPrompt';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowGuest?: boolean;
  guestMessage?: string;
}

const ProtectedRoute = ({ children, allowGuest = false, guestMessage }: ProtectedRouteProps) => {
  const { user, loading, isGuest } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSkeleton viewMode="grid" count={3} />;
  }

  // If user is authenticated, show content
  if (user) {
    return <>{children}</>;
  }

  // If route allows guests and user is a guest, show content
  if (allowGuest && isGuest) {
    return <>{children}</>;
  }

  // For protected routes, show guest prompt if user is guest or not authenticated
  if (!user && !allowGuest) {
    return (
      <GuestPrompt
        action="access this feature"
        description={guestMessage || "This feature requires a MY PUP account to continue."}
      />
    );
  }

  // Default fallback to auth page
  return <Navigate to="/auth" state={{ from: location }} replace />;
};

export default ProtectedRoute;
