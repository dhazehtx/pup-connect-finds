import { defineConfig, devices } from '@playwright/test';
import { chromium } from 'playwright';

/**
 * PAWS PRODUCTION CERTIFICATION HARNESS
 * ------------------------------------------------------------------
 * A repeatable, viewport-accurate E2E certification suite that replaces the
 * unreliable live-Chrome automation. It runs the certification specs in
 * `e2e/cert/` across a true device matrix (real browser viewport emulation,
 * not a 500px minimum window).
 *
 * Target: live production by default. Override with CERT_BASE_URL.
 *   CERT_BASE_URL=https://petadoptionwebservices.com \
 *   npx playwright test --config playwright.cert.config.ts
 *
 * Authenticated buyer/seller flows in the cert suite self-skip unless the
 * corresponding test-account env vars are provided (never hardcoded):
 *   CERT_BUYER_EMAIL / CERT_BUYER_PASSWORD
 *   CERT_SELLER_EMAIL / CERT_SELLER_PASSWORD
 *
 * Evidence (screenshots, traces, HTML report) lands in test-results/cert/ and
 * playwright-report/, both gitignored — nothing large is committed.
 */

const BASE_URL = process.env.CERT_BASE_URL ?? 'https://petadoptionwebservices.com';

// This sandbox needs the full Chromium binary (headless-shell SIGSEGVs) and
// crash-reporter disabled (crashpad can't create its db dir). Mirrors the
// primary playwright.config.ts.
const launchOptions = {
  executablePath: chromium.executablePath(),
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-crash-reporter', '--disable-gpu'],
};

type VP = { name: string; width: number; height: number; klass: 'mobile' | 'tablet' | 'desktop' };

const MATRIX: VP[] = [
  // Mobile
  { name: 'mobile-320', width: 320, height: 568, klass: 'mobile' },
  { name: 'mobile-375', width: 375, height: 667, klass: 'mobile' },
  { name: 'mobile-390', width: 390, height: 844, klass: 'mobile' },
  { name: 'mobile-430', width: 430, height: 932, klass: 'mobile' },
  // Tablet
  { name: 'tablet-768', width: 768, height: 1024, klass: 'tablet' },
  { name: 'tablet-820', width: 820, height: 1180, klass: 'tablet' },
  { name: 'tablet-900', width: 900, height: 1200, klass: 'tablet' },
  { name: 'tablet-1024', width: 1024, height: 1366, klass: 'tablet' },
  // Desktop
  { name: 'desktop-1280', width: 1280, height: 800, klass: 'desktop' },
  { name: 'desktop-1440', width: 1440, height: 900, klass: 'desktop' },
  { name: 'desktop-1920', width: 1920, height: 1080, klass: 'desktop' },
];

export default defineConfig({
  testDir: './e2e/cert',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: process.env.CI ? 2 : 4,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report/cert' }],
    ['json', { outputFile: 'test-results/cert/results.json' }],
  ],
  outputDir: 'test-results/cert',
  use: {
    baseURL: BASE_URL,
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions,
  },
  // No webServer: certification runs against a deployed origin (production).
  projects: MATRIX.map((vp) => ({
    name: vp.name,
    metadata: { deviceClass: vp.klass, width: vp.width, height: vp.height },
    use: {
      ...devices['Desktop Chrome'],
      viewport: { width: vp.width, height: vp.height },
      launchOptions,
      // Tag the device class so specs can branch (e.g. bottom-nav on mobile/tablet).
      // Read in tests via testInfo.project.metadata.deviceClass.
    },
  })),
});
