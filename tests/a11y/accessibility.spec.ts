/**
 * ACCESSIBILITY tests using axe-core.
 *
 * Each public page is scanned for WCAG violations. We fail on `serious` and
 * `critical` impact issues — the ones that actually block users of assistive
 * technology. Lower-impact findings are reported in the HTML report but don't
 * fail the build, which keeps a11y testing actionable rather than noisy.
 *
 * Add the `loggedInPage` fixture to also scan inventory/cart once authenticated.
 */

import { test, expect } from '../../src/fixtures/test-fixtures';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
  { name: 'login', path: '/' },
  { name: 'index', path: '/index.html' },
  { name: 'data table', path: '/table.html' },
  { name: 'forms', path: '/forms.html' },
  { name: 'dynamic', path: '/dynamic.html' },
  { name: 'modal', path: '/modal.html' },
  { name: 'upload', path: '/upload.html' },
];

test.describe('Accessibility (axe-core)', { tag: '@a11y' }, () => {

  for (const { name, path } of PAGES) {
    test(`${name} page has no serious/critical violations`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      const blocking = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical'
      );

      // Helpful failure message: list the rule ids that broke.
      expect(blocking.map((v) => `${v.id} (${v.impact})`)).toEqual([]);
    });
  }

});
