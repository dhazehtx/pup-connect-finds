
export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  aspectRatio?: number;
  objectFit?: 'cover' | 'contain' | 'fill';
}

export const optimizeImage = async (
  file: File, 
  options: ImageOptimizationOptions = {}
): Promise<Blob> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'jpeg',
    aspectRatio,
    objectFit = 'contain'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;
      
      // If aspect ratio is specified, adjust dimensions accordingly
      if (aspectRatio) {
        if (width / height > aspectRatio) {
          // Image is wider than target aspect ratio
          width = height * aspectRatio;
        } else {
          // Image is taller than target aspect ratio
          height = width / aspectRatio;
        }
      }
      
      // Scale down if needed
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Clear canvas with white background for better compatibility
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // Draw image based on object fit preference
        if (objectFit === 'contain') {
          // Calculate scaling to fit entire image
          const scale = Math.min(width / img.width, height / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const x = (width - scaledWidth) / 2;
          const y = (height - scaledHeight) / 2;
          
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        } else {
          // Default cover behavior
          ctx.drawImage(img, 0, 0, width, height);
        }
      }
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to optimize image'));
          }
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

export const generateThumbnail = async (
  file: File,
  size: number = 200
): Promise<Blob> => {
  return optimizeImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    format: 'jpeg',
    aspectRatio: 1, // Square aspect ratio for thumbnails
    objectFit: 'contain'
  });
};

export const generateCardImage = async (
  file: File,
  width: number = 300,
  height: number = 200
): Promise<Blob> => {
  return optimizeImage(file, {
    maxWidth: width,
    maxHeight: height,
    quality: 0.8,
    format: 'jpeg',
    aspectRatio: width / height,
    objectFit: 'contain'
  });
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload JPEG, PNG, WebP, or GIF images.'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Please upload images smaller than 10MB.'
    };
  }

  return { valid: true };
};
