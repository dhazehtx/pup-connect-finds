
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingState from '@/components/ui/loading-state';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isGuest, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState message="Checking authentication..." />;
  }

  // If user is not authenticated and not in guest mode, redirect to greeting page
  if (!user && !isGuest) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
