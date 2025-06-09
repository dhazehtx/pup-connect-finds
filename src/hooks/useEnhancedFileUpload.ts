
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UploadOptions {
  bucket: string;
  folder?: string;
  maxSize?: number; // in MB
  allowedTypes?: string[];
  quality?: number; // for image compression
}

interface UploadResult {
  url: string | null;
  error: Error | null;
  progress: number;
}

export const useEnhancedFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const validateFile = (file: File, options: UploadOptions): string | null => {
    // Check file size
    if (options.maxSize && file.size > options.maxSize * 1024 * 1024) {
      return `File size must be less than ${options.maxSize}MB`;
    }

    // Check file type
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      return `File type not allowed. Supported types: ${options.allowedTypes.join(', ')}`;
    }

    return null;
  };

  const compressImage = async (file: File, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 1920x1080)
        const maxWidth = 1920;
        const maxHeight = 1080;
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
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, file.type, quality);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const uploadFile = async (file: File, options: UploadOptions): Promise<string | null> => {
    try {
      setUploading(true);
      setProgress(0);

      // Validate file
      const validationError = validateFile(file, options);
      if (validationError) {
        toast({
          title: "Upload failed",
          description: validationError,
          variant: "destructive",
        });
        return null;
      }

      // Compress image if it's an image file and quality is specified
      let fileToUpload = file;
      if (file.type.startsWith('image/') && options.quality) {
        setProgress(10);
        fileToUpload = await compressImage(file, options.quality);
      }

      setProgress(20);

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2);
      const extension = file.name.split('.').pop();
      const fileName = `${timestamp}_${randomString}.${extension}`;
      const filePath = options.folder ? `${options.folder}/${fileName}` : fileName;

      setProgress(50);

      // Mock upload progress (replace with actual Supabase storage upload)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      clearInterval(progressInterval);
      setProgress(100);

      // Return mock URL (replace with actual Supabase storage URL)
      const mockUrl = URL.createObjectURL(fileToUpload);
      
      toast({
        title: "Upload successful",
        description: "Your file has been uploaded successfully.",
      });

      return mockUrl;

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your file.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const uploadMultipleFiles = async (files: File[], options: UploadOptions): Promise<string[]> => {
    const results: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const url = await uploadFile(files[i], options);
      if (url) {
        results.push(url);
      }
    }

    return results;
  };

  return {
    uploading,
    progress,
    uploadFile,
    uploadMultipleFiles
  };
};
