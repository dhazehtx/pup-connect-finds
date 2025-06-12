
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSkeleton from '@/components/LoadingSkeleton';

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

  // For routes that don't allow guests or when user is not authenticated,
  // redirect to auth page
  if (!user || (isGuest && !allowGuest)) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Default fallback to auth page
  return <Navigate to="/auth" state={{ from: location }} replace />;
};

export default ProtectedRoute;
