
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    if (!file) return null;

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('message-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('message-files')
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
      return null;
    } finally {
      setUploading(false);
    }
  }, [toast]);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return null;
    }

    return uploadFile(file);
  }, [uploadFile, toast]);

  const uploadAudio = useCallback(async (audioBlob: Blob): Promise<string | null> => {
    const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, {
      type: 'audio/webm'
    });

    return uploadFile(audioFile);
  }, [uploadFile]);

  return {
    uploading,
    uploadFile,
    uploadImage,
    uploadAudio
  };
};
