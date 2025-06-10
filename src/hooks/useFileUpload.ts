
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UploadProgress {
  progress: number;
  isUploading: boolean;
}

interface UseFileUploadOptions {
  bucket?: string;
  folder?: string;
  maxSize?: number; // in MB
  allowedTypes?: string[];
}

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    isUploading: false
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    bucket = 'message-attachments',
    folder = '',
    maxSize = 10,
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  } = options;

  const uploadFile = useCallback(async (file: File, conversationId?: string): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload files",
        variant: "destructive",
      });
      return null;
    }

    // Validate file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
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

    setUploadProgress({ progress: 0, isUploading: true });

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = folder 
        ? `${folder}/${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        : `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      setUploadProgress({ progress: 100, isUploading: false });

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });

      return publicUrl;
    } catch (error) {
      console.error('File upload error:', error);
      setUploadProgress({ progress: 0, isUploading: false });
      
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
      
      return null;
    }
  }, [user, toast, bucket, folder, maxSize, allowedTypes]);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    // Validate image file
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return null;
    }

    return uploadFile(file);
  }, [uploadFile, toast]);

  const uploadVoiceMessage = useCallback(async (audioBlob: Blob, duration: number): Promise<string | null> => {
    if (!user) return null;

    const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, {
      type: 'audio/webm'
    });

    return uploadFile(audioFile);
  }, [user, uploadFile]);

  return {
    uploadFile,
    uploadImage,
    uploadVoiceMessage,
    uploadProgress: uploadProgress.progress,
    isUploading: uploadProgress.isUploading
  };
};
