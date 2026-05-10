import React, { useRef, useCallback, forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { Camera, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import ImageCropper from '@/components/profile/ImageCropper';

export type ProfileAvatarPhotoControlsHandle = {
  /** Opens the image file picker (images only). */
  openFilePicker: () => void;
};

type Props = {
  /** Called with public URL after successful upload + server commit */
  onSuccess: (publicUrl: string) => void;
  /** Small circular button on top-right of avatar (Option A) */
  variant: 'overlay' | 'inline';
  className?: string;
  disabled?: boolean;
  /** Lets parent show a full-avatar overlay while uploading (overlay variant). */
  onUploadingChange?: (uploading: boolean) => void;
};

/** Browsers show images only; server + `useMediaUpload` validate MIME and size. */
const IMAGE_ACCEPT = 'image/*';

const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];

function canOpenCropper(file: File): { ok: true } | { ok: false; message: string } {
  if (!AVATAR_TYPES.includes(file.type)) {
    return { ok: false, message: 'Use a JPEG, PNG, WebP, or similar image.' };
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return { ok: false, message: 'Photo must be under 5MB.' };
  }
  return { ok: true };
}

/**
 * Device photo upload for profile avatar via `/api/media/sign` + commit (`kind: avatar`, bucket `avatars`).
 * Square crop (1:1) before upload; commit updates `profiles.avatar_url`.
 */
export const ProfileAvatarPhotoControls = forwardRef<ProfileAvatarPhotoControlsHandle, Props>(
  function ProfileAvatarPhotoControls(
    { onSuccess, variant, className, disabled, onUploadingChange },
    ref,
  ) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useMediaUpload();
  const { toast } = useToast();
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  useEffect(() => {
    onUploadingChange?.(uploading);
  }, [uploading, onUploadingChange]);

  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  useImperativeHandle(ref, () => ({ openFilePicker }), [openFilePicker]);

  const closeCropper = useCallback(() => {
    setCropSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const runUpload = useCallback(
    async (file: File) => {
      const result = await upload(file, { bucket: 'avatars', kind: 'avatar' });
      const url = result?.url || (result as { asset?: { publicUrl?: string } })?.asset?.publicUrl;
      if (url) {
        toast({ title: 'Photo updated', description: 'Your profile picture has been saved.' });
        onSuccess(url);
      }
    },
    [upload, onSuccess, toast],
  );

  const onCropApplied = useCallback(
    async (croppedFile: File) => {
      await runUpload(croppedFile);
    },
    [runUpload],
  );

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      const gate = canOpenCropper(file);
      if (!gate.ok) {
        toast({ title: 'Photo not accepted', description: gate.message, variant: 'destructive' });
        return;
      }
      const url = URL.createObjectURL(file);
      setCropSrc(url);
    },
    [toast],
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    handleFile(f);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        onChange={onChange}
      />
      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          isOpen
          onClose={closeCropper}
          onCropComplete={(file) => {
            void onCropApplied(file);
          }}
        />
      )}
      {variant === 'overlay' ? (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={(e) => {
            e.stopPropagation();
            openFilePicker();
          }}
          className={cn(
            'absolute right-1 top-1 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-md ring-2 ring-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 dark:ring-slate-950 dark:focus:ring-offset-slate-950',
            className,
          )}
          aria-label="Change profile photo"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Camera className="h-4 w-4" aria-hidden />}
        </button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || uploading}
          onClick={openFilePicker}
          className={cn('font-medium', className)}
        >
          {uploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {uploading ? 'Uploading…' : 'Upload photo'}
        </Button>
      )}
    </>
  );
  }
);
