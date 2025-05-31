
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UploadOptions {
  bucket: string;
  folder?: string;
  maxSizeBytes?: number;
  allowedTypes?: string[];
  generateThumbnail?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

interface UploadProgress {
  [key: string]: number;
}

export const useEnhancedFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const { user } = useAuth();
  const { toast } = useToast();

  // Resize image if needed
  const resizeImage = useCallback((
    file: File,
    maxWidth: number = 1200,
    maxHeight: number = 800,
    quality: number = 0.8
  ): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }, []);

  // Generate thumbnail
  const generateThumbnail = useCallback((file: File): Promise<File> => {
    return resizeImage(file, 300, 300, 0.7);
  }, [resizeImage]);

  // Validate file
  const validateFile = useCallback((file: File, options: UploadOptions): boolean => {
    // Check file size
    if (options.maxSizeBytes && file.size > options.maxSizeBytes) {
      toast({
        title: "File too large",
        description: `File size must be less than ${Math.round(options.maxSizeBytes / 1024 / 1024)}MB`,
        variant: "destructive",
      });
      return false;
    }

    // Check file type
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `Only ${options.allowedTypes.join(', ')} files are allowed`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [toast]);

  // Upload single file
  const uploadFile = useCallback(async (
    file: File,
    options: UploadOptions,
    onProgress?: (progress: number) => void
  ): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload files",
        variant: "destructive",
      });
      return null;
    }

    if (!validateFile(file, options)) {
      return null;
    }

    try {
      setUploading(true);
      
      // Resize image if it's an image and options are provided
      let fileToUpload = file;
      if (file.type.startsWith('image/') && (options.maxWidth || options.maxHeight)) {
        fileToUpload = await resizeImage(
          file,
          options.maxWidth,
          options.maxHeight,
          options.quality
        );
      }

      // Generate file path
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = options.folder ? `${options.folder}/${user.id}/${fileName}` : `${user.id}/${fileName}`;

      // Upload file
      const { data, error } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(filePath);

      // Upload thumbnail if requested
      if (options.generateThumbnail && file.type.startsWith('image/')) {
        try {
          const thumbnail = await generateThumbnail(file);
          const thumbnailPath = filePath.replace(/\.([^.]+)$/, '_thumb.$1');
          
          await supabase.storage
            .from(options.bucket)
            .upload(thumbnailPath, thumbnail);
        } catch (thumbError) {
          console.warn('Failed to generate thumbnail:', thumbError);
          // Continue without thumbnail
        }
      }

      toast({
        title: "Upload successful",
        description: "File uploaded successfully",
      });

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  }, [user, validateFile, resizeImage, generateThumbnail, toast]);

  // Upload multiple files
  const uploadMultipleFiles = useCallback(async (
    files: File[],
    options: UploadOptions,
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<string[]> => {
    const results: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progressCallback = onProgress ? (progress: number) => onProgress(i, progress) : undefined;
      
      const url = await uploadFile(file, options, progressCallback);
      if (url) {
        results.push(url);
      }
    }

    return results;
  }, [uploadFile]);

  // Delete file
  const deleteFile = useCallback(async (
    bucket: string,
    filePath: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) throw error;

      // Also try to delete thumbnail if it exists
      const thumbnailPath = filePath.replace(/\.([^.]+)$/, '_thumb.$1');
      await supabase.storage
        .from(bucket)
        .remove([thumbnailPath]);

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }, []);

  // Get signed URL for private files
  const getSignedUrl = useCallback(async (
    bucket: string,
    filePath: string,
    expiresIn: number = 3600
  ): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn);

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }
  }, []);

  return {
    uploading,
    uploadProgress,
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    getSignedUrl,
    resizeImage,
    generateThumbnail
  };
};
