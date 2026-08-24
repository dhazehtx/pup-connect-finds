import { Request, Response, NextFunction } from 'express';
import { loggingService } from '../services/loggingService';
import { nanoid } from 'nanoid';

interface RequestWithTiming extends Request {
  startTime?: number;
}

/** Header names that must never be written to logs. */
const REDACT_HEADERS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'x-ops-secret',
  'x-cron-secret',
  'apikey',
  'x-api-key',
]);

/** Body/field name fragments whose values must never be written to logs. */
const SENSITIVE_FIELD_RE =
  /pass(word)?|token|secret|authorization|cookie|card|cvc|cvv|ssn|social|two_factor|backup_code|id_document|bank|iban|routing|account_number/i;

export function redactHeaders(headers: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(headers || {})) {
    out[k] = REDACT_HEADERS.has(k.toLowerCase()) ? '[REDACTED]' : v;
  }
  return out;
}

export function redactBody(value: unknown, depth = 0): unknown {
  if (value == null || depth > 4) return value;
  if (Array.isArray(value)) return value.slice(0, 50).map((v) => redactBody(v, depth + 1));
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SENSITIVE_FIELD_RE.test(k) ? '[REDACTED]' : redactBody(v, depth + 1);
    }
    return out;
  }
  return value;
}

/**
 * Middleware to automatically log all API requests
 */
export const apiLoggingMiddleware = (req: RequestWithTiming, res: Response, next: NextFunction) => {
  // Skip logging for static assets and HMR
  if (shouldSkipLogging(req.path)) {
    return next();
  }

  const startTime = Date.now();
  req.startTime = startTime;

  // Log request start for debugging
  if (process.env.NODE_ENV === 'development') {
    loggingService.debug('api', `${req.method} ${req.path} - Request started`, {
      headers: redactHeaders(req.headers as Record<string, unknown>),
      query: req.query,
      body: req.method !== 'GET' ? redactBody(req.body) : undefined
    }, {
      method: req.method,
      endpoint: req.path,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
  }

  // Hook into response to log completion
  const originalSend = res.send;
  res.send = function(body) {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Determine log level based on status code
    let level: 'info' | 'warn' | 'error' = 'info';
    if (statusCode >= 400 && statusCode < 500) {
      level = 'warn';
    } else if (statusCode >= 500) {
      level = 'error';
    }

    // Log the completed request
    loggingService.log({
      level,
      category: 'api',
      message: `${req.method} ${req.path} ${statusCode} - ${responseTime}ms`,
      details: {
        responseBody: shouldLogResponseBody(req.path) ? body : '[BODY_OMITTED]',
        requestSize: req.get('Content-Length') || 0,
        responseSize: Buffer.byteLength(body || '', 'utf8')
      },
      method: req.method,
      endpoint: req.path,
      statusCode,
      responseTime,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id,
      sessionId: (req as any).sessionID
    });

    return originalSend.call(this, body);
  };

  next();
};

/**
 * Middleware to log user actions
 */
export const userActionLogger = (action: string, details?: Record<string, any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    loggingService.info('user-action', `User action: ${action}`, {
      ...details,
      userId: user?.id,
      username: user?.username
    }, {
      userId: user?.id,
      sessionId: (req as any).sessionID,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.path,
      method: req.method
    });

    next();
  };
};

/**
 * Middleware to log authentication events
 */
export const authEventLogger = (event: string, success: boolean) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const level = success ? 'info' : 'warn';
    
    loggingService.log({
      level,
      category: 'auth',
      message: `Authentication event: ${event} - ${success ? 'Success' : 'Failed'}`,
      details: {
        event,
        success,
        username: req.body?.username || req.body?.email,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.path,
      method: req.method,
      sessionId: (req as any).sessionID
    });

    next();
  };
};

/**
 * Middleware to log performance metrics
 */
export const performanceLogger = (threshold: number = 1000) => {
  return (req: RequestWithTiming, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(body) {
      const responseTime = Date.now() - (req.startTime || Date.now());
      
      // Only log if response time exceeds threshold
      if (responseTime > threshold) {
        loggingService.warn('performance', `Slow response detected: ${req.method} ${req.path}`, {
          responseTime,
          threshold,
          statusCode: res.statusCode
        }, {
          method: req.method,
          endpoint: req.path,
          responseTime,
          statusCode: res.statusCode,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });
      }

      return originalSend.call(this, body);
    };

    next();
  };
};

/**
 * Helper function to determine if we should skip logging for a path
 */
const shouldSkipLogging = (path: string): boolean => {
  const skipPatterns = [
    '/src/',
    '/assets/',
    '/@vite/',
    '/@fs/',
    '/@id/',
    '/node_modules/',
    '.css',
    '.js',
    '.map',
    '.ico',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot'
  ];

  return skipPatterns.some(pattern => path.includes(pattern));
};

/**
 * Helper function to determine if we should log response body
 */
const shouldLogResponseBody = (path: string): boolean => {
  // Never log response bodies in production — they routinely contain PII
  // (private messages, profile email/phone, exported account data) and tokens.
  if (process.env.NODE_ENV === 'production') return false;

  // Even in development, never log bodies for sensitive/PII endpoints.
  const skipBodyPaths = [
    '/api/logs',
    '/api/stats',
    '/api/health',
    '/api/messaging',
    '/api/messages',
    '/api/conversations',
    '/api/export-data',
    '/api/user',
    '/api/profile',
    '/api/profiles',
    '/api/auth',
    '/api/payout',
    '/api/payments',
    '/api/stripe',
    '/api/verify',
    '/api/upload-id',
    '/api/provider-applications',
  ];

  return !skipBodyPaths.some(skipPath => path.includes(skipPath));
};

/**
 * Frontend error logging endpoint middleware
 */
export const frontendErrorHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, stack, componentStack, errorBoundary, url, userAgent, userId, sessionId } = req.body;

    await loggingService.error('frontend', message || 'Frontend error occurred', {
      stack,
      componentStack,
      errorBoundary,
      url,
      browser: userAgent
    }, {
      userId,
      sessionId,
      ipAddress: req.ip,
      userAgent,
      endpoint: url
    });

    res.json({ success: true, message: 'Error logged successfully' });
  } catch (error) {
    console.error('Failed to log frontend error:', error);
    res.status(500).json({ success: false, message: 'Failed to log error' });
  }
};