import type { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  timestamps: number[];
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

function getStore(name: string): Map<string, RateLimitEntry> {
  if (!stores.has(name)) {
    stores.set(name, new Map());
  }
  return stores.get(name)!;
}

setInterval(() => {
  const now = Date.now();
  stores.forEach((store) => {
    store.forEach((entry, key) => {
      entry.timestamps = entry.timestamps.filter((t: number) => now - t < 120000);
      if (entry.timestamps.length === 0) {
        store.delete(key);
      }
    });
  });
}, 60000);

export function perUserRateLimit(name: string, maxRequests: number, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id;
    if (!userId) return next();

    const store = getStore(name);
    const now = Date.now();

    let entry = store.get(userId);
    if (!entry) {
      entry = { timestamps: [] };
      store.set(userId, entry);
    }

    entry.timestamps = entry.timestamps.filter(t => now - t < windowMs);

    if (entry.timestamps.length >= maxRequests) {
      console.log('[PROOF:RATE_LIMIT]', JSON.stringify({
        userId,
        action: name,
        count: entry.timestamps.length,
        max: maxRequests,
        windowMs,
        ts: now,
      }));
      return res.status(429).json({
        ok: false,
        code: "RATE_LIMIT",
        error: `Too many ${name} requests. Please slow down.`,
      });
    }

    entry.timestamps.push(now);
    next();
  };
}
