
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface StoryUploadOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
  quality?: number;
}

export const useStoryUpload = (options: StoryUploadOptions = {}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const {
    maxSizeBytes = 200 * 1024 * 1024, // 200MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'],
    quality = 0.95
  } = options;

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type (including iPhone HEIC photos)
    const isValidType = allowedTypes.includes(file.type.toLowerCase()) || 
                       file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif|heic|heif)$/);
    
    if (!isValidType) {
      return {
        valid: false,
        error: 'Please upload an image file (JPG, PNG, WebP, GIF, HEIC)'
      };
    }

    // Check file size
    if (file.size > maxSizeBytes) {
      const sizeMB = Math.round(maxSizeBytes / (1024 * 1024));
      return {
        valid: false,
        error: `File must be smaller than ${sizeMB}MB`
      };
    }

    return { valid: true };
  };

  const processImageFile = async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      setUploading(true);
      setProgress(0);

      // Simulate upload progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 20, 90));
      }, 200);

      // Create object URL for immediate preview
      const imageUrl = URL.createObjectURL(file);
      
      // Complete the "upload"
      setTimeout(() => {
        clearInterval(progressInterval);
        setProgress(100);
        setUploading(false);
        
        toast({
          title: "Photo Ready! 📸",
          description: "Your image is ready to be cropped and shared",
        });
        
        resolve(imageUrl);
      }, 1000);
    });
  };

  const uploadStoryImage = async (file: File): Promise<string | null> => {
    const validation = validateFile(file);
    if (!validation.valid) {
      toast({
        title: "Upload Error",
        description: validation.error,
        variant: "destructive",
      });
      return null;
    }

    try {
      return await processImageFile(file);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to process your image. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    uploadStoryImage,
    uploading,
    progress,
    validateFile
  };
};
