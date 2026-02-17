import { Router, Request, Response } from 'express';
import { z } from 'zod';
import RefundService from '../services/refundService';
import { refundRequests } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Request refund schema validation
const refundRequestSchema = z.object({
  transaction_id: z.string().min(1, 'Transaction ID is required'),
  reason: z.enum([
    'canceled_order',
    'scam_listing', 
    'dispute_resolved',
    'service_not_delivered',
    'item_not_as_described',
    'duplicate_payment',
    'other'
  ]),
  detailed_reason: z.string().min(10, 'Please provide a detailed explanation (minimum 10 characters)'),
  refund_amount: z.number().min(0, 'Refund amount must be 0 or greater (0 = auto-compute from transaction)')
});

// Admin action schema
const adminActionSchema = z.object({
  action: z.enum(['approve', 'decline']),
  admin_notes: z.string().optional()
});

// POST /api/refunds/request - Create a refund request
router.post('/request', async (req: Request, res: Response) => {
  try {
    // Check authentication
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Validate request body
    const validatedData = refundRequestSchema.parse(req.body);
    const userId = req.user.id;

    // Check refund eligibility
    const eligibilityCheck = await RefundService.checkRefundEligibility(
      validatedData.transaction_id,
      userId,
      validatedData.reason
    );

    if (!eligibilityCheck.eligible) {
      return res.status(400).json({
        error: 'Refund not eligible',
        reason: eligibilityCheck.reason
      });
    }

    // Validate refund amount doesn't exceed transaction amount
    if (eligibilityCheck.maxRefundAmount && validatedData.refund_amount > eligibilityCheck.maxRefundAmount) {
      return res.status(400).json({
        error: 'Refund amount exceeds transaction amount',
        max_refund_amount: eligibilityCheck.maxRefundAmount
      });
    }

    // Get charge ID from transaction (for Stripe refund)
    // This would typically come from your transactions table
    const chargeId = `pi_${validatedData.transaction_id}_mock`; // Mock for now

    // Create refund request
    const refundRequestId = await RefundService.createRefundRequest({
      user_id: userId,
      transaction_id: validatedData.transaction_id,
      charge_id: chargeId,
      reason: validatedData.reason,
      detailed_reason: validatedData.detailed_reason,
      refund_amount: validatedData.refund_amount.toString(),
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      refund_request_id: refundRequestId,
      message: 'Refund request submitted successfully',
      status: 'pending'
    });

  } catch (error: any) {
    console.error('Error creating refund request:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    res.status(500).json({
      error: 'Failed to create refund request',
      message: error.message
    });
  }
});

// GET /api/refunds/status/:refundId - Get refund status
router.get('/status/:refundId', async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { refundId } = req.params;
    const userRefunds = await RefundService.getUserRefundRequests(req.user.id);
    
    const refund = userRefunds.find(r => r.id === refundId);
    
    if (!refund) {
      return res.status(404).json({ error: 'Refund request not found' });
    }

    res.json({
      id: refund.id,
      transaction_id: refund.transaction_id,
      status: refund.status,
      reason: refund.reason,
      refund_amount: refund.refund_amount,
      currency: refund.currency,
      stripe_refund_id: refund.stripe_refund_id,
      processed_at: refund.processed_at,
      created_at: refund.created_at,
      updated_at: refund.updated_at,
      admin_notes: refund.status === 'declined' ? refund.admin_notes : undefined
    });

  } catch (error) {
    console.error('Error getting refund status:', error);
    res.status(500).json({ error: 'Failed to get refund status' });
  }
});

// GET /api/refunds/user - Get all refund requests for current user
router.get('/user', async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRefunds = await RefundService.getUserRefundRequests(req.user.id);
    
    res.json({
      refunds: userRefunds.map(refund => ({
        id: refund.id,
        transaction_id: refund.transaction_id,
        status: refund.status,
        reason: refund.reason,
        detailed_reason: refund.detailed_reason,
        refund_amount: refund.refund_amount,
        currency: refund.currency,
        stripe_refund_id: refund.stripe_refund_id,
        processed_at: refund.processed_at,
        created_at: refund.created_at,
        updated_at: refund.updated_at,
        transaction_amount: refund.transaction_amount,
        product_type: refund.product_type,
        admin_notes: refund.status === 'declined' ? refund.admin_notes : undefined
      }))
    });

  } catch (error) {
    console.error('Error getting user refunds:', error);
    res.status(500).json({ error: 'Failed to get refund requests' });
  }
});

// Admin routes (require admin privileges)
// GET /api/refunds/admin/all - Get all refund requests (admin only)
router.get('/admin/all', async (req: Request, res: Response) => {
  try {
    // TODO: Add admin permission check
    // if (!req.user?.isAdmin) {
    //   return res.status(403).json({ error: 'Admin access required' });
    // }

    const { status } = req.query;
    const allRefunds = await RefundService.getAllRefundRequests(status as string);
    
    res.json({
      refunds: allRefunds,
      total_count: allRefunds.length
    });

  } catch (error) {
    console.error('Error getting all refunds:', error);
    res.status(500).json({ error: 'Failed to get refund requests' });
  }
});

// POST /api/refunds/admin/:refundId/action - Approve or decline refund (admin only)
router.post('/admin/:refundId/action', async (req: Request, res: Response) => {
  try {
    // TODO: Add admin permission check
    // if (!req.user?.isAdmin) {
    //   return res.status(403).json({ error: 'Admin access required' });
    // }

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { refundId } = req.params;
    const validatedData = adminActionSchema.parse(req.body);
    
    if (validatedData.action === 'approve') {
      const result = await RefundService.approveRefund(
        refundId,
        req.user.id,
        validatedData.admin_notes
      );
      
      if (!result.success) {
        return res.status(400).json({
          error: 'Failed to approve refund',
          message: result.error
        });
      }
      
      res.json({
        success: true,
        message: 'Refund approved and processed successfully',
        stripe_refund_id: result.refundId,
        refunded_amount: result.amount
      });
      
    } else if (validatedData.action === 'decline') {
      if (!validatedData.admin_notes) {
        return res.status(400).json({
          error: 'Admin notes required when declining refund'
        });
      }
      
      const success = await RefundService.declineRefund(
        refundId,
        req.user.id,
        validatedData.admin_notes
      );
      
      if (!success) {
        return res.status(400).json({
          error: 'Failed to decline refund'
        });
      }
      
      res.json({
        success: true,
        message: 'Refund declined successfully'
      });
    }

  } catch (error: any) {
    console.error('Error processing admin action:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    res.status(500).json({
      error: 'Failed to process admin action',
      message: error.message
    });
  }
});

// GET /api/refunds/admin/stats - Get refund statistics (admin only)
router.get('/admin/stats', async (req: Request, res: Response) => {
  try {
    // TODO: Add admin permission check
    
    const allRefunds = await RefundService.getAllRefundRequests();
    
    const stats = {
      total_requests: allRefunds.length,
      pending: allRefunds.filter(r => r.status === 'pending').length,
      approved: allRefunds.filter(r => r.status === 'approved').length,
      declined: allRefunds.filter(r => r.status === 'declined').length,
      refunded: allRefunds.filter(r => r.status === 'refunded').length,
      failed: allRefunds.filter(r => r.status === 'failed').length,
      total_refunded_amount: allRefunds
        .filter(r => r.status === 'refunded')
        .reduce((sum, r) => sum + parseFloat(r.refund_amount?.toString() || '0'), 0),
      avg_processing_time: 0, // TODO: Calculate average processing time
      common_reasons: getCommonReasons(allRefunds)
    };
    
    res.json(stats);

  } catch (error) {
    console.error('Error getting refund stats:', error);
    res.status(500).json({ error: 'Failed to get refund statistics' });
  }
});

// Helper function to get common refund reasons
function getCommonReasons(refunds: any[]): Record<string, number> {
  const reasonCounts: Record<string, number> = {};
  
  refunds.forEach(refund => {
    const reason = refund.reason || 'unknown';
    reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
  });
  
  return reasonCounts;
}

export default router;