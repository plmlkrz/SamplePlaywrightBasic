import { Page, Locator, expect } from '@playwright/test';

/**
 * Page object for the file-upload page (/upload.html).
 * Demonstrates setting an <input type="file"> with setInputFiles.
 */
export class UploadPage {
  readonly page: Page;
  private readonly fileInput: Locator;
  private readonly fileName: Locator;
  private readonly uploadBtn: Locator;
  private readonly success: Locator;

  constructor(page: Page) {
    this.page      = page;
    this.fileInput = page.locator('[data-test="file-input"]');
    this.fileName  = page.locator('[data-test="file-name"]');
    this.uploadBtn = page.locator('[data-test="upload"]');
    this.success   = page.locator('[data-test="upload-success"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/upload.html');
    await expect(this.fileInput).toBeVisible();
  }

  /**
   * Attach a file. Accepts a real path, or a synthetic file via the object form,
   * e.g. chooseFile({ name: 'report.csv', mimeType: 'text/csv', buffer }).
   */
  async chooseFile(file: string | { name: string; mimeType: string; buffer: Buffer }): Promise<void> {
    await this.fileInput.setInputFiles(file as any);
  }

  async getFileName(): Promise<string> {
    return this.fileName.innerText();
  }

  async upload(): Promise<void> {
    await this.uploadBtn.click();
  }

  async getSuccessMessage(): Promise<string> {
    await expect(this.success).toBeVisible();
    return this.success.innerText();
  }
}
