import { Page, Locator, expect } from '@playwright/test';

export interface SignupData {
  fullName?: string;
  email?: string;
  password?: string;
  country?: string;
  agreeToTerms?: boolean;
}

/**
 * Page object for the form-validation page (/forms.html).
 * Demonstrates testing required fields, format validation, and inline errors.
 */
export class FormPage {
  readonly page: Page;
  private readonly submitBtn: Locator;
  private readonly success: Locator;

  constructor(page: Page) {
    this.page      = page;
    this.submitBtn = page.locator('[data-test="submit"]');
    this.success   = page.locator('[data-test="success"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/forms.html');
    await expect(this.submitBtn).toBeVisible();
  }

  /** Fill any subset of the form. Omitted fields are left untouched. */
  async fill(data: SignupData): Promise<void> {
    if (data.fullName !== undefined) await this.page.locator('[data-test="fullName"]').fill(data.fullName);
    if (data.email !== undefined)    await this.page.locator('[data-test="email"]').fill(data.email);
    if (data.password !== undefined) await this.page.locator('[data-test="password"]').fill(data.password);
    if (data.country !== undefined)  await this.page.locator('[data-test="country"]').selectOption(data.country);
    if (data.agreeToTerms)           await this.page.locator('[data-test="terms"]').check();
  }

  async submit(): Promise<void> {
    await this.submitBtn.click();
  }

  /** Returns the inline error for a field, or '' if none is shown. */
  async getFieldError(field: keyof SignupData): Promise<string> {
    const el = this.page.locator(`[data-test="error-${field}"]`);
    if (!(await el.isVisible())) return '';
    return el.innerText();
  }

  async isSuccessShown(): Promise<boolean> {
    return this.success.isVisible();
  }
}
