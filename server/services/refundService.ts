import Stripe from 'stripe';
import { db } from '../db';
import { refundRequests, transactions, profiles, InsertRefundRequest } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import crypto from 'crypto';


if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export interface RefundEligibilityCheck {
  eligible: boolean;
  reason?: string;
  maxRefundAmount?: number;
}

export interface RefundProcessResult {
  success: boolean;
  refundId?: string;
  error?: string;
  amount?: number;
}

export class RefundService {
  // Check if a transaction is eligible for refund
  static async checkRefundEligibility(
    transactionId: string, 
    userId: string, 
    reason: string
  ): Promise<RefundEligibilityCheck> {
    try {
      // Get transaction details
      const [transaction] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.id, transactionId));

      if (!transaction) {
        return { eligible: false, reason: 'Transaction not found' };
      }

      // Check if user owns this transaction
      if (transaction.buyer_id !== userId && transaction.user_id !== userId) {
        return { eligible: false, reason: 'Unauthorized access to transaction' };
      }

      // Check if transaction is in valid state for refund
      if (transaction.status !== 'completed' && transaction.status !== 'succeeded') {
        return { eligible: false, reason: 'Transaction not in refundable state' };
      }

      // Check if refund already exists
      const existingRefund = await db
        .select()
        .from(refundRequests)
        .where(
          and(
            eq(refundRequests.transaction_id, transactionId),
            eq(refundRequests.user_id, userId)
          )
        );

      if (existingRefund.length > 0) {
        const latestRefund = existingRefund[0];
        if (latestRefund.status === 'pending' || latestRefund.status === 'approved') {
          return { eligible: false, reason: 'Refund request already pending' };
        }
        if (latestRefund.status === 'refunded') {
          return { eligible: false, reason: 'Transaction already refunded' };
        }
        // Allow new request if previous was declined
      }

      // Check time limits based on reason
      const transactionDate = new Date(transaction.created_at);
      const daysSinceTransaction = Math.floor(
        (Date.now() - transactionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      let eligibilityRules: { maxDays: number; autoApprove: boolean } = { maxDays: 30, autoApprove: false };

      switch (reason) {
        case 'canceled_order':
          eligibilityRules = { maxDays: 7, autoApprove: true };
          break;
        case 'scam_listing':
          eligibilityRules = { maxDays: 60, autoApprove: false };
          break;
        case 'dispute_resolved':
          eligibilityRules = { maxDays: 90, autoApprove: true };
          break;
        case 'service_not_delivered':
          eligibilityRules = { maxDays: 30, autoApprove: false };
          break;
        case 'item_not_as_described':
          eligibilityRules = { maxDays: 14, autoApprove: false };
          break;
        default:
          eligibilityRules = { maxDays: 30, autoApprove: false };
      }

      if (daysSinceTransaction > eligibilityRules.maxDays) {
        return { 
          eligible: false, 
          reason: `Refund window expired. Must request within ${eligibilityRules.maxDays} days.` 
        };
      }

      return {
        eligible: true,
        maxRefundAmount: parseFloat(transaction.amount.toString())
      };

    } catch (error) {
      console.error('Error checking refund eligibility:', error);
      return { eligible: false, reason: 'System error checking eligibility' };
    }
  }

  // Create a refund request
  static async createRefundRequest(refundData: InsertRefundRequest): Promise<string> {
    try {
      const [refundRequest] = await db
        .insert(refundRequests)
        .values({
          ...refundData,
          id: crypto.randomUUID(),
        })
        .returning();

      // Check if this should be auto-approved
      const shouldAutoApprove = await this.shouldAutoApprove(refundData.reason, refundData.transaction_id);
      
      if (shouldAutoApprove) {
        await this.approveRefund(refundRequest.id, 'system', 'Auto-approved based on policy');
      }

      return refundRequest.id;
    } catch (error) {
      console.error('Error creating refund request:', error);
      throw new Error('Failed to create refund request');
    }
  }

  // Check if refund should be auto-approved
  private static async shouldAutoApprove(reason: string, transactionId: string): Promise<boolean> {
    const autoApproveReasons = ['canceled_order', 'dispute_resolved'];
    
    if (!autoApproveReasons.includes(reason)) {
      return false;
    }

    // Additional checks for auto-approval
    try {
      const [transaction] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.id, transactionId));

      if (!transaction) return false;

      // Auto-approve for smaller amounts (under $100)
      const amount = parseFloat(transaction.amount.toString());
      if (amount <= 100) {
        return true;
      }

      // Auto-approve if transaction is very recent (within 24 hours)
      const transactionDate = new Date(transaction.created_at);
      const hoursAgo = (Date.now() - transactionDate.getTime()) / (1000 * 60 * 60);
      if (hoursAgo <= 24) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error in auto-approval check:', error);
      return false;
    }
  }

  // Approve a refund request
  static async approveRefund(
    refundRequestId: string, 
    approvedBy: string, 
    adminNotes?: string
  ): Promise<RefundProcessResult> {
    try {
      // Get refund request details
      const [refundRequest] = await db
        .select()
        .from(refundRequests)
        .where(eq(refundRequests.id, refundRequestId));

      if (!refundRequest) {
        return { success: false, error: 'Refund request not found' };
      }

      if (refundRequest.status !== 'pending') {
        return { success: false, error: 'Refund request not in pending state' };
      }

      // Update status to approved
      await db
        .update(refundRequests)
        .set({
          status: 'approved',
          approved_by: approvedBy === 'system' ? null : approvedBy,
          admin_notes: adminNotes,
          updated_at: new Date()
        })
        .where(eq(refundRequests.id, refundRequestId));

      // Process the actual refund
      return await this.processStripeRefund(refundRequestId);

    } catch (error) {
      console.error('Error approving refund:', error);
      return { success: false, error: 'Failed to approve refund' };
    }
  }

  // Decline a refund request
  static async declineRefund(
    refundRequestId: string, 
    declinedBy: string, 
    adminNotes: string
  ): Promise<boolean> {
    try {
      await db
        .update(refundRequests)
        .set({
          status: 'declined',
          approved_by: declinedBy,
          admin_notes: adminNotes,
          updated_at: new Date()
        })
        .where(eq(refundRequests.id, refundRequestId));

      return true;
    } catch (error) {
      console.error('Error declining refund:', error);
      return false;
    }
  }

  // Process actual Stripe refund
  static async processStripeRefund(refundRequestId: string): Promise<RefundProcessResult> {
    try {
      const [refundRequest] = await db
        .select()
        .from(refundRequests)
        .where(eq(refundRequests.id, refundRequestId));

      if (!refundRequest) {
        return { success: false, error: 'Refund request not found' };
      }

      // Create refund in Stripe
      const stripeRefund = await stripe.refunds.create({
        payment_intent: refundRequest.charge_id,
        amount: Math.round(parseFloat(refundRequest.refund_amount.toString()) * 100), // Convert to cents
        reason: this.mapReasonToStripe(refundRequest.reason),
        metadata: {
          refund_request_id: refundRequestId,
          user_id: refundRequest.user_id,
          original_reason: refundRequest.reason
        }
      });

      // Update refund request with Stripe details
      await db
        .update(refundRequests)
        .set({
          status: 'refunded',
          stripe_refund_id: stripeRefund.id,
          processed_at: new Date(),
          updated_at: new Date()
        })
        .where(eq(refundRequests.id, refundRequestId));

      return {
        success: true,
        refundId: stripeRefund.id,
        amount: stripeRefund.amount / 100 // Convert back from cents
      };

    } catch (error: any) {
      console.error('Error processing Stripe refund:', error);

      // Update status to failed
      await db
        .update(refundRequests)
        .set({
          status: 'failed',
          admin_notes: `Stripe error: ${error.message}`,
          updated_at: new Date()
        })
        .where(eq(refundRequests.id, refundRequestId));

      return { 
        success: false, 
        error: error.message || 'Stripe refund failed' 
      };
    }
  }

  // Map internal reason to Stripe reason
  private static mapReasonToStripe(reason: string): 'duplicate' | 'fraudulent' | 'requested_by_customer' {
    switch (reason) {
      case 'scam_listing':
        return 'fraudulent';
      case 'duplicate_payment':
        return 'duplicate';
      default:
        return 'requested_by_customer';
    }
  }

  // Get refund requests for a user
  static async getUserRefundRequests(userId: string): Promise<any[]> {
    try {
      const refunds = await db
        .select({
          id: refundRequests.id,
          transaction_id: refundRequests.transaction_id,
          reason: refundRequests.reason,
          detailed_reason: refundRequests.detailed_reason,
          status: refundRequests.status,
          refund_amount: refundRequests.refund_amount,
          currency: refundRequests.currency,
          stripe_refund_id: refundRequests.stripe_refund_id,
          admin_notes: refundRequests.admin_notes,
          processed_at: refundRequests.processed_at,
          created_at: refundRequests.created_at,
          updated_at: refundRequests.updated_at,
          // Include transaction details
          transaction_amount: transactions.amount,
          transaction_status: transactions.status,
          product_type: transactions.product_type
        })
        .from(refundRequests)
        .leftJoin(transactions, eq(refundRequests.transaction_id, transactions.id))
        .where(eq(refundRequests.user_id, userId))
        .orderBy(desc(refundRequests.created_at));

      return refunds;
    } catch (error) {
      console.error('Error getting user refund requests:', error);
      return [];
    }
  }

  // Get all refund requests for admin
  static async getAllRefundRequests(status?: string): Promise<any[]> {
    try {
      let query = db
        .select({
          id: refundRequests.id,
          user_id: refundRequests.user_id,
          transaction_id: refundRequests.transaction_id,
          charge_id: refundRequests.charge_id,
          reason: refundRequests.reason,
          detailed_reason: refundRequests.detailed_reason,
          status: refundRequests.status,
          refund_amount: refundRequests.refund_amount,
          currency: refundRequests.currency,
          stripe_refund_id: refundRequests.stripe_refund_id,
          admin_notes: refundRequests.admin_notes,
          approved_by: refundRequests.approved_by,
          processed_at: refundRequests.processed_at,
          created_at: refundRequests.created_at,
          updated_at: refundRequests.updated_at,
          // Include user details
          user_name: profiles.full_name,
          user_username: profiles.username,
          // Include transaction details
          transaction_amount: transactions.amount,
          transaction_status: transactions.status,
          product_type: transactions.product_type
        })
        .from(refundRequests)
        .leftJoin(profiles, eq(refundRequests.user_id, profiles.id))
        .leftJoin(transactions, eq(refundRequests.transaction_id, transactions.id));

      if (status) {
        query = query.where(eq(refundRequests.status, status));
      }

      const refunds = await query.orderBy(desc(refundRequests.created_at));
      return refunds;
    } catch (error) {
      console.error('Error getting all refund requests:', error);
      return [];
    }
  }
}

export default RefundService;