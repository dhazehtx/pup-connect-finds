// @ts-nocheck
import { db } from '../db';
import { userReports, listingReports, reportRateLimit, profiles, dogListings, notifications } from '@shared/schema';
import { eq, desc, and, gte, sql, count } from 'drizzle-orm';
import { logInfo, logWarn, logError } from './loggingService';

export interface ReportUserData {
  reporterId: string;
  reportedUserId: string;
  reason: string;
  message: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface ReportListingData {
  reporterId: string;
  listingId: string;
  listingOwnerId: string;
  reason: string;
  message: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface ResolveReportData {
  reportId: string;
  adminId: string;
  status: 'resolved' | 'dismissed';
  actionTaken: string;
  adminNotes?: string;
}

export interface ReportFilters {
  type?: 'user' | 'listing';
  status?: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export class ReportingService {
  /**
   * Check if user can submit a report (rate limiting)
   */
  async canUserReport(userId: string): Promise<{ canReport: boolean; remainingReports: number; resetTime?: Date }> {
    try {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      // Get or create rate limit record
      let [rateLimitRecord] = await db
        .select()
        .from(reportRateLimit)
        .where(eq(reportRateLimit.user_id, userId));

      if (!rateLimitRecord) {
        // Create new rate limit record
        [rateLimitRecord] = await db
          .insert(reportRateLimit)
          .values({
            user_id: userId,
            report_count: 0,
            last_report_date: today,
            reset_date: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000) // Tomorrow
          })
          .returning();
      }

      // Check if we need to reset the count (new day)
      if (rateLimitRecord.reset_date < today) {
        rateLimitRecord = (await db
          .update(reportRateLimit)
          .set({
            report_count: 0,
            reset_date: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
          })
          .where(eq(reportRateLimit.user_id, userId))
          .returning())[0];
      }

      const maxReportsPerDay = 5;
      const canReport = rateLimitRecord.report_count < maxReportsPerDay;
      const remainingReports = Math.max(0, maxReportsPerDay - rateLimitRecord.report_count);

      return {
        canReport,
        remainingReports,
        resetTime: canReport ? undefined : rateLimitRecord.reset_date
      };
    } catch (error) {
      logError('database', 'Failed to check report rate limit', { userId, error: error.message });
      // On error, allow reporting but log the issue
      return { canReport: true, remainingReports: 5 };
    }
  }

  /**
   * Submit a user report
   */
  async reportUser(data: ReportUserData): Promise<{ success: boolean; reportId?: string; error?: string }> {
    try {
      // Check rate limiting
      const rateLimitCheck = await this.canUserReport(data.reporterId);
      if (!rateLimitCheck.canReport) {
        return {
          success: false,
          error: `Daily report limit reached. Resets at ${rateLimitCheck.resetTime?.toLocaleTimeString()}`
        };
      }

      // Prevent self-reporting
      if (data.reporterId === data.reportedUserId) {
        return { success: false, error: 'Cannot report yourself' };
      }

      // Check if user already reported this user recently (prevent spam)
      const recentReport = await db
        .select()
        .from(userReports)
        .where(
          and(
            eq(userReports.reporter_id, data.reporterId),
            eq(userReports.reported_user_id, data.reportedUserId),
            gte(userReports.created_at, new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
          )
        )
        .limit(1);

      if (recentReport.length > 0) {
        return { success: false, error: 'You have already reported this user recently' };
      }

      // Create the report
      const [report] = await db
        .insert(userReports)
        .values({
          reporter_id: data.reporterId,
          reported_user_id: data.reportedUserId,
          reason: data.reason,
          message: data.message,
          severity: data.severity || 'medium'
        })
        .returning();

      // Update rate limit counter
      await db
        .update(reportRateLimit)
        .set({
          report_count: sql`${reportRateLimit.report_count} + 1`,
          last_report_date: new Date()
        })
        .where(eq(reportRateLimit.user_id, data.reporterId));

      // Create notification for reported user
      await db.insert(notifications).values({
        user_id: data.reportedUserId,
        type: 'report_received',
        message: 'A report has been submitted regarding your account. Our team will review it shortly.',
        details: {
          reportId: report.id,
          reason: data.reason
        }
      });

      // Log the report
      await logInfo('security', 'User report submitted', {
        reportId: report.id,
        reporterId: data.reporterId,
        reportedUserId: data.reportedUserId,
        reason: data.reason,
        severity: data.severity
      });

      // Send alert for high/critical severity reports
      if (data.severity === 'high' || data.severity === 'critical') {
        await logWarn('security', `${data.severity.toUpperCase()} severity user report`, {
          reportId: report.id,
          reason: data.reason,
          message: data.message
        });
      }

      return { success: true, reportId: report.id };
    } catch (error) {
      logError('database', 'Failed to submit user report', { data, error: error.message });
      return { success: false, error: 'Failed to submit report. Please try again.' };
    }
  }

  /**
   * Submit a listing report
   */
  async reportListing(data: ReportListingData): Promise<{ success: boolean; reportId?: string; error?: string }> {
    try {
      // Check rate limiting
      const rateLimitCheck = await this.canUserReport(data.reporterId);
      if (!rateLimitCheck.canReport) {
        return {
          success: false,
          error: `Daily report limit reached. Resets at ${rateLimitCheck.resetTime?.toLocaleTimeString()}`
        };
      }

      // Check if user already reported this listing recently
      const recentReport = await db
        .select()
        .from(listingReports)
        .where(
          and(
            eq(listingReports.reporter_id, data.reporterId),
            eq(listingReports.listing_id, data.listingId),
            gte(listingReports.created_at, new Date(Date.now() - 24 * 60 * 60 * 1000))
          )
        )
        .limit(1);

      if (recentReport.length > 0) {
        return { success: false, error: 'You have already reported this listing recently' };
      }

      // Create the report
      const [report] = await db
        .insert(listingReports)
        .values({
          reporter_id: data.reporterId,
          listing_id: data.listingId,
          listing_owner_id: data.listingOwnerId,
          reason: data.reason,
          message: data.message,
          severity: data.severity || 'medium'
        })
        .returning();

      // Update rate limit counter
      await db
        .update(reportRateLimit)
        .set({
          report_count: sql`${reportRateLimit.report_count} + 1`,
          last_report_date: new Date()
        })
        .where(eq(reportRateLimit.user_id, data.reporterId));

      // Create notification for listing owner
      await db.insert(notifications).values({
        user_id: data.listingOwnerId,
        type: 'listing_reported',
        message: 'A report has been submitted regarding one of your listings. Our team will review it shortly.',
        details: {
          reportId: report.id,
          listingId: data.listingId,
          reason: data.reason
        }
      });

      // Log the report
      await logInfo('security', 'Listing report submitted', {
        reportId: report.id,
        reporterId: data.reporterId,
        listingId: data.listingId,
        listingOwnerId: data.listingOwnerId,
        reason: data.reason,
        severity: data.severity
      });

      // Send alert for high/critical severity reports
      if (data.severity === 'high' || data.severity === 'critical') {
        await logWarn('security', `${data.severity.toUpperCase()} severity listing report`, {
          reportId: report.id,
          listingId: data.listingId,
          reason: data.reason,
          message: data.message
        });
      }

      return { success: true, reportId: report.id };
    } catch (error) {
      logError('database', 'Failed to submit listing report', { data, error: error.message });
      return { success: false, error: 'Failed to submit report. Please try again.' };
    }
  }

  /**
   * Get reports with filtering for admin dashboard
   */
  async getReports(filters: ReportFilters = {}) {
    try {
      // Simplified approach: Get reports directly and join usernames in a second query
      let results = [];
      
      if (!filters.type || filters.type === 'user') {
        let query = db.select().from(userReports);
        
        // Apply filters for user reports
        if (filters.status) {
          query = query.where(eq(userReports.status, filters.status));
        }
        if (filters.severity) {
          query = query.where(eq(userReports.severity, filters.severity));
        }
        if (filters.startDate) {
          query = query.where(gte(userReports.created_at, filters.startDate));
        }
        
        const userReportsResults = await query;
        
        // Add type and format for consistency
        const formattedUserReports = userReportsResults.map(report => ({
          ...report,
          type: 'user' as const,
          reporter_username: 'Unknown',
          reported_username: 'Unknown', 
          listing_id: null,
          listing_title: null
        }));
        
        results.push(...formattedUserReports);
      }

      if (!filters.type || filters.type === 'listing') {
        let query = db.select().from(listingReports);
        
        // Apply filters for listing reports
        if (filters.status) {
          query = query.where(eq(listingReports.status, filters.status));
        }
        if (filters.severity) {
          query = query.where(eq(listingReports.severity, filters.severity));
        }
        if (filters.startDate) {
          query = query.where(gte(listingReports.created_at, filters.startDate));
        }
        
        const listingReportsResults = await query;
        
        // Add type and format for consistency
        const formattedListingReports = listingReportsResults.map(report => ({
          ...report,
          type: 'listing' as const,
          reporter_username: 'Unknown',
          reported_username: 'Unknown',
          listing_title: 'Unknown Listing',
          reported_user_id: report.listing_owner_id
        }));
        
        results.push(...formattedListingReports);
      }



      // Sort by created_at desc
      results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Apply pagination
      const offset = filters.offset || 0;
      const limit = filters.limit || 50;
      const paginatedResults = results.slice(offset, offset + limit);

      return {
        reports: paginatedResults,
        totalCount: results.length
      };
    } catch (error) {
      logError('database', 'Failed to fetch reports', { filters, error: error.message });
      throw error;
    }
  }

  /**
   * Resolve a report (admin action)
   */
  async resolveReport(data: ResolveReportData): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if it's a user report or listing report
      const [userReport] = await db
        .select()
        .from(userReports)
        .where(eq(userReports.id, data.reportId))
        .limit(1);

      const [listingReport] = await db
        .select()
        .from(listingReports)
        .where(eq(listingReports.id, data.reportId))
        .limit(1);

      if (!userReport && !listingReport) {
        return { success: false, error: 'Report not found' };
      }

      // Update the appropriate report table
      if (userReport) {
        await db
          .update(userReports)
          .set({
            status: data.status,
            action_taken: data.actionTaken,
            admin_notes: data.adminNotes,
            resolved_by: data.adminId,
            resolved_at: new Date(),
            updated_at: new Date()
          })
          .where(eq(userReports.id, data.reportId));

        // Notify reporter
        await db.insert(notifications).values({
          user_id: userReport.reporter_id,
          type: 'report_resolved',
          message: `Your report has been ${data.status}. Thank you for helping keep our community safe.`,
          details: {
            reportId: data.reportId,
            status: data.status,
            actionTaken: data.actionTaken
          }
        });

        // Notify reported user if action was taken
        if (data.actionTaken !== 'none') {
          await db.insert(notifications).values({
            user_id: userReport.reported_user_id,
            type: 'account_action',
            message: `Action has been taken on your account following a community report: ${data.actionTaken}`,
            details: {
              reportId: data.reportId,
              actionTaken: data.actionTaken,
              adminNotes: data.adminNotes
            }
          });
        }
      } else if (listingReport) {
        await db
          .update(listingReports)
          .set({
            status: data.status,
            action_taken: data.actionTaken,
            admin_notes: data.adminNotes,
            resolved_by: data.adminId,
            resolved_at: new Date(),
            updated_at: new Date()
          })
          .where(eq(listingReports.id, data.reportId));

        // Notify reporter
        await db.insert(notifications).values({
          user_id: listingReport.reporter_id,
          type: 'report_resolved',
          message: `Your listing report has been ${data.status}. Thank you for helping keep our marketplace safe.`,
          details: {
            reportId: data.reportId,
            status: data.status,
            actionTaken: data.actionTaken
          }
        });

        // Notify listing owner if action was taken
        if (data.actionTaken !== 'none') {
          await db.insert(notifications).values({
            user_id: listingReport.listing_owner_id,
            type: 'listing_action',
            message: `Action has been taken on your listing following a community report: ${data.actionTaken}`,
            details: {
              reportId: data.reportId,
              listingId: listingReport.listing_id,
              actionTaken: data.actionTaken,
              adminNotes: data.adminNotes
            }
          });
        }
      }

      // Log the resolution
      await logInfo('security', 'Report resolved by admin', {
        reportId: data.reportId,
        adminId: data.adminId,
        status: data.status,
        actionTaken: data.actionTaken,
        reportType: userReport ? 'user' : 'listing'
      });

      return { success: true };
    } catch (error) {
      logError('database', 'Failed to resolve report', { data, error: error.message });
      return { success: false, error: 'Failed to resolve report. Please try again.' };
    }
  }

  /**
   * Get reporting statistics for admin dashboard
   */
  async getReportingStats() {
    try {
      // Get total counts
      const [userReportCount] = await db.select({ count: count() }).from(userReports);
      const [listingReportCount] = await db.select({ count: count() }).from(listingReports);

      // Get pending counts
      const [pendingUserReports] = await db
        .select({ count: count() })
        .from(userReports)
        .where(eq(userReports.status, 'pending'));

      const [pendingListingReports] = await db
        .select({ count: count() })
        .from(listingReports)
        .where(eq(listingReports.status, 'pending'));

      // Get high severity pending reports
      const [highSeverityReports] = await db
        .select({ count: count() })
        .from(userReports)
        .where(
          and(
            eq(userReports.status, 'pending'),
            sql`${userReports.severity} IN ('high', 'critical')`
          )
        );

      const [highSeverityListingReports] = await db
        .select({ count: count() })
        .from(listingReports)
        .where(
          and(
            eq(listingReports.status, 'pending'),
            sql`${listingReports.severity} IN ('high', 'critical')`
          )
        );

      return {
        totalReports: (userReportCount?.count || 0) + (listingReportCount?.count || 0),
        userReports: userReportCount?.count || 0,
        listingReports: listingReportCount?.count || 0,
        pendingReports: (pendingUserReports?.count || 0) + (pendingListingReports?.count || 0),
        highSeverityPending: (highSeverityReports?.count || 0) + (highSeverityListingReports?.count || 0)
      };
    } catch (error) {
      logError('database', 'Failed to get reporting stats', { error: error.message });
      throw error;
    }
  }
}

// Export singleton instance
export const reportingService = new ReportingService();