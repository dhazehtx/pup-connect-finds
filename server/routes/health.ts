import type { Express } from "express";
import { db } from "../db";

export function registerHealthRoutes(app: Express) {
  // Basic health check
  app.get("/api/health", async (req, res) => {
    try {
      // Check database connection
      await db.execute('SELECT 1');
      
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        services: {
          database: 'healthy',
          memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
          }
        }
      });
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
        services: {
          database: 'unhealthy'
        }
      });
    }
  });

  // Detailed health check for monitoring systems
  app.get("/api/health/detailed", async (req, res) => {
    try {
      const startTime = Date.now();
      
      // Test database query
      await db.execute('SELECT COUNT(*) FROM profiles');
      const dbResponseTime = Date.now() - startTime;

      // Check environment variables
      const requiredEnvVars = [
        'DATABASE_URL',
        'STRIPE_SECRET_KEY'
      ];
      
      const envStatus = requiredEnvVars.reduce((acc, envVar) => {
        acc[envVar] = !!process.env[envVar];
        return acc;
      }, {} as Record<string, boolean>);

      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        services: {
          database: {
            status: 'healthy',
            responseTime: `${dbResponseTime}ms`
          },
          memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
            percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100) + '%'
          },
          environment: envStatus
        },
        performance: {
          databaseResponseTime: `${dbResponseTime}ms`,
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch
        }
      });
    } catch (error) {
      console.error('Detailed health check failed:', error);
      res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        services: {
          database: 'unhealthy'
        }
      });
    }
  });
}