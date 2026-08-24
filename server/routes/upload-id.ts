import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import multer from 'multer';
import { isSupabaseDegraded, runSupabaseWithRetry } from '../lib/supabaseResilience';

const router = Router();

// Configure multer for file upload handling
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif',
      'application/pdf'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed. Please use HEIC, JPG, PNG, WebP, or PDF.`));
    }
  }
});

const BUCKET_NAME = 'provider-id-docs';
const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour — preview only; store the PATH, not the URL.

/**
 * Generate a short-lived signed URL for a just-uploaded ID document. The bucket
 * is private, so this is the only way to view it. Callers should persist `path`
 * (not the signed URL) and re-sign on read.
 */
async function signIdDoc(path: string): Promise<string | null> {
  try {
    const { data, error } = await runSupabaseWithRetry(
      () => supabaseAdmin!.storage.from(BUCKET_NAME).createSignedUrl(path, SIGNED_URL_TTL_SECONDS),
      { opName: 'upload-id.createSignedUrl' },
    );
    if (error) {
      console.error('[UPLOAD-ID] Signed URL error:', error);
      return null;
    }
    return data?.signedUrl ?? null;
  } catch (err) {
    console.error('[UPLOAD-ID] Signed URL exception:', err);
    return null;
  }
}

async function getUserIdFromToken(req: Request): Promise<string | null> {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return null;
    const admin = supabaseAdmin;
    if (!admin) return null;
    const { data, error } = await runSupabaseWithRetry(
      () => admin.auth.getUser(token),
      { opName: 'upload-id.auth.getUser' },
    );
    if (error) return null;
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * POST /api/upload-id/front
 * Upload front ID image to Supabase Storage using service role (bypasses RLS)
 */
router.post('/front', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (isSupabaseDegraded()) {
      return res.status(503).json({
        error: 'Upload service temporarily degraded',
        code: 'SUPABASE_DEGRADED',
        message: 'Please retry in a minute.',
      });
    }
    if (!supabaseAdmin) {
      return res.status(503).json({
        error: 'Upload service not configured',
        code: 'SUPABASE_UNCONFIGURED',
        message: 'Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server.',
      });
    }
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const filePath = `users/${userId}/id/${Date.now()}_front_${req.file.originalname}`;

    console.log('[UPLOAD-ID] Uploading front image:', { userId, filePath, size: req.file.size });

    // Upload using supabaseAdmin (service role) - bypasses RLS
    const { data, error } = await runSupabaseWithRetry(
      () =>
        supabaseAdmin!.storage
          .from(BUCKET_NAME)
          .upload(filePath, req.file!.buffer, {
            contentType: req.file!.mimetype,
            upsert: true
          }),
      { opName: 'upload-id.front.storage.upload' },
    );

    if (error) {
      console.error('[UPLOAD-ID] Upload error:', error);
      return res.status(500).json({ error: `Upload failed: ${error.message}` });
    }

    // Private bucket: hand back a short-lived signed URL for preview. Persist `path`.
    const signedUrl = await signIdDoc(filePath);

    console.log('[UPLOAD-ID] Front image uploaded successfully');

    return res.status(200).json({
      success: true,
      url: signedUrl,
      path: filePath
    });
  } catch (error: any) {
    console.error('[UPLOAD-ID] Unexpected error:', error);
    return res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

/**
 * POST /api/upload-id/back
 * Upload back ID image to Supabase Storage using service role (bypasses RLS)
 */
router.post('/back', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (isSupabaseDegraded()) {
      return res.status(503).json({
        error: 'Upload service temporarily degraded',
        code: 'SUPABASE_DEGRADED',
        message: 'Please retry in a minute.',
      });
    }
    if (!supabaseAdmin) {
      return res.status(503).json({
        error: 'Upload service not configured',
        code: 'SUPABASE_UNCONFIGURED',
        message: 'Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server.',
      });
    }
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const filePath = `users/${userId}/id/${Date.now()}_back_${req.file.originalname}`;

    console.log('[UPLOAD-ID] Uploading back image:', { userId, filePath, size: req.file.size });

    // Upload using supabaseAdmin (service role) - bypasses RLS
    const { data, error } = await runSupabaseWithRetry(
      () =>
        supabaseAdmin!.storage
          .from(BUCKET_NAME)
          .upload(filePath, req.file!.buffer, {
            contentType: req.file!.mimetype,
            upsert: true
          }),
      { opName: 'upload-id.back.storage.upload' },
    );

    if (error) {
      console.error('[UPLOAD-ID] Upload error:', error);
      return res.status(500).json({ error: `Upload failed: ${error.message}` });
    }

    // Private bucket: hand back a short-lived signed URL for preview. Persist `path`.
    const signedUrl = await signIdDoc(filePath);

    console.log('[UPLOAD-ID] Back image uploaded successfully');

    return res.status(200).json({
      success: true,
      url: signedUrl,
      path: filePath
    });
  } catch (error: any) {
    console.error('[UPLOAD-ID] Unexpected error:', error);
    return res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

export default router;
