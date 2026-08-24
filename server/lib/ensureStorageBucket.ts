import { supabaseAdmin } from './supabaseAdmin';
import { runSupabaseWithRetry } from './supabaseResilience';

const BUCKET_NAME = 'provider-id-docs';

/**
 * Ensures the storage bucket exists for provider ID documents
 * Creates it if it doesn't exist with proper public access settings
 */
export async function ensureProviderIdBucket(): Promise<string> {
  try {
    if (!supabaseAdmin) {
      console.warn(
        "[Storage] Supabase admin not configured; skip provider-id bucket ensure.",
      );
      return BUCKET_NAME;
    }

    // Check if bucket exists
    const { data: buckets, error: listError } = await runSupabaseWithRetry(
      () => supabaseAdmin!.storage.listBuckets(),
      { opName: 'storage.listBuckets' },
    );
    
    if (listError) {
      console.error('[Storage] Error listing buckets:', listError);
      throw new Error('Failed to list storage buckets');
    }

    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

    // PRIVATE bucket: government-ID documents must never be world-readable.
    // The server reads them with the service role via short-lived signed URLs.
    const bucketConfig = {
      public: false,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']
    };

    if (!bucketExists) {
      console.log(`[Storage] Creating bucket: ${BUCKET_NAME}`);
      
      // Create the bucket with public access
      const { data, error: createError } = await runSupabaseWithRetry(
        () => supabaseAdmin!.storage.createBucket(BUCKET_NAME, bucketConfig),
        { opName: 'storage.createBucket' },
      );

      if (createError) {
        console.error('[Storage] Error creating bucket:', createError);
        throw new Error(`Failed to create storage bucket: ${createError.message}`);
      }

      console.log(`[Storage] Bucket created successfully: ${BUCKET_NAME}`);
    } else {
      console.log(`[Storage] Bucket already exists: ${BUCKET_NAME}`);
      
      // Update existing bucket to ensure MIME types include HEIC/HEIF
      console.log(`[Storage] Updating bucket MIME types to include HEIC/HEIF...`);
      const { error: updateError } = await runSupabaseWithRetry(
        () => supabaseAdmin!.storage.updateBucket(BUCKET_NAME, bucketConfig),
        { opName: 'storage.updateBucket' },
      );
      
      if (updateError) {
        console.warn('[Storage] Warning: Could not update bucket MIME types:', updateError.message);
        console.warn('[Storage] HEIC/HEIF uploads may be blocked. Consider updating bucket settings manually.');
      } else {
        console.log(`[Storage] Bucket MIME types updated successfully`);
      }
    }

    return BUCKET_NAME;
  } catch (error: any) {
    console.error('[Storage] ensureProviderIdBucket failed:', error);
    throw error;
  }
}

/**
 * Get the bucket name for provider ID documents
 */
export function getProviderIdBucketName(): string {
  return BUCKET_NAME;
}

const MEDIA_BUCKETS: Array<{
  name: string;
  fileSizeLimit: number;
  allowedMimeTypes: string[];
}> = [
  {
    name: 'avatars',
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'],
  },
  {
    name: 'posts',
    fileSizeLimit: 100 * 1024 * 1024,
    allowedMimeTypes: [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif',
      'video/mp4', 'video/quicktime', 'video/webm',
    ],
  },
  {
    name: 'listings',
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'],
  },
];

async function ensureOneBucket(
  bucketName: string,
  fileSizeLimit: number,
  allowedMimeTypes: string[],
): Promise<void> {
  if (!supabaseAdmin) return;

  const { data: buckets, error: listError } = await runSupabaseWithRetry(
    () => supabaseAdmin!.storage.listBuckets(),
    { opName: 'storage.listBuckets' },
  );

  if (listError) {
    console.error(`[Storage] Error listing buckets for ${bucketName}:`, listError);
    throw new Error('Failed to list storage buckets');
  }

  const bucketConfig = { public: true, fileSizeLimit, allowedMimeTypes };
  const exists = buckets?.some((b) => b.name === bucketName);

  if (!exists) {
    console.log(`[Storage] Creating bucket: ${bucketName}`);
    const { error: createError } = await runSupabaseWithRetry(
      () => supabaseAdmin!.storage.createBucket(bucketName, bucketConfig),
      { opName: `storage.createBucket.${bucketName}` },
    );
    if (createError) {
      console.error(`[Storage] Error creating bucket ${bucketName}:`, createError);
      throw new Error(`Failed to create storage bucket ${bucketName}: ${createError.message}`);
    }
    console.log(`[Storage] Bucket created: ${bucketName}`);
  } else {
    const { error: updateError } = await runSupabaseWithRetry(
      () => supabaseAdmin!.storage.updateBucket(bucketName, bucketConfig),
      { opName: `storage.updateBucket.${bucketName}` },
    );
    if (updateError) {
      console.warn(`[Storage] Could not update bucket ${bucketName}:`, updateError.message);
    }
  }
}

/** Ensures a single media bucket by name (avatars | posts | listings). */
export async function ensureMediaBucketByName(bucketName: string): Promise<void> {
  const config = MEDIA_BUCKETS.find((b) => b.name === bucketName);
  if (!config) {
    throw new Error(`Unknown media bucket: ${bucketName}`);
  }
  await ensureOneBucket(config.name, config.fileSizeLimit, config.allowedMimeTypes);
}

/** Ensures avatars, posts, and listings storage buckets exist (user media uploads). */
export async function ensureMediaBuckets(): Promise<void> {
  if (!supabaseAdmin) {
    console.warn('[Storage] Supabase admin not configured; skip media bucket ensure.');
    for (const bucket of MEDIA_BUCKETS) {
      console.warn(`[Storage] ${bucket.name} bucket: skipped (no admin client)`);
    }
    return;
  }

  for (const bucket of MEDIA_BUCKETS) {
    try {
      await ensureOneBucket(bucket.name, bucket.fileSizeLimit, bucket.allowedMimeTypes);
      console.log(`[Storage] ${bucket.name} bucket: ready`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[Storage] ${bucket.name} bucket: error — ${msg}`);
    }
  }
  console.log('[Storage] Media bucket ensure finished (avatars, posts, listings)');
}
