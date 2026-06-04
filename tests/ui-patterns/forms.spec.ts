/** Form validation: required fields, email format, inline errors. */
import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Form Validation', { tag: '@regression' }, () => {

  test.beforeEach(async ({ formPage }) => { await formPage.goto(); });

  test('submitting empty form shows all required-field errors', async ({ formPage }) => {
    await formPage.submit();
    expect(await formPage.getFieldError('fullName')).toContain('required');
    expect(await formPage.getFieldError('email')).toContain('required');
    expect(await formPage.getFieldError('password')).toContain('required');
    expect(await formPage.getFieldError('country')).toContain('country');
    expect(await formPage.getFieldError('terms')).toContain('agree');
    expect(await formPage.isSuccessShown()).toBe(false);
  });

  test('rejects an invalid email format', async ({ formPage }) => {
    await formPage.fill({ fullName: 'Ada', email: 'not-an-email', password: 'longenough', country: 'us', agreeToTerms: true });
    await formPage.submit();
    expect(await formPage.getFieldError('email')).toContain('valid email');
  });

  test('rejects a too-short password', async ({ formPage }) => {
    await formPage.fill({ fullName: 'Ada', email: 'ada@example.com', password: 'short', country: 'us', agreeToTerms: true });
    await formPage.submit();
    expect(await formPage.getFieldError('password')).toContain('at least 8');
  });

  test('accepts a fully valid submission', { tag: '@smoke' }, async ({ formPage }) => {
    await formPage.fill({ fullName: 'Ada Lovelace', email: 'ada@example.com', password: 'password123', country: 'uk', agreeToTerms: true });
    await formPage.submit();
    expect(await formPage.isSuccessShown()).toBe(true);
  });

});
