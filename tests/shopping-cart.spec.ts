import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { productByName } from '../src/data/products';

const CREDENTIALS = { username: 'standard_user', password: 'secret_sauce' };

async function loginAndGoToInventory(loginPage: LoginPage): Promise<void> {
  await loginPage.goto();
  await loginPage.login(CREDENTIALS.username, CREDENTIALS.password);
}

test.describe('SauceDemo — Shopping Cart Requirements', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginAndGoToInventory(loginPage);
  });

  // REQ-1: User can add a single item to cart
  test('REQ-1: adding one item to cart increments badge to 1', async ({ page }) => {
    const inventory = new InventoryPage(page);
    await inventory.waitForLoad();
    await inventory.addToCart('Sauce Labs Backpack');
    expect(await inventory.getCartBadgeCount()).toBe(1);
  });

  // REQ-2: User can add multiple items to cart
  test('REQ-2: adding multiple items increments badge correctly', async ({ page }) => {
    const inventory = new InventoryPage(page);
    await inventory.waitForLoad();
    await inventory.addToCart('Sauce Labs Backpack');
    await inventory.addToCart('Sauce Labs Bike Light');
    await inventory.addToCart('Sauce Labs Bolt T-Shirt');
    expect(await inventory.getCartBadgeCount()).toBe(3);
  });

  // REQ-3: Cart badge reflects correct item count
  test('REQ-3: cart badge count updates accurately on add and remove', async ({ page }) => {
    const inventory = new InventoryPage(page);
    await inventory.waitForLoad();
    expect(await inventory.getCartBadgeCount()).toBe(0);
    await inventory.addToCart('Sauce Labs Backpack');
    expect(await inventory.getCartBadgeCount()).toBe(1);
    await inventory.addToCart('Sauce Labs Onesie');
    expect(await inventory.getCartBadgeCount()).toBe(2);
    await inventory.removeFromCart('Sauce Labs Backpack');
    expect(await inventory.getCartBadgeCount()).toBe(1);
  });

  // REQ-4: User can remove item from cart page
  test('REQ-4: removing item from cart page leaves remaining items intact', async ({ page }) => {
    const inventory = new InventoryPage(page);
    const cartPage  = new CartPage(page);
    await inventory.waitForLoad();
    await inventory.addToCart('Sauce Labs Backpack');
    await inventory.addToCart('Sauce Labs Bike Light');
    await inventory.navigateToCart();
    await cartPage.removeItem('Sauce Labs Backpack');
    const remaining = await cartPage.getCartItems();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].name).toBe('Sauce Labs Bike Light');
  });

  // REQ-5: User can remove item from inventory page
  test('REQ-5: removing item from inventory page decrements badge', async ({ page }) => {
    const inventory = new InventoryPage(page);
    await inventory.waitForLoad();
    await inventory.addToCart('Sauce Labs Backpack');
    await inventory.addToCart('Sauce Labs Bike Light');
    await inventory.removeFromCart('Sauce Labs Backpack');
    expect(await inventory.getCartBadgeCount()).toBe(1);
  });

  // REQ-6: Cart persists items when navigating away and back
  test('REQ-6: cart retains items after navigating away and returning', async ({ page }) => {
    const inventory = new InventoryPage(page);
    const cartPage  = new CartPage(page);
    await inventory.waitForLoad();
    await inventory.addToCart('Sauce Labs Fleece Jacket');
    await inventory.navigateToCart();
    await cartPage.continueShopping();
    await inventory.navigateToCart();
    const items = await cartPage.getCartItems();
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('Sauce Labs Fleece Jacket');
  });

  // REQ-7: Cart total is correct
  test('REQ-7: checkout subtotal matches sum of added item prices', async ({ page }) => {
    const inventory = new InventoryPage(page);
    const cartPage  = new CartPage(page);
    const checkout  = new CheckoutPage(page);
    const backpack  = productByName('Sauce Labs Backpack');    // $29.99
    const bikeLight = productByName('Sauce Labs Bike Light'); // $9.99
    await inventory.waitForLoad();
    await inventory.addToCart(backpack.name);
    await inventory.addToCart(bikeLight.name);
    await inventory.navigateToCart();
    await cartPage.checkout();
    await checkout.fillInfo('Test', 'User', '12345');
    await checkout.continue();
    const summary = await checkout.getOrderSummary();
    const expectedSubtotal = (backpack.price + bikeLight.price).toFixed(2);
    expect(summary.subtotal).toContain(expectedSubtotal);
  });

  // REQ-8: Checkout flow completes successfully
  test('REQ-8: full checkout flow ends with order confirmation', async ({ page }) => {
    const inventory = new InventoryPage(page);
    const cartPage  = new CartPage(page);
    const checkout  = new CheckoutPage(page);
    await inventory.waitForLoad();
    await inventory.addToCart('Sauce Labs Bolt T-Shirt');
    await inventory.navigateToCart();
    await cartPage.checkout();
    await checkout.fillInfo('Jane', 'Doe', '94105');
    await checkout.continue();
    await checkout.finish();
    expect(await checkout.isOrderComplete()).toBe(true);
  });

  // REQ-9: Empty cart shows no items
  test('REQ-9: navigating to cart without adding items shows empty cart', async ({ page }) => {
    const inventory = new InventoryPage(page);
    const cartPage  = new CartPage(page);
    await inventory.waitForLoad();
    await inventory.navigateToCart();
    const items = await cartPage.getCartItems();
    expect(items).toHaveLength(0);
  });

  // REQ-10: Cart item details match inventory
  test('REQ-10: cart item name and price match what was shown in inventory', async ({ page }) => {
    const inventory = new InventoryPage(page);
    const cartPage  = new CartPage(page);
    await inventory.waitForLoad();
    const inventoryPrice = await inventory.getPriceOf('Sauce Labs Onesie');
    await inventory.addToCart('Sauce Labs Onesie');
    await inventory.navigateToCart();
    const [item] = await cartPage.getCartItems();
    expect(item.name).toBe('Sauce Labs Onesie');
    expect(item.price).toBe(inventoryPrice);
  });

});

// ── Login Validation ──────────────────────────────────────────────────────────
test.describe('SauceDemo — Login Validation', () => {

  test('shows error message for incorrect password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'wrong_password');
    const error = await loginPage.getErrorMessage();
    expect(error).toContain('Username and password do not match');
  });

  test('shows error message for locked-out user', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('locked_out_user', 'secret_sauce');
    const error = await loginPage.getErrorMessage();
    expect(error).toContain('locked out');
  });

  test('shows error message when username is missing', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('', 'secret_sauce');
    const error = await loginPage.getErrorMessage();
    expect(error).toContain('Username is required');
  });

});
