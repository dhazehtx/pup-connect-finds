
import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  connectionType?: string;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0
  });

  useEffect(() => {
    // Measure page load performance
    const measureLoadTime = () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      setMetrics(prev => ({ ...prev, loadTime }));
    };

    // Measure render performance
    const measureRenderTime = () => {
      const renderTime = performance.now();
      setMetrics(prev => ({ ...prev, renderTime }));
    };

    // Get memory usage if available
    const getMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        return memory.usedJSHeapSize;
      }
      return undefined;
    };

    // Get connection type if available
    const getConnectionType = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        return connection.effectiveType;
      }
      return undefined;
    };

    // Initial measurements
    measureLoadTime();
    measureRenderTime();

    setMetrics(prev => ({
      ...prev,
      memoryUsage: getMemoryUsage(),
      connectionType: getConnectionType()
    }));

    // Performance observer for long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn('Long task detected:', entry.duration, 'ms');
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // PerformanceObserver might not support longtask
        console.log('Long task monitoring not supported');
      }

      return () => observer.disconnect();
    }
  }, []);

  const reportVitals = (metric: string, value: number) => {
    // Report to analytics service
    console.log(`Performance metric - ${metric}:`, value);
  };

  return {
    metrics,
    reportVitals
  };
};
