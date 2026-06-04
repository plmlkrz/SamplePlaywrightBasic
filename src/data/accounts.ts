/**
 * Centralized test accounts — the single place credentials live.
 *
 * Sentinel-inspired: tests never hardcode usernames/passwords. They ask for a
 * named account (e.g. `accounts.standard`) so credentials can change per
 * environment without touching a single spec. The demo app validates against
 * this same set, so the accounts and the app under test never drift apart.
 */

export interface Account {
  username: string;
  password: string;
  /** Human-readable note about what this account demonstrates. */
  note: string;
}

export type AccountKey = 'standard' | 'locked' | 'wrongPassword' | 'noUsername' | 'noPassword';

export const accounts: Record<AccountKey, Account> = {
  standard: {
    username: 'standard_user',
    password: 'secret_sauce',
    note: 'Happy path — logs in successfully and reaches the inventory page.',
  },
  locked: {
    username: 'locked_out_user',
    password: 'secret_sauce',
    note: 'Valid password but the account is locked — app shows a lockout error.',
  },
  wrongPassword: {
    username: 'standard_user',
    password: 'wrong_password',
    note: 'Known user, bad password — app shows a generic "do not match" error.',
  },
  noUsername: {
    username: '',
    password: 'secret_sauce',
    note: 'Missing username — app shows a "Username is required" validation error.',
  },
  noPassword: {
    username: 'standard_user',
    password: '',
    note: 'Missing password — app shows a "Password is required" validation error.',
  },
};
