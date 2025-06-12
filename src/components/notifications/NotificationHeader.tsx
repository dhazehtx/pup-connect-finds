
import React from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationHeaderProps {
  showSettings: boolean;
  onToggleSettings: () => void;
}

const NotificationHeader = ({ showSettings, onToggleSettings }: NotificationHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold text-deep-navy">Activity</h1>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleSettings}
        className="p-2"
      >
        <Settings className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default NotificationHeader;
