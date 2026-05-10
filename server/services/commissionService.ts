import { db } from '../db';
import { commissions, commissionSettings, transactions, profiles } from '@shared/schema';
import { eq, and, desc, sum, sql, gte, lte, between } from 'drizzle-orm';
import { InsertCommission, InsertCommissionSettings } from '@shared/schema';
import crypto from 'crypto';

export interface CommissionCalculation {
  totalAmount: number;
  commissionPercent: number;
  platformFee: number;
  sellerPayout: number;
  appliedRule: string;
}

export interface CommissionSummary {
  totalEarnings: number;
  totalPaidOut: number;
  pendingPayouts: number;
  transactionCount: number;
  avgCommissionRate: number;
}

export interface SellerEarnings {
  totalSales: number;
  platformFees: number;
  netEarnings: number;
  pendingPayouts: number;
  completedPayouts: number;
  transactionCount: number;
}

export class CommissionService {
  // Default commission rates if not configured
  private static DEFAULT_RATES = {
    puppy: { percent: 0, description: 'Puppy listings commission (0% at launch; raise via admin / env later)' },
    service: { percent: 0, description: 'Pet services commission (0% at launch)' },
    rehoming: { percent: 0, flat_fee: 19.99, description: 'Rehoming flat fee' },
    premium: { percent: 0, description: 'Premium features - direct platform revenue' },
    subscription: { percent: 0, description: 'Subscription fees - direct platform revenue' }
  } as const;

  // Initialize default commission settings
  static async initializeDefaultSettings(): Promise<void> {
    try {
      for (const [listingType, config] of Object.entries(this.DEFAULT_RATES)) {
        // Check if setting already exists
        const existing = await db
          .select()
          .from(commissionSettings)
          .where(eq(commissionSettings.listing_type, listingType));

        if (existing.length === 0) {
          await db.insert(commissionSettings).values({
            id: crypto.randomUUID(),
            listing_type: listingType,
            commission_percent: config.percent.toString(),
            flat_fee: ('flat_fee' in config ? config.flat_fee?.toString() : null) || null,
            description: config.description,
            is_active: true
          });
        }
      }
    } catch (error) {
      console.error('Error initializing commission settings:', error);
    }
  }

  // Get commission rate for a specific listing type
  static async getCommissionRate(listingType: string): Promise<{
    percent: number;
    flatFee?: number;
    minFee?: number;
    maxFee?: number;
  }> {
    try {
      const [setting] = await db
        .select()
        .from(commissionSettings)
        .where(
          and(
            eq(commissionSettings.listing_type, listingType),
            eq(commissionSettings.is_active, true)
          )
        );

      if (setting) {
        return {
          percent: parseFloat(setting.commission_percent),
          flatFee: setting.flat_fee ? parseFloat(setting.flat_fee) : undefined,
          minFee: setting.min_fee ? parseFloat(setting.min_fee) : undefined,
          maxFee: setting.max_fee ? parseFloat(setting.max_fee) : undefined
        };
      }

      // Return default if no setting found
      const defaultRate = this.DEFAULT_RATES[listingType as keyof typeof this.DEFAULT_RATES];
      if (defaultRate) {
        return {
          percent: defaultRate.percent,
          flatFee: 'flat_fee' in defaultRate ? defaultRate.flat_fee : undefined
        };
      }

      // Fallback to 10% for unknown types
      return { percent: 10 };
    } catch (error) {
      console.error('Error getting commission rate:', error);
      return { percent: 10 }; // Safe default
    }
  }

  // Calculate commission for a transaction
  static async calculateCommission(
    totalAmount: number,
    listingType: string
  ): Promise<CommissionCalculation> {
    const rates = await this.getCommissionRate(listingType);
    
    let platformFee: number;
    let appliedRule: string;

    if (rates.flatFee && rates.flatFee > 0) {
      // Use flat fee (like rehoming)
      platformFee = rates.flatFee;
      appliedRule = `Flat fee: $${rates.flatFee}`;
    } else {
      // Use percentage
      platformFee = (totalAmount * rates.percent) / 100;
      appliedRule = `${rates.percent}% commission`;
      
      // Apply min/max fee caps if configured
      if (rates.minFee && platformFee < rates.minFee) {
        platformFee = rates.minFee;
        appliedRule += ` (min $${rates.minFee})`;
      }
      
      if (rates.maxFee && platformFee > rates.maxFee) {
        platformFee = rates.maxFee;
        appliedRule += ` (max $${rates.maxFee})`;
      }
    }

    const sellerPayout = Math.max(0, totalAmount - platformFee);

    return {
      totalAmount,
      commissionPercent: rates.percent,
      platformFee: Math.round(platformFee * 100) / 100, // Round to 2 decimals
      sellerPayout: Math.round(sellerPayout * 100) / 100,
      appliedRule
    };
  }

  // Create commission record for a transaction
  static async createCommission(
    transactionId: string,
    sellerId: string,
    buyerId: string,
    totalAmount: number,
    listingType: string,
    listingId?: string
  ): Promise<string> {
    try {
      const calculation = await this.calculateCommission(totalAmount, listingType);
      
      const [commission] = await db
        .insert(commissions)
        .values({
          id: crypto.randomUUID(),
          transaction_id: transactionId,
          seller_id: sellerId,
          buyer_id: buyerId,
          total_amount: calculation.totalAmount.toString(),
          commission_percent: calculation.commissionPercent.toString(),
          platform_fee: calculation.platformFee.toString(),
          seller_payout: calculation.sellerPayout.toString(),
          listing_type: listingType,
          listing_id: listingId || null,
          status: 'pending',
          currency: 'usd'
        })
        .returning();

      return commission.id;
    } catch (error) {
      console.error('Error creating commission record:', error);
      throw new Error('Failed to create commission record');
    }
  }

  // Mark commission as completed (when seller is paid)
  static async completeCommission(
    commissionId: string,
    stripeTransferId?: string
  ): Promise<boolean> {
    try {
      await db
        .update(commissions)
        .set({
          status: 'completed',
          stripe_transfer_id: stripeTransferId || null,
          payout_date: new Date(),
          updated_at: new Date()
        })
        .where(eq(commissions.id, commissionId));

      return true;
    } catch (error) {
      console.error('Error completing commission:', error);
      return false;
    }
  }

  // Mark commission as refunded
  static async refundCommission(commissionId: string, notes?: string): Promise<boolean> {
    try {
      await db
        .update(commissions)
        .set({
          status: 'refunded',
          notes: notes || 'Commission refunded due to transaction refund',
          updated_at: new Date()
        })
        .where(eq(commissions.id, commissionId));

      return true;
    } catch (error) {
      console.error('Error refunding commission:', error);
      return false;
    }
  }

  // Get platform commission summary
  static async getPlatformSummary(
    startDate?: Date,
    endDate?: Date
  ): Promise<CommissionSummary> {
    try {
      let query: any = db
        .select({
          totalEarnings: sum(commissions.platform_fee),
          totalPaidOut: sum(sql`CASE WHEN ${commissions.status} = 'completed' THEN ${commissions.seller_payout} ELSE 0 END`),
          pendingPayouts: sum(sql`CASE WHEN ${commissions.status} = 'pending' THEN ${commissions.seller_payout} ELSE 0 END`),
          transactionCount: sql`COUNT(*)`,
          avgCommissionRate: sql`AVG(${commissions.commission_percent})`
        })
        .from(commissions);

      let finalQuery: any = query;
      
      if (startDate && endDate) {
        finalQuery = finalQuery.where(between(commissions.created_at, startDate, endDate));
      } else if (startDate) {
        finalQuery = finalQuery.where(gte(commissions.created_at, startDate));
      } else if (endDate) {
        finalQuery = finalQuery.where(lte(commissions.created_at, endDate));
      }

      const [result] = await finalQuery;

      return {
        totalEarnings: parseFloat(result?.totalEarnings || '0'),
        totalPaidOut: parseFloat(result?.totalPaidOut || '0'),
        pendingPayouts: parseFloat(result?.pendingPayouts || '0'),
        transactionCount: parseInt(result?.transactionCount?.toString() || '0'),
        avgCommissionRate: parseFloat(result?.avgCommissionRate?.toString() || '0')
      };
    } catch (error) {
      console.error('Error getting platform summary:', error);
      return {
        totalEarnings: 0,
        totalPaidOut: 0,
        pendingPayouts: 0,
        transactionCount: 0,
        avgCommissionRate: 0
      };
    }
  }

  // Get seller earnings summary
  static async getSellerEarnings(sellerId: string): Promise<SellerEarnings> {
    try {
      const [result] = await db
        .select({
          totalSales: sum(commissions.total_amount),
          platformFees: sum(commissions.platform_fee),
          netEarnings: sum(commissions.seller_payout),
          pendingPayouts: sum(sql`CASE WHEN ${commissions.status} = 'pending' THEN ${commissions.seller_payout} ELSE 0 END`),
          completedPayouts: sum(sql`CASE WHEN ${commissions.status} = 'completed' THEN ${commissions.seller_payout} ELSE 0 END`),
          transactionCount: sql`COUNT(*)`
        })
        .from(commissions)
        .where(eq(commissions.seller_id, sellerId));

      return {
        totalSales: parseFloat(result?.totalSales || '0'),
        platformFees: parseFloat(result?.platformFees || '0'),
        netEarnings: parseFloat(result?.netEarnings || '0'),
        pendingPayouts: parseFloat(result?.pendingPayouts || '0'),
        completedPayouts: parseFloat(result?.completedPayouts || '0'),
        transactionCount: parseInt(result?.transactionCount?.toString() || '0')
      };
    } catch (error) {
      console.error('Error getting seller earnings:', error);
      return {
        totalSales: 0,
        platformFees: 0,
        netEarnings: 0,
        pendingPayouts: 0,
        completedPayouts: 0,
        transactionCount: 0
      };
    }
  }

  // Get detailed commission records
  static async getCommissions(filters: {
    sellerId?: string;
    buyerId?: string;
    listingType?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  } = {}): Promise<any[]> {
    try {
      let baseQuery: any = db
        .select({
          id: commissions.id,
          transaction_id: commissions.transaction_id,
          seller_id: commissions.seller_id,
          buyer_id: commissions.buyer_id,
          total_amount: commissions.total_amount,
          commission_percent: commissions.commission_percent,
          platform_fee: commissions.platform_fee,
          seller_payout: commissions.seller_payout,
          listing_type: commissions.listing_type,
          listing_id: commissions.listing_id,
          status: commissions.status,
          stripe_transfer_id: commissions.stripe_transfer_id,
          payout_date: commissions.payout_date,
          currency: commissions.currency,
          notes: commissions.notes,
          created_at: commissions.created_at,
          updated_at: commissions.updated_at
        })
        .from(commissions);

      // Apply filters
      const conditions = [];
      
      if (filters.sellerId) {
        conditions.push(eq(commissions.seller_id, filters.sellerId));
      }
      
      if (filters.buyerId) {
        conditions.push(eq(commissions.buyer_id, filters.buyerId));
      }
      
      if (filters.listingType) {
        conditions.push(eq(commissions.listing_type, filters.listingType));
      }
      
      if (filters.status) {
        conditions.push(eq(commissions.status, filters.status));
      }
      
      if (filters.startDate && filters.endDate) {
        conditions.push(between(commissions.created_at, filters.startDate, filters.endDate));
      } else if (filters.startDate) {
        conditions.push(gte(commissions.created_at, filters.startDate));
      } else if (filters.endDate) {
        conditions.push(lte(commissions.created_at, filters.endDate));
      }

      if (conditions.length > 0) {
        baseQuery = baseQuery.where(and(...conditions));
      }

      baseQuery = baseQuery.orderBy(desc(commissions.created_at));

      if (filters.limit) {
        baseQuery = baseQuery.limit(filters.limit);
      }
      
      if (filters.offset) {
        baseQuery = baseQuery.offset(filters.offset);
      }

      return await baseQuery;
    } catch (error) {
      console.error('Error getting commissions:', error);
      return [];
    }
  }

  // Update commission settings
  static async updateCommissionSettings(
    listingType: string,
    settings: Partial<InsertCommissionSettings>
  ): Promise<boolean> {
    try {
      const existing = await db
        .select()
        .from(commissionSettings)
        .where(eq(commissionSettings.listing_type, listingType));

      if (existing.length > 0) {
        // Update existing
        await db
          .update(commissionSettings)
          .set({
            ...settings,
            updated_at: new Date()
          })
          .where(eq(commissionSettings.listing_type, listingType));
      } else {
        // Create new
        await db
          .insert(commissionSettings)
          .values({
            id: crypto.randomUUID(),
            listing_type: listingType,
            commission_percent: settings.commission_percent?.toString() || '0',
            flat_fee: settings.flat_fee?.toString() || null,
            min_fee: settings.min_fee?.toString() || null,
            max_fee: settings.max_fee?.toString() || null,
            description: settings.description || null,
            is_active: settings.is_active ?? true
          });
      }

      return true;
    } catch (error) {
      console.error('Error updating commission settings:', error);
      return false;
    }
  }

  // Get all commission settings
  static async getAllCommissionSettings(): Promise<any[]> {
    try {
      return await db
        .select()
        .from(commissionSettings)
        .where(eq(commissionSettings.is_active, true))
        .orderBy(commissionSettings.listing_type);
    } catch (error) {
      console.error('Error getting commission settings:', error);
      return [];
    }
  }

  // Simulate commission calculation (for previews)
  static async simulateCommission(
    amount: number,
    listingType: string
  ): Promise<CommissionCalculation> {
    return await this.calculateCommission(amount, listingType);
  }
}

export default CommissionService;