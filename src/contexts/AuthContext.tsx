
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthState } from '@/hooks/useAuth';
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

  const continueAsGuest = () => {
    localStorage.setItem('guestMode', 'true');
    console.log('Continuing as guest');
  };

  const resetPassword = async (email: string) => {
    // This will be implemented in the auth hook
    return authState.resetPassword(email);
  };

  const value: AuthContextType = {
    ...authState,
    isGuest: !authState.user && !authState.loading,
    continueAsGuest,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
