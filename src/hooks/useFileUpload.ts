
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface UseFileUploadProps {
  bucket: 'dog-images' | 'verification-docs';
  folder?: string;
  maxSizeBytes?: number;
  allowedTypes?: string[];
}

export const useFileUpload = ({
  bucket,
  folder,
  maxSizeBytes = 50 * 1024 * 1024, // 50MB default
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
}: UseFileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload files",
        variant: "destructive",
      });
      return null;
    }

    // Validate file size
    if (file.size > maxSizeBytes) {
      toast({
        title: "File too large",
        description: `File size must be less than ${Math.round(maxSizeBytes / (1024 * 1024))}MB`,
        variant: "destructive",
      });
      return null;
    }

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `Allowed types: ${allowedTypes.join(', ')}`,
        variant: "destructive",
      });
      return null;
    }

    try {
      setUploading(true);
      setProgress(0);

      // Create unique filename with user ID folder structure
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${folder ? folder + '/' : ''}${Date.now()}.${fileExt}`;

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      setProgress(100);

      // Get public URL for public buckets
      if (bucket === 'dog-images') {
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);
        
        toast({
          title: "Upload successful",
          description: "File uploaded successfully",
        });

        return urlData.publicUrl;
      } else {
        // For private buckets, return the path
        toast({
          title: "Upload successful", 
          description: "File uploaded successfully",
        });

        return data.path;
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const deleteFile = async (filePath: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) throw error;

      toast({
        title: "File deleted",
        description: "File deleted successfully",
      });

      return true;
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete file",
        variant: "destructive",
      });
      return false;
    }
  };

  const getSignedUrl = async (filePath: string, expiresIn: number = 3600): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn);

      if (error) throw error;
      return data.signedUrl;
    } catch (error: any) {
      console.error('Get signed URL error:', error);
      return null;
    }
  };

  return {
    uploadFile,
    deleteFile,
    getSignedUrl,
    uploading,
    progress
  };
};
