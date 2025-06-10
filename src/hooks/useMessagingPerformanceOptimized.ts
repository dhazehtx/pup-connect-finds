
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface PerformanceMetrics {
  messageLoadTime: number;
  conversationLoadTime: number;
  searchTime: number;
  memoryUsage: number;
  activeConnections: number;
  renderTime: number;
  cacheHitRate: number;
}

interface OptimizationSuggestion {
  type: 'performance' | 'memory' | 'network' | 'ui';
  severity: 'low' | 'medium' | 'high';
  message: string;
  action?: string;
}

export const useMessagingPerformanceOptimized = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    messageLoadTime: 0,
    conversationLoadTime: 0,
    searchTime: 0,
    memoryUsage: 0,
    activeConnections: 0,
    renderTime: 0,
    cacheHitRate: 0,
  });

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [performanceCache, setPerformanceCache] = useState(new Map());

  // Enhanced performance measurement
  const measurePerformance = useCallback((operation: string, fn: () => Promise<any>) => {
    return async (...args: any[]) => {
      const startTime = performance.now();
      const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      try {
        const result = await fn.apply(null, args);
        const endTime = performance.now();
        const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
        const duration = endTime - startTime;
        const memoryDelta = endMemory - startMemory;
        
        setMetrics(prev => ({
          ...prev,
          [`${operation}Time`]: duration,
          memoryUsage: endMemory / 1024 / 1024, // MB
        }));
        
        // Log performance data
        console.log(`${operation} Performance:`, {
          duration: `${duration.toFixed(2)}ms`,
          memoryDelta: `${(memoryDelta / 1024).toFixed(2)}KB`,
          timestamp: new Date().toISOString()
        });
        
        return result;
      } catch (error) {
        console.error(`Performance measurement failed for ${operation}:`, error);
        throw error;
      }
    };
  }, []);

  // Cache management
  const getCachedData = useCallback((key: string) => {
    const cached = performanceCache.get(key);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
      setMetrics(prev => ({ ...prev, cacheHitRate: prev.cacheHitRate + 1 }));
      return cached.data;
    }
    return null;
  }, [performanceCache]);

  const setCachedData = useCallback((key: string, data: any) => {
    setPerformanceCache(prev => new Map(prev.set(key, {
      data,
      timestamp: Date.now()
    })));
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

  // Performance suggestions
  const getOptimizationSuggestions = useMemo((): OptimizationSuggestion[] => {
    const suggestions: OptimizationSuggestion[] = [];
    
    if (metrics.messageLoadTime > 1000) {
      suggestions.push({
        type: 'performance',
        severity: 'high',
        message: 'Message loading is slow. Consider implementing pagination or virtualization.',
        action: 'Enable message virtualization'
      });
    }
    
    if (metrics.memoryUsage > 100) {
      suggestions.push({
        type: 'memory',
        severity: 'medium',
        message: 'High memory usage detected. Consider clearing old messages.',
        action: 'Clear message cache'
      });
    }
    
    if (metrics.activeConnections > 10) {
      suggestions.push({
        type: 'network',
        severity: 'medium',
        message: 'Too many active connections. Consider connection pooling.',
        action: 'Optimize connections'
      });
    }
    
    if (metrics.cacheHitRate < 0.3) {
      suggestions.push({
        type: 'performance',
        severity: 'low',
        message: 'Low cache hit rate. Consider adjusting cache strategy.',
        action: 'Optimize caching'
      });
    }
    
    return suggestions;
  }, [metrics]);

  // Auto-optimization
  const optimizePerformance = useCallback(async () => {
    setIsOptimizing(true);
    
    try {
      // Clear old cached data
      if (metrics.memoryUsage > 100) {
        const now = Date.now();
        const newCache = new Map();
        performanceCache.forEach((value, key) => {
          if (now - value.timestamp < 60000) { // Keep recent cache
            newCache.set(key, value);
          }
        });
        setPerformanceCache(newCache);
        console.log('Cleared old cache entries');
      }
      
      // Optimize connections
      if (metrics.activeConnections > 10) {
        console.log('Optimizing connection pool');
        // Implementation would optimize connection management
      }
      
      // Force garbage collection if available
      if ('gc' in window) {
        (window as any).gc();
      }
      
      console.log('Performance optimization completed');
    } catch (error) {
      console.error('Performance optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  }, [metrics, performanceCache]);

  // Monitor memory usage periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        const memoryUsage = memInfo.usedJSHeapSize / 1024 / 1024; // MB
        
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(memoryUsage * 100) / 100
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Performance warning alerts
  useEffect(() => {
    if (metrics.memoryUsage > 150) {
      console.warn('High memory usage detected:', metrics.memoryUsage, 'MB');
    }
    
    if (metrics.messageLoadTime > 2000) {
      console.warn('Slow message loading detected:', metrics.messageLoadTime, 'ms');
    }
  }, [metrics.memoryUsage, metrics.messageLoadTime]);

  return {
    metrics,
    isOptimizing,
    measurePerformance,
    trackConnection,
    optimizePerformance,
    getOptimizationSuggestions,
    getCachedData,
    setCachedData,
  };
};
