import { test } from '@playwright/test';
import 'dotenv/config';
import { runPupBoxMediumStripeCheckout } from './helpers/pupboxMediumStripeCheckout';

/** P0 checkout path (Stripe test mode) — also listed in docs/P0_CRITICAL_FLOWS.md */
test.describe('Pup Box Medium — Stripe checkout E2E', () => {
  test('can purchase medium subscription via UI and mark order paid', async ({ page }) => {
    await runPupBoxMediumStripeCheckout(page);
  });
});
