/**
 * Post-certification hardening: messaging read-state, public email-handle privacy,
 * favorites timestamp + accessibility, and POST/PUT price contract consistency.
 * Price + safe-display-name are tested behaviorally; server/client wiring is guarded.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { insertDogListingSchema } from '../shared/schema';
import { safeDisplayName } from '../client/src/lib/displayName';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');

// ─────────────────────────── P1 — MESSAGING READ STATE ───────────────────────────
describe('P1 messaging read-state', () => {
  const thread = read('client/src/components/messaging/MessageThread.tsx');
  const routes = read('server/routes.ts');
  const storage = read('server/storage.ts');
  it('the recipient marks messages read on open AND when a live message arrives', () => {
    const calls = thread.match(/mark-read`, \{ method: 'POST' \}\)/g) || [];
    expect(calls.length).toBeGreaterThanOrEqual(2); // open effect + message:new effect
  });
  it('the mark-read endpoint is participant-gated (non-participant → 403)', () => {
    const ep = routes.slice(routes.indexOf('conversations/:id/mark-read'), routes.indexOf('conversations/:id/mark-read') + 1400);
    expect(ep).toMatch(/isConversationParticipant/);
    expect(ep).toMatch(/403/);
    expect(ep).toMatch(/markMessagesAsRead/);
  });
  it("only INCOMING unread messages are marked read (sender's own are excluded), idempotently", () => {
    const fn = storage.slice(storage.indexOf('async markMessagesAsRead'));
    expect(fn.slice(0, 400)).toMatch(/sender_id\} != \$\{userId\}/);
    expect(fn.slice(0, 400)).toMatch(/isNull\(messages\.read_at\)/);
    expect(fn.slice(0, 400)).toMatch(/read_at: new Date\(\)/);
  });
  it('unread count is derived from read_at, scoped to the recipient', () => {
    // the conversation-list unread query filters sender != me AND read_at IS NULL
    expect(storage).toMatch(/sender_id\} != \$\{userId\}[\s\S]{0,80}isNull\(messages\.read_at\)/);
  });
});

// ─────────────────────────── P2 — PUBLIC IDENTITY PRIVACY ───────────────────────────
describe('P2 public identity never derives from email', () => {
  it('safeDisplayName never returns an email fragment', () => {
    expect(safeDisplayName({ full_name: 'Jane Doe', username: 'jd' })).toBe('Jane Doe');
    expect(safeDisplayName({ full_name: null, username: 'jd' })).toBe('jd');
    expect(safeDisplayName({ full_name: null, username: null })).toBe('Member');
    expect(safeDisplayName({ full_name: null, username: null }, 'Unknown User')).toBe('Unknown User');
    // never falls back to an email even if one is somehow present on the object
    expect(safeDisplayName({ email: 'rich@x.com' } as any)).toBe('Member');
  });
  it('profile SEARCH no longer matches the email column (the exposure vector)', () => {
    const storage = read('server/storage.ts');
    const fn = storage.slice(storage.indexOf('async searchProfiles'), storage.indexOf('async searchProfiles') + 900);
    expect(fn).not.toMatch(/ilike\(profiles\.email/);
    expect(fn).toMatch(/ilike\(profiles\.username/); // still searches username/full_name
  });
  it('new server-created profiles use a neutral handle, not the email local-part', () => {
    const ep = read('server/lib/ensureProfile.ts');
    expect(ep).not.toMatch(/email\.split\('@'\)/);
    expect(ep).not.toMatch(/split_part/);
    expect(ep).toMatch(/neutralUsername/);
    expect(ep).toMatch(/`user_\$\{id\.replace\(\/-\/g, ''\)\.slice\(-8\)\}`/);
    expect(ep).toMatch(/input\.username\?\.trim\(\) \|\| neutralUsername/); // explicit username preserved
  });
  it('messaging participant display uses safeDisplayName (no email fallback)', () => {
    const thread = read('client/src/components/messaging/MessageThread.tsx');
    expect(thread).not.toMatch(/email\.split\('@'\)/);
    expect(thread).toMatch(/safeDisplayName/);
  });
  it('the conversation-messages endpoint does not return sender email to counterparties', () => {
    const routes = read('server/routes.ts');
    const block = routes.slice(routes.indexOf('senderIds.length > 0'), routes.indexOf('senderIds.length > 0') + 400);
    expect(block).not.toMatch(/email: profiles\.email/);
  });
  it('the prepared trigger migration reseeds the neutral handle (no email split)', () => {
    const mig = read('supabase/migrations/20260829000000_neutral_public_handle.sql');
    // executable SQL only — strip `--` comment lines (which document the old behavior)
    const sql = mig.split('\n').filter((l) => !l.trim().startsWith('--')).join('\n');
    expect(sql).toMatch(/handle_new_user/);
    expect(sql).toMatch(/'user_' \|\| right\(replace\(NEW\.id::text/);
    expect(sql).not.toMatch(/split_part\(NEW\.email/); // username never seeded from email
  });
});

// ─────────────────────────── P3 — FAVORITES + A11Y ───────────────────────────
describe('P3 favorites timestamp uses the SAVE time', () => {
  it('the API returns favorited_at (the favorite row time), not just listing.created_at', () => {
    const storage = read('server/storage.ts');
    expect(storage).toMatch(/favorited_at: favorites\.created_at/);
  });
  it('the client uses favorited_at for the "Saved …" timestamp', () => {
    const hook = read('client/src/hooks/useFavorites.ts');
    expect(hook).toMatch(/listing\.favorited_at \|\| listing\.created_at/);
  });
});

describe('P3 accessibility — favorite hearts + conversation rows', () => {
  it('favorite hearts expose an accessible name + toggle state', () => {
    const grid = read('client/src/components/ListingsGrid.tsx');
    const detail = read('client/src/pages/ListingDetail.tsx');
    const opt = read('client/src/components/listings/OptimizedListingCard.tsx');
    for (const src of [grid, detail, opt]) {
      expect(src).toMatch(/aria-label=\{is[A-Za-z]+ \? 'Remove from favorites' : 'Save to favorites'\}/);
      expect(src).toMatch(/aria-pressed=\{is[A-Za-z]+\}/);
    }
    // Favorites list heart is always a remove action
    expect(read('client/src/components/favorites/FavoritesList.tsx')).toMatch(/aria-label="Remove from favorites"/);
  });
  it('conversation rows get a safe accessible name (never email)', () => {
    const inbox = read('client/src/components/messaging/MessageInbox.tsx');
    expect(inbox).toMatch(/aria-label=\{`Conversation with \$\{safeDisplayName\(conversation\.other_user/);
    expect(inbox).not.toMatch(/email/i);
  });
});

// ─────────────────────────── P4 — PRICE CONTRACT (POST == PUT) ───────────────────────────
describe('P4 listing price contract is canonical + consistent for POST and PUT', () => {
  const POST = insertDogListingSchema;
  const PUT = insertDogListingSchema.partial();
  const base = { dog_name: 'Rex', breed: 'Mixed Breed', age: 8, user_id: '11111111-1111-1111-1111-111111111111' };
  it('POST + PUT accept a numeric price and normalize to the decimal string', () => {
    expect((POST.parse({ ...base, price: 1 }) as any).price).toBe('1');
    expect((PUT.parse({ price: 1 }) as any).price).toBe('1');
  });
  it('POST + PUT accept a numeric string', () => {
    expect(POST.safeParse({ ...base, price: '2.5' }).success).toBe(true);
    expect(PUT.safeParse({ price: '2.5' }).success).toBe(true);
  });
  it('POST + PUT reject negative, malformed, NaN, and Infinity', () => {
    for (const bad of [-1, 'abc', NaN, Infinity, -Infinity]) {
      expect(POST.safeParse({ ...base, price: bad }).success, `POST price=${bad}`).toBe(false);
      expect(PUT.safeParse({ price: bad }).success, `PUT price=${bad}`).toBe(false);
    }
  });
});
