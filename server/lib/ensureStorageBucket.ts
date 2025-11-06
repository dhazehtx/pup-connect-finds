import { supabaseAdmin } from './supabaseAdmin';

const BUCKET_NAME = 'provider-id-docs';

/**
 * Ensures the storage bucket exists for provider ID documents
 * Creates it if it doesn't exist with proper public access settings
 */
export async function ensureProviderIdBucket(): Promise<string> {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('[Storage] Error listing buckets:', listError);
      throw new Error('Failed to list storage buckets');
    }

    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

    if (!bucketExists) {
      console.log(`[Storage] Creating bucket: ${BUCKET_NAME}`);
      
      // Create the bucket with public access
      const { data, error: createError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']
      });

      if (createError) {
        console.error('[Storage] Error creating bucket:', createError);
        throw new Error(`Failed to create storage bucket: ${createError.message}`);
      }

      console.log(`[Storage] Bucket created successfully: ${BUCKET_NAME}`);
    } else {
      console.log(`[Storage] Bucket already exists: ${BUCKET_NAME}`);
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
