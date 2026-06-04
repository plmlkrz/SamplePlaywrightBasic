# 2. Write Your First Test

Let's add a test that verifies a logged-in user sees all six products. You'll use
the framework's fixtures so there's almost no setup code.

## Step 1 — Create the file

Create `tests/e2e/my-first.spec.ts`:

```ts
import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('My first tests', { tag: '@regression' }, () => {

  test('the inventory shows six products', async ({ loggedInPage, inventoryPage }) => {
    // `loggedInPage` already logged us in and landed on the inventory page.
    const products = await inventoryPage.getProducts();
    expect(products).toHaveLength(6);
  });

});
```

Two things to notice:

- We import `test`/`expect` from **`src/fixtures/test-fixtures`**, not from
  `@playwright/test`. That's what gives us the `loggedInPage` and `inventoryPage`
  fixtures.
- We never wrote login code. The `loggedInPage` fixture did it (using the
  `standard` account from `src/data/accounts.ts`).

## Step 2 — Run it

```bash
npx playwright test tests/e2e/my-first.spec.ts --project=chromium
```

You should see it pass.

## Step 3 — Make it fail (on purpose)

Change `toHaveLength(6)` to `toHaveLength(5)` and re-run. Open the report:

```bash
npm run report
```

Read the failure message — Playwright tells you it received 6 but expected 5.
Change it back to 6.

## Step 4 — Add an assertion of your own

Try asserting a specific product is present:

```ts
test('the backpack is listed', async ({ loggedInPage, inventoryPage }) => {
  const products = await inventoryPage.getProducts();
  expect(products).toContain('Trailblazer Backpack');
});
```

(Product names live in `src/data/products.ts` — never invent them.)

## What you just used

- **Fixtures** to skip boilerplate — see [Fixtures & config](04-fixtures-and-config.md).
- A **page object** (`inventoryPage.getProducts()`) instead of raw selectors —
  see [The Page Object Model](03-page-object-model.md).
- A **tag** (`@regression`) so the test joins the right suite — see
  [Tags & CI](07-tags-and-ci.md).

When you want a test for a new scenario, the `e2e-scenario` Claude skill can
generate one for you — see [AI-assisted QA](08-ai-assisted-qa.md).
