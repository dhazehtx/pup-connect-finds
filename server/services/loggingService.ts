// @ts-nocheck
import { db } from '../db';
import { systemLogs, type InsertSystemLog } from '@shared/schema';
import { eq, desc, and, gte, lte, count, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';
export type LogCategory = 'api' | 'frontend' | 'auth' | 'payment' | 'database' | 'security' | 'performance' | 'user-action';

export interface LogEntry {
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
  errorStack?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LogFilters {
  level?: LogLevel[];
  category?: LogCategory[];
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  resolved?: boolean;
  limit?: number;
  offset?: number;
}

export interface LogStats {
  totalLogs: number;
  errorCount: number;
  criticalCount: number;
  unresolvedErrors: number;
  avgResponseTime: number;
  topCategories: Array<{ category: string; count: number }>;
  recentTrends: Array<{ hour: string; count: number; errors: number }>;
}

export class LoggingService {
  /**
   * Log an entry to the system logs
   */
  async log(entry: LogEntry): Promise<string> {
    const logId = `log_${Date.now()}_${nanoid(8)}`;
    
    try {
      const logData = {
        log_id: logId,
        level: entry.level,
        category: entry.category,
        message: entry.message,
        details: entry.details || null,
        user_id: entry.userId || null,
        session_id: entry.sessionId || null,
        ip_address: entry.ipAddress || null,
        user_agent: entry.userAgent || null,
        endpoint: entry.endpoint || null,
        method: entry.method || null,
        status_code: entry.statusCode || null,
        response_time: entry.responseTime || null,
        error_stack: entry.errorStack || null,
      } as any;

      await db.insert(systemLogs).values(logData);
      return logId;
    } catch (error) {
      // Fallback to console logging if database fails
      console.error('Failed to log to database:', error);
      console.log('Original log entry:', entry);
      return logId;
    }
  }

  /**
   * Convenience methods for different log levels
   */
  async debug(category: LogCategory, message: string, details?: Record<string, any>, context?: Partial<LogEntry>) {
    return this.log({ level: 'debug', category, message, details, ...context });
  }

  async info(category: LogCategory, message: string, details?: Record<string, any>, context?: Partial<LogEntry>) {
    return this.log({ level: 'info', category, message, details, ...context });
  }

  async warn(category: LogCategory, message: string, details?: Record<string, any>, context?: Partial<LogEntry>) {
    return this.log({ level: 'warn', category, message, details, ...context });
  }

  async error(category: LogCategory, message: string, details?: Record<string, any>, context?: Partial<LogEntry>) {
    return this.log({ level: 'error', category, message, details, ...context });
  }

  async critical(category: LogCategory, message: string, details?: Record<string, any>, context?: Partial<LogEntry>) {
    const logId = await this.log({ level: 'critical', category, message, details, ...context });
    
    // Send critical alert notification (implement as needed)
    this.sendCriticalAlert(logId, message, details);
    
    return logId;
  }

  /**
   * Get logs with filtering
   */
  async getLogs(filters: LogFilters = {}) {
    let query = db.select().from(systemLogs);

    // Apply filters
    const conditions = [];
    
    if (filters.level?.length) {
      conditions.push(sql`${systemLogs.level} = ANY(ARRAY[${filters.level.map(l => `'${l}'`).join(',')}])`);
    }
    
    if (filters.category?.length) {
      conditions.push(sql`${systemLogs.category} = ANY(ARRAY[${filters.category.map(c => `'${c}'`).join(',')}])`);
    }
    
    if (filters.userId) {
      conditions.push(eq(systemLogs.user_id, filters.userId));
    }
    
    if (filters.startDate) {
      conditions.push(gte(systemLogs.created_at, filters.startDate));
    }
    
    if (filters.endDate) {
      conditions.push(lte(systemLogs.created_at, filters.endDate));
    }
    
    if (filters.resolved !== undefined) {
      conditions.push(eq(systemLogs.resolved, filters.resolved));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply ordering and pagination
    const finalQuery = query.orderBy(desc(systemLogs.created_at));
    
    if (filters.limit) {
      if (filters.offset) {
        return finalQuery.limit(filters.limit).offset(filters.offset);
      } else {
        return finalQuery.limit(filters.limit);
      }
    }
    
    if (filters.offset) {
      return finalQuery.offset(filters.offset);
    }

    return finalQuery;
  }

  /**
   * Get logging statistics
   */
  async getStats(): Promise<LogStats> {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Total logs count
    const [totalResult] = await db.select({ count: count() }).from(systemLogs);
    const totalLogs = totalResult?.count || 0;

    // Error counts
    const [errorResult] = await db
      .select({ count: count() })
      .from(systemLogs)
      .where(eq(systemLogs.level, 'error'));
    const errorCount = errorResult?.count || 0;

    const [criticalResult] = await db
      .select({ count: count() })
      .from(systemLogs)
      .where(eq(systemLogs.level, 'critical'));
    const criticalCount = criticalResult?.count || 0;

    // Unresolved errors
    const [unresolvedResult] = await db
      .select({ count: count() })
      .from(systemLogs)
      .where(
        and(
          sql`${systemLogs.level} IN ('error', 'critical')`,
          eq(systemLogs.resolved, false)
        )
      );
    const unresolvedErrors = unresolvedResult?.count || 0;

    // Average response time for API calls
    const [avgResponseResult] = await db
      .select({ 
        avg: sql<number>`AVG(${systemLogs.response_time})` 
      })
      .from(systemLogs)
      .where(
        and(
          eq(systemLogs.category, 'api'),
          sql`${systemLogs.response_time} IS NOT NULL`
        )
      );
    const avgResponseTime = Math.round(avgResponseResult?.avg || 0);

    // Top categories in last 24 hours
    const topCategories = await db
      .select({
        category: systemLogs.category,
        count: count()
      })
      .from(systemLogs)
      .where(gte(systemLogs.created_at, last24Hours))
      .groupBy(systemLogs.category)
      .orderBy(desc(count()))
      .limit(5);

    // Recent trends (hourly for last 24 hours)
    const recentTrends = await db
      .select({
        hour: sql<string>`TO_CHAR(${systemLogs.created_at}, 'YYYY-MM-DD HH24:00')`,
        count: count(),
        errors: sql<number>`COUNT(CASE WHEN ${systemLogs.level} IN ('error', 'critical') THEN 1 END)`
      })
      .from(systemLogs)
      .where(gte(systemLogs.created_at, last24Hours))
      .groupBy(sql`TO_CHAR(${systemLogs.created_at}, 'YYYY-MM-DD HH24:00')`)
      .orderBy(sql`TO_CHAR(${systemLogs.created_at}, 'YYYY-MM-DD HH24:00')`);

    return {
      totalLogs,
      errorCount,
      criticalCount,
      unresolvedErrors,
      avgResponseTime,
      topCategories: topCategories.map(t => ({ category: t.category, count: t.count })),
      recentTrends: recentTrends.map(t => ({ 
        hour: t.hour, 
        count: t.count, 
        errors: Number(t.errors) 
      }))
    };
  }

  /**
   * Mark an error as resolved
   */
  async resolveError(logId: string, resolvedBy?: string): Promise<boolean> {
    try {
      const result = await db
        .update(systemLogs)
        .set({
          resolved: true,
          resolved_by: resolvedBy || null,
          resolved_at: new Date()
        })
        .where(eq(systemLogs.log_id, logId));

      return Array.isArray(result) ? result.length > 0 : (result as any).rowCount > 0;
    } catch {
      return false;
    }
  }

  /**
   * Clean up old logs (older than specified days)
   */
  async cleanupOldLogs(olderThanDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    try {
      const result = await db
        .delete(systemLogs)
        .where(lte(systemLogs.created_at, cutoffDate));

      return result.length || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Send critical alert (placeholder for notification system)
   */
  private async sendCriticalAlert(logId: string, message: string, details?: Record<string, any>) {
    // This could be integrated with email, Slack, SMS, etc.
    console.error(`🚨 CRITICAL ALERT [${logId}]: ${message}`, details);
    
    // In production, you might want to:
    // - Send email to admins
    // - Post to Slack channel
    // - Send SMS alerts
    // - Trigger PagerDuty
  }
}

// Export singleton instance
export const loggingService = new LoggingService();

// Export convenience functions for quick logging
export const logDebug = (category: LogCategory, message: string, details?: Record<string, any>, context?: Partial<LogEntry>) =>
  loggingService.debug(category, message, details, context);

export const logInfo = (category: LogCategory, message: string, details?: Record<string, any>, context?: Partial<LogEntry>) =>
  loggingService.info(category, message, details, context);

export const logWarn = (category: LogCategory, message: string, details?: Record<string, any>, context?: Partial<LogEntry>) =>
  loggingService.warn(category, message, details, context);

export const logError = (category: LogCategory, message: string, details?: Record<string, any>, context?: Partial<LogEntry>) =>
  loggingService.error(category, message, details, context);

export const logCritical = (category: LogCategory, message: string, details?: Record<string, any>, context?: Partial<LogEntry>) =>
  loggingService.critical(category, message, details, context);