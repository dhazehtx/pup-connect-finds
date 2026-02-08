// AUTH GATE - Dev Test Checklist:
// 1. Log out → click each gated CTA → should redirect to /greeting + show toast
//    - Explore: listing card click, heart button, "Sign in to view" button
//    - Store: "Buy Now", "Add" (add to cart)
//    - Pup Box: "Subscribe"/"One-Time" toggles, "Add to Cart"
//    - Services: "Sign in to book", "Book Service", "View Profile", "Become a Service Provider"
// 2. Log in → click each gated CTA → should perform normal action (no redirect)
// 3. Verify no console errors and no partial cart mutations before redirect
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
        window.scrollTo(0, 0);
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
