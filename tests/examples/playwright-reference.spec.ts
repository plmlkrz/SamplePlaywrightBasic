/**
 * PLAYWRIGHT REFERENCE GUIDE
 * ==========================
 * A reference card of common Playwright patterns, targeted at this framework's
 * local demo store. Every test uses test.skip() so they don't run in the suite,
 * but each remains runnable individually for learning:
 *
 *   npx playwright test playwright-reference --grep "Selector Strategies"
 *
 * Read top-to-bottom as a cheat sheet. Pair with docs/03-page-object-model.md.
 */

import { test, expect } from '@playwright/test';

// ── Navigation ────────────────────────────────────────────────────────────────
test.describe('Navigation', () => {
  test.skip('goto with baseURL — relative paths', async ({ page }) => {
    // baseURL comes from the env profile (http://localhost:3100 by default).
    await page.goto('/');                 // → login page
    await page.goto('/inventory.html');   // → product grid
  });

  test.skip('URL assertions', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/localhost/);   // regex match
  });
});

// ── Selector Strategies (most stable → least stable) ────────────────────────────
test.describe('Selector Strategies', () => {
  test.skip('selector priority', async ({ page }) => {
    page.locator('[data-test="checkout"]');                 // 1. data-test hooks (most stable)
    page.getByRole('button', { name: 'Login' });            // 2. ARIA roles (accessible)
    page.getByLabel('Username');                            // 3. labels (form inputs)
    page.getByPlaceholder('Type to filter…');               // 4. placeholder text
    page.getByText('Add to cart');                          // 5. text content
    page.locator('#login-button');                          // 6. id / class
    page.locator('button[id^="add-to-cart"]');              // 7. CSS attribute (starts-with)
  });

  test.skip('scoped locators — find within a parent', async ({ page }) => {
    const card = page.locator('.inventory_item').filter({ hasText: 'Trailblazer Backpack' });
    card.locator('button');                                 // narrow to a child
    page.locator('.inventory_item').first();
    page.locator('.inventory_item').nth(0);
  });
});

// ── Assertions (auto-waiting) ───────────────────────────────────────────────────
test.describe('Assertions', () => {
  test.skip('element + content assertions', async ({ page }) => {
    const btn = page.locator('#login-button');
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
    await expect(page.locator('.inventory_item_name').first()).toContainText('Backpack');
    await expect(page.locator('.inventory_item')).toHaveCount(6);
  });

  test.skip('synchronous value assertions — after await', async ({ page }) => {
    const text = await page.locator('.inventory_item_name').first().innerText();
    expect(text).toContain('Backpack');
    expect(29.99).toBeCloseTo(29.99, 2);
  });

  test.skip('soft assertions — collect failures, fail at the end', async ({ page }) => {
    await expect.soft(page.locator('.shopping_cart_badge')).toBeVisible();
    await expect.soft(page.locator('.inventory_list')).toBeVisible();
  });
});

// ── Waits & Timing ──────────────────────────────────────────────────────────────
test.describe('Waits & Timing', () => {
  test.skip('prefer auto-waiting; avoid hard sleeps', async ({ page }) => {
    await page.locator('#login-button').click();           // waits for actionable
    await expect(page.locator('.inventory_list')).toBeVisible();
    await page.waitForURL(/inventory/);                    // after a navigation
    // await page.waitForTimeout(1000);  ← avoid: slow & flaky
  });
});

// ── Page Object Model ───────────────────────────────────────────────────────────
test.describe('Page Object Model', () => {
  test.skip('POM pattern', async () => {
    /**
     * 1. One class per page/component.
     * 2. Constructor takes `page: Page`.
     * 3. Locators are private readonly fields (defined once).
     * 4. Public async methods model user actions.
     * 5. Keep assertions in tests (exception: waitForLoad may assert).
     * See pages/ and src/fixtures/test-fixtures.ts for the fixture wiring.
     */
  });
});

// ── Debugging ────────────────────────────────────────────────────────────────────
test.describe('Debugging', () => {
  test.skip('helpers', async ({ page }) => {
    await page.screenshot({ path: 'screenshots/debug.png', fullPage: true });
    await page.locator('.inventory_item').first().highlight();
    await page.pause();   // opens the Playwright Inspector; remove before committing
    // Record new tests interactively with: npm run codegen
  });
});
