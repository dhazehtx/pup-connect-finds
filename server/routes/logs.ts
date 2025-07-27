import { Router, Request, Response } from 'express';
import { loggingService } from '../services/loggingService';
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
  category: z.enum(['admin', 'api', 'ui', 'auth', 'error'])
});

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

    await loggingService.log(
      logData.level,
      logData.category as any,
      logData.action,
      {
        frontend: true,
        userAgent,
        ipAddress,
        ...logData.metadata
      },
      userId
    );

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
  // Check if user is admin
  const user = (req as any).user;
  const isAdmin = user && (
    user.is_admin === true || 
    user.username === 'danieluke97' || 
    user.email === 'danieluke97@yahoo.com' ||
    user.username === 'Royalbabybullz'
  );

  if (!(req as any).isAuthenticated?.() || !isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const category = req.query.category as string;
    const level = req.query.level as string;

    const logs = await loggingService.getRecentLogs({
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