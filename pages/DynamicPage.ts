import { Page, Locator, expect } from '@playwright/test';

/**
 * Page object for the dynamic-loading page (/dynamic.html).
 * Demonstrates waiting for a spinner to disappear and async content to appear —
 * relying on Playwright's auto-waiting rather than hard sleeps.
 */
export class DynamicPage {
  readonly page: Page;
  private readonly loadBtn: Locator;
  private readonly spinner: Locator;
  private readonly content: Locator;

  constructor(page: Page) {
    this.page    = page;
    this.loadBtn = page.locator('[data-test="load"]');
    this.spinner = page.locator('[data-test="spinner"]');
    this.content = page.locator('[data-test="content"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/dynamic.html');
    await expect(this.loadBtn).toBeVisible();
  }

  async startLoad(): Promise<void> {
    await this.loadBtn.click();
  }

  /** Wait for the async content to finish loading (spinner gone, content shown). */
  async waitForContent(): Promise<void> {
    await expect(this.spinner).toBeHidden();
    await expect(this.content).toBeVisible();
  }

  async getContentText(): Promise<string> {
    return this.page.locator('[data-test="content-text"]').innerText();
  }

  async getLoadedItemCount(): Promise<number> {
    return this.page.locator('[data-test="product-names"] li').count();
  }
}
