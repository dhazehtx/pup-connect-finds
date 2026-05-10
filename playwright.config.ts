import { defineConfig, devices } from '@playwright/test';
import { chromium } from 'playwright';

/**
 * Local E2E defaults to port 3000 (matches `npm run dev:3000` / server default).
 * Override with PLAYWRIGHT_BASE_URL if your dev server binds elsewhere.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000',
    headless: true,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Important for this environment: use the full Chromium binary.
        // The Playwright headless-shell binary is crashing with SIGSEGV here.
        launchOptions: {
          executablePath: chromium.executablePath(),
          // In this sandbox, Chromium crashpad can't create its database dir.
          // Disable crash reporting so the browser can boot.
          args: ['--disable-crash-reporter'],
        },
      },
    },
  ],
  webServer: process.env.PLAYWRIGHT_NO_SERVER
    ? undefined
    : {
        command: 'npm run dev:3000',
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: process.env.PLAYWRIGHT_FORCE_NEW_SERVER !== '1',
        timeout: 120_000,
        stdout: 'pipe',
        stderr: 'pipe',
      },
});
