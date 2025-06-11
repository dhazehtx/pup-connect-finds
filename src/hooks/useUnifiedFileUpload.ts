
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FileUploadOptions {
  bucket?: 'message-files' | 'dog-images' | 'images';
  folder?: string;
  maxSize?: number;
  allowedTypes?: string[];
}

export interface UploadProgress {
  [fileId: string]: number;
}

export const useUnifiedFileUpload = (options: FileUploadOptions = {}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const { toast } = useToast();

  const {
    bucket = 'images',
    folder = 'uploads',
    maxSize = 50 * 1024 * 1024, // 50MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  } = options;

  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed. Supported types: ${allowedTypes.join(', ')}`
      };
    }

    // Check file size
    if (file.size > maxSize) {
      const sizeMB = Math.round(maxSize / (1024 * 1024));
      return {
        valid: false,
        error: `File must be smaller than ${sizeMB}MB`
      };
    }

    return { valid: true };
  }, [allowedTypes, maxSize]);

  const uploadFile = useCallback(async (file: File, customPath?: string): Promise<string> => {
    const fileId = crypto.randomUUID();
    
    try {
      setUploading(true);
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Generate file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = customPath || `${folder}/${fileName}`;

      console.log(`🔄 Uploading file to bucket: ${bucket}, path: ${filePath}`);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[fileId] || 0;
          if (currentProgress < 90) {
            return { ...prev, [fileId]: Math.min(currentProgress + 10, 90) };
          }
          return prev;
        });
      }, 200);

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));

      console.log(`✅ File uploaded successfully: ${publicUrl}`);

      toast({
        title: "Upload successful!",
        description: `${file.name} was uploaded successfully`,
      });

      return publicUrl;
    } catch (error: any) {
      console.error('File upload failed:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setUploading(false);
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      }, 2000);
    }
  }, [bucket, folder, validateFile, toast]);

  const uploadMultipleFiles = useCallback(async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(file => uploadFile(file));
    return Promise.all(uploadPromises);
  }, [uploadFile]);

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      throw new Error('Invalid file type');
    }
    return uploadFile(file);
  }, [uploadFile, toast]);

  const uploadDocument = useCallback(async (file: File): Promise<string> => {
    const documentTypes = ['application/pdf', 'text/plain', 'application/msword'];
    if (!documentTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid document file",
        variant: "destructive",
      });
      throw new Error('Invalid file type');
    }
    return uploadFile(file);
  }, [uploadFile, toast]);

  const uploadAudio = useCallback(async (audioBlob: Blob, duration?: number): Promise<string> => {
    const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, {
      type: 'audio/webm'
    });
    return uploadFile(audioFile, `voice/${audioFile.name}`);
  }, [uploadFile]);

  const deleteFile = useCallback(async (filePath: string): Promise<void> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) throw error;

      toast({
        title: "File deleted",
        description: "File was deleted successfully",
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete file",
        variant: "destructive",
      });
      throw error;
    }
  }, [bucket, toast]);

  return {
    uploading,
    uploadProgress,
    uploadFile,
    uploadMultipleFiles,
    uploadImage,
    uploadDocument,
    uploadAudio,
    deleteFile,
    validateFile,
    // Legacy compatibility
    isUploading: uploading,
    uploadSingleFile: uploadFile,
    uploadVoiceMessage: uploadAudio
  };
};
