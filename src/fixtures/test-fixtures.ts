/**
 * Custom test fixtures (Sentinel-inspired).
 *
 * Instead of importing `test` from '@playwright/test', specs import it from here.
 * That gives every test:
 *   - a ready-made page object for each page (no `new LoginPage(page)` boilerplate),
 *   - a `loggedInPage` fixture that handles the login flow once,
 *   - automatic per-test cleanup of client-side state.
 *
 * Fixtures are lazy: a spec only pays for the page objects it actually destructures.
 */

import { test as base, expect, Page } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { TablePage } from '../../pages/TablePage';
import { FormPage } from '../../pages/FormPage';
import { DynamicPage } from '../../pages/DynamicPage';
import { ModalPage } from '../../pages/ModalPage';
import { UploadPage } from '../../pages/UploadPage';
import { getEnv } from '../../config/env';

interface Fixtures {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  tablePage: TablePage;
  formPage: FormPage;
  dynamicPage: DynamicPage;
  modalPage: ModalPage;
  uploadPage: UploadPage;
  /** A page that has already logged in as the standard account and is on the inventory page. */
  loggedInPage: Page;
}

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  inventoryPage: async ({ page }, use) => { await use(new InventoryPage(page)); },
  cartPage: async ({ page }, use) => { await use(new CartPage(page)); },
  checkoutPage: async ({ page }, use) => { await use(new CheckoutPage(page)); },
  tablePage: async ({ page }, use) => { await use(new TablePage(page)); },
  formPage: async ({ page }, use) => { await use(new FormPage(page)); },
  dynamicPage: async ({ page }, use) => { await use(new DynamicPage(page)); },
  modalPage: async ({ page }, use) => { await use(new ModalPage(page)); },
  uploadPage: async ({ page }, use) => { await use(new UploadPage(page)); },

  loggedInPage: async ({ page, loginPage, inventoryPage }, use) => {
    const { standard } = getEnv().accounts;
    await loginPage.goto();
    await loginPage.login(standard.username, standard.password);
    await inventoryPage.waitForLoad();

    await use(page);

    // Teardown (mirrors Sentinel's @After/PageManager.reset). Playwright already
    // gives each test an isolated context, so this is belt-and-suspenders — but it
    // documents the intent and protects against `reuseExistingServer` state bleed.
    try {
      await page.evaluate(() => localStorage.clear());
    } catch {
      /* page may already be closed — nothing to clean up */
    }
  },
});

export { expect };
