
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationHeaderProps {
  showSettings: boolean;
  onToggleSettings: () => void;
}

const NotificationHeader = ({ showSettings, onToggleSettings }: NotificationHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-black border-b border-gray-800">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="p-2 text-white hover:bg-gray-800">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-lg font-semibold text-white">Notifications</h1>
      </div>
      <Button 
        variant="ghost" 
        size="sm"
        className="text-white hover:bg-gray-800"
        onClick={onToggleSettings}
      >
        Settings
      </Button>
    </div>
  );
};

export default NotificationHeader;
