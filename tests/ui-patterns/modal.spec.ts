/** Modal dialog: open/close, confirm/cancel, and Escape-to-close. */
import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Modal Dialog', { tag: '@regression' }, () => {

  test.beforeEach(async ({ modalPage }) => { await modalPage.goto(); });

  test('opens and confirms', { tag: '@smoke' }, async ({ modalPage }) => {
    await modalPage.open();
    expect(await modalPage.isOpen()).toBe(true);
    await modalPage.confirm();
    expect(await modalPage.isOpen()).toBe(false);
    expect(await modalPage.getResult()).toBe('Account deleted');
  });

  test('opens and cancels', async ({ modalPage }) => {
    await modalPage.open();
    await modalPage.cancel();
    expect(await modalPage.getResult()).toBe('Cancelled');
  });

  test('closes on Escape', async ({ page, modalPage }) => {
    await modalPage.open();
    await page.keyboard.press('Escape');
    expect(await modalPage.isOpen()).toBe(false);
    expect(await modalPage.getResult()).toBe('Cancelled');
  });

});
