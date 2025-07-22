
interface CompressionOptions {
  maxSize: number; // in MB
  quality?: number;
}

export const compressFile = async (file: File, options: CompressionOptions): Promise<File> => {
  // Only compress images for now
  if (!file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const maxSizeBytes = options.maxSize * 1024 * 1024;
      let quality = options.quality || 0.8;

      // Calculate new dimensions if file is too large
      let { width, height } = img;
      if (file.size > maxSizeBytes) {
        const ratio = Math.sqrt(maxSizeBytes / file.size);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Compression failed'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};
