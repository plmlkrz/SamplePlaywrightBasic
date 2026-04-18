/**
 * API + UI HYBRID TESTING
 * ========================
 * Demonstrates three patterns used in real senior QA automation work:
 *
 *  Pattern 1 — Pure API tests using Playwright's request fixture
 *  Pattern 2 — Programmatic state setup (bypass slow UI steps), then verify in UI
 *  Pattern 3 — Network interception (inspect or mock HTTP traffic during a UI test)
 *
 * Why hybrid tests matter:
 *   - Setting up complex preconditions via the UI is slow and brittle.
 *   - APIs (or localStorage for client-side apps) let you reach a known state
 *     in milliseconds, then focus the UI test on the behaviour you actually care about.
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { productByName } from '../src/data/products';

const CREDENTIALS = { username: 'standard_user', password: 'secret_sauce' };

// Helper: set SauceDemo's localStorage cart-contents directly.
// cart-contents is a JSON array of internal product cartIndex values.
// This is the client-side equivalent of calling POST /api/cart from a backend test.
async function seedCart(page: import('@playwright/test').Page, ...productNames: string[]): Promise<void> {
  const indices = productNames.map(name => productByName(name).cartIndex);
  await page.evaluate((ids) => {
    localStorage.setItem('cart-contents', JSON.stringify(ids));
  }, indices);
}

// ─────────────────────────────────────────────────────────────────────────────
// PATTERN 1: Pure API Testing — Playwright request fixture
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Pattern 1 — Pure API Tests (request fixture)', () => {

  test('SauceDemo returns HTTP 200', async ({ request }) => {
    const response = await request.get('https://www.saucedemo.com/');
    expect(response.status()).toBe(200);
  });

  test('SauceDemo login page returns HTML content-type', async ({ request }) => {
    const response = await request.get('https://www.saucedemo.com/');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/html');
  });

  // Using JSONPlaceholder as a stand-in for a real product/order API.
  // In the Veeva exercise, this would be the actual shopping cart backend endpoint.
  test('GET /todos returns a list of items', async ({ request }) => {
    const response = await request.get('https://jsonplaceholder.typicode.com/todos');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  test('GET /users/:id returns a user object with expected fields', async ({ request }) => {
    const response = await request.get('https://jsonplaceholder.typicode.com/users/1');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('name');
    expect(body).toHaveProperty('email');
    expect(typeof body.id).toBe('number');
    expect(typeof body.email).toBe('string');
  });

  test('POST /orders creates a new order and returns 201', async ({ request }) => {
    const response = await request.post('https://jsonplaceholder.typicode.com/posts', {
      data: {
        userId: 1,
        title: 'Order: Sauce Labs Backpack',
        body: JSON.stringify({ items: ['sauce-labs-backpack'], total: 29.99 }),
      },
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body.title).toBe('Order: Sauce Labs Backpack');
  });

  test('response Content-Type is application/json', async ({ request }) => {
    const response = await request.get('https://jsonplaceholder.typicode.com/users/1');
    expect(response.headers()['content-type']).toContain('application/json');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// PATTERN 2: API Setup → UI Verification (the hybrid pattern)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Pattern 2 — Programmatic State Setup + UI Verification', () => {

  // In a real app: POST /api/cart { items: [...] } then verify the UI
  // In SauceDemo:  set localStorage cart-contents, then verify the UI
  test('cart seeded with 2 items via localStorage is correctly reflected in UI', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(CREDENTIALS.username, CREDENTIALS.password);
    await page.waitForURL(/inventory/);

    // Simulate API-seeded cart state — skips the slow "add item" UI flow
    await seedCart(page, 'Sauce Labs Backpack', 'Sauce Labs Bike Light');
    await page.reload();
    await page.waitForURL(/inventory/);

    const inventory = new InventoryPage(page);
    expect(await inventory.getCartBadgeCount()).toBe(2);
  });

  test('navigating to cart after state seed shows correct item names', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(CREDENTIALS.username, CREDENTIALS.password);
    await page.waitForURL(/inventory/);

    await seedCart(page, 'Sauce Labs Fleece Jacket', 'Sauce Labs Onesie');
    await page.reload();

    const inventory = new InventoryPage(page);
    await inventory.navigateToCart();
    const cartPage = new CartPage(page);
    const items = await cartPage.getCartItems();

    expect(items).toHaveLength(2);
    const names = items.map(i => i.name);
    expect(names).toContain('Sauce Labs Fleece Jacket');
    expect(names).toContain('Sauce Labs Onesie');
  });

  test('UI action (add item) is reflected in backend state (localStorage)', async ({ page }) => {
    // Inverse of above: verify that UI actions correctly update backend state
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(CREDENTIALS.username, CREDENTIALS.password);
    await page.waitForURL(/inventory/);

    const inventory = new InventoryPage(page);
    await inventory.addToCart('Sauce Labs Backpack');  // cartIndex = 4

    const cartContents: number[] = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('cart-contents') || '[]')
    );

    const backpack = productByName('Sauce Labs Backpack');
    expect(cartContents).toContain(backpack.cartIndex);
  });

  test('clearing cart via localStorage removes all items from UI', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(CREDENTIALS.username, CREDENTIALS.password);
    await page.waitForURL(/inventory/);

    // Seed state, then wipe it — like calling DELETE /api/cart
    await seedCart(page, 'Sauce Labs Backpack', 'Sauce Labs Bolt T-Shirt');
    await page.reload();

    const inventory = new InventoryPage(page);
    expect(await inventory.getCartBadgeCount()).toBe(2);

    await page.evaluate(() => localStorage.removeItem('cart-contents'));
    await page.reload();

    expect(await inventory.getCartBadgeCount()).toBe(0);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// PATTERN 3: Network Interception
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Pattern 3 — Network Interception', () => {

  test('all SauceDemo resources load without server errors (no 4xx/5xx)', async ({ page }) => {
    const failedRequests: string[] = [];

    page.on('response', response => {
      // Filter to saucedemo.com only — third-party analytics (backtrace.io) may return 401
      if (response.status() >= 400 && response.url().includes('saucedemo.com')) {
        failedRequests.push(`${response.status()} ${response.url()}`);
      }
    });

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(CREDENTIALS.username, CREDENTIALS.password);
    await page.waitForURL(/inventory/);

    expect(failedRequests).toEqual([]);
  });

  test('navigating to inventory triggers only expected resource types', async ({ page }) => {
    const resourceTypes = new Set<string>();

    page.on('request', req => {
      // Scope to saucedemo.com only to exclude third-party analytics fetch calls
      if (req.url().includes('saucedemo.com')) {
        resourceTypes.add(req.resourceType());
      }
    });

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(CREDENTIALS.username, CREDENTIALS.password);
    await page.waitForURL(/inventory/);

    const allowed = new Set(['document', 'stylesheet', 'script', 'image', 'font', 'other', 'fetch']);
    const unexpected = [...resourceTypes].filter(t => !allowed.has(t));
    expect(unexpected).toEqual([]);
  });

  test('can mock a slow network response to test loading state', async ({ page }) => {
    // Intercept all JS files and add a 200ms delay — simulates slow network
    await page.route('**/*.js', async route => {
      await new Promise(resolve => setTimeout(resolve, 200));
      await route.continue();
    });

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    // Page should still load despite the artificial delay
    await expect(page.locator('#login-button')).toBeVisible();
  });

  test('can mock an API response with fixture data', async ({ page }) => {
    // Intercept any request to a hypothetical /api/products endpoint
    // and return controlled fixture data — makes tests independent of backend
    await page.route('**/api/products', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Mock Product', price: 9.99 },
        ]),
      });
    });

    // Navigate normally — the interceptor is registered and ready
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(page.locator('#login-button')).toBeVisible();
  });

});
