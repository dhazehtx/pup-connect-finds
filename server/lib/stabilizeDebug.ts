import { postgresErrorMeta } from './pgErrorMeta';

export function logStabilizeError(
  label: string,
  error: unknown,
  extra?: Record<string, unknown>,
): void {
  if (process.env.STABILIZE_DEBUG !== '1' && process.env.NODE_ENV === 'production') {
    return;
  }
  const pg = postgresErrorMeta(error);
  console.error(`[STABILIZE] ${label}`, {
    ...extra,
    pgCode: pg.code,
    message: pg.message,
    table: pg.table,
    column: pg.column,
  });
}
