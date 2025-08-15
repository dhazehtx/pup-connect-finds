import type { Request, Response } from 'express';
import multer from 'multer';
import { saveIdImage } from '../../../lib/storage';

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export const uploadIdImages = upload.fields([
  { name: 'front', maxCount: 1 },
  { name: 'back', maxCount: 1 }
]);

export async function handleIdUpload(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { providerId } = req.body;
    if (!providerId) {
      return res.status(400).json({ error: 'Provider ID required' });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files?.front?.[0] || !files?.back?.[0]) {
      return res.status(400).json({ error: 'Both front and back images required' });
    }

    // Save both images
    const frontPath = await saveIdImage({
      userId: req.user.id,
      providerId,
      side: 'front',
      file: files.front[0].buffer,
      contentType: files.front[0].mimetype
    });

    const backPath = await saveIdImage({
      userId: req.user.id,
      providerId,
      side: 'back', 
      file: files.back[0].buffer,
      contentType: files.back[0].mimetype
    });

    res.json({
      success: true,
      paths: {
        front: frontPath,
        back: backPath
      }
    });

  } catch (error) {
    console.error('ID upload error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Upload failed' 
    });
  }
}