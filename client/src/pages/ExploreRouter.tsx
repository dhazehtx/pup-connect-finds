import { useAuth } from '@/contexts/AuthContext';
import ExploreGuest from '@/pages/ExploreGuest';
import ExploreAuth from '@/pages/ExploreAuth';

export default function ExploreRouter() {
  const { user, loading } = useAuth();

  // Debug logging for navigation issues
  console.log('[EXPLORE ROUTER] Rendering router', { user: !!user, loading });

  if (loading) {
    console.log('[EXPLORE ROUTER] Still loading, showing null');
    return null;          // wait until auth is resolved
  }
  
  if (!user) {
    console.log('[EXPLORE ROUTER] No user, showing guest explore');
    return <ExploreGuest />;   // guest 2-card demo
  }
  
  console.log('[EXPLORE ROUTER] User authenticated, showing auth explore');
  return <ExploreAuth />;                    // signed-in filters
}