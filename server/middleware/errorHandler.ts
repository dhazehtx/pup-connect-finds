import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  errorId?: string;
}

// Error logging service
class ErrorLogger {
  async logError(error: AppError, req: Request, additionalInfo?: any) {
    const errorData = {
      errorId: error.errorId || this.generateErrorId(),
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode || 500,
      isOperational: error.isOperational || false,
      timestamp: new Date().toISOString(),
      request: {
        method: req.method,
        url: req.originalUrl,
        headers: this.sanitizeHeaders(req.headers),
        body: this.sanitizeBody(req.body),
        params: req.params,
        query: req.query,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      },
      user: req.user ? { id: req.user.id } : null,
      additionalInfo
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🔴 ERROR LOGGED:', JSON.stringify(errorData, null, 2));
    }

    // Store in database or external service
    // For now, we'll use console and could integrate with Supabase logs
    try {
      // TODO: Send to external logging service or database
      // await this.storeError(errorData);
    } catch (loggingError) {
      console.error('Failed to store error:', loggingError);
    }

    return errorData.errorId;
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeHeaders(headers: any): any {
    const { authorization, cookie, ...safeHeaders } = headers;
    return {
      ...safeHeaders,
      authorization: authorization ? '[REDACTED]' : undefined,
      cookie: cookie ? '[REDACTED]' : undefined
    };
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;
    
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
    const sanitized = { ...body };
    
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }
}

const errorLogger = new ErrorLogger();

// Create operational error
export const createError = (message: string, statusCode: number = 500): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  error.errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return error;
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Global error handler middleware
export const globalErrorHandler = async (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set default error properties
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Something went wrong';

  // Log the error
  const errorId = await errorLogger.logError(err, req);
  err.errorId = errorId;

  // Handle specific error types
  if (err instanceof ZodError) {
    const validationError = handleValidationError(err);
    return res.status(400).json({
      error: 'Validation Error',
      message: 'The provided data is invalid',
      details: validationError.details,
      errorId
    });
  }

  // Handle operational vs programming errors
  if (err.isOperational) {
    // Operational error - safe to send to client
    return res.status(err.statusCode).json({
      error: err.message,
      errorId
    });
  }

  // Programming error - don't leak details
  console.error('🔴 PROGRAMMING ERROR:', err);
  
  return res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong on our end. Please try again later.',
    errorId
  });
};

// Handle Zod validation errors
const handleValidationError = (err: ZodError) => {
  const details = err.errors.map(error => ({
    field: error.path.join('.'),
    message: error.message,
    code: error.code
  }));

  return {
    message: 'Validation failed',
    details
  };
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = createError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Critical error alerts for admin
export const sendCriticalAlert = async (error: AppError, context: string) => {
  // Define critical error conditions
  const isCritical = 
    error.statusCode === 500 ||
    context.includes('payment') ||
    context.includes('upload') ||
    context.includes('auth') ||
    error.message.toLowerCase().includes('database');

  if (isCritical) {
    console.error('🚨 CRITICAL ERROR ALERT:', {
      context,
      error: error.message,
      errorId: error.errorId,
      timestamp: new Date().toISOString()
    });

    // TODO: Implement actual alerting (email, Slack, etc.)
    // await sendEmailAlert(error, context);
    // await sendSlackAlert(error, context);
  }
};

export { errorLogger };
export default globalErrorHandler;