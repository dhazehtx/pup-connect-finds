
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseFileUploadOptions {
  bucket?: string;
  folder?: string;
  maxSize?: number;
  allowedTypes?: string[];
}

export const useFileUpload = (options?: UseFileUploadOptions) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    if (!file) throw new Error('No file provided');

    try {
      setUploading(true);
      setUploadProgress(0);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${options?.folder || 'uploads'}/${fileName}`;

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const { error: uploadError } = await supabase.storage
        .from(options?.bucket || 'message-files')
        .upload(filePath, file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(options?.bucket || 'message-files')
        .getPublicUrl(filePath);

      toast({
        title: "File uploaded",
        description: `${file.name} was uploaded successfully`,
      });

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [toast, options]);

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

  const uploadAudio = useCallback(async (audioBlob: Blob): Promise<string> => {
    const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, {
      type: 'audio/webm'
    });

    return uploadFile(audioFile);
  }, [uploadFile]);

  const uploadVoiceMessage = useCallback(async (audioBlob: Blob, duration: number): Promise<string> => {
    const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, {
      type: 'audio/webm'
    });

    return uploadFile(audioFile);
  }, [uploadFile]);

  return {
    uploading,
    uploadProgress,
    uploadFile,
    uploadImage,
    uploadAudio,
    uploadVoiceMessage,
    isUploading: uploading
  };
};
