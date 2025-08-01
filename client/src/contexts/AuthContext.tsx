
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

  // 3. REFACTOR - ROOT CAUSE FIX: Simplify and stabilize with minimal propagation
  // Only re-memoize when actual identity changes, not object references
  const stableUser = useMemo(() => authState.user, [authState.user?.id]);
  const stableProfile = useMemo(() => authState.profile, [authState.profile?.id]);
  
  // Memoize the entire context value to prevent unnecessary re-renders
  const value: AuthContextType = useMemo(() => {
    console.log('[AUTH CONTEXT] Creating new context value:', {
      userId: authState.user?.id,
      hasUser: !!authState.user,
      loading: authState.loading,
      isGuest,
      timestamp: Date.now()
    });
    
    return {
      user: stableUser,
      session: authState.session,
      loading: authState.loading,
      profile: stableProfile,
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
    stableUser,
    authState.session,
    authState.loading,
    stableProfile,
    authState.signOut,
    authState.refreshProfile,
    isGuest,
    signUp,
    signIn,
    updateProfile,
    continueAsGuest,
    resetPassword,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
