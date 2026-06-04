import { accounts } from '../src/data/accounts';

/**
 * Environment configuration profiles (Sentinel-inspired).
 *
 * Select a profile with the TEST_ENV environment variable (defaults to `local`):
 *   TEST_ENV=ci npm test
 *
 * `playwright.config.ts` reads from here, so switching environments never means
 * editing test code — only the profile below. Add a `staging`/`prod` profile the
 * same way when you point this framework at a real deployed app.
 */

export type EnvName = 'local' | 'ci';

export interface EnvConfig {
  name: EnvName;
  /** Base URL the app under test is served from. */
  baseURL: string;
  /** Base URL for the demo REST API (same origin here, but kept explicit). */
  apiURL: string;
  /** Default action timeout (ms) Playwright waits for an element to be actionable. */
  actionTimeout: number;
  /** Per-test timeout (ms). */
  testTimeout: number;
  /** Retries for flaky tests. */
  retries: number;
  /** Named accounts available in this environment. */
  accounts: typeof accounts;
}

const PORT = process.env.PORT ?? '3100';
const LOCAL_BASE = `http://localhost:${PORT}`;

const PROFILES: Record<EnvName, EnvConfig> = {
  local: {
    name: 'local',
    baseURL: LOCAL_BASE,
    apiURL: `${LOCAL_BASE}/api`,
    actionTimeout: 10_000,
    testTimeout: 30_000,
    retries: 0,
    accounts,
  },
  ci: {
    name: 'ci',
    baseURL: LOCAL_BASE,
    apiURL: `${LOCAL_BASE}/api`,
    actionTimeout: 15_000,
    testTimeout: 45_000,
    retries: 2,
    accounts,
  },
};

export function getEnv(): EnvConfig {
  const requested = (process.env.TEST_ENV ?? 'local').toLowerCase();
  const profile = PROFILES[requested as EnvName];
  if (!profile) {
    const valid = Object.keys(PROFILES).join(', ');
    throw new Error(`Unknown TEST_ENV "${requested}". Valid options: ${valid}`);
  }
  return profile;
}
