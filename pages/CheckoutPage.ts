import { Page, Locator, expect } from '@playwright/test';

export interface OrderSummary {
  items: { name: string; price: string }[];
  subtotal: string;
  tax: string;
  total: string;
}

export class CheckoutPage {
  readonly page: Page;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly zipInput: Locator;
  private readonly continueBtn: Locator;
  private readonly finishBtn: Locator;
  private readonly completeHeader: Locator;

  constructor(page: Page) {
    this.page           = page;
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput  = page.locator('[data-test="lastName"]');
    this.zipInput       = page.locator('[data-test="postalCode"]');
    this.continueBtn    = page.locator('[data-test="continue"]');
    this.finishBtn      = page.locator('[data-test="finish"]');
    this.completeHeader = page.locator('.complete-header');
  }

  async fillInfo(firstName: string, lastName: string, zip: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.zipInput.fill(zip);
  }

  async continue(): Promise<void> {
    await this.continueBtn.click();
    await expect(this.page).toHaveURL(/checkout-step-two/);
  }

  async getOrderSummary(): Promise<OrderSummary> {
    const itemRows = this.page.locator('.cart_item');
    const count    = await itemRows.count();
    const items: OrderSummary['items'] = [];
    for (let i = 0; i < count; i++) {
      const row = itemRows.nth(i);
      items.push({
        name:  await row.locator('.inventory_item_name').innerText(),
        price: await row.locator('.inventory_item_price').innerText(),
      });
    }
    return {
      items,
      subtotal: await this.page.locator('.summary_subtotal_label').innerText(),
      tax:      await this.page.locator('.summary_tax_label').innerText(),
      total:    await this.page.locator('.summary_total_label').innerText(),
    };
  }

  async finish(): Promise<void> {
    await this.finishBtn.click();
    await expect(this.page).toHaveURL(/checkout-complete/);
  }

  async isOrderComplete(): Promise<boolean> {
    return this.completeHeader.isVisible();
  }
}
