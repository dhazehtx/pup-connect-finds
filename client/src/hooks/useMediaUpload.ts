import { useState, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface UploadOptions {
  bucket: string;
  kind: 'avatar' | 'post' | 'listing';
  parentId?: string;
}

interface UploadResult {
  ok: boolean;
  assetId?: string;
  url?: string;
  path?: string;
}

export function useMediaUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const upload = useCallback(async (file: File, options: UploadOptions): Promise<UploadResult | null> => {
    setUploading(true);
    setProgress(10);

    try {
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

      setProgress(30);

      const uploadRes = await fetch(signData.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error('Upload failed');
      }

      setProgress(70);

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

      console.log('[PROOF:MEDIA]', { kind: options.kind, parentId: options.parentId, ok: commitData.ok });

      return commitData;
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error?.message || 'Something went wrong during upload',
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

  return { upload, deleteAsset, uploading, progress };
}
