import { useState, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface UploadOptions {
  bucket: string;
  kind: 'avatar' | 'post' | 'listing';
  parentId?: string;
}

interface AssetResult {
  id: string;
  publicUrl: string;
  variant: string;
  mime: string;
  sizeBytes: number;
  parentType: string;
  parentId: string | null;
}

interface UploadResult {
  ok: boolean;
  asset?: AssetResult;
  thumbUrl?: string | null;
  assetId?: string;
  url?: string;
  path?: string;
  bucket?: string;
}

const MAX_RETRIES = 1;

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'
];
const ALLOWED_VIDEO_TYPES = [
  'video/mp4', 'video/quicktime', 'video/webm'
];
const ALL_ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

const LIMITS = {
  avatar: { maxBytes: 5 * 1024 * 1024, label: '5MB' },
  post_image: { maxBytes: 15 * 1024 * 1024, label: '15MB' },
  post_video: { maxBytes: 80 * 1024 * 1024, label: '80MB' },
  listing: { maxBytes: 15 * 1024 * 1024, label: '15MB', maxCount: 8 },
} as const;

function preflightCheck(
  file: File,
  kind: 'avatar' | 'post' | 'listing'
): { valid: boolean; message?: string } {
  if (!ALL_ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, message: `Unsupported file type: ${file.type}. Use JPEG, PNG, WebP, GIF, or MP4.` };
  }

  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (kind === 'avatar') {
    if (isVideo) return { valid: false, message: 'Avatars must be images, not videos.' };
    if (file.size > LIMITS.avatar.maxBytes) return { valid: false, message: `Avatar must be under ${LIMITS.avatar.label}.` };
  } else if (kind === 'post') {
    if (isVideo) {
      if (file.size > LIMITS.post_video.maxBytes) return { valid: false, message: `Video must be under ${LIMITS.post_video.label}.` };
    } else {
      if (file.size > LIMITS.post_image.maxBytes) return { valid: false, message: `Image must be under ${LIMITS.post_image.label}.` };
    }
  } else if (kind === 'listing') {
    if (isVideo) return { valid: false, message: 'Listings only accept images.' };
    if (file.size > LIMITS.listing.maxBytes) return { valid: false, message: `Image must be under ${LIMITS.listing.label}.` };
  }

  return { valid: true };
}

export function useMediaUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const upload = useCallback(async (file: File, options: UploadOptions): Promise<UploadResult | null> => {
    const check = preflightCheck(file, options.kind);
    if (!check.valid) {
      toast({
        title: 'File not accepted',
        description: check.message,
        variant: 'destructive',
      });
      return null;
    }

    setUploading(true);
    setProgress(5);

    let lastError: Error | null = null;

    try {
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          if (attempt > 0) {
            setProgress(5);
            toast({ title: 'Retrying upload...', description: `Attempt ${attempt + 1}` });
          }

          setProgress(10);
          const signRes = await apiRequest('/api/media/sign', {
            method: 'POST',
            body: JSON.stringify({
              bucket: options.bucket,
              fileName: file.name,
              mimeType: file.type,
              kind: options.kind,
              sizeBytes: file.size,
              parentId: options.parentId,
            }),
          });

          const signData = await signRes.json();
          if (!signData.ok) {
            if (signData.code === 'MEDIA_INVALID' || signData.code === 'MEDIA_TOO_LARGE' || signData.code === 'MEDIA_TOO_MANY') {
              toast({ title: 'Upload rejected', description: signData.error, variant: 'destructive' });
              return null;
            }
            throw new Error(signData.error || 'Failed to get upload URL');
          }

          setProgress(25);

          const xhr = new XMLHttpRequest();
          const uploadPromise = new Promise<void>((resolve, reject) => {
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                const pct = 25 + Math.round((e.loaded / e.total) * 40);
                setProgress(pct);
              }
            };
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) resolve();
              else reject(new Error(`Upload failed (HTTP ${xhr.status})`));
            };
            xhr.onerror = () => reject(new Error('Upload network error'));
            xhr.open('PUT', signData.uploadUrl);
            xhr.setRequestHeader('Content-Type', file.type);
            xhr.send(file);
          });

          await uploadPromise;
          setProgress(65);

          const commitRes = await apiRequest('/api/media/commit', {
            method: 'POST',
            body: JSON.stringify({
              bucket: signData.bucket,
              path: signData.path,
              mimeType: file.type,
              sizeBytes: file.size,
              kind: options.kind,
              parentId: options.parentId,
            }),
          });

          const commitData = await commitRes.json();
          setProgress(100);

          console.log('[PROOF:MEDIA] upload', options.kind, options.parentId, commitData);

          return commitData as UploadResult;
        } catch (error: any) {
          lastError = error;
          if (attempt < MAX_RETRIES) {
            await new Promise(r => setTimeout(r, 1000));
            continue;
          }
        }
      }

      toast({
        title: 'Upload failed',
        description: lastError?.message || 'Something went wrong during upload. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [toast]);

  const deleteAsset = useCallback(async (assetId: string): Promise<boolean> => {
    try {
      const res = await apiRequest(`/api/media/${assetId}`, { method: 'DELETE' });
      const data = await res.json();
      return data.ok === true;
    } catch {
      return false;
    }
  }, []);

  const cleanupParent = useCallback(async (parentType: string, parentId: string): Promise<boolean> => {
    try {
      const res = await apiRequest('/api/media/cleanup-parent', {
        method: 'POST',
        body: JSON.stringify({ parentType, parentId }),
      });
      const data = await res.json();
      return data.ok === true;
    } catch {
      return false;
    }
  }, []);

  return { upload, deleteAsset, cleanupParent, uploading, progress };
}
