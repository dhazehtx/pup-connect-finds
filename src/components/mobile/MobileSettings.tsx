
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Volume2, VolumeX } from 'lucide-react';

interface MobileSettingsProps {
  isDarkMode: boolean;
  isSoundOn: boolean;
  onToggleDarkMode: () => void;
  onToggleSound: () => void;
}

export const MobileSettings = ({ 
  isDarkMode, 
  isSoundOn, 
  onToggleDarkMode, 
  onToggleSound 
}: MobileSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mobile Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span>Dark Mode</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleDarkMode}
            >
              {isDarkMode ? 'On' : 'Off'}
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isSoundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span>Sound</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleSound}
            >
              {isSoundOn ? 'On' : 'Off'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
