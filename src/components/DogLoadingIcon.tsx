
import React from 'react';

interface DogLoadingIconProps {
  size?: number;
  className?: string;
}

const DogLoadingIcon = ({ size = 48, className = "" }: DogLoadingIconProps) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className="animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"
        style={{ 
          width: size, 
          height: size 
        }}
      />
    </div>
  );
};

export default DogLoadingIcon;
