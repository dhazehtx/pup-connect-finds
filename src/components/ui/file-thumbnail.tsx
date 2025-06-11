
import React from 'react';
import { generateFileThumbnail } from '@/utils/fileThumbnailGenerator';
import { File } from 'lucide-react';

interface FileThumbnailProps {
  file: File;
  thumbnail?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const FileThumbnail = ({ 
  file, 
  thumbnail, 
  size = 'md', 
  className = '' 
}: FileThumbnailProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-8 h-8'
  };

  if (thumbnail) {
    return (
      <img 
        src={thumbnail} 
        alt={file.name}
        className={`${sizeClasses[size]} object-cover rounded ${className}`}
      />
    );
  }

  const config = generateFileThumbnail(file);
  const IconComponent = config.icon;

  if (IconComponent) {
    return (
      <div className={`${sizeClasses[size]} rounded flex items-center justify-center ${config.bgColor} ${className}`}>
        <IconComponent className={`${iconSizes[size]} ${config.color}`} />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded flex items-center justify-center bg-gray-50 ${className}`}>
      <File className={`${iconSizes[size]} text-gray-400`} />
    </div>
  );
};

export default FileThumbnail;
