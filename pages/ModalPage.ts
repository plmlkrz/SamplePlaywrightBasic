import { Page, Locator, expect } from '@playwright/test';

/**
 * Page object for the modal-dialog page (/modal.html).
 * Demonstrates testing dialog open/close, focus management, and confirm/cancel.
 */
export class ModalPage {
  readonly page: Page;
  private readonly openBtn: Locator;
  private readonly dialog: Locator;
  private readonly confirmBtn: Locator;
  private readonly cancelBtn: Locator;
  private readonly result: Locator;

  constructor(page: Page) {
    this.page       = page;
    this.openBtn    = page.locator('[data-test="open-modal"]');
    this.dialog     = page.locator('[data-test="modal"]');
    this.confirmBtn = page.locator('[data-test="confirm"]');
    this.cancelBtn  = page.locator('[data-test="cancel-modal"]');
    this.result     = page.locator('[data-test="result"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/modal.html');
    await expect(this.openBtn).toBeVisible();
  }

  async open(): Promise<void> {
    await this.openBtn.click();
    await expect(this.dialog).toBeVisible();
  }

  async isOpen(): Promise<boolean> {
    return this.dialog.isVisible();
  }

  async confirm(): Promise<void> {
    await this.confirmBtn.click();
    await expect(this.dialog).toBeHidden();
  }

  async cancel(): Promise<void> {
    await this.cancelBtn.click();
    await expect(this.dialog).toBeHidden();
  }

  async getResult(): Promise<string> {
    return this.result.innerText();
  }
}
