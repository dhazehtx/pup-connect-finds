import { Router, Request, Response } from 'express';
import { loggingService, type LogCategory, type LogLevel } from '../services/loggingService';
import { asyncHandler } from '../middleware/errorHandler';
import { z } from 'zod';

const router = Router();

// Frontend log schema
const frontendLogSchema = z.object({
  action: z.string().min(1, 'Action is required'),
  timestamp: z.string(),
  userId: z.string().optional(),
  metadata: z.any().optional(),
  level: z.enum(['info', 'warn', 'error', 'debug']),
  category: z.enum(['admin', 'api', 'ui', 'auth', 'error']),
});

function mapFrontendCategoryToLogCategory(
  c: z.infer<typeof frontendLogSchema>['category'],
): LogCategory {
  switch (c) {
    case 'admin':
      return 'user-action';
    case 'api':
      return 'api';
    case 'ui':
      return 'frontend';
    case 'auth':
      return 'auth';
    case 'error':
      return 'security';
    default:
      return 'frontend';
  }
}

/**
 * Accept logs from frontend for persistent storage
 */
router.post('/frontend', asyncHandler(async (req: Request, res: Response) => {
  try {
    const logData = frontendLogSchema.parse(req.body);
    
    // Get user info from session if available
    const userId = (req as any).user?.id || logData.userId || 'anonymous';
    const userAgent = req.get('User-Agent') || 'unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

    await loggingService.log({
      level: logData.level as LogLevel,
      category: mapFrontendCategoryToLogCategory(logData.category),
      message: logData.action,
      details: {
        frontend: true,
        timestamp: logData.timestamp,
        ...logData.metadata,
      },
      userId: userId !== 'anonymous' ? userId : undefined,
      userAgent,
      ipAddress,
    });

    res.json({ success: true, message: 'Log recorded successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid log data', 
        details: error.errors 
      });
    }
    throw error;
  }
}));

/**
 * Get logs for debugging (admin only)
 */
router.get('/recent', asyncHandler(async (req: Request, res: Response) => {
  // Admin status comes only from trusted server/DB state — no hardcoded
  // username/email allowlists (those bypass real access control).
  const user = (req as any).user;
  const isAdmin = user?.is_admin === true;

  if (!(req as any).isAuthenticated?.() || !isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const category = req.query.category as string;
    const level = req.query.level as string;

    const logs = await loggingService.getLogs({
      limit,
      category: category as any,
      level: level as any
    });

    res.json({ success: true, logs });
  } catch (error) {
    throw error;
  }
}));

export default router;