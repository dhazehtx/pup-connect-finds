
import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useAuthState } from '@/hooks/useAuthState';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: any | null;
  isGuest: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
  refreshProfile: () => Promise<any>;
  continueAsGuest: () => void;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authState = useAuthState();

  // Memoize callback functions to prevent unnecessary re-renders
  const continueAsGuest = useCallback(() => {
    localStorage.setItem('guestMode', 'true');
    console.log('Continuing as guest');
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    return authState.resetPassword(email);
  }, [authState.resetPassword]);

  // Wrapper functions to ensure void return type - memoized
  const signUp = useCallback(async (email: string, password: string, userData?: any) => {
    await authState.signUp(email, password, userData);
  }, [authState.signUp]);

  const signIn = useCallback(async (email: string, password: string) => {
    await authState.signIn(email, password);
  }, [authState.signIn]);

  const updateProfile = useCallback(async (updates: any) => {
    await authState.updateProfile(updates);
  }, [authState.updateProfile]);

  // Memoize guest detection logic
  const isGuest = useMemo(() => {
    return !authState.user && localStorage.getItem('guestMode') === 'true';
  }, [authState.user]);

  // 3. REFACTOR - COMPREHENSIVE FIX: Stabilize auth context completely
  // Create stable context value that only changes when core identity changes
  const value: AuthContextType = useMemo(() => {
    // Only log when context actually needs to be recreated
    console.log('[AUTH CONTEXT] Context stable, user ID:', authState.user?.id || 'none');
    
    return {
      user: authState.user,
      session: authState.session,
      loading: authState.loading,
      profile: authState.profile,
      isGuest,
      signUp,
      signIn,
      signOut: authState.signOut,
      updateProfile,
      refreshProfile: authState.refreshProfile,
      continueAsGuest,
      resetPassword,
    };
  }, [
    // Only re-create context when these core values actually change
    authState.user?.id,  // User identity only, not full object
    authState.session?.access_token, // Session identity only
    authState.loading,   // Loading state
    isGuest,            // Guest mode
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
