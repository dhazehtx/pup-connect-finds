
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { compressFile } from '@/utils/fileCompression';

export interface UnifiedFileUploadOptions {
  bucket: string;
  folder?: string;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  compress?: boolean;
}

// Export for backward compatibility
export type FileUploadOptions = UnifiedFileUploadOptions;

export const useUnifiedFileUpload = (options: UnifiedFileUploadOptions) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const {
    bucket,
    folder = 'uploads',
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    compress = true
  } = options;

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
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
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const validation = validateFile(file);
    if (!validation.valid) {
      toast({
        title: "Upload Error",
        description: validation.error,
        variant: "destructive",
      });
      return null;
    }

    try {
      setUploading(true);
      setProgress(0);

      // Compress file if needed and it's an image
      let processedFile = file;
      if (compress && file.type.startsWith('image/')) {
        processedFile = await compressFile(file, {
          maxSize: maxSize / (1024 * 1024), // Convert to MB
          quality: 0.8
        });
      }

      // For now, create object URL for immediate use
      // In production, this would upload to Supabase Storage
      const fileUrl = URL.createObjectURL(processedFile);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            setProgress(100);
            
            setTimeout(() => {
              setUploading(false);
              toast({
                title: "Upload successful! 📁",
                description: "Your file has been uploaded successfully",
              });
            }, 300);
            
            return 100;
          }
          return prev + 20;
        });
      }, 200);

      return fileUrl;
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      toast({
        title: "Upload Failed",
        description: "Failed to upload your file. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    return uploadFile(file);
  };

  const uploadVoiceMessage = async (audioBlob: Blob, duration: number): Promise<string | null> => {
    try {
      setUploading(true);
      setProgress(0);

      // Create object URL for voice message
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            setProgress(100);
            
            setTimeout(() => {
              setUploading(false);
              toast({
                title: "Voice message sent! 🎤",
                description: "Your voice message has been uploaded successfully",
              });
            }, 300);
            
            return 100;
          }
          return prev + 30;
        });
      }, 150);

      return audioUrl;
    } catch (error) {
      console.error('Voice upload error:', error);
      setUploading(false);
      toast({
        title: "Upload Failed",
        description: "Failed to upload your voice message. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const uploadMultipleFiles = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(file => uploadFile(file));
    const results = await Promise.all(uploadPromises);
    return results.filter(url => url !== null) as string[];
  };

  const uploadAudio = async (audioBlob: Blob): Promise<string | null> => {
    return uploadVoiceMessage(audioBlob, 0);
  };

  return {
    uploadImage,
    uploadFile,
    uploadVoiceMessage,
    uploadMultipleFiles,
    uploadAudio,
    uploading,
    isUploading: uploading, // Alias for backward compatibility
    progress,
    uploadProgress,
    validateFile
  };
};
