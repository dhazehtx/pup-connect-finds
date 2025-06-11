
export interface CompressionOptions {
  maxSize?: number; // in MB
  quality?: number; // 0-1 for images
  maxWidth?: number;
  maxHeight?: number;
}

export const compressFile = async (
  file: File, 
  options: CompressionOptions = {}
): Promise<File> => {
  const {
    maxSize = 10, // 10MB default
    quality = 0.8,
    maxWidth = 1920,
    maxHeight = 1080
  } = options;

  // If file is already small enough, return as-is
  if (file.size <= maxSize * 1024 * 1024) {
    return file;
  }

  // Only compress images for now
  if (!file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions
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

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
};

export const getCompressionEstimate = (file: File, quality: number = 0.8): number => {
  if (!file.type.startsWith('image/')) {
    return file.size;
  }
  
  // Rough estimation based on quality
  return Math.round(file.size * quality);
};
