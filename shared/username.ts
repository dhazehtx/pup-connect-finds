import { z } from 'zod';

export const RESERVED_USERNAMES = new Set([
  'admin',
  'api',
  'login',
  'logout',
  'signup',
  'signin',
  'sign-in',
  'sign-up',
  'settings',
  'support',
  'help',
  'paws',
  'root',
  'system',
  'null',
  'undefined',
  'me',
  'you',
  'explore',
  'home',
  'feed',
  'messages',
  'profile',
  'marketplace',
  'services',
]);

export const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(/^[a-z0-9_.]+$/, 'Use only lowercase letters, numbers, underscores, and periods')
  .refine((v) => !RESERVED_USERNAMES.has(v), 'This username is reserved');

/** Lowercase, trimmed — does not validate format. */
export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateUsername(raw: string): { ok: true; username: string } | { ok: false; error: string } {
  const normalized = normalizeUsername(raw);
  const parsed = usernameSchema.safeParse(normalized);
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? 'Invalid username';
    return { ok: false, error: msg };
  }
  return { ok: true, username: parsed.data };
}
