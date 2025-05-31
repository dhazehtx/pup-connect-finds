
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UploadedImage {
  id: string;
  url: string;
  file: File;
  uploadedUrl?: string;
}

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const uploadImage = async (file: File, imageId: string): Promise<string | null> => {
    try {
      setUploading(true);
      setUploadProgress(prev => ({ ...prev, [imageId]: 0 }));

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `dog-images/${fileName}`;

      // Simulate progress updates for better UX during upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[imageId] || 0;
          if (currentProgress < 90) {
            return { ...prev, [imageId]: currentProgress + 10 };
          }
          return prev;
        });
      }, 500);

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('dog-images')
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
        .from('dog-images')
        .getPublicUrl(filePath);

      setUploadProgress(prev => ({ ...prev, [imageId]: 100 }));
      
      toast({
        title: "Image uploaded successfully",
        description: "Your image has been uploaded to the cloud.",
      });

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[imageId];
          return newProgress;
        });
      }, 2000);
    }
  };

  const uploadMultipleImages = async (images: UploadedImage[]): Promise<UploadedImage[]> => {
    const uploadPromises = images.map(async (image) => {
      if (image.uploadedUrl) return image; // Already uploaded
      
      const uploadedUrl = await uploadImage(image.file, image.id);
      return {
        ...image,
        uploadedUrl: uploadedUrl || undefined
      };
    });

    return Promise.all(uploadPromises);
  };

  return {
    uploadImage,
    uploadMultipleImages,
    uploading,
    uploadProgress
  };
};
