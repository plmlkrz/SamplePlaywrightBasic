import { Page, Locator, expect } from '@playwright/test';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage {
  readonly page: Page;
  private readonly cartBadge: Locator;
  private readonly cartLink: Locator;
  private readonly sortDropdown: Locator;

  constructor(page: Page) {
    this.page         = page;
    this.cartBadge    = page.locator('.shopping_cart_badge');
    this.cartLink     = page.locator('.shopping_cart_link');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
  }

  async waitForLoad(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory/);
    await expect(this.page.locator('.inventory_list')).toBeVisible();
  }

  async getProducts(): Promise<string[]> {
    return this.page.locator('.inventory_item_name').allInnerTexts();
  }

  async addToCart(productName: string): Promise<void> {
    const item = this.page.locator('.inventory_item').filter({ hasText: productName });
    await item.locator('button[id^="add-to-cart"]').click();
  }

  async removeFromCart(productName: string): Promise<void> {
    const item = this.page.locator('.inventory_item').filter({ hasText: productName });
    await item.locator('button[id^="remove"]').click();
  }

  async getCartBadgeCount(): Promise<number> {
    const visible = await this.cartBadge.isVisible();
    if (!visible) return 0;
    const text = await this.cartBadge.innerText();
    return parseInt(text, 10);
  }

  async navigateToCart(): Promise<void> {
    await this.cartLink.click();
    await expect(this.page).toHaveURL(/cart/);
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async getPriceOf(productName: string): Promise<string> {
    const item = this.page.locator('.inventory_item').filter({ hasText: productName });
    return item.locator('.inventory_item_price').innerText();
  }
}
