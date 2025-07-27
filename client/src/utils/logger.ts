/**
 * Client-side logging utility for tracking admin actions and errors
 * This logger can be extended to send logs to backend/Supabase for persistent audit trails
 */

export interface LogEvent {
  action: string;
  timestamp: string;
  userId?: string;
  metadata?: any;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'admin' | 'api' | 'ui' | 'auth' | 'error';
}

class Logger {
  private logs: LogEvent[] = [];
  private maxLogSize = 1000; // Keep last 1000 logs in memory
  
  /**
   * Log an event with metadata
   */
  logEvent(
    action: string, 
    metadata?: any, 
    level: LogEvent['level'] = 'info',
    category: LogEvent['category'] = 'admin'
  ): void {
    const logEntry: LogEvent = {
      action,
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId(),
      metadata,
      level,
      category
    };

    // Add to memory logs
    this.logs.push(logEntry);
    
    // Keep logs under limit
    if (this.logs.length > this.maxLogSize) {
      this.logs = this.logs.slice(-this.maxLogSize);
    }

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      const logMethod = level === 'error' ? console.error : 
                       level === 'warn' ? console.warn : console.log;
      logMethod(`[${category.toUpperCase()}] ${action}`, metadata || '');
    }

    // Send to backend if needed (can be implemented later)
    this.sendToBackend(logEntry);
  }

  /**
   * Log admin actions specifically
   */
  logAdminAction(action: string, metadata?: any): void {
    this.logEvent(action, metadata, 'info', 'admin');
  }

  /**
   * Log API errors
   */
  logApiError(action: string, error: any, metadata?: any): void {
    this.logEvent(action, { 
      error: error.message || error, 
      stack: error.stack,
      ...metadata 
    }, 'error', 'api');
  }

  /**
   * Log UI interactions
   */
  logUIAction(action: string, metadata?: any): void {
    this.logEvent(action, metadata, 'info', 'ui');
  }

  /**
   * Log authentication events
   */
  logAuthEvent(action: string, metadata?: any): void {
    this.logEvent(action, metadata, 'info', 'auth');
  }

  /**
   * Get current user ID from auth context
   */
  private getCurrentUserId(): string | undefined {
    try {
      // Try to get from Supabase session if available
      const authData = localStorage.getItem('sb-wneticxjhxpjpfghnclr-auth-token');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed?.user?.id;
      }
    } catch (error) {
      // Silently fail
    }
    return undefined;
  }

  /**
   * Send log to backend for persistent storage
   */
  private async sendToBackend(logEntry: LogEvent): Promise<void> {
    try {
      // Only send important logs to backend to avoid spam
      if (logEntry.level === 'error' || logEntry.category === 'admin') {
        await fetch('/api/logs/frontend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(logEntry)
        });
      }
    } catch (error) {
      // Silently fail - don't want logging to break the app
      console.warn('Failed to send log to backend:', error);
    }
  }

  /**
   * Get recent logs for debugging
   */
  getRecentLogs(limit = 50): LogEvent[] {
    return this.logs.slice(-limit);
  }

  /**
   * Filter logs by category or level
   */
  filterLogs(filters: {
    category?: LogEvent['category'];
    level?: LogEvent['level'];
    since?: Date;
  }): LogEvent[] {
    return this.logs.filter(log => {
      if (filters.category && log.category !== filters.category) return false;
      if (filters.level && log.level !== filters.level) return false;
      if (filters.since && new Date(log.timestamp) < filters.since) return false;
      return true;
    });
  }

  /**
   * Clear logs (useful for testing)
   */
  clearLogs(): void {
    this.logs = [];
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience functions for common use cases
export const logAdminAction = (action: string, metadata?: any) => 
  logger.logAdminAction(action, metadata);

export const logApiError = (action: string, error: any, metadata?: any) => 
  logger.logApiError(action, error, metadata);

export const logUIAction = (action: string, metadata?: any) => 
  logger.logUIAction(action, metadata);

export const logAuthEvent = (action: string, metadata?: any) => 
  logger.logAuthEvent(action, metadata);

export const logEvent = (action: string, metadata?: any, level?: LogEvent['level'], category?: LogEvent['category']) => 
  logger.logEvent(action, metadata, level, category);