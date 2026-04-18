/**
 * PLAYWRIGHT BOILERPLATE REFERENCE GUIDE
 * =======================================
 * A reference card showing common Playwright patterns used in this project.
 * All tests use test.skip() so they don't run in the main suite but remain
 * runnable individually: npx playwright test boilerplate --grep "Section Name"
 */

import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Section 1 — Navigation', () => {

  test.skip('goto with baseURL — relative paths', async ({ page }) => {
    // baseURL is set in playwright.config.ts as https://www.saucedemo.com
    await page.goto('/');                    // → https://www.saucedemo.com/
    await page.goto('/inventory.html');      // → https://www.saucedemo.com/inventory.html
  });

  test.skip('URL assertions', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page).toHaveURL(/saucedemo/);  // regex match
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: SELECTOR STRATEGIES
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Section 2 — Selector Strategies', () => {

  test.skip('selector priority — most stable to least stable', async ({ page }) => {
    // 1. data-test attributes (most stable — explicit test hooks)
    page.locator('[data-test="login-button"]');

    // 2. ARIA roles (accessible, semantic)
    page.getByRole('button', { name: 'Login' });
    page.getByRole('link', { name: 'About' });
    page.getByRole('heading', { level: 1 });

    // 3. Labels (works for form inputs)
    page.getByLabel('Username');
    page.getByLabel('Password');

    // 4. Placeholder text
    page.getByPlaceholder('Username');

    // 5. Text content
    page.getByText('Add to cart');
    page.getByText('Sauce Labs Backpack', { exact: true });

    // 6. id / class (acceptable for stable ids)
    page.locator('#login-button');
    page.locator('.inventory_item_name');

    // 7. CSS attribute selectors
    page.locator('button[id^="add-to-cart"]');   // id starts with
    page.locator('button[id$="-backpack"]');      // id ends with
    page.locator('input[type="submit"]');
  });

  test.skip('scoped locators — finding elements within a parent', async ({ page }) => {
    // Filter a list to one item, then find a child within it
    const productCard = page.locator('.inventory_item')
      .filter({ hasText: 'Sauce Labs Backpack' });
    const addButton = productCard.locator('button');

    // Index-based (use sparingly — order can change)
    const firstProduct = page.locator('.inventory_item').nth(0);
    const lastProduct  = page.locator('.inventory_item').last();
  });

  test.skip('counting and iterating locators', async ({ page }) => {
    await page.goto('/inventory.html');
    const items = page.locator('.inventory_item');
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const name = await items.nth(i).locator('.inventory_item_name').innerText();
      console.log(name);
    }
    // Bulk text extraction
    const allNames = await page.locator('.inventory_item_name').allInnerTexts();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: INTERACTIONS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Section 3 — Interactions', () => {

  test.skip('common user interactions', async ({ page }) => {
    // Typing
    await page.locator('#user-name').fill('standard_user');  // clears then types
    await page.locator('#user-name').clear();

    // Clicking
    await page.locator('#login-button').click();
    await page.locator('#login-button').dblclick();
    await page.locator('#login-button').click({ button: 'right' });

    // Keyboard
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.locator('#user-name').press('Enter');

    // Dropdown
    await page.locator('[data-test="product-sort-container"]').selectOption('az');
    await page.locator('[data-test="product-sort-container"]').selectOption({ label: 'Name (A to Z)' });

    // Hover
    await page.locator('.inventory_item').first().hover();

    // Scroll element into view
    await page.locator('.footer').scrollIntoViewIfNeeded();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: ASSERTIONS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Section 4 — Assertions', () => {

  test.skip('element state assertions — auto-waiting', async ({ page }) => {
    const locator = page.locator('#login-button');

    await expect(locator).toBeVisible();
    await expect(locator).toBeHidden();
    await expect(locator).toBeEnabled();
    await expect(locator).toBeDisabled();
    await expect(page.locator('input[type="checkbox"]')).toBeChecked();
  });

  test.skip('content assertions', async ({ page }) => {
    const locator = page.locator('.inventory_item_name').first();

    await expect(locator).toHaveText('Sauce Labs Backpack');
    await expect(locator).toHaveText(/Backpack/);           // regex
    await expect(locator).toContainText('Backpack');        // partial match

    await expect(page.locator('#login-button')).toHaveAttribute('type', 'submit');
    await expect(page.locator('#user-name')).toHaveValue('standard_user');
  });

  test.skip('page-level assertions', async ({ page }) => {
    await expect(page).toHaveTitle('Swag Labs');
    await expect(page).toHaveTitle(/Swag/);
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
    await expect(page).toHaveURL(/inventory/);
  });

  test.skip('count assertions', async ({ page }) => {
    const items = page.locator('.inventory_item');
    await expect(items).toHaveCount(6);
  });

  test.skip('synchronous value assertions — use after await', async ({ page }) => {
    // After extracting a value with await, use plain expect() (no await)
    const text = await page.locator('.inventory_item_name').first().innerText();
    expect(text).toBe('Sauce Labs Backpack');
    expect(text).toContain('Backpack');
    expect(text).toMatch(/Backpack/);

    const price = 29.99;
    expect(price).toBeCloseTo(29.99, 2);   // float comparison

    const items = ['a', 'b', 'c'];
    expect(items).toHaveLength(3);
    expect(items).toContain('a');
    expect(items).toEqual(['a', 'b', 'c']);
  });

  test.skip('soft assertions — continue test after failure', async ({ page }) => {
    // Soft assertions collect failures without stopping the test
    await expect.soft(page.locator('.shopping_cart_badge')).toBeVisible();
    await expect.soft(page.locator('.inventory_list')).toBeVisible();
    // Final hard check — fails here if any soft assertion failed
    expect(test.info().errors).toHaveLength(0);
  });

  test.skip('negating assertions', async ({ page }) => {
    await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
    await expect(page.locator('#login-button')).not.toBeDisabled();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: WAITS & TIMING
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Section 5 — Waits & Timing', () => {

  test.skip('auto-waiting — built into every locator action', async ({ page }) => {
    // Playwright waits automatically for elements to be visible and actionable.
    // actionTimeout in playwright.config.ts controls the max wait (10s here).
    // You almost never need explicit waits.
    await page.locator('#login-button').click();            // waits for enabled + visible
    await expect(page.locator('.inventory_list')).toBeVisible(); // waits up to timeout
  });

  test.skip('waitForURL — use after navigation triggers', async ({ page }) => {
    await page.locator('#login-button').click();
    await page.waitForURL(/inventory/);
  });

  test.skip('waitForSelector — explicit element wait', async ({ page }) => {
    await page.waitForSelector('.inventory_list', { state: 'visible' });
  });

  test.skip('waitForTimeout — avoid in production tests', async ({ page }) => {
    // Hard sleeps make tests slow and flaky. Only use for demos.
    await page.waitForTimeout(1000);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: TEST ORGANIZATION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Section 6 — Test Organization', () => {

  test.beforeAll(async () => {
    // Runs once before all tests in this describe block.
    // Not suitable for browser state — each test gets a fresh page.
  });

  test.beforeEach(async ({ page }) => {
    // Runs before every test — standard place for login/navigation setup.
    await page.goto('/');
  });

  test.afterEach(async ({ page }) => {
    // Runs after every test. Page is auto-closed — usually no teardown needed.
  });

  test.skip('test with explicit timeout override', async ({ page }) => {
    test.setTimeout(30_000);  // override config timeout for this test only
  });

  test.skip('conditional skip based on environment', async ({ page }) => {
    test.skip(process.env.CI === 'true', 'Skipped in CI environment');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7: PAGE OBJECT MODEL PATTERN
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Section 7 — Page Object Model', () => {

  test.skip('POM instantiation and usage pattern', async ({ page }) => {
    /**
     * POM Pattern:
     * 1. One class per page/component
     * 2. Constructor accepts page: Page from the Playwright fixture
     * 3. Locators are private readonly class fields (defined once, reused)
     * 4. Public async methods represent user actions
     * 5. Keep assertions OUT of page objects — assert in test files
     *    (exception: waitForLoad() can use expect internally)
     *
     * See: pages/LoginPage.ts, InventoryPage.ts, CartPage.ts, CheckoutPage.ts
     */
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8: DEBUGGING HELPERS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Section 8 — Debugging', () => {

  test.skip('manual screenshot', async ({ page }) => {
    await page.screenshot({ path: 'screenshots/debug.png', fullPage: true });
    // Automatic screenshots on failure are configured in playwright.config.ts
  });

  test.skip('highlight a locator for visual debugging', async ({ page }) => {
    await page.locator('.inventory_item').first().highlight();
  });

  test.skip('pause — opens Playwright Inspector', async ({ page }) => {
    await page.pause();  // Opens interactive debugger; remove before committing
  });

  test.skip('codegen — record new tests interactively', async ({ page }) => {
    // Run: npm run codegen
    // Playwright opens a browser and records your actions as test code.
  });

});
