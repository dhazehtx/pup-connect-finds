import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

/**
 * PAWS PRODUCTION CERTIFICATION — real two-user marketplace journey.
 *
 * Two INDEPENDENT owner-created TEST accounts, each in its own isolated browser
 * context (no session bleed), prove the marketplace works between a seller and a
 * buyer: listing creation (real photo upload) → discovery → detail → favorites →
 * two-way messaging → authorization/isolation → commerce boundary.
 *
 * SELF-SKIPS unless CERT_BUYER_EMAIL/PASSWORD + CERT_SELLER_EMAIL/PASSWORD are set
 * (never hardcoded). Runs ONCE on the desktop-1280 project (the journey is a
 * single serial flow that creates real data — running it per-viewport would
 * duplicate listings/messages).
 *
 * Data marker: every artifact this run creates carries `CERT-<timestamp>` so it
 * is distinguishable from real marketplace data. Evidence is captured BEFORE the
 * afterAll cleanup soft-deletes the listing.
 *
 * Run (owner):
 *   set -a; source .env.local; set +a
 *   npx playwright test --config playwright.cert.config.ts marketplace
 */

const BASE = process.env.CERT_BASE_URL ?? 'https://petadoptionwebservices.com';
const BUYER_EMAIL = process.env.CERT_BUYER_EMAIL;
const BUYER_PASSWORD = process.env.CERT_BUYER_PASSWORD;
const SELLER_EMAIL = process.env.CERT_SELLER_EMAIL;
const SELLER_PASSWORD = process.env.CERT_SELLER_PASSWORD;
const CREDS_OK = !!(BUYER_EMAIL && BUYER_PASSWORD && SELLER_EMAIL && SELLER_PASSWORD);
const RUN_PROJECT = 'desktop-1280';

// A stable marker for this run. Date.now() is fine in Playwright specs.
const MARKER = `CERT-${Date.now()}`;
const listing = {
  name: `CertPup ${MARKER}`,
  breed: 'Poodle',
  age: '8',
  price: '1234',
  description: `Certification TEST listing ${MARKER} — safe to delete.`,
};
const priceDisplay = `$${Number(listing.price).toLocaleString()}`; // "$1,234"

const authH = (token: string) => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });

/** Sign in through the real /auth UI; resolve once we've left /auth. */
async function signIn(page: Page, email: string, password: string) {
  await page.goto('/auth', { waitUntil: 'domcontentloaded' });
  await page.locator('input[type="email"], input[name="email"]').first().fill(email);
  await page.locator('input[type="password"], input[name="password"]').first().fill(password);
  await page.getByRole('button', { name: /sign in|log in/i }).first().click();
  await expect.poll(() => page.url(), { timeout: 30_000 }).not.toMatch(/\/auth(\?|$)/);
}

/** Pull the Supabase access token from localStorage for authoritative API checks. */
async function getToken(page: Page): Promise<string> {
  const t = await page.evaluate(() => {
    for (const k of Object.keys(localStorage)) {
      if (/^sb-.*-auth-token$/.test(k)) {
        try {
          const v = JSON.parse(localStorage.getItem(k) || 'null');
          return v?.access_token || v?.currentSession?.access_token || (Array.isArray(v) ? v[0]?.access_token : null);
        } catch { /* ignore */ }
      }
    }
    return null;
  });
  expect(t, 'expected a Supabase access token after sign-in').toBeTruthy();
  return t as string;
}

async function profileId(req: APIRequestContext, token: string): Promise<string> {
  const res = await req.get(`${BASE}/api/profiles/me`, { headers: authH(token) });
  expect(res.status(), 'GET /api/profiles/me').toBe(200);
  const body = await res.json();
  expect(body?.id).toBeTruthy();
  return body.id as string;
}

test.describe.serial('Marketplace certification (two independent users)', () => {
  let sellerPage: Page, buyerPage: Page;
  let sellerToken = '', buyerToken = '', sellerId = '', buyerId = '';
  let listingId = '', listingPath = '', conversationPath = '';
  const buyerMsg = `Buyer→Seller ${MARKER}: is this pup still available?`;
  const sellerReply = `Seller→Buyer ${MARKER}: yes, still available!`;

  // Gate: only the desktop-1280 project, only with credentials. This is a
  // run-once gate, NOT feature-hiding — feature checks below FAIL, never skip.
  test.beforeEach(async ({}, testInfo) => {
    test.skip(!CREDS_OK, 'CERT_* credentials not set — owner test accounts required');
    test.skip(testInfo.project.name !== RUN_PROJECT, `marketplace cert runs once on ${RUN_PROJECT}`);
  });

  test.beforeAll(async ({ browser }, testInfo) => {
    if (!CREDS_OK || testInfo.project.name !== RUN_PROJECT) return; // don't sign in for skipped projects
    const sellerCtx = await browser.newContext();
    const buyerCtx = await browser.newContext();
    sellerPage = await sellerCtx.newPage();
    buyerPage = await buyerCtx.newPage();
    await signIn(sellerPage, SELLER_EMAIL!, SELLER_PASSWORD!);
    await signIn(buyerPage, BUYER_EMAIL!, BUYER_PASSWORD!);
    sellerToken = await getToken(sellerPage);
    buyerToken = await getToken(buyerPage);
    sellerId = await profileId(sellerPage.request, sellerToken);
    buyerId = await profileId(buyerPage.request, buyerToken);
    expect(sellerId, 'buyer and seller must be different identities').not.toBe(buyerId);
  });

  test.afterAll(async () => {
    // Cleanup AFTER all evidence is captured: soft-delete the cert listing.
    // Messages + the conversation are intentionally LEFT as certification data
    // (marked with MARKER) — deleting them would harm auditability of the run.
    if (listingId && sellerToken) {
      await sellerPage.request.delete(`${BASE}/api/listings/${listingId}`, { headers: authH(sellerToken) }).catch(() => {});
    }
    await sellerPage?.context().close().catch(() => {});
    await buyerPage?.context().close().catch(() => {});
  });

  // ─────────────────────────── A. SELLER ───────────────────────────
  test('A1 seller creates a listing through the real UI (with photo upload)', async () => {
    await sellerPage.goto('/create-listing', { waitUntil: 'domcontentloaded' });
    await sellerPage.getByPlaceholder('e.g., Buddy').fill(listing.name);
    // Breed is a shadcn Select — open by its placeholder text, choose the option.
    await sellerPage.locator('button:has-text("Select a breed")').first().click();
    await sellerPage.getByRole('option', { name: listing.breed }).first().click();
    await sellerPage.getByPlaceholder('e.g., 8').fill(listing.age);
    await sellerPage.getByPlaceholder('e.g., 1200').fill(listing.price);
    await sellerPage.getByPlaceholder('Tell us about your dog...').fill(listing.description);
    // Photo is client-mandatory — upload a safe repo fixture via the hidden input.
    // The "Post Listing" button only enables once the signed upload commits.
    await sellerPage.setInputFiles('#unified-media-upload', 'e2e/fixtures/cert-listing.jpg');
    const postBtn = sellerPage.getByRole('button', { name: /post listing/i });
    await expect(postBtn, 'Post Listing enables only after a photo upload commits').toBeEnabled({ timeout: 45_000 });
    await postBtn.click();
    // Success = the toast, then the page switches to the in-page "My Listings" tab
    // (MyListingsManager) which renders the new card by dog_name.
    await expect(sellerPage.getByText(/created successfully|Success!/i)).toBeVisible({ timeout: 20_000 });
    await expect(sellerPage.getByRole('heading', { level: 3, name: listing.name })).toBeVisible({ timeout: 20_000 });

    // Resolve the authoritative listing id (used by later steps) via the owner API.
    const res = await sellerPage.request.get(`${BASE}/api/listings/user/${sellerId}`, { headers: authH(sellerToken) });
    expect(res.status()).toBe(200);
    const rows = await res.json();
    const mine = (Array.isArray(rows) ? rows : rows?.listings || []).find((l: any) => l.dog_name === listing.name);
    expect(mine?.id, 'created listing must be retrievable by the owner').toBeTruthy();
    listingId = mine.id;
    listingPath = `/listing/${listingId}`;
    expect(String(mine.seller_id || mine.user_id)).toBe(sellerId); // owner is the seller, server-forced
  });

  test('A2 listing persists after reload and is owner-visible', async () => {
    expect(listingId, 'A1 must have created a listing').toBeTruthy();
    await sellerPage.goto(listingPath, { waitUntil: 'domcontentloaded' });
    await expect(sellerPage.getByRole('heading', { name: `Meet ${listing.name}` })).toBeVisible({ timeout: 20_000 });
  });

  test('A3 seller detail shows the values it created', async () => {
    await sellerPage.goto(listingPath, { waitUntil: 'domcontentloaded' });
    await expect(sellerPage.getByRole('heading', { name: `Meet ${listing.name}` })).toBeVisible();
    await expect(sellerPage.getByText(listing.breed).first()).toBeVisible();
    await expect(sellerPage.getByText(priceDisplay).first()).toBeVisible();
    await expect(sellerPage.getByText(listing.description).first()).toBeVisible();
  });

  test('A4 edit: UI edit is NOT IMPLEMENTED — authoritative API edit persists', async () => {
    // The "Edit" buttons on both my-listings surfaces are dead stubs (no onClick).
    test.info().annotations.push({
      type: 'NOT IMPLEMENTED',
      description: 'Listing edit has no UI (dead Edit buttons). Verifying the authoritative PUT /api/listings/:id path instead.',
    });
    const newDesc = `${listing.description} [edited ${MARKER}]`;
    const put = await sellerPage.request.put(`${BASE}/api/listings/${listingId}`, {
      headers: authH(sellerToken),
      data: { description: newDesc },
    });
    expect(put.status(), 'owner PUT should succeed').toBe(200);
    listing.description = newDesc; // keep buyer read-back consistent
    await sellerPage.goto(listingPath, { waitUntil: 'domcontentloaded' });
    await expect(sellerPage.getByText(newDesc).first()).toBeVisible({ timeout: 15_000 });
  });

  // ─────────────────────────── B. BUYER ───────────────────────────
  test('B1 buyer discovers the seller listing via search', async () => {
    await buyerPage.goto('/explore', { waitUntil: 'domcontentloaded' });
    const search = buyerPage.getByRole('search').getByRole('textbox');
    await search.fill(listing.name);
    await buyerPage.getByRole('option', { name: new RegExp(listing.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) })
      .first().click({ timeout: 20_000 });
    await expect(buyerPage).toHaveURL(/\/listing\/.+/, { timeout: 20_000 });
    expect(new URL(buyerPage.url()).pathname).toBe(listingPath);
  });

  test('B2 buyer detail read-back matches what the seller created', async () => {
    await buyerPage.goto(listingPath, { waitUntil: 'domcontentloaded' });
    await expect(buyerPage.getByRole('heading', { name: `Meet ${listing.name}` })).toBeVisible({ timeout: 20_000 });
    await expect(buyerPage.getByText(listing.breed).first()).toBeVisible();
    await expect(buyerPage.getByText(priceDisplay).first()).toBeVisible();
    await expect(buyerPage.getByText(listing.description).first()).toBeVisible();
  });

  test('B3 buyer favorites the listing and it persists across reload', async () => {
    await buyerPage.goto(listingPath, { waitUntil: 'domcontentloaded' });
    const heart = buyerPage.locator('button:has(svg.lucide-heart)').first();
    await expect(heart, 'favorite control must exist on the detail page').toBeVisible({ timeout: 15_000 });
    await heart.click();
    // Confirm the write landed, then reload and assert the PERSISTED filled state.
    await buyerPage.waitForTimeout(1200);
    await buyerPage.reload({ waitUntil: 'domcontentloaded' });
    await expect(buyerPage.locator('svg.lucide-heart[fill="#ef4444"]').first())
      .toBeVisible({ timeout: 15_000 });
  });

  test('B4 cart is NOT APPLICABLE to dog listings (Contact Seller is the path)', async () => {
    test.info().annotations.push({
      type: 'NOT APPLICABLE',
      description: 'Dog listings are not cart-able (no add-to-cart/buy/checkout on the listing UI). Cart is store/Pup-Box only; the dog purchase path is Contact Seller.',
    });
    await buyerPage.goto(listingPath, { waitUntil: 'domcontentloaded' });
    await expect(buyerPage.getByRole('button', { name: 'Contact Seller' })).toBeVisible();
    await expect(buyerPage.getByRole('button', { name: /add to cart|buy now|proceed to checkout/i })).toHaveCount(0);
  });

  // ─────────────────────── C. BUYER ↔ SELLER MESSAGING ───────────────────────
  test('C1 buyer contacts seller and sends a CERT message', async () => {
    await buyerPage.goto(listingPath, { waitUntil: 'domcontentloaded' });
    await buyerPage.getByRole('button', { name: 'Contact Seller' }).click();
    await expect(buyerPage).toHaveURL(/\/messages\/.+/, { timeout: 20_000 });
    conversationPath = new URL(buyerPage.url()).pathname;
    const composer = buyerPage.locator('input[placeholder="Type a message..."]');
    await composer.fill(buyerMsg);
    await composer.press('Enter');
    await expect(buyerPage.getByText(buyerMsg)).toBeVisible({ timeout: 15_000 });
  });

  test('C2 seller sees the conversation + buyer message, correctly attributed', async () => {
    expect(conversationPath, 'C1 must have created a conversation').toBeTruthy();
    const convId = conversationPath.split('/').pop()!;
    // Authoritative attribution: seller (a participant) reads the thread; the
    // message exists and its sender_id is the BUYER, not the seller.
    const res = await sellerPage.request.get(`${BASE}/api/messaging/conversations/${convId}/messages`, {
      headers: authH(sellerToken),
    });
    expect(res.status(), 'seller is a participant → 200').toBe(200);
    const msgs = await res.json();
    const arr = Array.isArray(msgs) ? msgs : msgs?.messages || [];
    const found = arr.find((m: any) => (m.content ?? m.body) === buyerMsg);
    expect(found, 'buyer message must be in the thread').toBeTruthy();
    expect(String(found.sender_id)).toBe(buyerId); // attribution: from the buyer
    expect(String(found.sender_id)).not.toBe(sellerId);
    // And the seller can see it in the UI thread.
    await sellerPage.goto(conversationPath, { waitUntil: 'domcontentloaded' });
    await expect(sellerPage.getByText(buyerMsg)).toBeVisible({ timeout: 15_000 });
  });

  test('C3 seller replies and the buyer sees the reply', async () => {
    await sellerPage.goto(conversationPath, { waitUntil: 'domcontentloaded' });
    const composer = sellerPage.locator('input[placeholder="Type a message..."]');
    await composer.fill(sellerReply);
    await composer.press('Enter');
    await expect(sellerPage.getByText(sellerReply)).toBeVisible({ timeout: 15_000 });
    // Buyer reloads the thread and sees the reply (no polling — reload is expected).
    await buyerPage.goto(conversationPath, { waitUntil: 'domcontentloaded' });
    await expect(buyerPage.getByText(sellerReply)).toBeVisible({ timeout: 15_000 });
  });

  // ─────────────────────── D. AUTHORIZATION / ISOLATION ───────────────────────
  test('D1 buyer CANNOT edit or delete the seller listing (even with spoofed body)', async () => {
    const spoofPut = await buyerPage.request.put(`${BASE}/api/listings/${listingId}`, {
      headers: authH(buyerToken),
      data: { description: 'HIJACKED', seller_id: buyerId, user_id: buyerId },
    });
    expect([401, 403], `buyer PUT must be denied (got ${spoofPut.status()})`).toContain(spoofPut.status());
    const del = await buyerPage.request.delete(`${BASE}/api/listings/${listingId}`, { headers: authH(buyerToken) });
    expect([401, 403], `buyer DELETE must be denied (got ${del.status()})`).toContain(del.status());
    // Listing is intact + unchanged (still the seller's edited description).
    await buyerPage.goto(listingPath, { waitUntil: 'domcontentloaded' });
    await expect(buyerPage.getByRole('heading', { name: `Meet ${listing.name}` })).toBeVisible();
    await expect(buyerPage.getByText('HIJACKED')).toHaveCount(0);
  });

  test('D2 a conversation is scoped to its participants (no cross-account leak)', async () => {
    const convId = conversationPath.split('/').pop()!;
    // Both buyer and seller ARE participants → 200 for each.
    const asBuyer = await buyerPage.request.get(`${BASE}/api/messaging/conversations/${convId}/messages`, { headers: authH(buyerToken) });
    const asSeller = await sellerPage.request.get(`${BASE}/api/messaging/conversations/${convId}/messages`, { headers: authH(sellerToken) });
    expect(asBuyer.status()).toBe(200);
    expect(asSeller.status()).toBe(200);
    // An unauthenticated request must NOT read the thread.
    const anon = await buyerPage.request.get(`${BASE}/api/messaging/conversations/${convId}/messages`, { headers: { 'Content-Type': 'application/json' } });
    expect([401, 403], `anon read must be denied (got ${anon.status()})`).toContain(anon.status());
  });

  test('D3 neither test account has admin access', async () => {
    // Authoritative: an admin-only endpoint returns 401/403 for a non-admin token.
    for (const [who, token] of [['seller', sellerToken], ['buyer', buyerToken]] as const) {
      const res = await sellerPage.request.get(`${BASE}/api/admin/stripe-events`, { headers: authH(token) });
      expect([401, 403], `${who} must not have admin API access (got ${res.status()})`).toContain(res.status());
    }
    // UI: seller visiting /admin is not left on a functioning admin dashboard.
    await sellerPage.goto('/admin', { waitUntil: 'domcontentloaded' });
    await sellerPage.waitForTimeout(2500);
    const onAdmin = new URL(sellerPage.url()).pathname === '/admin';
    if (onAdmin) {
      // If not redirected, it must show an access-denied state, not admin tools.
      await expect(sellerPage.getByText(/access denied|not authorized|unauthorized|permission/i).first())
        .toBeVisible({ timeout: 10_000 });
    }
  });

  // ─────────────────────────── E. COMMERCE ───────────────────────────
  test('E1 dog listings have no on-platform checkout — Contact Seller only (N/A)', async () => {
    test.info().annotations.push({
      type: 'NOT APPLICABLE',
      description: 'No buyer-facing purchase/escrow/checkout exists for dog listings (Buy/Reserve/Deposit/Checkout absent; escrow /api/deals is admin-only). The certifiable purchase action is Contact Seller. Stripe TEST checkout applies only to store/Pup-Box products.',
    });
    await buyerPage.goto(listingPath, { waitUntil: 'domcontentloaded' });
    await expect(buyerPage.getByRole('button', { name: /buy now|reserve|deposit|checkout|proceed to/i })).toHaveCount(0);
    await expect(buyerPage.getByRole('button', { name: 'Contact Seller' })).toBeVisible();
  });

  test('E2 no LIVE Stripe surface is used on the marketplace journey', async () => {
    const liveHits: string[] = [];
    buyerPage.on('request', (r) => { if (/pk_live_|checkout\.stripe\.com\/.*live/.test(r.url())) liveHits.push(r.url()); });
    await buyerPage.goto('/explore', { waitUntil: 'domcontentloaded' });
    await buyerPage.goto(listingPath, { waitUntil: 'domcontentloaded' });
    const domHasLive = await buyerPage.evaluate(() => document.documentElement.innerHTML.includes('pk_live_'));
    expect(domHasLive, 'no pk_live_ publishable key on the marketplace pages').toBeFalsy();
    expect(liveHits, `no live Stripe surface contacted: ${liveHits.join(', ')}`).toEqual([]);
  });
});
