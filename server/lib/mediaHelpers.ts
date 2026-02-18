import { db } from "../db";
import { mediaAssets } from "@shared/schema";
import { eq, and, inArray } from "drizzle-orm";

export interface MediaThumb {
  parentId: string;
  publicUrl: string;
  thumbUrl: string;
}

export async function getThumbUrlsForParents(
  parentType: string,
  parentIds: string[]
): Promise<Map<string, MediaThumb[]>> {
  if (parentIds.length === 0) return new Map();

  const originals = await db.select().from(mediaAssets).where(
    and(
      eq(mediaAssets.parent_type, parentType),
      inArray(mediaAssets.parent_id, parentIds),
      eq(mediaAssets.variant, 'original')
    )
  );

  const thumbs = await db.select().from(mediaAssets).where(
    and(
      eq(mediaAssets.parent_type, parentType),
      inArray(mediaAssets.parent_id, parentIds),
      eq(mediaAssets.variant, 'thumb')
    )
  );

  const result = new Map<string, MediaThumb[]>();

  for (const orig of originals) {
    if (!orig.parent_id) continue;
    const thumb = thumbs.find(t => t.parent_asset_id === orig.id);
    const entry: MediaThumb = {
      parentId: orig.parent_id,
      publicUrl: orig.public_url || '',
      thumbUrl: thumb?.public_url || orig.public_url || '',
    };

    if (!result.has(orig.parent_id)) {
      result.set(orig.parent_id, []);
    }
    result.get(orig.parent_id)!.push(entry);
  }

  return result;
}

export function attachThumbUrls<T extends { id: string; images?: string[] | null; image_url?: string | null }>(
  items: T[],
  thumbMap: Map<string, MediaThumb[]>
): (T & { thumbUrls?: string[] })[] {
  return items.map(item => {
    const mediaItems = thumbMap.get(item.id);
    if (mediaItems && mediaItems.length > 0) {
      return {
        ...item,
        thumbUrls: mediaItems.map(m => m.thumbUrl),
      };
    }
    return {
      ...item,
      thumbUrls: item.images?.map(img => img) || (item.image_url ? [item.image_url] : []),
    };
  });
}

export const MEDIA_LIMITS = {
  avatar: { maxBytes: 5 * 1024 * 1024, maxCount: 1 },
  post_image: { maxBytes: 10 * 1024 * 1024, maxCount: 10 },
  post_video: { maxBytes: 100 * 1024 * 1024, maxCount: 1 },
  listing: { maxBytes: 10 * 1024 * 1024, maxCount: 20 },
} as const;

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'
];

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4', 'video/quicktime', 'video/webm'
];

export const ALL_ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

export function validateMediaUpload(
  mimeType: string,
  sizeBytes: number | undefined,
  kind: string,
  existingCount: number = 0
): { valid: boolean; code?: string; message?: string } {
  if (!ALL_ALLOWED_TYPES.includes(mimeType)) {
    return { valid: false, code: 'MEDIA_INVALID_TYPE', message: `Unsupported file type: ${mimeType}` };
  }

  const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType);

  if (kind === 'avatar') {
    if (isVideo) {
      return { valid: false, code: 'MEDIA_INVALID_TYPE', message: 'Avatars must be images, not videos' };
    }
    if (sizeBytes && sizeBytes > MEDIA_LIMITS.avatar.maxBytes) {
      return { valid: false, code: 'MEDIA_TOO_LARGE', message: 'Avatar must be under 5MB' };
    }
  } else if (kind === 'post') {
    if (isVideo) {
      if (sizeBytes && sizeBytes > MEDIA_LIMITS.post_video.maxBytes) {
        return { valid: false, code: 'MEDIA_TOO_LARGE', message: 'Post video must be under 100MB' };
      }
    } else {
      if (sizeBytes && sizeBytes > MEDIA_LIMITS.post_image.maxBytes) {
        return { valid: false, code: 'MEDIA_TOO_LARGE', message: 'Post image must be under 10MB' };
      }
    }
    if (existingCount >= MEDIA_LIMITS.post_image.maxCount) {
      return { valid: false, code: 'MEDIA_TOO_MANY', message: 'Maximum 10 images per post' };
    }
  } else if (kind === 'listing') {
    if (isVideo) {
      return { valid: false, code: 'MEDIA_INVALID_TYPE', message: 'Listings only accept images' };
    }
    if (sizeBytes && sizeBytes > MEDIA_LIMITS.listing.maxBytes) {
      return { valid: false, code: 'MEDIA_TOO_LARGE', message: 'Listing image must be under 10MB' };
    }
    if (existingCount >= MEDIA_LIMITS.listing.maxCount) {
      return { valid: false, code: 'MEDIA_TOO_MANY', message: 'Maximum 20 images per listing' };
    }
  }

  return { valid: true };
}
