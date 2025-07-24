// Lighthouse optimization utilities
export const lighthouseOptimizations = {
  // Preload critical resources
  preloadCriticalResources: () => {
    const criticalResources = [
      '/manifest.json',
      // Add other critical CSS/JS resources here
    ];

    criticalResources.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      if (url.endsWith('.css')) {
        link.as = 'style';
      } else if (url.endsWith('.js')) {
        link.as = 'script';
      }
      document.head.appendChild(link);
    });
  },

  // Optimize images for performance
  optimizeImages: () => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // Add loading="lazy" if not already present
      if (!img.hasAttribute('loading')) {
        img.loading = 'lazy';
      }

      // Add decoding="async" for better performance
      if (!img.hasAttribute('decoding')) {
        img.decoding = 'async';
      }
    });
  },

  // Remove unused CSS
  removeUnusedCSS: () => {
    // This would typically be handled by build tools
    // but can be used for runtime optimization
    console.log('CSS optimization should be handled by build process');
  },

  // Optimize font loading
  optimizeFonts: () => {
    const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    fontLinks.forEach(link => {
      link.setAttribute('rel', 'preconnect');
      if (!link.hasAttribute('crossorigin')) {
        link.setAttribute('crossorigin', '');
      }
    });
  },

  // Set up proper caching headers
  setupCaching: () => {
    // This should be handled server-side, but can provide client hints
    if ('serviceWorker' in navigator) {
      // Service worker handles caching
      return true;
    }
    return false;
  },

  // Minimize main thread work
  optimizeMainThread: () => {
    // Use requestIdleCallback for non-critical tasks
    if ('requestIdleCallback' in window) {
      const runWhenIdle = (task: () => void) => {
        window.requestIdleCallback(task, { timeout: 5000 });
      };

      return runWhenIdle;
    }

    // Fallback to setTimeout
    return (task: () => void) => {
      setTimeout(task, 0);
    };
  },

  // Reduce cumulative layout shift
  stabilizeLayout: () => {
    // Add dimensions to images and video elements
    const media = document.querySelectorAll('img, video');
    media.forEach(element => {
      if (!element.hasAttribute('width') && !element.hasAttribute('height')) {
        // Set default aspect ratio to prevent layout shift
        element.style.aspectRatio = '16/9';
      }
    });
  },

  // Optimize for mobile
  optimizeForMobile: () => {
    // Ensure proper viewport meta tag
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0';
      document.head.appendChild(meta);
    }

    // Add touch-friendly button styles
    const buttons = document.querySelectorAll('button, a[role="button"]');
    buttons.forEach(button => {
      const element = button as HTMLElement;
      if (!element.style.minHeight) {
        element.style.minHeight = '44px';
      }
      if (!element.style.minWidth) {
        element.style.minWidth = '44px';
      }
    });
  }
};

// Auto-run optimizations on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    lighthouseOptimizations.preloadCriticalResources();
    lighthouseOptimizations.optimizeImages();
    lighthouseOptimizations.optimizeFonts();
    lighthouseOptimizations.stabilizeLayout();
    lighthouseOptimizations.optimizeForMobile();
  });
}