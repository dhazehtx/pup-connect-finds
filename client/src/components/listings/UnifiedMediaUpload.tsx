
import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Video, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useMediaUpload } from '@/hooks/useMediaUpload';

interface UnifiedMediaUploadProps {
  onImagesChange: (imageUrls: string[]) => void;
  onVideoChange: (videoUrl: string) => void;
  /** Committed media_asset ids, so the parent can clean up orphans if the
   *  listing is never created (uploads happen before the listing exists). */
  onAssetsChange?: (assetIds: string[]) => void;
  listingId?: string;
  className?: string;
}

type MediaItem = {
  file: File;
  previewUrl: string;   // local blob: URL for instant, reliable preview
  remoteUrl?: string;   // committed Supabase URL once the upload succeeds
  assetId?: string;     // committed media_asset id (for orphan cleanup)
  failed?: boolean;     // remote upload failed (preview still shown)
};

// Only formats every browser can decode. HEIC/HEIF (iPhone default) fetch fine
// but render as a broken 0x0 image, so they must never enter the pipeline.
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const isHeic = (f: File) => /image\/hei[cf]/i.test(f.type) || /\.(heic|heif)$/i.test(f.name);
const isSupportedImage = (f: File) =>
  SUPPORTED_IMAGE_TYPES.includes(f.type) ||
  // Some browsers report an empty MIME for a valid jpg/png/webp — trust the extension.
  (f.type === '' && /\.(jpe?g|png|webp)$/i.test(f.name));

const UnifiedMediaUpload = ({ onImagesChange, onVideoChange, onAssetsChange, listingId, className }: UnifiedMediaUploadProps) => {
  // Each picked photo gets a LOCAL object-URL preview (shown immediately, never
  // dependent on the remote upload) plus the committed remote URL once it lands.
  const [items, setItems] = useState<MediaItem[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const { upload, uploading, progress } = useMediaUpload();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);

  // Revoke all object URLs on unmount to avoid leaks.
  useEffect(() => () => { objectUrlsRef.current.forEach(URL.revokeObjectURL); }, []);

  /** The committed remote URLs (what the saved listing stores). */
  const remoteUrls = () => items.map((i) => i.remoteUrl).filter(Boolean) as string[];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    e.target.value = '';

    const videoFiles = files.filter((file) => file.type.startsWith('video/'));
    // Everything that isn't a video is a candidate photo (covers empty-MIME HEIC).
    const photoCandidates = files.filter((file) => !file.type.startsWith('video/'));
    const imageFiles = photoCandidates.filter(isSupportedImage);
    const heicFiles = photoCandidates.filter((f) => !isSupportedImage(f) && isHeic(f));
    const otherUnsupported = photoCandidates.filter((f) => !isSupportedImage(f) && !isHeic(f));

    if (heicFiles.length > 0) {
      toast({
        title: 'HEIC photos aren’t supported yet',
        description: "HEIC photos aren't supported yet. Please upload JPEG, PNG, or WebP.",
        variant: 'destructive',
      });
    }
    if (otherUnsupported.length > 0) {
      toast({
        title: 'Unsupported photo format',
        description: 'Please upload JPEG, PNG, or WebP photos.',
        variant: 'destructive',
      });
    }
    if (videoFiles.length > 0) {
      toast({
        title: 'Photos only',
        description: 'Listing media must be photos (JPEG, PNG, or WebP). Video is not supported yet.',
        variant: 'destructive',
      });
    }
    // Rejected files never reach the uploader — no Supabase write, no orphan object.
    if (imageFiles.length === 0) return;

    if (items.length + imageFiles.length > 5) {
      toast({
        title: 'Too many files',
        description: 'You can upload up to 5 photos total.',
        variant: 'destructive',
      });
      return;
    }

    // 1) Show local previews IMMEDIATELY — independent of the remote upload.
    const staged: MediaItem[] = imageFiles.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      objectUrlsRef.current.push(previewUrl);
      return { file, previewUrl };
    });
    setItems((prev) => [...prev, ...staged]);

    // 2) Upload each; attach the committed remote URL + asset id (or mark failed).
    const committed: string[] = remoteUrls(); // already-committed remote URLs
    const committedAssets: string[] = items.map((i) => i.assetId).filter(Boolean) as string[];
    let uploaded = 0;
    const markFailed = (previewUrl: string) =>
      setItems((prev) => prev.map((it) => (it.previewUrl === previewUrl ? { ...it, failed: true } : it)));
    for (const item of staged) {
      try {
        const result = await upload(item.file, { bucket: 'listings', kind: 'listing', parentId: listingId });
        const url = result?.url || (result as { asset?: { publicUrl?: string } })?.asset?.publicUrl;
        const assetId = result?.assetId || (result as { asset?: { id?: string } })?.asset?.id;
        if (url) {
          uploaded += 1;
          committed.push(url);
          if (assetId) committedAssets.push(assetId);
          setItems((prev) => prev.map((it) => (it.previewUrl === item.previewUrl ? { ...it, remoteUrl: url, assetId } : it)));
          onImagesChange([...committed]); // enables submit only once a real upload commits
          onAssetsChange?.([...committedAssets]);
        } else {
          markFailed(item.previewUrl);
        }
      } catch {
        // useMediaUpload already toasted the specific error (e.g. SUPABASE_DEGRADED).
        markFailed(item.previewUrl);
      }
    }

    // 3) Honest status: report only what actually PERSISTED. During creation there
    //    is no listingId yet, so photos are stored (not attached) until you publish.
    if (uploaded > 0) {
      toast({
        title: 'Photo uploaded',
        description: listingId
          ? `${uploaded} photo(s) added to your listing`
          : `${uploaded} of ${imageFiles.length} photo(s) uploaded`,
      });
    }
  };

  const removeImage = (index: number) => {
    const target = items[index];
    if (target) {
      URL.revokeObjectURL(target.previewUrl);
      objectUrlsRef.current = objectUrlsRef.current.filter((u) => u !== target.previewUrl);
    }
    const next = items.filter((_, i) => i !== index);
    setItems(next);
    onImagesChange(next.map((i) => i.remoteUrl).filter(Boolean) as string[]);
    onAssetsChange?.(next.map((i) => i.assetId).filter(Boolean) as string[]);
  };

  const removeVideo = () => {
    setVideoUrl('');
    onVideoChange('');
  };

  const hasMedia = items.length > 0 || videoUrl;

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
            accept="image/jpeg,image/png,image/webp"
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

        {(items.length > 0 || videoUrl) && (
          <div className="grid grid-cols-3 gap-2">
            {items.map((item, index) => (
              <div key={item.previewUrl} className="relative">
                <img
                  src={item.previewUrl}
                  alt={`Selected photo ${index + 1}`}
                  className="h-20 w-full rounded-lg object-cover"
                />
                {item.failed && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-red-900/50 px-1 text-center text-[10px] font-medium leading-tight text-white">
                    Upload failed — remove &amp; retry
                  </div>
                )}
                {!item.remoteUrl && !item.failed && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/30 text-[10px] font-medium text-white">
                    Uploading…
                  </div>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeImage(index)}
                  aria-label={`Remove photo ${index + 1}`}
                  className="absolute -right-2 -top-2 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" aria-hidden />
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
                  aria-label="Remove video"
                  className="absolute -right-2 -top-2 h-6 w-6 p-0"
                  disabled={uploading}
                >
                  <X className="h-3 w-3" aria-hidden />
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
