
import React, { useState } from 'react';
import { Upload, X, Image, Video, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useMediaUpload } from '@/hooks/useMediaUpload';

interface UnifiedMediaUploadProps {
  onImagesChange: (imageUrls: string[]) => void;
  onVideoChange: (videoUrl: string) => void;
  listingId?: string;
  className?: string;
}

const UnifiedMediaUpload = ({ onImagesChange, onVideoChange, listingId, className }: UnifiedMediaUploadProps) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const { upload, uploading, progress } = useMediaUpload();
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const videoFiles = files.filter(file => file.type.startsWith('video/'));

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

    try {
      if (imageFiles.length > 0) {
        const newUrls: string[] = [];
        for (const file of imageFiles) {
          const result = await upload(file, {
            bucket: 'listings',
            kind: 'listing',
            parentId: listingId,
          });
          if (result?.ok && result.url) {
            newUrls.push(result.url);
          }
        }

        const updatedImageUrls = [...imageUrls, ...newUrls];
        setImageUrls(updatedImageUrls);
        onImagesChange(updatedImageUrls);
      }

      if (videoFiles.length > 0) {
        const result = await upload(videoFiles[0], {
          bucket: 'listings',
          kind: 'listing',
          parentId: listingId,
        });
        if (result?.ok && result.url) {
          setVideoUrl(result.url);
          onVideoChange(result.url);
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

        {uploading && (
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Uploading... {progress}%</p>
            <Progress value={progress} className="w-full h-1.5" />
          </div>
        )}

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
                  disabled={uploading}
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
                  disabled={uploading}
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
