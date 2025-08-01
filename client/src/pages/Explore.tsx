import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import ExploreRouter from './ExploreRouter';
import ErrorBoundaryWrapper from '@/components/ErrorBoundaryWrapper';

const Explore = () => {
  const { user, loading, isGuest } = useAuth();
  const location = useLocation();

  // 1. INSTRUMENT FOR CLARITY - Scoped console logs
  console.log('[EXPLORE PAGE] Rendering Explore component', {
    userId: user?.id,
    hasUser: !!user,
    loading,
    isGuest,
    pathname: location.pathname,
    timestamp: Date.now()
  });

  useEffect(() => {
    console.log('[EXPLORE PAGE] Component mounted', { user: !!user, loading, isGuest });
    return () => console.log('[EXPLORE PAGE] Component unmounted');
  }, []);

  // Track auth state changes
  useEffect(() => {
    console.log('[EXPLORE PAGE] Auth state changed', { 
      userId: user?.id, 
      loading, 
      isGuest, 
      pathname: location.pathname 
    });
  }, [user?.id, loading, isGuest, location.pathname]);

  return (
    <ErrorBoundaryWrapper fallbackMessage="Explore page failed to load">
      <ExploreRouter />
    </ErrorBoundaryWrapper>
  );
};

export default Explore;