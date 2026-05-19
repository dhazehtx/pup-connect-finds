import { useState, useCallback, useRef } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { parseApiErrorMessage } from '@/lib/parseApiError';

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

const MAX_RETRIES = 2;

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'
];
const ALLOWED_VIDEO_TYPES = [
  'video/mp4', 'video/quicktime', 'video/webm'
];
const ALL_ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

const LIMITS = {
  avatar: { maxBytes: 5 * 1024 * 1024, label: '5MB' },
  post_image: { maxBytes: 10 * 1024 * 1024, label: '10MB' },
  post_video: { maxBytes: 100 * 1024 * 1024, label: '100MB' },
  listing: { maxBytes: 10 * 1024 * 1024, label: '10MB', maxCount: 20 },
} as const;

function preflightCheck(
  file: File,
  kind: 'avatar' | 'post' | 'listing'
): { valid: boolean; code?: string; message?: string } {
  if (!file.type || file.size === 0) {
    return { valid: false, code: 'MEDIA_EMPTY_FILE', message: 'The image file is empty. Try choosing the photo again.' };
  }

  if (!ALL_ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, code: 'MEDIA_INVALID_TYPE', message: `Unsupported file type: ${file.type || 'unknown'}. Use JPEG, PNG, WebP, GIF, or MP4.` };
  }

  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (kind === 'avatar') {
    if (isVideo) return { valid: false, code: 'MEDIA_INVALID_TYPE', message: 'Avatars must be images, not videos.' };
    if (file.size > LIMITS.avatar.maxBytes) return { valid: false, code: 'MEDIA_TOO_LARGE', message: `Avatar must be under ${LIMITS.avatar.label}.` };
  } else if (kind === 'post') {
    if (isVideo) {
      if (file.size > LIMITS.post_video.maxBytes) return { valid: false, code: 'MEDIA_TOO_LARGE', message: `Video must be under ${LIMITS.post_video.label}.` };
    } else {
      if (file.size > LIMITS.post_image.maxBytes) return { valid: false, code: 'MEDIA_TOO_LARGE', message: `Image must be under ${LIMITS.post_image.label}.` };
    }
  } else if (kind === 'listing') {
    if (isVideo) return { valid: false, code: 'MEDIA_INVALID_TYPE', message: 'Listings only accept images.' };
    if (file.size > LIMITS.listing.maxBytes) return { valid: false, code: 'MEDIA_TOO_LARGE', message: `Image must be under ${LIMITS.listing.label}.` };
  }

  return { valid: true };
}

export function useMediaUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const abortRef = useRef<XMLHttpRequest | null>(null);

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setUploading(false);
    setProgress(0);
  }, []);

  const upload = useCallback(async (file: File, options: UploadOptions): Promise<UploadResult | null> => {
    const check = preflightCheck(file, options.kind);
    if (!check.valid) {
      console.log('[PROOF:MEDIA:TOAST]', check.code);
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
            console.log('[PROOF:UPLOAD:RETRY]', JSON.stringify({ attempt: attempt + 1, filename: file.name }));
            setProgress(5);
            toast({ title: 'Retrying upload...', description: `Attempt ${attempt + 1}` });
          }

          console.log('[PROOF:UPLOAD]', JSON.stringify({ parentType: options.kind, parentId: options.parentId || null, filename: file.name, pct: 10 }));
          setProgress(10);
          const signData = (await apiRequest('/api/media/sign', {
            method: 'POST',
            body: {
              bucket: options.bucket,
              fileName: file.name,
              mimeType: file.type,
              kind: options.kind,
              sizeBytes: file.size,
              parentId: options.parentId,
            },
          })) as {
            ok?: boolean;
            uploadUrl?: string;
            path?: string;
            bucket?: string;
            error?: string;
            code?: string;
          };
          if (!signData.ok) {
            const rejectCode = signData.code || 'MEDIA_SIGN_REJECTED';
            if (
              rejectCode === 'MEDIA_INVALID_TYPE' ||
              rejectCode === 'MEDIA_INVALID' ||
              rejectCode === 'MEDIA_TOO_LARGE' ||
              rejectCode === 'MEDIA_TOO_MANY' ||
              rejectCode === 'AUTH_REQUIRED' ||
              rejectCode === 'SUPABASE_DEGRADED'
            ) {
              console.log('[PROOF:MEDIA:TOAST]', rejectCode);
              toast({
                title: 'Upload rejected',
                description: signData.error || rejectCode,
                variant: 'destructive',
              });
              return null;
            }
            throw new Error(signData.error || `Failed to get upload URL (${rejectCode})`);
          }
          const uploadUrl = signData.uploadUrl;
          const signedPath = signData.path;
          const signedBucket = signData.bucket;
          if (!uploadUrl || !signedPath || !signedBucket) {
            throw new Error('Invalid upload response from server');
          }

          setProgress(25);

          const xhr = new XMLHttpRequest();
          abortRef.current = xhr;
          const uploadPromise = new Promise<void>((resolve, reject) => {
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                const pct = 25 + Math.round((e.loaded / e.total) * 40);
                setProgress(pct);
                console.log('[PROOF:UPLOAD]', JSON.stringify({ parentType: options.kind, parentId: options.parentId || null, filename: file.name, pct }));
              }
            };
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) resolve();
              else reject(new Error(`Upload failed (HTTP ${xhr.status})`));
            };
            xhr.onerror = () => reject(new Error('Upload network error'));
            xhr.onabort = () => reject(new Error('Upload cancelled'));
            xhr.open('PUT', uploadUrl);
            xhr.setRequestHeader('Content-Type', file.type);
            xhr.send(file);
          });

          await uploadPromise;
          abortRef.current = null;
          setProgress(65);

          const commitData = (await apiRequest('/api/media/commit', {
            method: 'POST',
            body: {
              bucket: signedBucket,
              path: signedPath,
              mimeType: file.type,
              sizeBytes: file.size,
              kind: options.kind,
              parentId: options.parentId,
            },
          })) as UploadResult & { ok?: boolean; error?: string; code?: string };

          if (commitData.ok === false || (!commitData.url && !commitData.asset?.publicUrl)) {
            throw new Error(
              commitData.error || commitData.code || 'Failed to save media metadata',
            );
          }

          setProgress(100);

          console.log('[PROOF:UPLOAD]', JSON.stringify({ parentType: options.kind, parentId: options.parentId || null, filename: file.name, pct: 100 }));

          return commitData as UploadResult;
        } catch (error: any) {
          lastError = error;
          if (attempt < MAX_RETRIES) {
            await new Promise(r => setTimeout(r, 1000));
            continue;
          }
        }
      }

      const parsed = parseApiErrorMessage(lastError);
      const description = parsed.code
        ? `${parsed.message} (${parsed.code})`
        : parsed.message || 'Something went wrong during upload. Please try again.';
      toast({
        title: 'Upload failed',
        description,
        variant: 'destructive',
      });
      const err = lastError instanceof Error ? lastError : new Error(description);
      (err as Error & { code?: string }).code = parsed.code;
      throw err;
    } finally {
      abortRef.current = null;
      setUploading(false);
      setProgress(0);
    }
  }, [toast]);

  const deleteAsset = useCallback(async (assetId: string): Promise<boolean> => {
    try {
      const data = (await apiRequest(`/api/media/${assetId}`, { method: 'DELETE' })) as { ok?: boolean };
      return data.ok === true;
    } catch {
      return false;
    }
  }, []);

  const cleanupParent = useCallback(async (parentType: string, parentId: string): Promise<boolean> => {
    try {
      const data = (await apiRequest('/api/media/cleanup-parent', {
        method: 'POST',
        body: { parentType, parentId },
      })) as { ok?: boolean };
      return data.ok === true;
    } catch {
      return false;
    }
  }, []);

  return { upload, deleteAsset, cleanupParent, cancel, uploading, progress };
}
