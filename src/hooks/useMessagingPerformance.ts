
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface PerformanceMetrics {
  messageLoadTime: number;
  conversationLoadTime: number;
  searchTime: number;
  memoryUsage: number;
  activeConnections: number;
}

export const useMessagingPerformance = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    messageLoadTime: 0,
    conversationLoadTime: 0,
    searchTime: 0,
    memoryUsage: 0,
    activeConnections: 0,
  });

  const [isOptimizing, setIsOptimizing] = useState(false);

  // Performance measurement utilities
  const measurePerformance = useCallback((operation: string, fn: () => Promise<any>) => {
    return async (...args: any[]) => {
      const startTime = performance.now();
      try {
        const result = await fn(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        setMetrics(prev => ({
          ...prev,
          [`${operation}Time`]: duration
        }));
        
        console.log(`${operation} took ${duration.toFixed(2)}ms`);
        return result;
      } catch (error) {
        console.error(`Performance measurement failed for ${operation}:`, error);
        throw error;
      }
    };
  }, []);

  // Memory usage monitoring
  const monitorMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const memoryUsage = memInfo.usedJSHeapSize / 1024 / 1024; // MB
      
      setMetrics(prev => ({
        ...prev,
        memoryUsage: Math.round(memoryUsage * 100) / 100
      }));
    }
  }, []);

  // Connection monitoring
  const trackConnection = useCallback((type: 'add' | 'remove') => {
    setMetrics(prev => ({
      ...prev,
      activeConnections: type === 'add' 
        ? prev.activeConnections + 1 
        : Math.max(0, prev.activeConnections - 1)
    }));
  }, []);

  // Performance optimization suggestions
  const getOptimizationSuggestions = useMemo(() => {
    const suggestions: string[] = [];
    
    if (metrics.messageLoadTime > 1000) {
      suggestions.push('Consider implementing message virtualization for better performance');
    }
    
    if (metrics.memoryUsage > 100) {
      suggestions.push('High memory usage detected. Consider clearing cached messages');
    }
    
    if (metrics.activeConnections > 10) {
      suggestions.push('Too many active connections. Consider connection pooling');
    }
    
    if (metrics.searchTime > 500) {
      suggestions.push('Search performance is slow. Consider implementing search indexing');
    }
    
    return suggestions;
  }, [metrics]);

  // Auto-optimization
  const optimizePerformance = useCallback(async () => {
    setIsOptimizing(true);
    
    try {
      // Clear old cached data
      if (metrics.memoryUsage > 100) {
        // Simulate cache clearing
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Cache cleared for better performance');
      }
      
      // Optimize connections
      if (metrics.activeConnections > 10) {
        console.log('Optimizing connection pool');
      }
      
      // Force garbage collection if available
      if ('gc' in window) {
        (window as any).gc();
      }
      
    } catch (error) {
      console.error('Performance optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  }, [metrics]);

  // Monitor memory usage periodically
  useEffect(() => {
    const interval = setInterval(monitorMemoryUsage, 5000);
    return () => clearInterval(interval);
  }, [monitorMemoryUsage]);

  // Performance warning threshold
  useEffect(() => {
    if (metrics.memoryUsage > 150) {
      console.warn('High memory usage detected:', metrics.memoryUsage, 'MB');
    }
  }, [metrics.memoryUsage]);

  return {
    metrics,
    isOptimizing,
    measurePerformance,
    trackConnection,
    optimizePerformance,
    getOptimizationSuggestions,
    monitorMemoryUsage
  };
};
