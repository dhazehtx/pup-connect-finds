// Performance optimization utilities
export const performanceUtils = {
  // Debounce function for search inputs
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  // Throttle function for scroll events
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void => {
    let lastExecution = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastExecution >= delay) {
        func(...args);
        lastExecution = now;
      }
    };
  },

  // Lazy load images with intersection observer
  createImageObserver: (callback: (entry: IntersectionObserverEntry) => void) => {
    return new IntersectionObserver(
      (entries) => {
        entries.forEach(callback);
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );
  },

  // Preload critical images
  preloadImages: (urls: string[]): Promise<void[]> => {
    return Promise.all(
      urls.map(url => new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      }))
    );
  },

  // Bundle size analyzer
  analyzeBundle: () => {
    if (process.env.NODE_ENV === 'development') {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const entry = navigationEntries[0];
      
      console.log('Performance Metrics:', {
        domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
        loadComplete: entry.loadEventEnd - entry.loadEventStart,
        totalTime: entry.loadEventEnd
      });
    }
  },

  // Memory usage monitoring
  monitorMemory: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
      };
    }
    return null;
  }
};