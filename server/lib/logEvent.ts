/**
 * Structured stdout logging for aggregators (JSON lines).
 * Shape: { level, message, timestamp, context? }
 * Does not replace existing console logs — call alongside them where needed.
 */

export type StructuredLogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface StructuredLogRecord {
  level: StructuredLogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

function safeContext(
  context?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (context === undefined || Object.keys(context).length === 0) {
    return undefined;
  }
  try {
    JSON.stringify(context);
    return context;
  } catch {
    return { _serialization: 'failed' };
  }
}

/**
 * Emit one structured log line. Prefer `context.category` in { auth, payment, webhook, error }.
 */
export function logEvent(
  level: StructuredLogLevel,
  message: string,
  context?: Record<string, unknown>,
): void {
  const record: StructuredLogRecord = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(() => {
      const c = safeContext(context);
      return c ? { context: c } : {};
    })(),
  };

  const line = JSON.stringify(record);

  switch (level) {
    case 'error':
      console.error(line);
      break;
    case 'warn':
      console.warn(line);
      break;
    case 'debug':
      console.log(line);
      break;
    default:
      console.log(line);
  }
}
