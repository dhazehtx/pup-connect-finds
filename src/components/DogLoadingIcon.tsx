
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DogLoadingIconProps {
  size?: number;
  className?: string;
  mobileSizeMultiplier?: number;
}

const DogLoadingIcon = ({ 
  size = 48, 
  className = "",
  mobileSizeMultiplier = 1.2
}: DogLoadingIconProps) => {
  const isMobile = useIsMobile();
  const actualSize = isMobile ? size * mobileSizeMultiplier : size;
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className="animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"
        style={{ 
          width: actualSize, 
          height: actualSize 
        }}
      />
    </div>
  );
};

export default DogLoadingIcon;
