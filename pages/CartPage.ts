import { Page, Locator, expect } from '@playwright/test';

export interface CartItemData {
  name: string;
  price: string;
  quantity: string;
}

export class CartPage {
  readonly page: Page;
  private readonly continueShoppingBtn: Locator;
  private readonly checkoutBtn: Locator;

  constructor(page: Page) {
    this.page                = page;
    this.continueShoppingBtn = page.locator('[data-test="continue-shopping"]');
    this.checkoutBtn         = page.locator('[data-test="checkout"]');
  }

  async waitForLoad(): Promise<void> {
    await expect(this.page).toHaveURL(/cart/);
  }

  async getCartItems(): Promise<CartItemData[]> {
    const rows = this.page.locator('.cart_item');
    const count = await rows.count();
    const result: CartItemData[] = [];
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      result.push({
        name:     await row.locator('.inventory_item_name').innerText(),
        price:    await row.locator('.inventory_item_price').innerText(),
        quantity: await row.locator('.cart_quantity').innerText(),
      });
    }
    return result;
  }

  async removeItem(productName: string): Promise<void> {
    const row = this.page.locator('.cart_item').filter({ hasText: productName });
    await row.locator('button[id^="remove"]').click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingBtn.click();
    await expect(this.page).toHaveURL(/inventory/);
  }

  async checkout(): Promise<void> {
    await this.checkoutBtn.click();
    await expect(this.page).toHaveURL(/checkout-step-one/);
  }
}
