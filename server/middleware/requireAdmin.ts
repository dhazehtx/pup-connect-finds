import { Request, Response, NextFunction } from 'express';

const ADMIN_IDS = (process.env.ADMIN_USER_IDS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

export function requireAdmin(req: any, res: Response, next: NextFunction) {
  const userId = req?.user?.id;
  if (!userId || !ADMIN_IDS.includes(userId)) {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
}
