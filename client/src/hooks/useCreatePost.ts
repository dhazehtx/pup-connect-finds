import { useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import { useMediaUpload } from '@/hooks/useMediaUpload';

type CreatePostInput = {
  file: File;
  caption: string;
  userId: string;
  postType: 'photo' | 'video';
};

export function useCreatePost() {
  const { upload, uploading, progress } = useMediaUpload();

  const createPost = useCallback(
    async ({ file, caption, userId, postType }: CreatePostInput) => {
      const result = await upload(file, { bucket: 'posts', kind: 'post' });
      const url =
        result?.url ||
        (result as { asset?: { publicUrl?: string } })?.asset?.publicUrl;
      if (!url) {
        throw new Error('Failed to upload media');
      }

      const trimmedCaption = caption.trim();
      const post = await apiRequest('/api/posts', {
        method: 'POST',
        body: {
          user_id: userId,
          content: trimmedCaption || 'Post',
          ...(trimmedCaption ? { caption: trimmedCaption } : {}),
          post_type: postType === 'video' ? 'video' : 'image',
          ...(postType === 'photo'
            ? { image_url: url, images: [url] }
            : { video_url: url }),
        },
      });

      return { post, mediaUrl: url };
    },
    [upload],
  );

  return { createPost, uploading, progress };
}
