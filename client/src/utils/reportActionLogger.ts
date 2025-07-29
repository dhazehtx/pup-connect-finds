import { logToSupabase } from './logToSupabase';
import { logAdminAction } from './logger';

/**
 * Comprehensive report action logging utilities for tracking admin interactions
 * with reports including viewing, resolution, and moderation actions
 */

export interface ReportViewPayload {
  reportId: string;
  reportType: 'user' | 'listing';
  reportSeverity: 'low' | 'medium' | 'high' | 'critical';
  reportStatus: string;
  viewDuration?: number;
  accessedFrom: string;
}

export interface ReportResolutionPayload {
  reportId: string;
  reportType: 'user' | 'listing';
  resolutionType: 'resolved' | 'dismissed' | 'escalated' | 'transferred';
  actionTaken: string;
  adminNotes?: string;
  previousStatus: string;
  newStatus: string;
  resolutionReason?: string;
}

export interface ModerationActionPayload {
  reportId: string;
  actionType: 'ban_user' | 'warn_user' | 'hide_listing' | 'remove_content' | 'suspend_account' | 'flag_for_review';
  targetType: 'user' | 'listing' | 'content';
  targetId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  duration?: string;
  reason: string;
  additionalNotes?: string;
  reversible: boolean;
}

/**
 * Log when an admin views a report
 */
export const logReportView = async (payload: ReportViewPayload): Promise<void> => {
  try {
    const eventDetail = `Viewed ${payload.reportType} report ${payload.reportId} (${payload.reportSeverity} severity, ${payload.reportStatus} status)`;
    
    await logToSupabase(`Report viewed: ${payload.reportId}`, {
      event_type: 'REPORT_VIEW',
      event_detail: eventDetail,
      report_id: payload.reportId,
      report_type: payload.reportType,
      report_severity: payload.reportSeverity,
      report_status: payload.reportStatus,
      view_duration: payload.viewDuration,
      accessed_from: payload.accessedFrom,
      view_timestamp: new Date().toISOString()
    });

    logAdminAction(`Viewed report: ${payload.reportId}`, {
      event_type: 'REPORT_VIEW',
      ...payload
    });

    console.log(`[Report View] Admin viewed report ${payload.reportId}`, payload);
  } catch (error) {
    console.error('Failed to log report view:', error);
  }
};

/**
 * Log when an admin resolves a report
 */
export const logReportResolution = async (payload: ReportResolutionPayload): Promise<void> => {
  try {
    const eventDetail = `Resolved ${payload.reportType} report ${payload.reportId}: ${payload.resolutionType} - ${payload.actionTaken}`;
    
    await logToSupabase(`Report resolved: ${payload.reportId}`, {
      event_type: 'REPORT_RESOLUTION',
      event_detail: eventDetail,
      report_id: payload.reportId,
      report_type: payload.reportType,
      resolution_type: payload.resolutionType,
      action_taken: payload.actionTaken,
      admin_notes: payload.adminNotes,
      previous_status: payload.previousStatus,
      new_status: payload.newStatus,
      resolution_reason: payload.resolutionReason,
      resolution_timestamp: new Date().toISOString()
    });

    logAdminAction(`Resolved report: ${payload.resolutionType}`, {
      event_type: 'REPORT_RESOLUTION',
      ...payload
    });

    console.log(`[Report Resolution] Admin resolved report ${payload.reportId}`, payload);
  } catch (error) {
    console.error('Failed to log report resolution:', error);
  }
};

/**
 * Log moderation actions taken as a result of reports
 */
export const logModerationAction = async (payload: ModerationActionPayload): Promise<void> => {
  try {
    const eventDetail = `Moderation action: ${payload.actionType} on ${payload.targetType} ${payload.targetId} (Report: ${payload.reportId}) - ${payload.reason}`;
    
    await logToSupabase(`Moderation: ${payload.actionType}`, {
      event_type: 'MODERATION_ACTION',
      event_detail: eventDetail,
      report_id: payload.reportId,
      action_type: payload.actionType,
      target_type: payload.targetType,
      target_id: payload.targetId,
      severity: payload.severity,
      duration: payload.duration,
      reason: payload.reason,
      additional_notes: payload.additionalNotes,
      reversible: payload.reversible,
      action_timestamp: new Date().toISOString()
    });

    logAdminAction(`Moderation action: ${payload.actionType}`, {
      event_type: 'MODERATION_ACTION',
      ...payload
    });

    console.log(`[Moderation Action] Admin performed ${payload.actionType}`, payload);
  } catch (error) {
    console.error('Failed to log moderation action:', error);
  }
};

/**
 * Log bulk report actions
 */
export const logBulkReportAction = async (
  actionType: string,
  reportIds: string[],
  successCount: number,
  failureCount: number,
  notes?: string
): Promise<void> => {
  try {
    const eventDetail = `Bulk report action: ${actionType} on ${reportIds.length} reports - ${successCount} succeeded, ${failureCount} failed`;
    
    await logToSupabase(`Bulk report action: ${actionType}`, {
      event_type: 'BULK_REPORT_ACTION',
      event_detail: eventDetail,
      action_type: actionType,
      report_count: reportIds.length,
      success_count: successCount,
      failure_count: failureCount,
      report_ids: reportIds,
      notes: notes,
      action_timestamp: new Date().toISOString()
    });

    logAdminAction(`Bulk report action: ${actionType}`, {
      event_type: 'BULK_REPORT_ACTION',
      action_type: actionType,
      report_count: reportIds.length,
      success_count: successCount,
      failure_count: failureCount
    });

    console.log(`[Bulk Report Action] Admin performed ${actionType} on ${reportIds.length} reports`);
  } catch (error) {
    console.error('Failed to log bulk report action:', error);
  }
};

/**
 * Log report escalation actions
 */
export const logReportEscalation = async (
  reportId: string,
  escalationType: 'legal_review' | 'senior_admin' | 'external_authority' | 'law_enforcement',
  reason: string,
  urgency: 'low' | 'medium' | 'high' | 'critical',
  additionalInfo?: string
): Promise<void> => {
  try {
    const eventDetail = `Escalated report ${reportId} to ${escalationType} (${urgency} urgency) - ${reason}`;
    
    await logToSupabase(`Report escalated: ${escalationType}`, {
      event_type: 'REPORT_ESCALATION',
      event_detail: eventDetail,
      report_id: reportId,
      escalation_type: escalationType,
      reason: reason,
      urgency: urgency,
      additional_info: additionalInfo,
      escalation_timestamp: new Date().toISOString()
    });

    logAdminAction(`Report escalation: ${escalationType}`, {
      event_type: 'REPORT_ESCALATION',
      report_id: reportId,
      escalation_type: escalationType,
      reason: reason,
      urgency: urgency
    });

    console.log(`[Report Escalation] Admin escalated report ${reportId} to ${escalationType}`);
  } catch (error) {
    console.error('Failed to log report escalation:', error);
  }
};