import * as Sentry from '@sentry/node';

export const getSentryEnvironment = (): string => process.env.NODE_ENV || 'development';

export const initializeSentry = () => {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: getSentryEnvironment(),
      integrations: [
        Sentry.httpIntegration(),
        Sentry.expressIntegration(),
      ],
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      beforeSend(event) {
        // Filter out sensitive data
        if (event.request?.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
        return event;
      }
    });
    if (process.env.NODE_ENV !== 'production') {
      console.log('Sentry initialized for error tracking');
    }
  } else if (process.env.NODE_ENV !== 'production') {
    console.warn('Sentry DSN not configured, error tracking disabled');
  }
};

export const captureError = (error: Error, context?: Record<string, any>) => {
  if (process.env.SENTRY_DSN) {
    Sentry.withScope((scope) => {
      if (context) {
        Object.keys(context).forEach(key => {
          scope.setExtra(key, context[key]);
        });
      }
      Sentry.captureException(error);
    });
  } else if (process.env.NODE_ENV !== 'production') {
    console.error('Error captured:', error, context);
  }
};

export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  if (process.env.SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  } else if (process.env.NODE_ENV !== 'production') {
    console.log(`[${level.toUpperCase()}] ${message}`);
  }
};

export { Sentry };