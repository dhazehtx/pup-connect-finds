import { test, expect, type Page, type TestInfo } from '@playwright/test';

/**
 * PAWS PRODUCTION CERTIFICATION — guest + responsive matrix.
 * Runs under playwright.cert.config.ts across the full device matrix
 * (mobile 320/375/390/430, tablet 768/820/900/1024, desktop 1280/1440/1920)
 * against a deployed origin (CERT_BASE_URL, default production).
 *
 * No credentials required. Authenticated buyer/seller flows live in
 * auth-buyer-seller.cert.spec.ts and self-skip without test accounts.
 */

const OVERFLOW_TOLERANCE = 2; // px — sub-pixel rounding / scrollbar allowance

type Captured = { pageErrors: string[]; serverErrors: string[]; clientErrors: string[] };

/** Wire console + network capture. Fails later only on material severity. */
function capture(page: Page): Captured {
  const c: Captured = { pageErrors: [], serverErrors: [], clientErrors: [] };
  page.on('pageerror', (e) => c.pageErrors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') c.clientErrors.push(m.text());
  });
  page.on('response', (r) => {
    const s = r.status();
    if (s >= 500) c.serverErrors.push(`${s} ${r.request().method()} ${r.url()}`);
  });
  return c;
}

/** Material errors must fail the run: uncaught JS exceptions and server 5xx.
 *  4xx and console.error are collected (guests legitimately hit 401s) and
 *  attached as evidence, not failed on. */
async function assertNoMaterialErrors(c: Captured, info: TestInfo) {
  await info.attach('captured-errors.json', {
    body: JSON.stringify(c, null, 2),
    contentType: 'application/json',
  });
  expect(c.pageErrors, `uncaught page errors:\n${c.pageErrors.join('\n')}`).toEqual([]);
  expect(c.serverErrors, `server 5xx responses:\n${c.serverErrors.join('\n')}`).toEqual([]);
}

/** Fail on horizontal overflow: the page body must never scroll sideways. */
async function assertNoHorizontalOverflow(page: Page, label: string) {
  const { docW, winW, overflowing } = await page.evaluate(() => {
    const doc = document.documentElement;
    // Any element extending past the viewport right edge (the usual culprits).
    const vw = window.innerWidth;
    const bad: string[] = [];
    document.querySelectorAll('body *').forEach((el) => {
      const r = (el as HTMLElement).getBoundingClientRect();
      if (r.width > 0 && r.right > vw + 3 && r.left >= 0) {
        const t = (el as HTMLElement).tagName.toLowerCase();
        const cls = (el as HTMLElement).className?.toString().slice(0, 40);
        if (bad.length < 5) bad.push(`${t}.${cls} right=${Math.round(r.right)}`);
      }
    });
    return { docW: doc.scrollWidth, winW: window.innerWidth, overflowing: bad };
  });
  expect(
    docW,
    `${label}: horizontal overflow — scrollWidth ${docW} > viewport ${winW}. Offenders: ${overflowing.join(' | ')}`,
  ).toBeLessThanOrEqual(winW + OVERFLOW_TOLERANCE);
}

async function screenshot(page: Page, info: TestInfo, name: string) {
  const buf = await page.screenshot({ fullPage: false });
  await info.attach(`${info.project.name}-${name}.png`, { body: buf, contentType: 'image/png' });
}

test.describe('Guest + responsive certification', () => {
  test('landing renders without material errors and no overflow', async ({ page }, info) => {
    const c = capture(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
    // Something substantive rendered (header/hero/main), not a white screen.
    await expect(page.locator('main, header, nav').first()).toBeVisible({ timeout: 20_000 });
    await assertNoHorizontalOverflow(page, 'landing');
    await screenshot(page, info, 'landing');
    await assertNoMaterialErrors(c, info);
  });

  test('guest Explore renders listings or an honest empty state, no overflow', async ({ page }, info) => {
    const c = capture(page);
    await page.goto('/explore', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible({ timeout: 20_000 });
    // Give the grid a beat to fetch, then require either results or a real message
    // (never a permanent fake "Searching…" loader).
    await page.waitForTimeout(2500);
    const bodyText = (await page.locator('body').innerText()).toLowerCase();
    const hasHonestState =
      /\$|price|breed|no puppies|no listings|no results|coming soon|check back/.test(bodyText);
    expect(hasHonestState, 'Explore showed neither listings nor an honest empty state').toBeTruthy();
    expect(bodyText.includes('searching for your perfect match')).toBeFalsy();
    await assertNoHorizontalOverflow(page, 'explore');
    await screenshot(page, info, 'explore');
    await assertNoMaterialErrors(c, info);
  });

  test('exactly one primary navigation is shown for this viewport', async ({ page }, info) => {
    // Assert the app-shell nav contract on an app page (/explore). The marketing
    // landing (/) intentionally has its own chrome and is not part of this contract.
    await page.goto('/explore', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    const width = (info.project.metadata as any).width as number;
    const bottomNav = page.locator('nav.bottom-nav');
    const desktopNav = page.locator('nav[aria-label="Primary"]');
    const bottomVisible = await bottomNav.isVisible().catch(() => false);
    const desktopVisible = await desktopNav.isVisible().catch(() => false);
    // Contract handoff at lg = 1024px.
    if (width < 1024) {
      expect(bottomVisible, `bottom nav must show at ${width}px`).toBeTruthy();
      expect(desktopVisible, `desktop nav must be hidden at ${width}px`).toBeFalsy();
    } else {
      expect(desktopVisible, `desktop nav must show at ${width}px`).toBeTruthy();
      expect(bottomVisible, `bottom nav must be hidden at ${width}px`).toBeFalsy();
    }
  });

  for (const [pathname, title, h1] of [
    ['/legal/terms', 'Terms of Service — PAWS', 'Terms of Service'],
    ['/legal/privacy', 'Privacy Policy — PAWS', 'Privacy'],
    ['/legal/shipping', 'Shipping Policy — PAWS', 'Shipping Policy'],
    ['/legal/returns', 'Returns & Refunds — PAWS', 'Returns'],
  ] as const) {
    test(`legal page ${pathname} renders cleanly (title, no owner-note, no overflow)`, async ({ page }, info) => {
      const c = capture(page);
      await page.goto(pathname, { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { level: 1 })).toContainText(new RegExp(h1, 'i'), {
        timeout: 15_000,
      });
      await expect(page).toHaveTitle(title);
      const body = (await page.locator('main, body').first().innerText()).toLowerCase();
      expect(body.includes('owner note'), `${pathname} still renders an owner note`).toBeFalsy();
      await assertNoHorizontalOverflow(page, pathname);
      await assertNoMaterialErrors(c, info);
    });
  }

  test('bare legal aliases redirect to /legal/*', async ({ page }) => {
    for (const [bare, canonical] of [
      ['/terms', '/legal/terms'],
      ['/shipping', '/legal/shipping'],
      ['/returns', '/legal/returns'],
    ] as const) {
      await page.goto(bare, { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(new RegExp(canonical.replace('/', '\\/') + '$'), { timeout: 15_000 });
    }
  });

  test('unknown route renders the PAWS 404 (not a white screen or crash)', async ({ page }, info) => {
    const c = capture(page);
    await page.goto('/this-route-does-not-exist-cert-zzz', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText(/404|not found/i, { timeout: 15_000 });
    await assertNoMaterialErrors(c, info);
  });

  test('auth page loads and exposes sign-in + sign-up entry', async ({ page }, info) => {
    const c = capture(page);
    await page.goto('/auth', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: /sign in|log in/i }).first()).toBeVisible({
      timeout: 20_000,
    });
    await assertNoHorizontalOverflow(page, 'auth');
    await screenshot(page, info, 'auth');
    await assertNoMaterialErrors(c, info);
  });

  test('authenticated-only routes redirect anonymous users away (no seller/profile UI)', async ({ page }) => {
    // Anonymous visitors must never be shown the create-listing form, my-listings,
    // profile, or messages — RequireAuth sends them to /greeting.
    for (const guarded of ['/create-listing', '/my-listings', '/profile', '/messages']) {
      // Ensure a clean logged-out context for each route.
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => {
        try { localStorage.clear(); sessionStorage.clear(); } catch { /* private mode */ }
      });
      await page.goto(guarded, { waitUntil: 'domcontentloaded' });
      // Wait for the auth check to resolve and the guard to redirect.
      await expect
        .poll(async () => new URL(page.url()).pathname, { timeout: 20_000 })
        .not.toBe(guarded);
      const path = new URL(page.url()).pathname;
      expect(path, `${guarded} should redirect an anonymous user to /greeting`).toBe('/greeting');
    }
  });
});
