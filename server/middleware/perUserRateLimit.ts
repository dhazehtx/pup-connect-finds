import { debugApiLog, debugApiWarn } from '../lib/debugApi';
import type { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitStats {
  triggeredCount: number;
  lastTriggered: number | null;
  activeUsers: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();
const triggerStats = new Map<string, { count: number; lastTriggered: number | null }>();

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

export function getRateLimitStats(): Record<string, RateLimitStats> {
  const result: Record<string, RateLimitStats> = {};
  Array.from(stores.entries()).forEach(([name, store]) => {
    const stats = triggerStats.get(name);
    result[name] = {
      triggeredCount: stats?.count ?? 0,
      lastTriggered: stats?.lastTriggered ?? null,
      activeUsers: store.size,
    };
  });
  Array.from(triggerStats.entries()).forEach(([name, stats]) => {
    if (!result[name]) {
      result[name] = {
        triggeredCount: stats.count,
        lastTriggered: stats.lastTriggered,
        activeUsers: 0,
      };
    }
  });
  return result;
}

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
      const existing = triggerStats.get(name) || { count: 0, lastTriggered: null };
      triggerStats.set(name, { count: existing.count + 1, lastTriggered: now });

      debugApiLog('[PROOF:RATE_LIMIT]', JSON.stringify({
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
