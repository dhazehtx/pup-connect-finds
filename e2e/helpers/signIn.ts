import type { Page } from '@playwright/test';

/**
 * Sign in via /auth using the same controls as master-flow.spec.ts.
 */
export async function signInWithEmailPassword(
  page: Page,
  email: string,
  password: string,
  options?: { nextPath?: string },
): Promise<void> {
  const q = options?.nextPath ? `?next=${encodeURIComponent(options.nextPath)}` : '';
  await page.goto(`/auth${q}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Sign In' }).first().click();
  await page.getByTestId('auth-email').fill(email);
  await page.getByTestId('auth-password').fill(password);
  await page.getByTestId('auth-submit').click();
  await page.waitForURL(/\/(explore|profile|marketplace|messages|home)/, { timeout: 45_000 });
}

/** Read Supabase session access_token from localStorage (browser context). */
export async function getSupabaseAccessToken(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const keys = Object.keys(localStorage);
    const authKey = keys.find((k) => k.includes('auth-token') && k.startsWith('sb-'));
    if (!authKey) return null;
    try {
      const raw = localStorage.getItem(authKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { access_token?: string };
      return parsed.access_token ?? null;
    } catch {
      return null;
    }
  });
}
