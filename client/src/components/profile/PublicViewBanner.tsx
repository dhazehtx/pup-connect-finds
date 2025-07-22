
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, X } from 'lucide-react';

interface PublicViewBannerProps {
  isVisible: boolean;
  onExit: () => void;
}

const PublicViewBanner = ({ isVisible, onExit }: PublicViewBannerProps) => {
  if (!isVisible) return null;

  return (
    <div className="sticky top-0 z-50 bg-blue-600 text-white">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">Public View</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onExit}
            className="text-white hover:bg-blue-700 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PublicViewBanner;
