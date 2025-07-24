// Image optimization utilities
export const imageOptimization = {
  // Generate different sizes for responsive images
  generateSrcSet: (baseUrl: string, sizes: number[] = [300, 600, 900, 1200]) => {
    return sizes.map(size => `${baseUrl}?w=${size} ${size}w`).join(', ');
  },

  // Generate sizes attribute for responsive images
  generateSizes: (breakpoints: { [key: string]: string } = {
    '(max-width: 768px)': '100vw',
    '(max-width: 1024px)': '50vw',
    default: '33vw'
  }) => {
    const entries = Object.entries(breakpoints);
    const conditions = entries
      .filter(([key]) => key !== 'default')
      .map(([condition, value]) => `${condition} ${value}`);
    
    const defaultValue = breakpoints.default || '100vw';
    return [...conditions, defaultValue].join(', ');
  },

  // Compress image quality for faster loading
  getOptimizedUrl: (url: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}) => {
    const params = new URLSearchParams();
    
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('f', options.format);
    
    return `${url}?${params.toString()}`;
  },

  // Placeholder for blurred image effect
  generateBlurDataUrl: (width = 10, height = 10) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create a simple gradient placeholder
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#f3f4f6');
      gradient.addColorStop(1, '#e5e7eb');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
    
    return canvas.toDataURL();
  }
};