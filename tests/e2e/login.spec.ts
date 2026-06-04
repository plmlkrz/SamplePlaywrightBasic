/**
 * Login validation tests. Credentials come from the central account registry
 * (src/data/accounts.ts) via the env profile — never hardcoded here.
 */

import { test, expect } from '../../src/fixtures/test-fixtures';
import { getEnv } from '../../config/env';

const { accounts } = getEnv();

test.describe('Login Validation', { tag: '@regression' }, () => {

  test('valid credentials reach the inventory page', { tag: '@smoke' }, async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(accounts.standard.username, accounts.standard.password);
    await inventoryPage.waitForLoad();
    expect(await inventoryPage.getProducts()).not.toHaveLength(0);
  });

  test('shows error for incorrect password', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(accounts.wrongPassword.username, accounts.wrongPassword.password);
    expect(await loginPage.getErrorMessage()).toContain('Username and password do not match');
  });

  test('shows error for locked-out user', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(accounts.locked.username, accounts.locked.password);
    expect(await loginPage.getErrorMessage()).toContain('locked out');
  });

  test('shows error when username is missing', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(accounts.noUsername.username, accounts.noUsername.password);
    expect(await loginPage.getErrorMessage()).toContain('Username is required');
  });

  test('shows error when password is missing', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(accounts.noPassword.username, accounts.noPassword.password);
    expect(await loginPage.getErrorMessage()).toContain('Password is required');
  });

});
