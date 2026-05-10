/**
 * Playwright uses `PLAYWRIGHT_BASE_URL` (see playwright.config.ts) for staging vs local.
 * Defaults to http://127.0.0.1:5001 when unset.
 */
export const E2E_BASE_URL = process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:5001';

/** Primary verified test account */
export const E2E_EMAIL = process.env.E2E_EMAIL?.trim();
export const E2E_PASSWORD = process.env.E2E_PASSWORD?.trim();
export const hasPrimaryCredentials = Boolean(E2E_EMAIL && E2E_PASSWORD);

/** Optional: second user (UUID) for messaging / follow notification tests */
export const E2E_PEER_USER_ID = process.env.E2E_PEER_USER_ID?.trim();

/** Optional: second account to receive follow notifications */
export const E2E_PEER_EMAIL = process.env.E2E_PEER_EMAIL?.trim();
export const E2E_PEER_PASSWORD = process.env.E2E_PEER_PASSWORD?.trim();
export const hasPeerCredentials = Boolean(E2E_PEER_EMAIL && E2E_PEER_PASSWORD && E2E_PEER_USER_ID);
