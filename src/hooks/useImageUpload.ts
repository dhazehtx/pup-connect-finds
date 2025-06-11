
import { useState } from 'react';
import { useUnifiedFileUpload } from './useUnifiedFileUpload';
import { useToast } from '@/hooks/use-toast';

export interface UploadedImage {
  id: string;
  url: string;
  file: File;
  uploadedUrl?: string;
}

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const { toast } = useToast();
  
  const { uploadImage: uploadToStorage } = useUnifiedFileUpload({
    bucket: 'dog-images',
    folder: 'listings',
    maxSize: 50 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  });

  const uploadImage = async (file: File, imageId: string): Promise<string | null> => {
    try {
      setUploading(true);
      setUploadProgress(prev => ({ ...prev, [imageId]: 0 }));

      // Simulate progress updates for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[imageId] || 0;
          if (currentProgress < 90) {
            return { ...prev, [imageId]: currentProgress + 10 };
          }
          return prev;
        });
      }, 200);

      const uploadedUrl = await uploadToStorage(file);

      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [imageId]: 100 }));

      return uploadedUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      return null;
    } finally {
      setUploading(false);
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[imageId];
          return newProgress;
        });
      }, 2000);
    }
  };

  const uploadMultipleImages = async (images: UploadedImage[]): Promise<UploadedImage[]> => {
    const uploadPromises = images.map(async (image) => {
      if (image.uploadedUrl) return image;
      
      const uploadedUrl = await uploadImage(image.file, image.id);
      return {
        ...image,
        uploadedUrl: uploadedUrl || undefined
      };
    });

    return Promise.all(uploadPromises);
  };

  return {
    uploadImage,
    uploadMultipleImages,
    uploading,
    uploadProgress
  };
};
