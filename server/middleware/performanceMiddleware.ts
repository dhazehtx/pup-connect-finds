import { Request, Response, NextFunction } from 'express';
import { queryOptimizations } from '../utils/queryOptimization';

interface PerformanceMetrics {
  requestStart: number;
  queryCount: number;
  totalQueryTime: number;
  cacheHits: number;
  cacheMisses: number;
}

// Middleware to track performance metrics
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const metrics: PerformanceMetrics = {
    requestStart: Date.now(),
    queryCount: 0,
    totalQueryTime: 0,
    cacheHits: 0,
    cacheMisses: 0
  };

  // Attach metrics to request for tracking
  (req as any).metrics = metrics;

  // Override res.json to log performance data
  const originalJson = res.json;
  res.json = function(data: any) {
    const totalTime = Date.now() - metrics.requestStart;
    
    // Log slow requests
    if (totalTime > 1000) {
      console.warn(`Slow request detected: ${req.method} ${req.path} - ${totalTime}ms`, {
        queryCount: metrics.queryCount,
        totalQueryTime: metrics.totalQueryTime,
        cacheHits: metrics.cacheHits,
        cacheMisses: metrics.cacheMisses
      });
    }

    // Add performance headers in development
    if (process.env.NODE_ENV === 'development') {
      this.set('X-Response-Time', `${totalTime}ms`);
      this.set('X-Query-Count', metrics.queryCount.toString());
      this.set('X-Cache-Hits', metrics.cacheHits.toString());
    }

    return originalJson.call(this, data);
  };

  next();
};

// Query timing wrapper
export const timeQuery = async <T>(
  queryName: string,
  queryFn: () => Promise<T>,
  req: Request
): Promise<T> => {
  const start = Date.now();
  const metrics = (req as any).metrics as PerformanceMetrics;
  
  try {
    const result = await queryFn();
    const duration = Date.now() - start;
    
    metrics.queryCount++;
    metrics.totalQueryTime += duration;
    
    // Log slow queries
    queryOptimizations.logSlowQueries(queryName, duration);
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`Query failed: ${queryName} - ${duration}ms`, error);
    throw error;
  }
};

// Cache tracking wrapper
export const trackCache = (hit: boolean, req: Request) => {
  const metrics = (req as any).metrics as PerformanceMetrics;
  if (hit) {
    metrics.cacheHits++;
  } else {
    metrics.cacheMisses++;
  }
};