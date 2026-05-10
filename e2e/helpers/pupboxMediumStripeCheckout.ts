import { expect, type Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { Pool } from '@neondatabase/serverless';
import { v5 as uuidv5 } from 'uuid';

const PUPBOX_PRODUCT_NAMESPACE = 'c9b3f2a1-7d4e-5c6b-9a8f-1e2d3c4b5a6f';

export function pupBoxCartSlugToProductUuid(slug: string) {
  return uuidv5(slug, PUPBOX_PRODUCT_NAMESPACE);
}

export async function createTestUser(email: string, password: string) {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env');
  }

  const supabaseAdmin = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  const uniqueSuffix = `${Date.now()}`.slice(-10);
  const username = `e2e_pupbox_buyer_${uniqueSuffix}`;
  const fullName = `E2E Pup Box Buyer ${uniqueSuffix}`;
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      username,
      full_name: fullName,
    },
  });

  if (error) throw error;
  if (!data?.user?.id) throw new Error('createUser did not return user id');
  return data.user.id as string;
}

export async function getLatestOrderForUser(pool: Pool, userId: string) {
  const { rows } = await pool.query(
    `
    SELECT id, user_id, status, stripe_session_id, created_at
    FROM orders
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [userId],
  );
  return rows[0];
}

const STRIPE_TEST_CARD = {
  number: '4242 4242 4242 4242',
  exp: '12/34',
  cvc: '123',
};

/**
 * Full Pup Box Medium → cart → Stripe Checkout (test mode) → success page + DB assertions.
 */
export async function runPupBoxMediumStripeCheckout(page: Page): Promise<void> {
  const productSlug = 'pupbox-medium-subscription';
  const productId = pupBoxCartSlugToProductUuid(productSlug);

  const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  expect(dbUrl, 'NEON_DATABASE_URL/DATABASE_URL must be set').toBeTruthy();
  const pool = new Pool({ connectionString: dbUrl! });

  let preInventory: number | null = null;
  try {
    const { rows } = await pool.query('SELECT inventory_qty FROM products WHERE id = $1', [productId]);
    preInventory = rows[0]?.inventory_qty ?? null;
  } catch {
    preInventory = null;
  }

  const testEmail = `e2e-pupbox-${Date.now()}@mypup.dev`;
  const testPassword = 'TestPass123!';

  const userId = await createTestUser(testEmail, testPassword);

  await page.goto('/auth?next=/marketplace', { waitUntil: 'load' });
  await page.getByPlaceholder('Email').fill(testEmail);
  await page.getByPlaceholder('Password').fill(testPassword);
  const signInButton = page.locator('form').getByRole('button', { name: /Sign In/i });
  await expect(signInButton).toHaveCount(1);
  await signInButton.click();

  await page.waitForURL(/\/marketplace|\/explore/, { timeout: 30_000 });
  await page.goto('/marketplace', { waitUntil: 'load' });
  await page.waitForTimeout(1500);

  await page.getByRole('tab', { name: /Pup Box/i }).click();
  await expect(page.getByTestId('toggle-subscription-medium')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('button-add-to-cart-medium')).toBeVisible({ timeout: 30_000 });
  await page.getByTestId('button-add-to-cart-medium').click();

  await page.goto('/cart', { waitUntil: 'load' });
  await page.waitForURL(/\/cart/, { timeout: 30_000 });

  const checkoutResponsePromise = page.waitForResponse((resp) => {
    return resp.url().includes('/api/checkout/session') && resp.request().method() === 'POST';
  });
  await page.getByRole('button', { name: /Proceed to Checkout/i }).click();

  const checkoutResp = await checkoutResponsePromise;
  expect(checkoutResp.ok()).toBeTruthy();
  const checkoutJson = (await checkoutResp.json()) as { url?: string; message?: string };
  expect(checkoutJson.url, `Expected Stripe URL from /api/checkout/session, got: ${JSON.stringify(checkoutJson)}`).toBeTruthy();
  expect(checkoutJson.url).toMatch(/stripe\.com\/checkout|buy\.stripe\.com/i);

  await page.waitForURL(/stripe\.com\/checkout|buy\.stripe\.com/i, { timeout: 60_000 });

  const numberFrame = page.frameLocator('iframe[title*="card number"], iframe[name*="cardnumber"]');
  const expFrame = page.frameLocator('iframe[title*="expiration"], iframe[name*="exp"]');
  const cvcFrame = page.frameLocator('iframe[title*="CVC"], iframe[name*="cvc"]');

  await numberFrame.locator('input').fill(STRIPE_TEST_CARD.number);
  await expFrame.locator('input').fill(STRIPE_TEST_CARD.exp);
  await cvcFrame.locator('input').fill(STRIPE_TEST_CARD.cvc);

  const payButton = page.getByRole('button', { name: /Pay|Complete payment/i }).first();
  await payButton.click();

  await page.waitForURL(/\/checkout\/success/i, { timeout: 120_000 });
  await expect(page.getByText('Payment Successful!')).toBeVisible({ timeout: 30_000 });

  const url = page.url();
  const sessionId = new URL(url).searchParams.get('session_id');
  expect(sessionId, 'session_id should exist in success URL').toBeTruthy();

  const statusResp = await page.request.get(`/api/checkout/status?session_id=${sessionId}`);
  expect(statusResp.ok()).toBeTruthy();
  const statusJson = await statusResp.json();
  expect(statusJson.status, `Expected order status "paid", got: ${statusJson.status}`).toBe('paid');

  const latestOrder = await getLatestOrderForUser(pool, userId);
  expect(latestOrder.status).toBe('paid');

  const { rows: itemRows } = await pool.query(
    `
    SELECT oi.product_id, oi.qty
    FROM order_items oi
    WHERE oi.order_id = $1
    `,
    [latestOrder.id],
  );
  expect(itemRows.length).toBeGreaterThanOrEqual(1);
  expect(
    itemRows.some((r: { product_id: string }) => r.product_id === productId),
    'Expected order_items.product_id to match Pup Box product uuid',
  ).toBeTruthy();

  const { rows: postInvRows } = await pool.query('SELECT inventory_qty FROM products WHERE id = $1', [productId]);
  const postInventory = postInvRows[0]?.inventory_qty ?? null;
  if (preInventory !== null && postInventory !== null) {
    expect(postInventory).toBe(preInventory - 1);
  }
}
