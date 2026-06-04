# 4. Fixtures & Config

Two ideas borrowed from mature frameworks (like Sentinel) keep tests short and
environment-independent: **custom fixtures** and **config profiles**.

## Custom fixtures

A Playwright *fixture* is something the test runner sets up for you and passes
into your test. Built-in ones include `page` and `request`. This framework adds
its own in `src/fixtures/test-fixtures.ts`:

```ts
export const test = base.extend<Fixtures>({
  inventoryPage: async ({ page }, use) => { await use(new InventoryPage(page)); },
  // ...one per page object...
  loggedInPage: async ({ page, loginPage, inventoryPage }, use) => {
    const { standard } = getEnv().accounts;
    await loginPage.goto();
    await loginPage.login(standard.username, standard.password);
    await inventoryPage.waitForLoad();
    await use(page);
    try { await page.evaluate(() => localStorage.clear()); } catch {}  // cleanup
  },
});
```

Because tests import `test` from here instead of `@playwright/test`, they can
just destructure what they need:

```ts
test('...', async ({ loggedInPage, inventoryPage, cartPage }) => { ... });
```

- **No `new InventoryPage(page)`** in every test — the fixture does it.
- **No repeated login** — `loggedInPage` handles it once, with credentials from
  the account registry.
- **Auto-cleanup** — the teardown after `use()` clears client state. (Playwright
  already isolates each test in a fresh context, so this is belt-and-suspenders,
  but it documents the intent and guards against `reuseExistingServer` bleed.)

Fixtures are **lazy**: a test only pays for the fixtures it actually
destructures, so listing many fixtures is free.

## Config profiles

`config/env.ts` defines named environments:

```ts
const PROFILES = {
  local: { baseURL: 'http://localhost:3100', actionTimeout: 10_000, retries: 0, accounts },
  ci:    { baseURL: 'http://localhost:3100', actionTimeout: 15_000, retries: 2, accounts },
};

export function getEnv() { /* picks a profile from process.env.TEST_ENV */ }
```

`playwright.config.ts` reads `getEnv()` for the base URL, timeouts, and retries —
so switching environments never means editing a test:

```bash
TEST_ENV=ci npm test
```

To point this framework at a real deployed app later, add a `staging` profile
with its URL and accounts; nothing else changes.

## Test data lives in one place

- **Accounts** — `src/data/accounts.ts`. Tests ask for `accounts.standard` etc.;
  credentials are never hardcoded in specs.
- **Products** — `src/data/products.ts`. The same catalog the app serves via
  `GET /api/products`, so tests and app never drift.

Next: [API & hybrid testing](05-api-and-hybrid.md).
