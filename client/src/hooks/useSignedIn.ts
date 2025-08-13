// client/src/hooks/useSignedIn.ts
// Supabase adapter for single source of truth for signed in state
import { useAuth } from '@/contexts/AuthContext';

export function useSignedIn() {
  const { user } = useAuth();
  return !!user;
}