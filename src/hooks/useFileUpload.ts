
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UploadProgress {
  progress: number;
  isUploading: boolean;
}

export const useFileUpload = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    isUploading: false
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadFile = useCallback(async (file: File, conversationId?: string): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload files",
        variant: "destructive",
      });
      return null;
    }

    setUploadProgress({ progress: 0, isUploading: true });

    try {
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB');
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('message-attachments')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
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
  }, [user, toast]);

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
    uploadProgress,
    isUploading: uploadProgress.isUploading
  };
};
