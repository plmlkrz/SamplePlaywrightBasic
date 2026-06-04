/** Dynamic loading: wait for a spinner to disappear and async content to appear. */
import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Dynamic Loading', { tag: '@regression' }, () => {

  test('content appears after the spinner finishes', { tag: '@smoke' }, async ({ dynamicPage }) => {
    await dynamicPage.goto();
    await dynamicPage.startLoad();
    await dynamicPage.waitForContent();           // auto-waits — no hard sleep
    expect(await dynamicPage.getContentText()).toContain('asynchronously');
  });

  test('loaded content includes the products from the API', async ({ dynamicPage }) => {
    await dynamicPage.goto();
    await dynamicPage.startLoad();
    await dynamicPage.waitForContent();
    expect(await dynamicPage.getLoadedItemCount()).toBe(6);
  });

});
