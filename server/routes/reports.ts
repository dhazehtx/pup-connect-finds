import { Router, Request, Response } from 'express';
import { reportingService } from '../services/reportingService';
import { asyncHandler } from '../middleware/errorHandler';
import { userActionLogger } from '../middleware/loggingMiddleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const reportUserSchema = z.object({
  reportedUserId: z.string().min(1, 'Reported user ID is required'),
  reason: z.enum(['inappropriate_content', 'harassment', 'spam', 'fraud', 'fake_profile', 'other']),
  message: z.string().min(10, 'Please provide more details (minimum 10 characters)'),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional()
});

const reportListingSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  listingOwnerId: z.string().min(1, 'Listing owner ID is required'),
  reason: z.enum(['misleading_info', 'overpriced', 'sick_animal', 'puppy_mill', 'scam', 'inappropriate_content', 'other']),
  message: z.string().min(10, 'Please provide more details (minimum 10 characters)'),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional()
});

const resolveReportSchema = z.object({
  reportId: z.string().min(1, 'Report ID is required'),
  status: z.enum(['resolved', 'dismissed']),
  actionTaken: z.string().min(1, 'Action taken is required'),
  adminNotes: z.string().optional()
});

const reportFiltersSchema = z.object({
  type: z.enum(['user', 'listing']).optional(),
  status: z.enum(['pending', 'investigating', 'resolved', 'dismissed']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional()
});

/**
 * Check rate limit for reporting
 */
router.get('/rate-limit', asyncHandler(async (req: Request, res: Response) => {
  if (!(req as any).isAuthenticated?.()) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const userId = ((req as any).user as any).id;
  const rateLimitInfo = await reportingService.canUserReport(userId);

  res.json({
    success: true,
    canReport: rateLimitInfo.canReport,
    remainingReports: rateLimitInfo.remainingReports,
    resetTime: rateLimitInfo.resetTime
  });
}));

/**
 * Report a user
 */
router.post('/user', 
  userActionLogger('report_user_submitted'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!(req as any).isAuthenticated?.()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const data = reportUserSchema.parse(req.body);
      const reporterId = ((req as any).user as any).id;

      const result = await reportingService.reportUser({
        reporterId,
        reportedUserId: data.reportedUserId,
        reason: data.reason,
        message: data.message,
        severity: data.severity
      });

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({
        success: true,
        message: 'Report submitted successfully',
        reportId: result.reportId
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid request data', 
          details: error.errors 
        });
      }
      throw error;
    }
  })
);

/**
 * Report a listing
 */
router.post('/listing',
  userActionLogger('report_listing_submitted'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!(req as any).isAuthenticated?.()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const data = reportListingSchema.parse(req.body);
      const reporterId = ((req as any).user as any).id;

      const result = await reportingService.reportListing({
        reporterId,
        listingId: data.listingId,
        listingOwnerId: data.listingOwnerId,
        reason: data.reason,
        message: data.message,
        severity: data.severity
      });

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({
        success: true,
        message: 'Report submitted successfully',
        reportId: result.reportId
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid request data', 
          details: error.errors 
        });
      }
      throw error;
    }
  })
);

/**
 * Get reports for admin dashboard (admin only)
 */
router.get('/admin/reports', asyncHandler(async (req: Request, res: Response) => {
  // Check admin authorization - temporarily allow danieluke97/Royalbabybullz
  const user = (req as any).user;
  const isAdmin = user && (
    user.is_admin === true || 
    user.username === 'danieluke97' || 
    user.email === 'danieluke97@yahoo.com' ||
    user.username === 'Royalbabybullz'
  );
  
  if (!(req as any).isAuthenticated?.() || !user || !isAdmin) {
    return res.status(403).json({ 
      error: 'Forbidden', 
      message: 'Administrator privileges required' 
    });
  }
  // TODO: Add admin authentication check
  // if (!(req as any).user?.isAdmin) {
  //   return res.status(403).json({ error: 'Admin access required' });
  // }

  try {
    const filters = reportFiltersSchema.parse({
      type: req.query.type as string,
      status: req.query.status as string,
      severity: req.query.severity as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
    });

    // Convert date strings to Date objects
    if (filters.startDate) {
      filters.startDate = new Date(filters.startDate) as any;
    }
    if (filters.endDate) {
      filters.endDate = new Date(filters.endDate) as any;
    }

    const result = await reportingService.getReports(filters as any);

    res.json({
      success: true,
      reports: result.reports,
      totalCount: result.totalCount,
      filters
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid filter parameters', 
        details: error.errors 
      });
    }
    throw error;
  }
}));

/**
 * Resolve a report (admin only)
 */
router.patch('/admin/resolve',
  // Check admin authorization  
  asyncHandler(async (req: Request, res: Response, next) => {
    // Check admin authorization - temporarily allow danieluke97/Royalbabybullz
    const user = (req as any).user;
    const isAdmin = user && (
      user.is_admin === true || 
      user.username === 'danieluke97' || 
      user.email === 'danieluke97@yahoo.com' ||
      user.username === 'Royalbabybullz'
    );
    
    if (!(req as any).isAuthenticated?.() || !user || !isAdmin) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Administrator privileges required' 
      });
    }
    next();
  }),
  userActionLogger('report_resolved_by_admin'),
  asyncHandler(async (req: Request, res: Response) => {
    // TODO: Add admin authentication check
    // if (!(req as any).user?.isAdmin) {
    //   return res.status(403).json({ error: 'Admin access required' });
    // }

    try {
      const data = resolveReportSchema.parse(req.body);
      const adminId = ((req as any).user as any)?.id || 'admin'; // Fallback for now

      const result = await reportingService.resolveReport({
        reportId: data.reportId,
        adminId,
        status: data.status,
        actionTaken: data.actionTaken,
        adminNotes: data.adminNotes
      });

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({
        success: true,
        message: 'Report resolved successfully'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid request data', 
          details: error.errors 
        });
      }
      throw error;
    }
  })
);

/**
 * Get reporting statistics (admin only)
 */
router.get('/admin/stats', asyncHandler(async (req: Request, res: Response) => {
  // Check admin authorization - temporarily allow danieluke97/Royalbabybullz
  const user = (req as any).user;
  const isAdmin = user && (
    user.is_admin === true || 
    user.username === 'danieluke97' || 
    user.email === 'danieluke97@yahoo.com' ||
    user.username === 'Royalbabybullz'
  );
  
  if (!(req as any).isAuthenticated?.() || !user || !isAdmin) {
    return res.status(403).json({ 
      error: 'Forbidden', 
      message: 'Administrator privileges required' 
    });
  }
  // TODO: Add admin authentication check
  // if (!(req as any).user?.isAdmin) {
  //   return res.status(403).json({ error: 'Admin access required' });
  // }

  try {
    const stats = await reportingService.getReportingStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    throw error;
  }
}));

/**
 * Get available report reasons and severities
 */
router.get('/config', (req: Request, res: Response) => {
  res.json({
    success: true,
    config: {
      userReportReasons: [
        { value: 'inappropriate_content', label: 'Inappropriate Content' },
        { value: 'harassment', label: 'Harassment or Bullying' },
        { value: 'spam', label: 'Spam or Unwanted Messages' },
        { value: 'fraud', label: 'Fraudulent Activity' },
        { value: 'fake_profile', label: 'Fake Profile' },
        { value: 'other', label: 'Other' }
      ],
      listingReportReasons: [
        { value: 'misleading_info', label: 'Misleading Information' },
        { value: 'overpriced', label: 'Overpriced' },
        { value: 'sick_animal', label: 'Sick or Unhealthy Animal' },
        { value: 'puppy_mill', label: 'Suspected Puppy Mill' },
        { value: 'scam', label: 'Scam or Fraudulent Listing' },
        { value: 'inappropriate_content', label: 'Inappropriate Content' },
        { value: 'other', label: 'Other' }
      ],
      severityLevels: [
        { value: 'low', label: 'Low Priority' },
        { value: 'medium', label: 'Medium Priority' },
        { value: 'high', label: 'High Priority' },
        { value: 'critical', label: 'Critical' }
      ],
      actionTypes: [
        { value: 'none', label: 'No Action Taken' },
        { value: 'warning_issued', label: 'Warning Issued' },
        { value: 'temporary_ban', label: 'Temporary Ban' },
        { value: 'permanent_ban', label: 'Permanent Ban' },
        { value: 'profile_restricted', label: 'Profile Restricted' },
        { value: 'listing_removed', label: 'Listing Removed' },
        { value: 'listing_flagged', label: 'Listing Flagged' },
        { value: 'user_banned', label: 'User Banned' }
      ]
    }
  });
});

export default router;