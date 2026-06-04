/**
 * API + UI HYBRID TESTING and NETWORK INTERCEPTION.
 *
 *  Pattern A — Programmatic state setup (skip slow UI steps), then verify in UI.
 *  Pattern B — Network interception (inspect or mock HTTP traffic during a UI test).
 *
 * Why hybrid tests matter: reaching a known state through the UI is slow and
 * brittle. Seeding state directly (here via localStorage, in a real app via an
 * API call) lets the test focus on the behaviour you actually care about.
 */

import { test, expect } from '../../src/fixtures/test-fixtures';
import { getEnv } from '../../config/env';
import { productByName } from '../../src/data/products';
import type { Page } from '@playwright/test';

const { accounts } = getEnv();

// Seed the cart by writing product indices straight to localStorage —
// the client-side equivalent of POST /api/cart in a server-backed app.
async function seedCart(page: Page, ...productNames: string[]): Promise<void> {
  const indices = productNames.map(name => productByName(name).cartIndex);
  await page.evaluate((ids) => localStorage.setItem('cart-contents', JSON.stringify(ids)), indices);
}

test.describe('Pattern A — Programmatic State Setup + UI Verification', { tag: '@api' }, () => {

  test('cart seeded via localStorage is reflected in the UI badge', async ({ loggedInPage, inventoryPage }) => {
    await seedCart(loggedInPage, 'Trailblazer Backpack', 'Beacon Bike Light');
    await loggedInPage.reload();
    expect(await inventoryPage.getCartBadgeCount()).toBe(2);
  });

  test('navigating to cart after seeding shows the correct item names', async ({ loggedInPage, inventoryPage, cartPage }) => {
    await seedCart(loggedInPage, 'Summit Fleece Jacket', 'Cozy Onesie');
    await loggedInPage.reload();
    await inventoryPage.navigateToCart();
    const names = (await cartPage.getCartItems()).map(i => i.name);
    expect(names).toContain('Summit Fleece Jacket');
    expect(names).toContain('Cozy Onesie');
  });

  test('a UI add is reflected in backend state (localStorage)', async ({ loggedInPage, inventoryPage }) => {
    await inventoryPage.addToCart('Trailblazer Backpack');
    const cartContents: number[] = await loggedInPage.evaluate(() =>
      JSON.parse(localStorage.getItem('cart-contents') || '[]')
    );
    expect(cartContents).toContain(productByName('Trailblazer Backpack').cartIndex);
  });

  test('clearing the cart via localStorage empties the UI', async ({ loggedInPage, inventoryPage }) => {
    await seedCart(loggedInPage, 'Trailblazer Backpack', 'Bolt T-Shirt');
    await loggedInPage.reload();
    expect(await inventoryPage.getCartBadgeCount()).toBe(2);
    await loggedInPage.evaluate(() => localStorage.removeItem('cart-contents'));
    await loggedInPage.reload();
    expect(await inventoryPage.getCartBadgeCount()).toBe(0);
  });

});

test.describe('Pattern B — Network Interception', { tag: '@api' }, () => {

  test('inventory loads with no failed (4xx/5xx) requests', async ({ page, loginPage }) => {
    const failed: string[] = [];
    page.on('response', (response) => {
      if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`);
    });
    await loginPage.goto();
    await loginPage.login(accounts.standard.username, accounts.standard.password);
    await page.waitForURL(/inventory/);
    await expect(page.locator('.inventory_item').first()).toBeVisible();
    expect(failed).toEqual([]);
  });

  test('can mock the /api/products response with fixture data', async ({ loggedInPage, inventoryPage }) => {
    // Intercept the catalog request and return a single controlled product.
    await loggedInPage.route('**/api/products', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'mock', name: 'Mock Product', price: 1.23, description: 'Mocked', cartIndex: 0 },
        ]),
      });
    });
    await loggedInPage.reload();
    await inventoryPage.waitForLoad();
    const products = await inventoryPage.getProducts();
    expect(products).toEqual(['Mock Product']);
  });

  test('can simulate a slow response without breaking the page', async ({ loggedInPage, inventoryPage }) => {
    await loggedInPage.route('**/api/products', async (route) => {
      await new Promise((r) => setTimeout(r, 300));  // artificial latency
      await route.continue();
    });
    await loggedInPage.reload();
    await inventoryPage.waitForLoad();
    // Wait for the (delayed) product render before reading — web-first assertions
    // auto-retry, so this rides through the artificial latency.
    await expect(loggedInPage.locator('.inventory_item').first()).toBeVisible();
    expect(await inventoryPage.getProducts()).not.toHaveLength(0);
  });

});
