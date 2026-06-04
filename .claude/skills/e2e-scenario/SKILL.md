---
name: e2e-scenario
description: Generate a Playwright end-to-end test for a described user scenario against this framework's local demo store. Knows the custom fixtures, page objects, account registry, and tag conventions. Invoke with a plain-English description of the scenario to test (e.g. "a user with two items in the cart removes one and checks out").
---

# e2e-scenario

Generate a complete, runnable Playwright spec from a plain-English scenario, written the way this framework expects.

## Before writing anything

1. Read `src/fixtures/test-fixtures.ts` to see the available fixtures
   (`loginPage`, `inventoryPage`, `cartPage`, `checkoutPage`, `tablePage`,
   `formPage`, `dynamicPage`, `modalPage`, `uploadPage`, and `loggedInPage`).
2. Read the relevant page object(s) in `pages/` to use existing action methods —
   do **not** inline raw locators in the spec if a POM method already exists.
3. Read `src/data/accounts.ts` and `src/data/products.ts` for valid accounts and
   product names. Never hardcode credentials or invent product names.
4. Check `app/public/*.html` if you need a selector the POM doesn't expose yet —
   if a new interaction is needed, add a method to the POM rather than reaching
   into the DOM from the test.

## Rules for the generated spec

- Import `{ test, expect }` from `../../src/fixtures/test-fixtures` (not from
  `@playwright/test`) so the fixtures are available.
- Start authenticated flows with the `loggedInPage` fixture instead of repeating
  login steps.
- Prefer POM methods; assertions live in the test, not the POM.
- Add a tag: `@smoke` for a critical happy path, otherwise `@regression`
  (`@api` for request-only tests, `@a11y` for axe scans). Use the
  `test('title', { tag: '@smoke' }, async ({...}) => {...})` form.
- Use web-first assertions (`await expect(locator).toBeVisible()`); avoid
  `waitForTimeout`.
- Place the file under the right folder: `tests/e2e`, `tests/ui-patterns`,
  `tests/api`, or `tests/a11y`.

## Output

1. The full spec file content, ready to save at a named path.
2. A one-line note on which fixtures/POM methods it relies on, and whether any
   new POM method had to be added.
3. The exact command to run just this spec, e.g.
   `npx playwright test tests/e2e/your-spec.spec.ts --project=chromium`.
