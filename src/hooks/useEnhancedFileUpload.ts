
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UploadOptions {
  bucket: string;
  folder?: string;
  maxSize?: number; // in MB
  allowedTypes?: string[];
}

export const useEnhancedFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const uploadFile = async (file: File, options: UploadOptions): Promise<string | null> => {
    const { bucket, folder = '', maxSize = 10, allowedTypes = [] } = options;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File size must be less than ${maxSize}MB`,
        variant: "destructive",
      });
      return null;
    }

    // Validate file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `Allowed types: ${allowedTypes.join(', ')}`,
        variant: "destructive",
      });
      return null;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Mock upload process with progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // In production, this would upload to Supabase storage
      const mockUrl = URL.createObjectURL(file);
      
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded`,
      });

      return mockUrl;
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const uploadMultipleFiles = async (files: File[], options: UploadOptions): Promise<string[]> => {
    const urls: string[] = [];
    
    for (const file of files) {
      const url = await uploadFile(file, options);
      if (url) urls.push(url);
    }
    
    return urls;
  };

  return {
    uploadFile,
    uploadMultipleFiles,
    uploading,
    progress
  };
};
