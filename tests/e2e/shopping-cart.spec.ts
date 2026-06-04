/**
 * End-to-end shopping cart tests against the local demo store.
 *
 * Notice how little boilerplate each test has: the `loggedInPage` fixture handles
 * login, and the page-object fixtures (`inventoryPage`, `cartPage`, ...) are
 * injected ready to use. See src/fixtures/test-fixtures.ts.
 *
 * Tags let you run a subset:  npm run test:smoke   (only @smoke)
 */

import { test, expect } from '../../src/fixtures/test-fixtures';
import { productByName } from '../../src/data/products';

test.describe('Shopping Cart Requirements', { tag: '@regression' }, () => {

  // Every test starts logged in and on the inventory page.
  test.beforeEach(async ({ loggedInPage }) => { void loggedInPage; });

  // REQ-1
  test('adding one item to cart increments badge to 1', { tag: '@smoke' }, async ({ inventoryPage }) => {
    await inventoryPage.addToCart('Trailblazer Backpack');
    expect(await inventoryPage.getCartBadgeCount()).toBe(1);
  });

  // REQ-2
  test('adding multiple items increments badge correctly', async ({ inventoryPage }) => {
    await inventoryPage.addToCart('Trailblazer Backpack');
    await inventoryPage.addToCart('Beacon Bike Light');
    await inventoryPage.addToCart('Bolt T-Shirt');
    expect(await inventoryPage.getCartBadgeCount()).toBe(3);
  });

  // REQ-3
  test('cart badge count updates accurately on add and remove', async ({ inventoryPage }) => {
    expect(await inventoryPage.getCartBadgeCount()).toBe(0);
    await inventoryPage.addToCart('Trailblazer Backpack');
    expect(await inventoryPage.getCartBadgeCount()).toBe(1);
    await inventoryPage.addToCart('Cozy Onesie');
    expect(await inventoryPage.getCartBadgeCount()).toBe(2);
    await inventoryPage.removeFromCart('Trailblazer Backpack');
    expect(await inventoryPage.getCartBadgeCount()).toBe(1);
  });

  // REQ-4
  test('removing item from cart page leaves remaining items intact', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart('Trailblazer Backpack');
    await inventoryPage.addToCart('Beacon Bike Light');
    await inventoryPage.navigateToCart();
    await cartPage.removeItem('Trailblazer Backpack');
    const remaining = await cartPage.getCartItems();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].name).toBe('Beacon Bike Light');
  });

  // REQ-5
  test('removing item from inventory page decrements badge', async ({ inventoryPage }) => {
    await inventoryPage.addToCart('Trailblazer Backpack');
    await inventoryPage.addToCart('Beacon Bike Light');
    await inventoryPage.removeFromCart('Trailblazer Backpack');
    expect(await inventoryPage.getCartBadgeCount()).toBe(1);
  });

  // REQ-6
  test('cart retains items after navigating away and returning', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart('Summit Fleece Jacket');
    await inventoryPage.navigateToCart();
    await cartPage.continueShopping();
    await inventoryPage.navigateToCart();
    const items = await cartPage.getCartItems();
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('Summit Fleece Jacket');
  });

  // REQ-7
  test('checkout subtotal matches sum of added item prices', async ({ inventoryPage, cartPage, checkoutPage }) => {
    const backpack  = productByName('Trailblazer Backpack');  // $29.99
    const bikeLight = productByName('Beacon Bike Light');      // $9.99
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.addToCart(bikeLight.name);
    await inventoryPage.navigateToCart();
    await cartPage.checkout();
    await checkoutPage.fillInfo('Test', 'User', '12345');
    await checkoutPage.continue();
    const summary = await checkoutPage.getOrderSummary();
    const expectedSubtotal = (backpack.price + bikeLight.price).toFixed(2);
    expect(summary.subtotal).toContain(expectedSubtotal);
  });

  // REQ-8
  test('full checkout flow ends with order confirmation', { tag: '@smoke' }, async ({ inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.addToCart('Bolt T-Shirt');
    await inventoryPage.navigateToCart();
    await cartPage.checkout();
    await checkoutPage.fillInfo('Jane', 'Doe', '94105');
    await checkoutPage.continue();
    await checkoutPage.finish();
    expect(await checkoutPage.isOrderComplete()).toBe(true);
  });

  // REQ-9
  test('navigating to cart without adding items shows empty cart', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.navigateToCart();
    const items = await cartPage.getCartItems();
    expect(items).toHaveLength(0);
  });

  // REQ-10
  test('cart item name and price match what was shown in inventory', async ({ inventoryPage, cartPage }) => {
    const inventoryPrice = await inventoryPage.getPriceOf('Cozy Onesie');
    await inventoryPage.addToCart('Cozy Onesie');
    await inventoryPage.navigateToCart();
    const [item] = await cartPage.getCartItems();
    expect(item.name).toBe('Cozy Onesie');
    expect(item.price).toBe(inventoryPrice);
  });

});
