// Frontend logging utility
interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  category: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
  url?: string;
  userAgent?: string;
  userId?: string;
  sessionId?: string;
}

class FrontendLogger {
  private endpoint = '/api/admin/logs/frontend-error';
  private queue: LogEntry[] = [];
  private isProcessing = false;

  async log(entry: LogEntry) {
    // Add to queue
    this.queue.push({
      ...entry,
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId()
    });

    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.queue.length === 0 || this.isProcessing) return;
    
    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const entry = this.queue.shift();
      if (entry) {
        try {
          await fetch(this.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(entry)
          });
        } catch (error) {
          // If logging fails, just console log
          console.error('Failed to send log to server:', error);
          console.log('Original log entry:', entry);
        }
      }
    }
    
    this.isProcessing = false;
  }

  private getCurrentUserId(): string | undefined {
    // Try to get user ID from various sources
    try {
      // From React context, local storage, etc.
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id;
    } catch {
      return undefined;
    }
  }

  private getSessionId(): string | undefined {
    try {
      return sessionStorage.getItem('sessionId') || undefined;
    } catch {
      return undefined;
    }
  }

  // Convenience methods
  debug(category: string, message: string, details?: Record<string, any>) {
    return this.log({ level: 'debug', category, message, details });
  }

  info(category: string, message: string, details?: Record<string, any>) {
    return this.log({ level: 'info', category, message, details });
  }

  warn(category: string, message: string, details?: Record<string, any>) {
    return this.log({ level: 'warn', category, message, details });
  }

  error(category: string, message: string, details?: Record<string, any>, error?: Error) {
    return this.log({ 
      level: 'error', 
      category, 
      message, 
      details,
      stack: error?.stack 
    });
  }

  critical(category: string, message: string, details?: Record<string, any>, error?: Error) {
    return this.log({ 
      level: 'critical', 
      category, 
      message, 
      details,
      stack: error?.stack 
    });
  }
}

// Export singleton instance
export const logger = new FrontendLogger();

// Export convenience functions
export const logDebug = (category: string, message: string, details?: Record<string, any>) =>
  logger.debug(category, message, details);

export const logInfo = (category: string, message: string, details?: Record<string, any>) =>
  logger.info(category, message, details);

export const logWarn = (category: string, message: string, details?: Record<string, any>) =>
  logger.warn(category, message, details);

export const logError = (category: string, message: string, details?: Record<string, any>, error?: Error) =>
  logger.error(category, message, details, error);

export const logCritical = (category: string, message: string, details?: Record<string, any>, error?: Error) =>
  logger.critical(category, message, details, error);

// Auto-capture unhandled errors
window.addEventListener('error', (event) => {
  logger.error('frontend', `Unhandled error: ${event.message}`, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  }, event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error('frontend', `Unhandled promise rejection: ${event.reason}`, {
    reason: event.reason
  });
});

// Performance monitoring
if ('PerformanceObserver' in window) {
  try {
    const perfObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          
          // Log slow page loads (>3 seconds)
          if (navEntry.loadEventEnd - navEntry.navigationStart > 3000) {
            logger.warn('performance', 'Slow page load detected', {
              loadTime: navEntry.loadEventEnd - navEntry.navigationStart,
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.navigationStart,
              url: navEntry.name
            });
          }
        }
      }
    });
    
    perfObserver.observe({ entryTypes: ['navigation'] });
  } catch (error) {
    console.warn('Performance observer not available:', error);
  }
}