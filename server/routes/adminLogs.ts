import { Router, Request, Response } from 'express';
import { loggingService, type LogFilters } from '../services/loggingService';
import { asyncHandler } from '../middleware/errorHandler';
import { z } from 'zod';

const router = Router();

// Validation schemas
const logFiltersSchema = z.object({
  level: z.array(z.enum(['debug', 'info', 'warn', 'error', 'critical'])).optional(),
  category: z.array(z.enum(['api', 'frontend', 'auth', 'payment', 'database', 'security', 'performance', 'user-action'])).optional(),
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  resolved: z.boolean().optional(),
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional()
});

const resolveErrorSchema = z.object({
  logId: z.string(),
  resolvedBy: z.string().optional()
});

// Get system logs with filtering
router.get('/logs', asyncHandler(async (req: Request, res: Response) => {
  // TODO: Add admin authentication check
  // if (!req.user?.isAdmin) {
  //   return res.status(403).json({ error: 'Access denied. Admin role required.' });
  // }

  try {
    const query = req.query;
    
    // Parse and validate filters
    const filters: LogFilters = {
      level: query.level ? (Array.isArray(query.level) ? query.level : [query.level]) as any : undefined,
      category: query.category ? (Array.isArray(query.category) ? query.category : [query.category]) as any : undefined,
      userId: query.userId as string,
      startDate: query.startDate ? new Date(query.startDate as string) : undefined,
      endDate: query.endDate ? new Date(query.endDate as string) : undefined,
      resolved: query.resolved === 'true' ? true : query.resolved === 'false' ? false : undefined,
      limit: query.limit ? parseInt(query.limit as string) : 50,
      offset: query.offset ? parseInt(query.offset as string) : 0
    };

    const logs = await loggingService.getLogs(filters);
    
    res.json({
      success: true,
      logs,
      filters: filters,
      count: logs.length
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
}));

// Get logging statistics
router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  // TODO: Add admin authentication check
  // if (!req.user?.isAdmin) {
  //   return res.status(403).json({ error: 'Access denied. Admin role required.' });
  // }

  try {
    const stats = await loggingService.getStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching log stats:', error);
    res.status(500).json({ error: 'Failed to fetch log statistics' });
  }
}));

// Resolve an error log
router.patch('/resolve', asyncHandler(async (req: Request, res: Response) => {
  // TODO: Add admin authentication check
  // if (!req.user?.isAdmin) {
  //   return res.status(403).json({ error: 'Access denied. Admin role required.' });
  // }

  try {
    const { logId, resolvedBy } = resolveErrorSchema.parse(req.body);
    
    const success = await loggingService.resolveError(logId, resolvedBy);
    
    if (!success) {
      return res.status(404).json({ error: 'Log entry not found' });
    }
    
    res.json({
      success: true,
      message: 'Error marked as resolved'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    console.error('Error resolving log:', error);
    res.status(500).json({ error: 'Failed to resolve error' });
  }
}));

// Clean up old logs
router.delete('/cleanup/:days', asyncHandler(async (req: Request, res: Response) => {
  // TODO: Add admin authentication check
  // if (!req.user?.isAdmin) {
  //   return res.status(403).json({ error: 'Access denied. Admin role required.' });
  // }

  try {
    const days = parseInt(req.params.days);
    if (isNaN(days) || days < 1) {
      return res.status(400).json({ error: 'Invalid number of days' });
    }

    const deletedCount = await loggingService.cleanupOldLogs(days);
    
    res.json({
      success: true,
      message: `Cleaned up ${deletedCount} old log entries`,
      deletedCount
    });
  } catch (error) {
    console.error('Error cleaning up logs:', error);
    res.status(500).json({ error: 'Failed to clean up logs' });
  }
}));

// Log a frontend error
router.post('/frontend-error', asyncHandler(async (req: Request, res: Response) => {
  try {
    const {
      message,
      stack,
      componentStack,
      errorBoundary,
      url,
      userAgent,
      userId,
      sessionId,
      level = 'error'
    } = req.body;

    await loggingService.log({
      level: level as any,
      category: 'frontend',
      message: message || 'Frontend error occurred',
      details: {
        stack,
        componentStack,
        errorBoundary,
        url,
        browser: userAgent
      },
      userId,
      sessionId,
      ipAddress: req.ip,
      userAgent,
      endpoint: url,
      errorStack: stack
    });

    res.json({ 
      success: true, 
      message: 'Frontend error logged successfully' 
    });
  } catch (error) {
    console.error('Failed to log frontend error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to log frontend error' 
    });
  }
}));

// Export available log levels and categories for frontend
router.get('/config', (req: Request, res: Response) => {
  res.json({
    success: true,
    config: {
      levels: ['debug', 'info', 'warn', 'error', 'critical'],
      categories: ['api', 'frontend', 'auth', 'payment', 'database', 'security', 'performance', 'user-action']
    }
  });
});

export default router;