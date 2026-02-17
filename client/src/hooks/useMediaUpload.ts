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

export function useMediaUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const upload = useCallback(async (file: File, options: UploadOptions): Promise<UploadResult | null> => {
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
            }),
          });

          const signData = await signRes.json();
          if (!signData.ok) {
            throw new Error(signData.error || 'Failed to get upload URL');
          }

          setProgress(25);

          const uploadRes = await fetch(signData.uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file,
          });

          if (!uploadRes.ok) {
            throw new Error(`Upload failed (HTTP ${uploadRes.status})`);
          }

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

          console.log('[PROOF:MEDIA]', { kind: options.kind, parentId: options.parentId, ok: commitData.ok, assetId: commitData.assetId });

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
