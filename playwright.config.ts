import { defineConfig, devices } from '@playwright/test';
import { getEnv } from './config/env';

/**
 * Playwright configuration.
 *
 * Everything environment-specific (base URL, timeouts, retries) comes from the
 * env profile in config/env.ts — select one with TEST_ENV (defaults to `local`).
 * The demo app is started automatically by the `webServer` block, so a learner
 * only ever needs `npm test`.
 *
 * See https://playwright.dev/docs/test-configuration.
 */
const env = getEnv();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? env.retries : 0,
  /* CI runs serially; locally cap at 4 so a single dev-server SUT (and the dev
     machine) isn't oversubscribed — keeps runs reliable without losing parallelism. */
  workers: process.env.CI ? 1 : 4,
  timeout: env.testTimeout,

  /* Console summary + rich HTML report (open with `npm run report`). */
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  use: {
    baseURL: env.baseURL,
    actionTimeout: env.actionTimeout,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
    /* Mobile viewport — useful for the accessibility/touch-target checks. */
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],

  /* Start the local demo store before the tests run. */
  webServer: {
    command: 'npm run app:start',
    url: env.baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
