// Storage utility for handling file uploads
import { promises as fs } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'provider-id');

// Ensure upload directory exists
export async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create upload directory:', error);
  }
}

export async function saveIdImage(opts: {
  userId: string;
  providerId: string;
  side: "front" | "back";
  file: Buffer;
  contentType?: string;
}): Promise<string> {
  await ensureUploadDir();
  
  const ts = Date.now();
  const ext = (opts.contentType?.split("/")?.[1]) || "jpg";
  const filename = `id-${opts.side}-${ts}.${ext}`;
  const userDir = path.join(UPLOAD_DIR, opts.userId, opts.providerId);
  
  // Create user/provider directory
  await fs.mkdir(userDir, { recursive: true });
  
  const filePath = path.join(userDir, filename);
  const relativePath = `${opts.userId}/${opts.providerId}/${filename}`;
  
  await fs.writeFile(filePath, opts.file);
  
  return relativePath;
}

export async function getIdImagePath(userId: string, providerId: string, side: "front" | "back"): Promise<string | null> {
  const userDir = path.join(UPLOAD_DIR, userId, providerId);
  
  try {
    const files = await fs.readdir(userDir);
    const imageFile = files.find(file => file.startsWith(`id-${side}-`));
    
    if (imageFile) {
      return `${userId}/${providerId}/${imageFile}`;
    }
  } catch (error) {
    // Directory doesn't exist or other error
  }
  
  return null;
}