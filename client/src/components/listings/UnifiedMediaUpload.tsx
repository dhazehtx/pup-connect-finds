
import React, { useState, useRef } from 'react';
import { Upload, X, Video, Camera } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    e.target.value = '';

    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    const videoFiles = files.filter((file) => file.type.startsWith('video/'));

    if (imageUrls.length + imageFiles.length > 5) {
      toast({
        title: 'Too many files',
        description: 'You can upload up to 5 photos total.',
        variant: 'destructive',
      });
      return;
    }

    if (videoFiles.length > 1 || (videoUrl && videoFiles.length > 0)) {
      toast({
        title: 'Video limit exceeded',
        description: 'You can upload only 1 video.',
        variant: 'destructive',
      });
      return;
    }

    if (videoFiles.some((file) => file.size > 50 * 1024 * 1024)) {
      toast({
        title: 'File too large',
        description: 'Video must be smaller than 50MB',
        variant: 'destructive',
      });
      return;
    }

    let uploadedCount = 0;
    const newUrls: string[] = [];

    try {
      for (const file of imageFiles) {
        const result = await upload(file, {
          bucket: 'listings',
          kind: 'listing',
          parentId: listingId,
        });
        const url = result?.url || (result as { asset?: { publicUrl?: string } })?.asset?.publicUrl;
        if (url) {
          newUrls.push(url);
          uploadedCount += 1;
        }
      }

      if (newUrls.length > 0) {
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
        const url = result?.url || (result as { asset?: { publicUrl?: string } })?.asset?.publicUrl;
        if (url) {
          setVideoUrl(url);
          onVideoChange(url);
          uploadedCount += 1;
        }
      }

      const attempted = imageFiles.length + videoFiles.length;
      if (uploadedCount > 0) {
        toast({
          title: 'Media uploaded',
          description: `${uploadedCount} file(s) ready for your listing`,
        });
      } else if (attempted > 0) {
        toast({
          title: 'Upload failed',
          description: 'Could not save media. Check your connection and try again.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload media. Please try again.',
        variant: 'destructive',
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
          <Camera className="h-4 w-4 text-slate-700" />
          <label className="text-sm font-medium text-slate-900">Upload Media</label>
        </div>
        <p className="text-xs text-slate-600">Add up to 5 photos or 1 video to showcase your pup</p>

        <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp,.mp4,video/*,image/*"
            onChange={handleFileUpload}
            className="sr-only"
            id="unified-media-upload"
            disabled={uploading}
          />
          <div className="flex flex-col items-center gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-slate-400 bg-white font-semibold text-slate-900 hover:bg-slate-100"
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? 'Uploading…' : hasMedia ? 'Add more photos or video' : 'Choose photos or video'}
            </Button>
            <p className="text-center text-xs text-slate-500">JPEG, PNG, WebP, or MP4</p>
          </div>
        </div>

        {uploading && (
          <div className="space-y-1">
            <p className="text-xs text-slate-600">Uploading… {progress}%</p>
            <Progress value={progress} className="h-1.5 w-full" />
          </div>
        )}

        {(imageUrls.length > 0 || videoUrl) && (
          <div className="grid grid-cols-3 gap-2">
            {imageUrls.map((url, index) => (
              <div key={url} className="relative">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="h-20 w-full rounded-lg object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeImage(index)}
                  className="absolute -right-2 -top-2 h-6 w-6 p-0"
                  disabled={uploading}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}

            {videoUrl && (
              <div className="relative">
                <video src={videoUrl} className="h-20 w-full rounded-lg object-cover" />
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/30">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeVideo}
                  className="absolute -right-2 -top-2 h-6 w-6 p-0"
                  disabled={uploading}
                >
                  <X className="h-3 w-3" />
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
