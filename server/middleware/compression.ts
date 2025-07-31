import compression from 'compression';
import { Request, Response, NextFunction } from 'express';

// Compression middleware with optimized settings
export const compressionMiddleware = compression({
  // Only compress responses larger than 1kb
  threshold: 1024,
  
  // Compression level (1-9, 6 is default balance of speed/size)
  level: 6,
  
  // Don't compress responses with these headers
  filter: (req: Request, res: Response) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Don't compress already compressed content
    const contentType = res.getHeader('content-type') as string;
    if (contentType && (
      contentType.includes('image/') ||
      contentType.includes('video/') ||
      contentType.includes('audio/') ||
      contentType.includes('application/zip') ||
      contentType.includes('application/gzip')
    )) {
      return false;
    }
    
    // Use compression filter
    return compression.filter(req, res);
  },
  
  // Custom compression algorithms
  windowBits: 15,
  memLevel: 8,
});

export default compressionMiddleware;