
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationHeaderProps {
  showSettings: boolean;
  onToggleSettings: () => void;
}

const NotificationHeader = ({ showSettings, onToggleSettings }: NotificationHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5 text-deep-navy" />
          </Button>
          <h1 className="text-lg font-semibold text-deep-navy">Notifications</h1>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSettings}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <Settings className="h-5 w-5 text-deep-navy" />
        </Button>
      </div>
    </div>
  );
};

export default NotificationHeader;
