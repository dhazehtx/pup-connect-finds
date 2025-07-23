import { Router, Request, Response } from 'express';
import { z } from 'zod';
import CommissionService from '../services/commissionService';


const router = Router();

// Schema for updating commission settings
const commissionSettingsSchema = z.object({
  commission_percent: z.number().min(0).max(100),
  flat_fee: z.number().min(0).optional(),
  min_fee: z.number().min(0).optional(),
  max_fee: z.number().min(0).optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional()
});

// Schema for commission calculation
const calculateCommissionSchema = z.object({
  amount: z.number().min(0.01),
  listing_type: z.enum(['puppy', 'service', 'rehoming', 'premium', 'subscription'])
});

// GET /api/commissions/settings - Get all commission settings
router.get('/settings', async (req: Request, res: Response) => {
  try {
    const settings = await CommissionService.getAllCommissionSettings();
    res.json({ settings });
  } catch (error) {
    console.error('Error getting commission settings:', error);
    res.status(500).json({ error: 'Failed to get commission settings' });
  }
});

// PUT /api/commissions/settings/:listingType - Update commission settings for a listing type
router.put('/settings/:listingType', async (req: Request, res: Response) => {
  try {
    // TODO: Add admin permission check
    // if (!req.user?.isAdmin) {
    //   return res.status(403).json({ error: 'Admin access required' });
    // }

    const { listingType } = req.params;
    const validatedData = commissionSettingsSchema.parse(req.body);

    const success = await CommissionService.updateCommissionSettings(listingType, validatedData);
    
    if (!success) {
      return res.status(400).json({ error: 'Failed to update commission settings' });
    }

    res.json({
      success: true,
      message: `Commission settings updated for ${listingType}`,
      listing_type: listingType,
      settings: validatedData
    });

  } catch (error: any) {
    console.error('Error updating commission settings:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    res.status(500).json({
      error: 'Failed to update commission settings',
      message: error.message
    });
  }
});

// POST /api/commissions/calculate - Calculate commission for a given amount and type
router.post('/calculate', async (req: Request, res: Response) => {
  try {
    const validatedData = calculateCommissionSchema.parse(req.body);
    
    const calculation = await CommissionService.simulateCommission(
      validatedData.amount,
      validatedData.listing_type
    );

    res.json({
      success: true,
      calculation: {
        total_amount: calculation.totalAmount,
        commission_percent: calculation.commissionPercent,
        platform_fee: calculation.platformFee,
        seller_payout: calculation.sellerPayout,
        applied_rule: calculation.appliedRule
      }
    });

  } catch (error: any) {
    console.error('Error calculating commission:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    res.status(500).json({
      error: 'Failed to calculate commission',
      message: error.message
    });
  }
});

// GET /api/commissions/seller/:sellerId - Get commission records for a seller
router.get('/seller/:sellerId', async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;
    
    // TODO: Add permission check - users can only see their own commissions
    // if (req.user?.id !== sellerId && !req.user?.isAdmin) {
    //   return res.status(403).json({ error: 'Access denied' });
    // }

    const { status, listing_type, limit = '50', offset = '0' } = req.query;
    
    const commissions = await CommissionService.getCommissions({
      sellerId,
      status: status as string,
      listingType: listing_type as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    const earnings = await CommissionService.getSellerEarnings(sellerId);

    res.json({
      commissions,
      summary: earnings,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: commissions.length
      }
    });

  } catch (error) {
    console.error('Error getting seller commissions:', error);
    res.status(500).json({ error: 'Failed to get seller commissions' });
  }
});

// GET /api/commissions/seller/:sellerId/earnings - Get earnings summary for a seller
router.get('/seller/:sellerId/earnings', async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;
    
    // TODO: Add permission check
    // if (req.user?.id !== sellerId && !req.user?.isAdmin) {
    //   return res.status(403).json({ error: 'Access denied' });
    // }

    const earnings = await CommissionService.getSellerEarnings(sellerId);

    res.json({
      seller_id: sellerId,
      earnings: {
        total_sales: earnings.totalSales,
        platform_fees: earnings.platformFees,
        net_earnings: earnings.netEarnings,
        pending_payouts: earnings.pendingPayouts,
        completed_payouts: earnings.completedPayouts,
        transaction_count: earnings.transactionCount
      }
    });

  } catch (error) {
    console.error('Error getting seller earnings:', error);
    res.status(500).json({ error: 'Failed to get seller earnings' });
  }
});

// Admin routes
// GET /api/commissions/admin/summary - Get platform commission summary
router.get('/admin/summary', async (req: Request, res: Response) => {
  try {
    // TODO: Add admin permission check
    // if (!req.user?.isAdmin) {
    //   return res.status(403).json({ error: 'Admin access required' });
    // }

    const { start_date, end_date } = req.query;
    
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    
    if (start_date) {
      startDate = new Date(start_date as string);
    }
    
    if (end_date) {
      endDate = new Date(end_date as string);
    }

    const summary = await CommissionService.getPlatformSummary(startDate, endDate);

    res.json({
      platform_summary: {
        total_earnings: summary.totalEarnings,
        total_paid_out: summary.totalPaidOut,
        pending_payouts: summary.pendingPayouts,
        transaction_count: summary.transactionCount,
        avg_commission_rate: summary.avgCommissionRate
      },
      date_range: {
        start_date: startDate?.toISOString() || null,
        end_date: endDate?.toISOString() || null
      }
    });

  } catch (error) {
    console.error('Error getting platform summary:', error);
    res.status(500).json({ error: 'Failed to get platform summary' });
  }
});

// GET /api/commissions/admin/all - Get all commission records with filters
router.get('/admin/all', async (req: Request, res: Response) => {
  try {
    // TODO: Add admin permission check
    // if (!req.user?.isAdmin) {
    //   return res.status(403).json({ error: 'Admin access required' });
    // }

    const { 
      seller_id, 
      buyer_id, 
      listing_type, 
      status, 
      start_date, 
      end_date,
      limit = '100',
      offset = '0'
    } = req.query;

    let startDate: Date | undefined;
    let endDate: Date | undefined;
    
    if (start_date) {
      startDate = new Date(start_date as string);
    }
    
    if (end_date) {
      endDate = new Date(end_date as string);
    }

    const commissions = await CommissionService.getCommissions({
      sellerId: seller_id as string,
      buyerId: buyer_id as string,
      listingType: listing_type as string,
      status: status as string,
      startDate,
      endDate,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    res.json({
      commissions,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: commissions.length
      },
      filters: {
        seller_id,
        buyer_id,
        listing_type,
        status,
        start_date,
        end_date
      }
    });

  } catch (error) {
    console.error('Error getting all commissions:', error);
    res.status(500).json({ error: 'Failed to get commission records' });
  }
});

// POST /api/commissions/admin/:commissionId/complete - Mark commission as completed (seller paid)
router.post('/admin/:commissionId/complete', async (req: Request, res: Response) => {
  try {
    // TODO: Add admin permission check
    // if (!req.user?.isAdmin) {
    //   return res.status(403).json({ error: 'Admin access required' });
    // }

    const { commissionId } = req.params;
    const { stripe_transfer_id } = req.body;

    const success = await CommissionService.completeCommission(
      commissionId,
      stripe_transfer_id
    );

    if (!success) {
      return res.status(400).json({ error: 'Failed to complete commission' });
    }

    res.json({
      success: true,
      message: 'Commission marked as completed',
      commission_id: commissionId,
      stripe_transfer_id
    });

  } catch (error) {
    console.error('Error completing commission:', error);
    res.status(500).json({ error: 'Failed to complete commission' });
  }
});

// POST /api/commissions/admin/initialize-settings - Initialize default commission settings
router.post('/admin/initialize-settings', async (req: Request, res: Response) => {
  try {
    // TODO: Add admin permission check
    // if (!req.user?.isAdmin) {
    //   return res.status(403).json({ error: 'Admin access required' });
    // }

    await CommissionService.initializeDefaultSettings();

    res.json({
      success: true,
      message: 'Default commission settings initialized'
    });

  } catch (error) {
    console.error('Error initializing settings:', error);
    res.status(500).json({ error: 'Failed to initialize commission settings' });
  }
});

// POST /api/commissions/create - Create commission record (internal use)
router.post('/create', async (req: Request, res: Response) => {
  try {
    // This endpoint should only be called internally by the payment system
    // TODO: Add internal authentication or API key check
    
    const {
      transaction_id,
      seller_id,
      buyer_id,
      total_amount,
      listing_type,
      listing_id
    } = req.body;

    const commissionId = await CommissionService.createCommission(
      transaction_id,
      seller_id,
      buyer_id,
      parseFloat(total_amount),
      listing_type,
      listing_id
    );

    res.json({
      success: true,
      commission_id: commissionId,
      message: 'Commission record created successfully'
    });

  } catch (error: any) {
    console.error('Error creating commission:', error);
    res.status(500).json({
      error: 'Failed to create commission record',
      message: error.message
    });
  }
});

export default router;