
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          {isDarkMode ? (
            <Moon size={20} className="text-blue-600" />
          ) : (
            <Sun size={20} className="text-yellow-600" />
          )}
        </div>
        <div>
          <Label htmlFor="dark-mode" className="font-medium text-gray-900 dark:text-white">
            Dark Mode
          </Label>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Switch between light and dark themes
          </p>
        </div>
      </div>
      <Switch 
        id="dark-mode"
        checked={isDarkMode}
        onCheckedChange={toggleDarkMode}
      />
    </div>
  );
};

export default DarkModeToggle;
