
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

  // Legacy support for guest mode
  const continueAsGuest = () => {
    localStorage.setItem('guestMode', 'true');
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
