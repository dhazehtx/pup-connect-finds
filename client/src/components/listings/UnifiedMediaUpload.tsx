
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

    if (videoFiles.length > 0) {
      toast({
        title: 'Photos only',
        description: 'Listing media must be photos (JPEG, PNG, or WebP). Video is not supported yet.',
        variant: 'destructive',
      });
      if (imageFiles.length === 0) return;
    }

    if (imageUrls.length + imageFiles.length > 5) {
      toast({
        title: 'Too many files',
        description: 'You can upload up to 5 photos total.',
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

      if (uploadedCount > 0) {
        toast({
          title: 'Media uploaded',
          description: `${uploadedCount} file(s) ready for your listing`,
        });
      }
      // useMediaUpload already shows a detailed toast on sign/commit failure
    } catch {
      // useMediaUpload already toasted; avoid duplicate generic message
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
        <p className="text-xs text-slate-600">Add up to 5 photos to showcase your pup</p>

        <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp,image/*"
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
              {uploading ? 'Uploading…' : hasMedia ? 'Add more photos' : 'Choose photos'}
            </Button>
            <p className="text-center text-xs text-slate-500">JPEG, PNG, or WebP</p>
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
