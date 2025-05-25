
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationHeaderProps {
  showSettings: boolean;
  onToggleSettings: () => void;
}

const NotificationHeader = ({ showSettings, onToggleSettings }: NotificationHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="p-2 text-gray-800 hover:bg-gray-100">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-lg font-semibold text-gray-800">Notifications</h1>
      </div>
      <Button 
        variant="ghost" 
        size="sm"
        className="text-gray-800 hover:bg-gray-100"
        onClick={onToggleSettings}
      >
        Settings
      </Button>
    </div>
  );
};

export default NotificationHeader;
