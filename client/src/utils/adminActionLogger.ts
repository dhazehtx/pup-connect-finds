import { logToSupabase } from './logToSupabase';
import { logAdminAction } from './logger';

/**
 * Comprehensive admin action logging utilities for tracking filter applications,
 * data operations, moderation actions, and decision-making patterns
 */

export interface FilterActionPayload {
  filterType: string;
  filters: Record<string, any>;
  resultCount?: number;
  appliedAt: string;
  pageContext: string;
}

export interface ModerationActionPayload {
  actionType: 'approve' | 'reject' | 'ban' | 'warn' | 'delete' | 'suspend' | 'review';
  targetType: 'user' | 'listing' | 'report' | 'message' | 'comment';
  targetId: string;
  reason?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  additionalData?: Record<string, any>;
}

export interface DataOperationPayload {
  operation: 'create' | 'update' | 'delete' | 'bulk_update' | 'bulk_delete' | 'export' | 'import';
  entityType: string;
  entityId?: string;
  changeCount?: number;
  affectedFields?: string[];
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
}

/**
 * Log admin filter applications across all admin interfaces
 */
export const logAdminFilterAction = async (payload: FilterActionPayload): Promise<void> => {
  try {
    const filterSummary = Object.entries(payload.filters)
      .filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    const eventDetail = `Applied ${payload.filterType} filters on ${payload.pageContext}: ${filterSummary}`;
    
    await logToSupabase(`Filter action: ${payload.filterType}`, {
      event_type: 'FILTER_ACTION',
      event_detail: eventDetail,
      filter_type: payload.filterType,
      page_context: payload.pageContext,
      filters_applied: payload.filters,
      result_count: payload.resultCount,
      applied_at: payload.appliedAt
    });

    logAdminAction(`Applied ${payload.filterType} filters`, {
      event_type: 'FILTER_ACTION',
      ...payload
    });

    console.log(`[Admin Filter] ${eventDetail}`, payload.filters);
  } catch (error) {
    console.error('Failed to log admin filter action:', error);
  }
};

/**
 * Log admin moderation actions and decisions
 */
export const logAdminModerationAction = async (payload: ModerationActionPayload): Promise<void> => {
  try {
    const eventDetail = `Performed ${payload.actionType} on ${payload.targetType} (ID: ${payload.targetId})${payload.reason ? ` - Reason: ${payload.reason}` : ''}`;
    
    await logToSupabase(`Moderation: ${payload.actionType}`, {
      event_type: 'MODERATION_ACTION',
      event_detail: eventDetail,
      action_type: payload.actionType,
      target_type: payload.targetType,
      target_id: payload.targetId,
      reason: payload.reason,
      severity: payload.severity,
      additional_data: payload.additionalData
    });

    logAdminAction(`Moderation action: ${payload.actionType}`, {
      event_type: 'MODERATION_ACTION',
      ...payload
    });

    console.log(`[Admin Moderation] ${eventDetail}`, payload);
  } catch (error) {
    console.error('Failed to log admin moderation action:', error);
  }
};

/**
 * Log admin data operations and changes
 */
export const logAdminDataOperation = async (payload: DataOperationPayload): Promise<void> => {
  try {
    const eventDetail = `Performed ${payload.operation} on ${payload.entityType}${payload.entityId ? ` (ID: ${payload.entityId})` : ''}${payload.changeCount ? ` affecting ${payload.changeCount} records` : ''}`;
    
    await logToSupabase(`Data operation: ${payload.operation}`, {
      event_type: 'DATA_OPERATION',
      event_detail: eventDetail,
      operation: payload.operation,
      entity_type: payload.entityType,
      entity_id: payload.entityId,
      change_count: payload.changeCount,
      affected_fields: payload.affectedFields,
      old_values: payload.oldValues,
      new_values: payload.newValues
    });

    logAdminAction(`Data operation: ${payload.operation}`, {
      event_type: 'DATA_OPERATION',
      ...payload
    });

    console.log(`[Admin Data] ${eventDetail}`, payload);
  } catch (error) {
    console.error('Failed to log admin data operation:', error);
  }
};

/**
 * Log admin search and query operations
 */
export const logAdminSearchAction = async (searchQuery: string, searchType: string, resultCount: number, pageContext: string): Promise<void> => {
  try {
    const eventDetail = `Performed ${searchType} search for "${searchQuery}" on ${pageContext}, found ${resultCount} results`;
    
    await logToSupabase(`Search: ${searchType}`, {
      event_type: 'SEARCH_ACTION',
      event_detail: eventDetail,
      search_query: searchQuery,
      search_type: searchType,
      result_count: resultCount,
      page_context: pageContext
    });

    logAdminAction(`Search action: ${searchType}`, {
      event_type: 'SEARCH_ACTION',
      search_query: searchQuery,
      search_type: searchType,
      result_count: resultCount,
      page_context: pageContext
    });

    console.log(`[Admin Search] ${eventDetail}`);
  } catch (error) {
    console.error('Failed to log admin search action:', error);
  }
};

/**
 * Log admin bulk operations
 */
export const logAdminBulkAction = async (actionType: string, targetType: string, targetIds: string[], successCount: number, failureCount: number): Promise<void> => {
  try {
    const eventDetail = `Performed bulk ${actionType} on ${targetIds.length} ${targetType}(s): ${successCount} succeeded, ${failureCount} failed`;
    
    await logToSupabase(`Bulk action: ${actionType}`, {
      event_type: 'BULK_ACTION',
      event_detail: eventDetail,
      action_type: actionType,
      target_type: targetType,
      target_count: targetIds.length,
      success_count: successCount,
      failure_count: failureCount,
      target_ids: targetIds
    });

    logAdminAction(`Bulk action: ${actionType}`, {
      event_type: 'BULK_ACTION',
      action_type: actionType,
      target_type: targetType,
      target_count: targetIds.length,
      success_count: successCount,
      failure_count: failureCount
    });

    console.log(`[Admin Bulk] ${eventDetail}`);
  } catch (error) {
    console.error('Failed to log admin bulk action:', error);
  }
};

/**
 * Log admin report resolution actions
 */
export const logAdminReportResolution = async (reportId: string, resolution: string, notes?: string): Promise<void> => {
  try {
    const eventDetail = `Resolved report ${reportId} with resolution: ${resolution}${notes ? ` - Notes: ${notes}` : ''}`;
    
    await logToSupabase(`Report resolved: ${resolution}`, {
      event_type: 'REPORT_RESOLUTION',
      event_detail: eventDetail,
      report_id: reportId,
      resolution: resolution,
      resolution_notes: notes
    });

    logAdminAction(`Report resolution: ${resolution}`, {
      event_type: 'REPORT_RESOLUTION',
      report_id: reportId,
      resolution: resolution,
      notes: notes
    });

    console.log(`[Admin Report] ${eventDetail}`);
  } catch (error) {
    console.error('Failed to log admin report resolution:', error);
  }
};