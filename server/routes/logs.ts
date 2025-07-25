import { Router, Request, Response } from 'express';
import { asyncHandler, createError, sendCriticalAlert, errorLogger } from '../middleware/errorHandler';
import { z } from 'zod';

const router = Router();

// Schema for error logging
const errorLogSchema = z.object({
  message: z.string(),
  stack: z.string().optional(),
  componentStack: z.string().optional(),
  timestamp: z.string(),
  url: z.string(),
  userAgent: z.string(),
  errorId: z.string(),
  type: z.enum(['frontend_error', 'manual_report']),
  context: z.string().optional()
});

// In-memory error storage (in production, use database)
interface StoredError {
  id: string;
  type: 'frontend' | 'backend';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack?: string;
  timestamp: string;
  userId?: string;
  context?: string;
  resolved: boolean;
  errorData: any;
}

class ErrorStorage {
  private errors: Map<string, StoredError> = new Map();

  async storeError(errorData: any): Promise<string> {
    const id = errorData.errorId || `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const storedError: StoredError = {
      id,
      type: errorData.type === 'frontend_error' ? 'frontend' : 'backend',
      severity: this.calculateSeverity(errorData),
      message: errorData.message,
      stack: errorData.stack,
      timestamp: errorData.timestamp || new Date().toISOString(),
      userId: errorData.user?.id,
      context: errorData.context,
      resolved: false,
      errorData
    };

    this.errors.set(id, storedError);

    // Send alert for critical errors
    if (storedError.severity === 'critical') {
      await sendCriticalAlert(
        { message: errorData.message, errorId: id } as any,
        errorData.context || 'Unknown context'
      );
    }

    return id;
  }

  private calculateSeverity(errorData: any): 'low' | 'medium' | 'high' | 'critical' {
    const message = errorData.message?.toLowerCase() || '';
    const context = errorData.context?.toLowerCase() || '';
    
    // Critical errors
    if (
      message.includes('payment') ||
      message.includes('database') ||
      message.includes('auth') ||
      context.includes('payment') ||
      context.includes('upload') ||
      errorData.statusCode === 500
    ) {
      return 'critical';
    }

    // High severity
    if (
      message.includes('network') ||
      message.includes('timeout') ||
      errorData.statusCode >= 400
    ) {
      return 'high';
    }

    // Medium severity
    if (
      message.includes('validation') ||
      errorData.statusCode >= 300
    ) {
      return 'medium';
    }

    return 'low';
  }

  async getErrors(filters?: {
    type?: 'frontend' | 'backend';
    severity?: string;
    resolved?: boolean;
    limit?: number;
  }): Promise<StoredError[]> {
    let errors = Array.from(this.errors.values());

    if (filters) {
      if (filters.type) {
        errors = errors.filter(e => e.type === filters.type);
      }
      if (filters.severity) {
        errors = errors.filter(e => e.severity === filters.severity);
      }
      if (filters.resolved !== undefined) {
        errors = errors.filter(e => e.resolved === filters.resolved);
      }
    }

    // Sort by timestamp (newest first)
    errors.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Limit results
    if (filters?.limit) {
      errors = errors.slice(0, filters.limit);
    }

    return errors;
  }

  async resolveError(id: string): Promise<boolean> {
    const error = this.errors.get(id);
    if (error) {
      error.resolved = true;
      return true;
    }
    return false;
  }

  async getErrorStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    resolved: number;
    unresolved: number;
  }> {
    const errors = Array.from(this.errors.values());
    
    const stats = {
      total: errors.length,
      byType: { frontend: 0, backend: 0 },
      bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      resolved: 0,
      unresolved: 0
    };

    errors.forEach(error => {
      stats.byType[error.type]++;
      stats.bySeverity[error.severity]++;
      if (error.resolved) {
        stats.resolved++;
      } else {
        stats.unresolved++;
      }
    });

    return stats;
  }
}

const errorStorage = new ErrorStorage();

// Log frontend errors
router.post('/error', asyncHandler(async (req: Request, res: Response) => {
  const validatedData = errorLogSchema.parse(req.body);
  
  // Add request context
  const errorData = {
    ...validatedData,
    ip: req.ip,
    user: req.user ? { id: req.user.id } : null
  };

  const errorId = await errorStorage.storeError(errorData);
  
  res.json({ 
    success: true, 
    errorId,
    message: 'Error logged successfully' 
  });
}));

// Get error logs (admin only)
router.get('/errors', asyncHandler(async (req: Request, res: Response) => {
  // TODO: Add admin authentication check
  // if (!req.user?.isAdmin) {
  //   throw createError('Access denied', 403);
  // }

  const filters = {
    type: req.query.type as 'frontend' | 'backend' | undefined,
    severity: req.query.severity as string | undefined,
    resolved: req.query.resolved === 'true' ? true : req.query.resolved === 'false' ? false : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 50
  };

  const errors = await errorStorage.getErrors(filters);
  
  res.json({
    success: true,
    errors,
    count: errors.length
  });
}));

// Get error statistics (admin only)
router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  // TODO: Add admin authentication check
  // if (!req.user?.isAdmin) {
  //   throw createError('Access denied', 403);
  // }

  const stats = await errorStorage.getErrorStats();
  
  res.json({
    success: true,
    stats
  });
}));

// Resolve error (admin only)
router.patch('/errors/:id/resolve', asyncHandler(async (req: Request, res: Response) => {
  // TODO: Add admin authentication check
  // if (!req.user?.isAdmin) {
  //   throw createError('Access denied', 403);
  // }

  const { id } = req.params;
  const resolved = await errorStorage.resolveError(id);
  
  if (!resolved) {
    throw createError('Error not found', 404);
  }
  
  res.json({
    success: true,
    message: 'Error marked as resolved'
  });
}));

// Test error endpoint (development only)
if (process.env.NODE_ENV === 'development') {
  router.post('/test-error', asyncHandler(async (req: Request, res: Response) => {
    const { type = 'generic' } = req.body;
    
    switch (type) {
      case 'validation':
        throw createError('Test validation error', 400);
      case 'auth':
        throw createError('Test authentication error', 401);
      case 'critical':
        throw createError('Test critical database error', 500);
      default:
        throw new Error('Test generic error');
    }
  }));
}

export { errorStorage };
export default router;