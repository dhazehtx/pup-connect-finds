import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingPage } from '@/components/ui/loading';

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait until AuthContext finishes its first check
  if (loading) return <LoadingPage message="Authenticating..." />;

  // Not signed-in → go to greeting and remember where they tried to go
  if (!user) {
    return <Navigate to="/greeting" state={{ from: location }} replace />;
  }

  // Signed-in → render the protected page
  return children;
}