/**
 * Launch security-hardening regressions. Each block pins a confirmed P0/P1/P2 fix
 * from the pre-launch audit so it cannot silently regress. Source-guard style
 * (like the checkpoint and p0 tests): deterministic, no DB/Stripe/network.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');

describe('P0-1/P1-3/P2-6 — the unauthenticated legacy profile routes are removed', () => {
  const routes = read('server/routes.ts');
  it('no legacy PUT/GET /api/profile/:id or POST /api/profiles route handlers exist', () => {
    expect(routes).not.toMatch(/app\.put\(\s*["']\/api\/profile\/:id["']/);
    expect(routes).not.toMatch(/app\.get\(\s*["']\/api\/profile\/:id["']/);
    expect(routes).not.toMatch(/app\.post\(\s*["']\/api\/profiles["']\s*,\s*async/);
  });
  it('does not call updateProfile/createProfile with an unfiltered insertProfileSchema in routes.ts', () => {
    expect(routes).not.toMatch(/insertProfileSchema\.partial\(\)\.parse/);
    expect(routes).not.toMatch(/insertProfileSchema\.parse\(req\.body\)/);
  });
});

describe('P0-2/P3-14 — authorization fields are DB-authoritative, not from user_metadata', () => {
  const auth = read('server/middleware/auth.ts');
  const deals = read('server/routes/deals.ts');

  it('authMiddleware overrides is_admin/isAdmin/role from the profile AFTER the metadata spread', () => {
    const spreadIdx = auth.indexOf('...(user.user_metadata');
    const isAdminIdx = auth.indexOf('is_admin: Boolean(profile?.is_admin)');
    const roleIdx = auth.indexOf("role: (profile?.role as string) ?? 'user'");
    const isAdminCamelIdx = auth.indexOf('isAdmin: Boolean(profile?.is_admin)');
    expect(spreadIdx).toBeGreaterThan(-1);
    expect(isAdminIdx).toBeGreaterThan(spreadIdx);
    expect(roleIdx).toBeGreaterThan(spreadIdx);
    expect(isAdminCamelIdx).toBeGreaterThan(spreadIdx);
  });

  it('escrow/deals admin checks use req.user.is_admin, never the spoofable role string', () => {
    expect(deals).not.toMatch(/req\.user\?\.role === ["']admin["']/);
    expect(deals).toMatch(/req\.user\?\.is_admin === true/);
  });
});

describe('P1-4 — mock ID/background-check webhooks are blocked in production', () => {
  const onboarding = read('server/routes/providers/onboarding.ts');
  it('checks/webhook and id/webhook are guarded by a prod block', () => {
    expect(onboarding).toMatch(/blockMockWebhookInProd/);
    expect(onboarding).toMatch(/process\.env\.NODE_ENV === ['"]production['"]/);
    expect(onboarding).toMatch(/router\.post\('\/checks\/webhook',\s*blockMockWebhookInProd/);
    expect(onboarding).toMatch(/router\.post\('\/id\/webhook',\s*blockMockWebhookInProd/);
  });
});

describe('P1-5 — Socket.IO conversation rooms enforce participant authorization', () => {
  const socket = read('server/socket.ts');
  it('join:conversation verifies isConversationParticipant before joining', () => {
    expect(socket).toMatch(/join:conversation['"],\s*async/);
    expect(socket).toMatch(/storage\.isConversationParticipant\(conversationId, userId\)/);
    expect(socket).toMatch(/join:denied/);
  });
  it('relay handlers require actual room membership (no cross-conversation injection)', () => {
    expect(socket).toMatch(/inConversationRoom\(socket,/);
    // message:new must guard before broadcasting
    const msgIdx = socket.indexOf("socket.on('message:new'");
    const guardIdx = socket.indexOf('inConversationRoom(socket, data?.conversationId)', msgIdx);
    const emitIdx = socket.indexOf("socket.to(`conv:${data.conversationId}`).emit('message:new'", msgIdx);
    expect(guardIdx).toBeGreaterThan(msgIdx);
    expect(emitIdx).toBeGreaterThan(guardIdx);
  });
});

describe('P2-7 — POST /api/notifications requires auth and forces a server-authoritative sender', () => {
  const notif = read('server/routes/notifications.ts');
  it('rejects unauthenticated callers and overrides fromUserId', () => {
    const postIdx = notif.indexOf('router.post("/"');
    expect(notif.indexOf('req.isAuthenticated', postIdx)).toBeGreaterThan(postIdx);
    expect(notif.indexOf('validatedData.fromUserId = (req as any).user!.id', postIdx)).toBeGreaterThan(postIdx);
  });
});
