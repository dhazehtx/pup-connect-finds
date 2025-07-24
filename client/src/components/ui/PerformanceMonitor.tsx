import React, { useEffect, useState } from 'react';
import { performanceUtils } from '@/utils/performanceOptimizations';

interface PerformanceStats {
  memory?: {
    used: number;
    total: number;
    limit: number;
  };
  bundleSize?: number;
  loadTime?: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [stats, setStats] = useState<PerformanceStats>({});

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Monitor memory usage
      const memoryStats = performanceUtils.monitorMemory();
      if (memoryStats) {
        setStats(prev => ({ ...prev, memory: memoryStats }));
      }

      // Analyze bundle performance
      performanceUtils.analyzeBundle();

      // Set up periodic monitoring
      const interval = setInterval(() => {
        const newMemoryStats = performanceUtils.monitorMemory();
        if (newMemoryStats) {
          setStats(prev => ({ ...prev, memory: newMemoryStats }));
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, []);

  if (process.env.NODE_ENV !== 'development' || !stats.memory) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-2 rounded text-xs z-50">
      <div>Memory: {stats.memory.used}MB / {stats.memory.total}MB</div>
      <div>Limit: {stats.memory.limit}MB</div>
    </div>
  );
};