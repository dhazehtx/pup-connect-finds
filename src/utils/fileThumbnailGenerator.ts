
import { File, FileText, Image, Music, Video, Archive } from 'lucide-react';

export const generateFileThumbnail = (file: File) => {
  const type = file.type.toLowerCase();
  
  if (type.startsWith('image/')) {
    return { icon: Image, color: 'text-blue-500', bgColor: 'bg-blue-50' };
  }
  
  if (type.startsWith('video/')) {
    return { icon: Video, color: 'text-purple-500', bgColor: 'bg-purple-50' };
  }
  
  if (type.startsWith('audio/')) {
    return { icon: Music, color: 'text-green-500', bgColor: 'bg-green-50' };
  }
  
  if (type.includes('pdf') || type.includes('document') || type.includes('text')) {
    return { icon: FileText, color: 'text-red-500', bgColor: 'bg-red-50' };
  }
  
  if (type.includes('zip') || type.includes('rar') || type.includes('archive')) {
    return { icon: Archive, color: 'text-yellow-500', bgColor: 'bg-yellow-50' };
  }
  
  return { icon: File, color: 'text-gray-500', bgColor: 'bg-gray-50' };
};

export const generateImageThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        const maxSize = 150;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
