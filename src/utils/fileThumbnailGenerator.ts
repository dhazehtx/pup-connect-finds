
import { FileText, Video, Music, Archive, Code, Database } from 'lucide-react';

export interface ThumbnailConfig {
  icon: any;
  color: string;
  bgColor: string;
}

export const generateFileThumbnail = (file: File): ThumbnailConfig => {
  const type = file.type.toLowerCase();
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  // Image files (handled separately with actual thumbnails)
  if (type.startsWith('image/')) {
    return {
      icon: null, // Will use actual image preview
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    };
  }

  // Video files
  if (type.startsWith('video/')) {
    return {
      icon: Video,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    };
  }

  // Audio files
  if (type.startsWith('audio/')) {
    return {
      icon: Music,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    };
  }

  // Document files
  if (type.includes('pdf') || 
      type.includes('document') || 
      type.includes('text') ||
      ['doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension)) {
    return {
      icon: FileText,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    };
  }

  // Archive files
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
    return {
      icon: Archive,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    };
  }

  // Code files
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'py', 'java', 'cpp', 'c', 'php'].includes(extension)) {
    return {
      icon: Code,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    };
  }

  // Database files
  if (['sql', 'db', 'sqlite', 'mdb'].includes(extension)) {
    return {
      icon: Database,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    };
  }

  // Default fallback
  return {
    icon: FileText,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  };
};

export const generateImageThumbnail = async (file: File, size: number = 120): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate dimensions to maintain aspect ratio
      const { width, height } = img;
      const aspectRatio = width / height;
      
      let newWidth, newHeight;
      if (aspectRatio > 1) {
        newWidth = size;
        newHeight = size / aspectRatio;
      } else {
        newWidth = size * aspectRatio;
        newHeight = size;
      }

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw image
      ctx?.drawImage(img, 0, 0, newWidth, newHeight);
      
      // Convert to data URL
      const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
      resolve(thumbnailUrl);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};
