import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useRequireAuth() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const requireAuth = useCallback(
    (action: () => void) => {
      if (!user) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to continue.',
        });
        navigate('/greeting');
        return;
      }
      action();
    },
    [user, navigate, toast],
  );

  const isAuthenticated = !!user;

  return { requireAuth, isAuthenticated };
}
