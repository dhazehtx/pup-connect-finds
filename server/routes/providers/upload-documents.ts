import type { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

// Configure multer for disk storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'provider-docs');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.id || 'anonymous';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const docType = file.fieldname;
    cb(null, `${userId}_${docType}_${timestamp}${ext}`);
  }
});

// Configure multer
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF and image files
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'));
    }
  }
});

export const uploadDocuments = upload.fields([
  { name: 'businessLicense', maxCount: 1 },
  { name: 'insuranceCertificate', maxCount: 1 },
  { name: 'certCPR', maxCount: 1 },
  { name: 'certAKCTrainer', maxCount: 1 },
  { name: 'other', maxCount: 1 }
]);

export async function handleDocumentUpload(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Build response with file paths
    const uploadedFiles: Record<string, { path: string; filename: string; type: string }> = {};
    
    for (const [fieldName, fileArray] of Object.entries(files)) {
      if (fileArray && fileArray.length > 0) {
        const file = fileArray[0];
        uploadedFiles[fieldName] = {
          path: file.path,
          filename: file.filename,
          type: file.mimetype
        };
      }
    }

    // TODO: Save document metadata to provider_documents table
    // For now, just return the file paths

    res.json({
      success: true,
      files: uploadedFiles,
      message: 'Documents uploaded successfully'
    });

  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Upload failed' 
    });
  }
}
