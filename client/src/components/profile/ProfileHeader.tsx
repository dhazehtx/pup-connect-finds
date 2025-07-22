
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ProfileHeaderProps {
  displayName: string;
  showHeader: boolean;
  onBack: () => void;
}

const ProfileHeader = ({ displayName, showHeader, onBack }: ProfileHeaderProps) => {
  if (!showHeader) return null;

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900 flex-1 text-center">
            {displayName}
          </h1>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
