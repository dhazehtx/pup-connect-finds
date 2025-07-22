
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSize?: number; // in MB
}

export const useImageCompression = () => {
  const [compressing, setCompressing] = useState(false);
  const { toast } = useToast();

  const compressImage = async (
    file: File, 
    options: CompressionOptions = {}
  ): Promise<File | null> => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      maxSize = 2
    } = options;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return null;
    }

    setCompressing(true);

    try {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          // Calculate new dimensions
          let { width, height } = img;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });

                // Check if compression was successful
                if (compressedFile.size < file.size || file.size > maxSize * 1024 * 1024) {
                  console.log(`Compressed from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
                  resolve(compressedFile);
                } else {
                  resolve(file);
                }
              } else {
                resolve(file);
              }
              setCompressing(false);
            },
            file.type,
            quality
          );
        };

        img.onerror = () => {
          toast({
            title: "Compression failed",
            description: "Failed to process image",
            variant: "destructive",
          });
          resolve(file);
          setCompressing(false);
        };

        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      console.error('Image compression error:', error);
      setCompressing(false);
      return file;
    }
  };

  return {
    compressImage,
    compressing
  };
};
