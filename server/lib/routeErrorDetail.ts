import type { Request, Response } from 'express';
import { postgresErrorMeta } from './pgErrorMeta';

export type RouteErrorCtx = {
  route: string;
  step: string;
  table?: string;
  statusCode: number;
};

export function buildRouteCtx(
  req: Request,
  route: string,
  step: string,
  table: string,
  res: Response,
): RouteErrorCtx {
  return {
    route,
    step,
    table,
    statusCode: res.statusCode || 500,
  };
}

export function sendRouteError(
  req: Request,
  res: Response,
  status: number,
  message: string,
  code: string,
  error: unknown,
  ctx: RouteErrorCtx,
  extra?: Record<string, unknown>,
): void {
  const pg = postgresErrorMeta(error);
  console.error(`[ROUTE_FAIL] ${ctx.route}`, {
    step: ctx.step,
    table: ctx.table,
    code,
    userId: (req as { user?: { id?: string } }).user?.id,
    pgCode: pg.code,
    pgMessage: pg.message,
    ...extra,
  });

  const debug =
    process.env.DEBUG_API_ERRORS === '1' || process.env.NODE_ENV !== 'production';

  res.status(status).json({
    error: code,
    message,
    ...(debug
      ? {
          debug: {
            step: ctx.step,
            pgCode: pg.code,
            pgMessage: pg.message,
            table: pg.table,
            column: pg.column,
          },
        }
      : {}),
  });
}
