
import React, { useState } from 'react';
import { Upload, X, Image, Video, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UnifiedMediaUploadProps {
  onImagesChange: (imageUrls: string[]) => void;
  onVideoChange: (videoUrl: string) => void;
  className?: string;
}

const UnifiedMediaUpload = ({ onImagesChange, onVideoChange, className }: UnifiedMediaUploadProps) => {
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Separate images and videos
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const videoFiles = files.filter(file => file.type.startsWith('video/'));

    // Validate limits
    if (imageUrls.length + imageFiles.length > 5) {
      toast({
        title: "Too many files",
        description: "You can upload up to 5 photos total.",
        variant: "destructive",
      });
      return;
    }

    if (videoFiles.length > 1 || (videoUrl && videoFiles.length > 0)) {
      toast({
        title: "Video limit exceeded",
        description: "You can upload only 1 video.",
        variant: "destructive",
      });
      return;
    }

    if (videoFiles.some(file => file.size > 50 * 1024 * 1024)) {
      toast({
        title: "File too large",
        description: "Video must be smaller than 50MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Upload images
      if (imageFiles.length > 0) {
        const imageUploadPromises = imageFiles.map(file => uploadFile(file, 'dog-images'));
        const imageResults = await Promise.all(imageUploadPromises);
        const successfulImageUploads = imageResults.filter(url => url !== null) as string[];
        const newImageUrls = [...imageUrls, ...successfulImageUploads];
        
        setImageUrls(newImageUrls);
        onImagesChange(newImageUrls);
      }

      // Upload video
      if (videoFiles.length > 0) {
        const videoResult = await uploadFile(videoFiles[0], 'dog-images');
        if (videoResult) {
          setVideoUrl(videoResult);
          onVideoChange(videoResult);
        }
      }

      const totalUploaded = imageFiles.length + videoFiles.length;
      toast({
        title: "Media uploaded successfully",
        description: `${totalUploaded} file(s) uploaded`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload media. Please try again.",
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

  const hasMedia = imageUrls.length > 0 || videoUrl;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4" />
          <label className="text-sm font-medium">Upload Media</label>
        </div>
        <p className="text-xs text-gray-500">Add up to 5 photos or 1 video to showcase your pup</p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp,.mp4"
            onChange={handleFileUpload}
            className="hidden"
            id="unified-media-upload"
            disabled={uploading}
          />
          <label
            htmlFor="unified-media-upload"
            className={`flex items-center justify-center gap-2 cursor-pointer ${uploading ? 'opacity-50' : ''}`}
          >
            <Upload className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              {uploading ? 'Uploading...' : hasMedia ? 'Add more media' : 'Choose photos or video'}
            </span>
          </label>
        </div>

        {/* Display uploaded media */}
        {(imageUrls.length > 0 || videoUrl) && (
          <div className="grid grid-cols-3 gap-2">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg"
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
            
            {videoUrl && (
              <div className="relative">
                <video
                  src={videoUrl}
                  className="w-full h-20 object-cover rounded-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                  <Video className="w-6 h-6 text-white" />
                </div>
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
        )}
      </div>
    </div>
  );
};

export default UnifiedMediaUpload;
