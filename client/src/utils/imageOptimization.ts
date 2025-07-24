// Image optimization utilities for better performance
export const imageOptimization = {
  // Generate optimized image URL with quality and format parameters
  getOptimizedUrl: (
    src: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png';
    } = {}
  ): string => {
    if (!src || src.startsWith('data:')) return src;

    const { width, height, quality = 80, format = 'webp' } = options;
    
    // For external images (like from Supabase), return as-is
    if (src.startsWith('http')) {
      return src;
    }

    // For local images, add optimization parameters
    const url = new URL(src, window.location.origin);
    
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    if (quality !== 80) url.searchParams.set('q', quality.toString());
    if (format !== 'jpeg') url.searchParams.set('f', format);

    return url.toString();
  },

  // Generate srcSet for responsive images
  generateSrcSet: (src: string): string => {
    if (!src || src.startsWith('data:') || src.startsWith('http')) {
      return src;
    }

    const sizes = [320, 640, 960, 1280, 1920];
    const srcSetEntries = sizes.map(size => {
      const optimizedUrl = imageOptimization.getOptimizedUrl(src, {
        width: size,
        quality: 80,
        format: 'webp'
      });
      return `${optimizedUrl} ${size}w`;
    });

    return srcSetEntries.join(', ');
  },

  // Generate sizes attribute for responsive images
  generateSizes: (): string => {
    return [
      '(max-width: 320px) 280px',
      '(max-width: 640px) 600px',
      '(max-width: 960px) 920px',
      '(max-width: 1280px) 1240px',
      '1880px'
    ].join(', ');
  },

  // Check if WebP is supported
  supportsWebP: (): Promise<boolean> => {
    return new Promise(resolve => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  },

  // Lazy load images with intersection observer
  setupLazyLoading: (selector: string = 'img[data-src]') => {
    const images = document.querySelectorAll(selector);
    
    if (!images.length) return;

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.getAttribute('data-src');
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
          }
          
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    images.forEach(img => imageObserver.observe(img));
  },

  // Convert images to WebP format client-side
  convertToWebP: async (
    file: File,
    quality: number = 0.8
  ): Promise<Blob | null> => {
    return new Promise(resolve => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(resolve, 'image/webp', quality);
        } else {
          resolve(null);
        }
      };

      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  },

  // Compress image file size
  compressImage: async (
    file: File,
    maxWidth: number = 1920,
    maxHeight: number = 1920,
    quality: number = 0.8
  ): Promise<Blob | null> => {
    return new Promise(resolve => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(resolve, 'image/jpeg', quality);
        } else {
          resolve(null);
        }
      };

      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  }
};