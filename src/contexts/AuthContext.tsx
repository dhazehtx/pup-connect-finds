
import React, { createContext, useContext } from 'react';
import { useAuthState } from '@/hooks/useAuth';

const AuthContext = createContext<ReturnType<typeof useAuthState> | undefined>(undefined);

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

  const value = {
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
