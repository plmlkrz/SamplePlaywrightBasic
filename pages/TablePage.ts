import { Page, Locator, expect } from '@playwright/test';

/**
 * Page object for the data-table page (/table.html).
 * Demonstrates testing sorting, filtering, and pagination.
 */
export class TablePage {
  readonly page: Page;
  private readonly filterInput: Locator;
  private readonly rows: Locator;
  private readonly pageInfo: Locator;
  private readonly nextBtn: Locator;
  private readonly prevBtn: Locator;

  constructor(page: Page) {
    this.page        = page;
    this.filterInput = page.locator('[data-test="filter"]');
    this.rows        = page.locator('tbody#table-body tr');
    this.pageInfo    = page.locator('[data-test="page-info"]');
    this.nextBtn     = page.locator('[data-test="next-page"]');
    this.prevBtn     = page.locator('[data-test="prev-page"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/table.html');
    await expect(this.rows.first()).toBeVisible();
  }

  async filter(text: string): Promise<void> {
    await this.filterInput.fill(text);
  }

  async sortByName(): Promise<void> {
    await this.page.locator('[data-test="sort-name"]').click();
  }

  async sortByScore(): Promise<void> {
    await this.page.locator('[data-test="sort-score"]').click();
  }

  async getRowCount(): Promise<number> {
    return this.rows.count();
  }

  /** Values in the Name column (first cell) for the current page. */
  async getNames(): Promise<string[]> {
    return this.rows.locator('.cell-name').allInnerTexts();
  }

  async getScores(): Promise<number[]> {
    const texts = await this.rows.locator('.cell-score').allInnerTexts();
    return texts.map(t => Number(t));
  }

  async getPageInfo(): Promise<string> {
    return this.pageInfo.innerText();
  }

  async nextPage(): Promise<void> {
    await this.nextBtn.click();
  }

  async prevPage(): Promise<void> {
    await this.prevBtn.click();
  }
}
