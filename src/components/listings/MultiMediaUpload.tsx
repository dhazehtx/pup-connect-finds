
import React, { useState } from 'react';
import { Upload, X, Image, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MultiMediaUploadProps {
  onImagesChange: (imageUrls: string[]) => void;
  onVideoChange: (videoUrl: string) => void;
  className?: string;
}

const MultiMediaUpload = ({ onImagesChange, onVideoChange, className }: MultiMediaUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const { toast } = useToast();

  const uploadFile = async (file: File, bucket: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (imageUrls.length + files.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload up to 5 images per listing.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = files.map(file => uploadFile(file, 'dog-images'));
      const results = await Promise.all(uploadPromises);
      
      const successfulUploads = results.filter(url => url !== null) as string[];
      const newImageUrls = [...imageUrls, ...successfulUploads];
      
      setImageUrls(newImageUrls);
      onImagesChange(newImageUrls);

      toast({
        title: "Images uploaded successfully",
        description: `${successfulUploads.length} image(s) uploaded`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast({
        title: "File too large",
        description: "Video must be smaller than 50MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const uploadedUrl = await uploadFile(file, 'dog-images');
      if (uploadedUrl) {
        setVideoUrl(uploadedUrl);
        onVideoChange(uploadedUrl);
        toast({
          title: "Video uploaded successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImageUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newImageUrls);
    onImagesChange(newImageUrls);
  };

  const removeVideo = () => {
    setVideoUrl('');
    onVideoChange('');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Image Upload */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4" />
          <label className="text-sm font-medium">Photos (up to 5)</label>
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
            disabled={uploading}
          />
          <label
            htmlFor="image-upload"
            className={`flex flex-col items-center justify-center cursor-pointer ${uploading ? 'opacity-50' : ''}`}
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-gray-600">
              {uploading ? 'Uploading...' : 'Click to upload photos'}
            </span>
          </label>
        </div>

        {imageUrls.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Upload */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4" />
          <label className="text-sm font-medium">Video (optional)</label>
        </div>
        {!videoUrl ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
              id="video-upload"
              disabled={uploading}
            />
            <label
              htmlFor="video-upload"
              className={`flex flex-col items-center justify-center cursor-pointer ${uploading ? 'opacity-50' : ''}`}
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-gray-600">
                {uploading ? 'Uploading...' : 'Click to upload video'}
              </span>
            </label>
          </div>
        ) : (
          <div className="relative">
            <video
              src={videoUrl}
              controls
              className="w-full h-40 object-cover rounded-lg"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={removeVideo}
              className="absolute -top-2 -right-2 h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiMediaUpload;
