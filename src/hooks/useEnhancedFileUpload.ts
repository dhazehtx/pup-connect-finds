
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UploadOptions {
  bucket: string;
  folder?: string;
  maxSize?: number; // in MB
  allowedTypes?: string[];
}

interface UploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export const useEnhancedFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const uploadFile = useCallback(async (
    file: File,
    options: UploadOptions
  ): Promise<string | null> => {
    const {
      bucket,
      folder = '',
      maxSize = 10,
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'application/pdf']
    } = options;

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `Please upload one of: ${allowedTypes.join(', ')}`,
        variant: "destructive",
      });
      return null;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Please upload a file smaller than ${maxSize}MB`,
        variant: "destructive",
      });
      return null;
    }

    try {
      setUploading(true);
      setProgress(0);

      // Simulate upload progress for demo
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // For demo purposes, create a blob URL
      // In a real implementation, this would upload to Supabase Storage
      const url = URL.createObjectURL(file);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      clearInterval(progressInterval);
      setProgress(100);

      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded`,
      });

      return url;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [toast]);

  const uploadMultipleFiles = useCallback(async (
    files: File[],
    options: UploadOptions
  ): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];
    
    for (const file of files) {
      const url = await uploadFile(file, options);
      if (url) {
        results.push({
          url,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type
        });
      }
    }
    
    return results;
  }, [uploadFile]);

  return {
    uploadFile,
    uploadMultipleFiles,
    uploading,
    progress
  };
};
