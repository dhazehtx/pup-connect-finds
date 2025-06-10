
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useImageCompression } from './useImageCompression';

interface UploadOptions {
  bucket: string;
  folder?: string;
  maxSize?: number; // in MB
  allowedTypes?: string[];
  compress?: boolean;
}

export const useEnhancedFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const { compressImage } = useImageCompression();

  const uploadFile = async (
    file: File,
    options: UploadOptions
  ): Promise<string | null> => {
    const {
      bucket,
      folder = '',
      maxSize = 10,
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
      compress = true
    } = options;

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `Please select a file of type: ${allowedTypes.join(', ')}`,
        variant: "destructive",
      });
      return null;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Please select a file smaller than ${maxSize}MB`,
        variant: "destructive",
      });
      return null;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      let fileToUpload = file;

      // Compress image if it's an image file
      if (compress && file.type.startsWith('image/')) {
        const compressedFile = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.8
        });
        if (compressedFile) {
          fileToUpload = compressedFile;
        }
      }

      // Generate unique filename
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setUploadProgress(100);
      
      toast({
        title: "Upload successful",
        description: "File uploaded successfully",
      });

      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    uploadFile,
    uploading,
    uploadProgress
  };
};
