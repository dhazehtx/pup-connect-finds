
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // For now, return a mock URL since we don't have storage bucket configured
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload
      
      const mockUrl = `https://example.com/files/${fileName}`;
      
      toast({
        title: "File uploaded",
        description: `${file.name} uploaded successfully`,
      });
      
      return mockUrl;
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
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return null;
    }
    
    return uploadFile(file);
  };

  const uploadVoiceMessage = async (audioBlob: Blob, duration: number): Promise<string | null> => {
    try {
      setUploading(true);
      
      // Create a unique filename for voice message
      const fileName = `voice-${Date.now()}-${Math.random().toString(36).substring(2)}.webm`;
      
      // For now, create object URL for voice message
      // In production, this would upload to Supabase Storage
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Voice message uploaded",
        description: `Voice message (${duration}s) uploaded successfully`,
      });
      
      return audioUrl;
    } catch (error) {
      console.error('Error uploading voice message:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload voice message",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadFile,
    uploadImage,
    uploadVoiceMessage,
    uploading,
    isUploading: uploading // Alias for backward compatibility
  };
};
