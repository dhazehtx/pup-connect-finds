import { useAuth } from '@/contexts/AuthContext';
import ExploreGuest from '@/pages/ExploreGuest';
import ExploreAuth from '@/pages/ExploreAuth';

export default function ExploreRouter() {
  const { user, loading } = useAuth();

  if (loading) return null;          // wait until auth is resolved
  if (!user)      return <ExploreGuest />;   // guest 2-card demo
  return <ExploreAuth />;                    // signed-in filters
}