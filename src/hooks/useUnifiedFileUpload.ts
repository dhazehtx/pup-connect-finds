
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileUploadOptions {
  bucket: string;
  folder?: string;
  maxSize?: number;
  allowedTypes?: string[];
  onProgress?: (progress: number) => void;
}

export const useUnifiedFileUpload = (options: FileUploadOptions) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    if (options.maxSize && file.size > options.maxSize) {
      toast({
        title: "File too large",
        description: `File size must be less than ${Math.round(options.maxSize / 1024 / 1024)}MB`,
        variant: "destructive"
      });
      return false;
    }

    if (options.allowedTypes && !options.allowedTypes.some(type => file.type.startsWith(type.replace('*', '')))) {
      toast({
        title: "Invalid file type",
        description: "This file type is not supported",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!validateFile(file)) return null;

    setUploading(true);
    setProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = options.folder ? `${options.folder}/${fileName}` : fileName;

      const { data, error } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, file);

      if (error) throw error;

      // Simulate progress updates for compatibility
      setProgress(50);
      await new Promise(resolve => setTimeout(resolve, 100));
      setProgress(100);
      options.onProgress?.(100);

      const { data: { publicUrl } } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const uploadMultipleFiles = async (files: File[]): Promise<string[]> => {
    const results = await Promise.allSettled(files.map(uploadFile));
    return results
      .filter((result): result is PromiseFulfilledResult<string> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
  };

  // Backward compatibility methods
  const uploadImage = uploadFile;
  const uploadAudio = uploadFile;
  const uploadProgress = progress;

  return {
    uploadFile,
    uploadMultipleFiles,
    uploading,
    progress,
    // Backward compatibility exports
    uploadImage,
    uploadAudio,
    uploadProgress
  };
};
