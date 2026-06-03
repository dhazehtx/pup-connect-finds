import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { apiRequest } from '@/lib/api';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

/** PAWS ships light-only; Tailwind `dark:` utilities must not activate from OS preference. */
const LAUNCH_THEME: Theme = 'light';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(LAUNCH_THEME);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load theme on mount (preferences may still be read; UI always stays light)
  useEffect(() => {
    const loadTheme = async () => {
      try {
        if (user) {
          await apiRequest('/api/support/preferences');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setThemeState(LAUNCH_THEME);
        applyTheme(LAUNCH_THEME);
        localStorage.setItem('theme', LAUNCH_THEME);
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [user]);

  const applyTheme = (_newTheme: Theme) => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  };

  // Save theme to backend or localStorage
  const saveTheme = async (newTheme: Theme) => {
    try {
      if (user) {
        // Save to user preferences if authenticated
        await apiRequest('/api/support/preferences', { method: 'PATCH', body: { theme: newTheme } });
      } else {
        // Save to localStorage for unauthenticated users
        localStorage.setItem('theme', newTheme);
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      // Fallback to localStorage even if authenticated
      localStorage.setItem('theme', newTheme);
    }
  };

  const setTheme = async (_newTheme: Theme) => {
    setThemeState(LAUNCH_THEME);
    applyTheme(LAUNCH_THEME);
    await saveTheme(LAUNCH_THEME);
  };

  const toggleTheme = async () => {
    await setTheme(LAUNCH_THEME);
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;