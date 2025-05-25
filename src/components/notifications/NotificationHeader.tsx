
import React from 'react';
import { Button } from '@/components/ui/button';

interface NotificationHeaderProps {
  showSettings: boolean;
  onToggleSettings: () => void;
}

const NotificationHeader = ({ showSettings, onToggleSettings }: NotificationHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onToggleSettings}
        >
          Settings
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-amber-600 hover:text-amber-700"
        >
          Mark all as read
        </Button>
      </div>
    </div>
  );
};

export default NotificationHeader;
