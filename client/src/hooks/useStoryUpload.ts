
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
    // Check file type (including iPhone HEIC photos and mobile formats)
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

      // Create object URL for immediate preview - NO CROPPING, preserve original
      const imageUrl = URL.createObjectURL(file);
      
      // Simulate processing with progress updates for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            setProgress(100);
            
            setTimeout(() => {
              setUploading(false);
              toast({
                title: "Photo Ready! 📸",
                description: "Your image has been uploaded and will fit perfectly in your story",
              });
              resolve(imageUrl);
            }, 300);
            
            return 100;
          }
          return prev + 30;
        });
      }, 150);
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
      console.log(`Processing ${file.type} file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) - preserving original aspect ratio`);
      return await processImageFile(file);
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
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
