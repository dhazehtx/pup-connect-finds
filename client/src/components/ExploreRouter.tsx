import { useAuth } from '@/contexts/AuthContext';
import ExploreGuest from '../pages/ExploreGuest';
import ExploreAuth from '../pages/ExploreAuth';

export default function ExploreRouter() {
  const { user, loading } = useAuth();

  if (loading) return null;          // avoid flash
  if (!user)      return <ExploreGuest />;   // demo grid
  return <ExploreAuth />;                    // pill filters
}