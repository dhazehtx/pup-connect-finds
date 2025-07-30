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

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        if (user) {
          // Load theme from user preferences if authenticated
          const response = await apiRequest('GET', '/api/support/preferences');
          const data = await response.json();
          const savedTheme = data.theme || 'light';
          setThemeState(savedTheme);
          applyTheme(savedTheme);
        } else {
          // Load theme from localStorage for unauthenticated users
          const savedTheme = localStorage.getItem('theme') as Theme;
          if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            setThemeState(savedTheme);
            applyTheme(savedTheme);
          } else {
            // Default to system preference
            const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            setThemeState(systemPreference);
            applyTheme(systemPreference);
            localStorage.setItem('theme', systemPreference);
          }
        }
      } catch (error) {
        console.error('Error loading theme:', error);
        // Fallback to localStorage or system preference
        const savedTheme = localStorage.getItem('theme') as Theme || 'light';
        setThemeState(savedTheme);
        applyTheme(savedTheme);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [user]);

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  // Save theme to backend or localStorage
  const saveTheme = async (newTheme: Theme) => {
    try {
      if (user) {
        // Save to user preferences if authenticated
        await apiRequest('PATCH', '/api/support/preferences', { theme: newTheme });
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

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    await saveTheme(newTheme);
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    await setTheme(newTheme);
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only auto-update if no user preference is set
      const hasUserPreference = user || localStorage.getItem('theme');
      if (!hasUserPreference) {
        const systemTheme = e.matches ? 'dark' : 'light';
        setThemeState(systemTheme);
        applyTheme(systemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [user]);

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