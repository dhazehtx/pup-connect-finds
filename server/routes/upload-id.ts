import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import multer from 'multer';

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

async function getUserIdFromToken(req: Request): Promise<string | null> {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return null;
    const { data, error } = await supabaseAdmin.auth.getUser(token);
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
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const BUCKET_NAME = 'provider-id-docs';
    const filePath = `users/${userId}/id/${Date.now()}_front_${req.file.originalname}`;

    console.log('[UPLOAD-ID] Uploading front image:', { userId, filePath, size: req.file.size });

    // Upload using supabaseAdmin (service role) - bypasses RLS
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (error) {
      console.error('[UPLOAD-ID] Upload error:', error);
      return res.status(500).json({ error: `Upload failed: ${error.message}` });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    console.log('[UPLOAD-ID] Front image uploaded successfully');

    return res.status(200).json({
      success: true,
      url: urlData.publicUrl,
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
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const BUCKET_NAME = 'provider-id-docs';
    const filePath = `users/${userId}/id/${Date.now()}_back_${req.file.originalname}`;

    console.log('[UPLOAD-ID] Uploading back image:', { userId, filePath, size: req.file.size });

    // Upload using supabaseAdmin (service role) - bypasses RLS
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (error) {
      console.error('[UPLOAD-ID] Upload error:', error);
      return res.status(500).json({ error: `Upload failed: ${error.message}` });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    console.log('[UPLOAD-ID] Back image uploaded successfully');

    return res.status(200).json({
      success: true,
      url: urlData.publicUrl,
      path: filePath
    });
  } catch (error: any) {
    console.error('[UPLOAD-ID] Unexpected error:', error);
    return res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

export default router;
