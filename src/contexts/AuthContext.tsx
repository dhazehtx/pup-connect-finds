
import React, { createContext, useContext } from 'react';
import { useAuthState } from '@/hooks/useAuth';

interface AuthContextType extends ReturnType<typeof useAuthState> {
  continueAsGuest: () => void;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authState = useAuthState();

  const continueAsGuest = () => {
    localStorage.setItem('guestMode', 'true');
    // Force a page reload to update the auth state
    window.location.reload();
  };

  const isGuest = localStorage.getItem('guestMode') === 'true' && !authState.user;

  const value: AuthContextType = {
    ...authState,
    continueAsGuest,
    isGuest,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
