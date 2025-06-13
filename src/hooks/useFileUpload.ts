
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      setIsUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('message-files')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('message-files')
        .getPublicUrl(filePath);

      return data.publicUrl;
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
      setIsUploading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return null;
    }

    return uploadFile(file);
  };

  const uploadVoiceMessage = async (audioBlob: Blob, duration: number): Promise<string | null> => {
    try {
      setUploading(true);
      setIsUploading(true);
      
      const fileName = `voice_${Date.now()}.webm`;
      const filePath = `voice/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('message-files')
        .upload(filePath, audioBlob);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('message-files')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading voice message:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload voice message. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    uploadImage,
    uploadVoiceMessage,
    uploading,
    isUploading
  };
};
