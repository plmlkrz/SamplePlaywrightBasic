# Playwright QA Framework

A **self-contained**, freely-usable Playwright automation framework for QA
engineers — new and experienced — to learn end-to-end testing by example.

It ships with its **own demo web app** (the "system under test"), so there are no
external sites to depend on. Clone it, install, and `npm test` runs a full suite
against industry-standard web pages you can read, modify, and break on purpose.

```bash
git clone <this-repo>
cd playwright-qa-framework
npm install
npx playwright install        # download browser binaries
npm test                      # starts the demo app + runs every test
```

That's it — the demo store starts automatically (see the `webServer` block in
`playwright.config.ts`); you don't start anything by hand.

---

## What's inside

| Area | What it teaches | Where |
|---|---|---|
| **Demo app** | A real app to test: login, products, cart, checkout, table, forms, modal, upload | `app/` |
| **Page Object Models** | Encapsulating pages behind clean action methods | `pages/` |
| **Custom fixtures** | Injecting POMs and a logged-in page; auto-cleanup | `src/fixtures/test-fixtures.ts` |
| **Env config profiles** | Switching environments without editing tests | `config/env.ts` |
| **Account/test data** | Credentials and product data in one place | `src/data/` |
| **Tagged suites** | `@smoke` / `@regression` / `@api` / `@a11y` / `@unit` | every spec |
| **API + hybrid testing** | Pure API tests, state seeding, network mocking | `tests/api/` |
| **Accessibility testing** | axe-core scans for WCAG issues | `tests/a11y/` |
| **AI-assisted QA** | Claude skills/agents for generating & healing tests | `.claude/` |

## Project layout

```
app/            Demo web app (Express server + static pages + in-memory API)
config/         Environment profiles (env.ts)
src/
  cart.ts       ShoppingCart domain model (unit-test subject)
  data/         accounts.ts, products.ts — single source of truth
  fixtures/     Custom Playwright fixtures (POM injection, loggedInPage)
pages/          Page Object Models, one per page
tests/
  e2e/          Full user flows (shopping, login)
  ui-patterns/  Table, forms, dynamic loading, modal, upload
  api/          Pure API + hybrid + network interception
  unit/         Browser-less unit tests for the cart model
  a11y/         Accessibility scans
  examples/     Heavily-commented reference cheat sheet (all skipped)
docs/           Teaching guides — start with docs/01-getting-started.md
.claude/        Claude Code skills, agents, and the /heal-tests command
```

## Common commands

```bash
npm test                 # everything, all browsers
npm run test:chromium    # everything, Chromium only (fastest)
npm run test:smoke       # only @smoke-tagged critical paths
npm run test:e2e         # shopping + login flows
npm run test:api         # API + hybrid tests
npm run test:unit        # browser-less cart unit tests
npm run test:a11y        # accessibility scans
npm run report           # open the HTML report from the last run
npm run codegen          # record a new test against the demo store
npm run app:start        # run the demo app on its own (http://localhost:3100)
```

Switch environments with `TEST_ENV` (see `config/env.ts`): `TEST_ENV=ci npm test`.

## The demo store

The app under test is a small e-commerce store plus a set of practice pages.
Visit `http://localhost:3100` (after `npm run app:start`) to browse them:

- **Login** — form validation and auth errors. Try `standard_user` / `secret_sauce`.
- **Inventory / Cart / Checkout** — an API-backed product grid through to order confirmation.
- **Data table** — sorting, filtering, pagination.
- **Forms** — required fields, email format, inline errors.
- **Dynamic loading** — spinner then async content.
- **Modal** — open/close, focus management, confirm/cancel.
- **Upload** — file selection and upload.

## New here?

Read the guides in order:

1. [Getting started](docs/01-getting-started.md)
2. [Write your first test](docs/02-write-your-first-test.md)
3. [The Page Object Model](docs/03-page-object-model.md)
4. [Fixtures & config](docs/04-fixtures-and-config.md)
5. [API & hybrid testing](docs/05-api-and-hybrid.md)
6. [Accessibility testing](docs/06-accessibility.md)
7. [Tags & CI](docs/07-tags-and-ci.md)
8. [AI-assisted QA](docs/08-ai-assisted-qa.md)

## Debugging

```bash
npx playwright test --headed                 # watch it run in a browser
npx playwright test tests/e2e --debug        # step through with the Inspector
npx playwright test --grep "checkout"        # run tests matching a title
npm run report                               # traces, screenshots, video on failure
```

## License

MIT — use it freely.
