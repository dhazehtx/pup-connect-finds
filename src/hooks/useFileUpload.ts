
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UploadOptions {
  bucket?: string;
  folder?: string;
  maxSize?: number; // in MB
  allowedTypes?: string[];
  purpose?: 'avatar' | 'listing' | 'story' | 'document';
}

export const useFileUpload = (options: UploadOptions = {}) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const {
    bucket = 'images',
    folder = 'general',
    maxSize = 10,
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    purpose = 'listing'
  } = options;

  const uploadFile = async (file: File, relatedId?: string): Promise<string | null> => {
    if (!user) {
      setError('User must be authenticated to upload files');
      return null;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`File size must be less than ${maxSize}MB`);
      }

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type must be one of: ${allowedTypes.join(', ')}`);
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      // Record upload in database
      const { error: dbError } = await supabase
        .from('file_uploads')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          upload_purpose: purpose,
          related_id: relatedId
        });

      if (dbError) {
        console.warn('Failed to record upload in database:', dbError);
      }

      setUploadProgress(100);
      console.log('File uploaded successfully:', publicUrl);
      return publicUrl;

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadMultiple = async (files: File[], relatedId?: string): Promise<string[]> => {
    const results = await Promise.all(
      files.map(file => uploadFile(file, relatedId))
    );
    return results.filter((url): url is string => url !== null);
  };

  return {
    uploadFile,
    uploadMultiple,
    isUploading,
    uploadProgress,
    error
  };
};
