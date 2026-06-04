# Sample Playwright Basic

A TypeScript Playwright sample project that tests the SauceDemo shopping cart flow using a mix of UI automation, page objects, unit-style cart tests, API examples, and hybrid API/UI testing patterns.

## What This Project Covers

- End-to-end SauceDemo shopping cart and checkout tests
- Login validation tests
- Page Object Model classes for common SauceDemo pages
- Backend-style unit tests for a local `ShoppingCart` model
- API tests using Playwright's `request` fixture
- Hybrid tests that seed browser state with `localStorage` and verify behavior in the UI
- Network interception examples for inspecting and mocking traffic
- Skipped boilerplate examples that act as a Playwright reference guide

## Tech Stack

- Node.js
- TypeScript
- Playwright Test
- SauceDemo as the target UI application

## Project Structure

```text
.
|-- pages/
|   |-- CartPage.ts
|   |-- CheckoutPage.ts
|   |-- InventoryPage.ts
|   `-- LoginPage.ts
|-- src/
|   |-- cart.ts
|   `-- data/
|       `-- products.ts
|-- tests/
|   |-- api-hybrid.spec.ts
|   |-- boilerplate-examples.spec.ts
|   |-- cart-backend.spec.ts
|   `-- shopping-cart.spec.ts
|-- package.json
|-- package-lock.json
`-- playwright.config.ts
```

## Getting Started

Install dependencies:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install
```

Run the full test suite:

```bash
npm test
```

## Useful Scripts

Run all tests:

```bash
npm test
```

Run only Chromium:

```bash
npm run test:chromium
```

Run backend cart tests:

```bash
npm run test:cart-backend
```

Run the main SauceDemo E2E cart tests:

```bash
npm run test:e2e
```

Open the latest HTML report:

```bash
npm run report
```

Launch Playwright codegen against SauceDemo:

```bash
npm run codegen
```

## Test Suites

### `tests/shopping-cart.spec.ts`

Covers the primary SauceDemo user flows:

- Add one or more items to the cart
- Remove items from the inventory and cart pages
- Verify cart persistence during navigation
- Validate checkout subtotal calculation
- Complete checkout successfully
- Validate login error states

### `tests/cart-backend.spec.ts`

Tests the local `ShoppingCart` class without opening a browser:

- Add, remove, retrieve, and clear cart items
- Validate totals and item counts
- Check product test data integrity

### `tests/api-hybrid.spec.ts`

Demonstrates API and hybrid automation patterns:

- Direct HTTP checks with Playwright's `request` fixture
- JSONPlaceholder API examples as stand-ins for backend endpoints
- Programmatic cart setup using SauceDemo `localStorage`
- Network monitoring and route mocking

### `tests/boilerplate-examples.spec.ts`

A skipped reference suite with examples for:

- Navigation
- Selectors
- Interactions
- Assertions
- Waits and timing
- Test organization
- Page Object Model usage
- Debugging helpers

Because these tests use `test.skip()`, they are documentation/examples and do not run during the normal suite.

## Configuration

The Playwright configuration lives in `playwright.config.ts`.

Key settings:

- `testDir`: `./tests`
- `baseURL`: `https://www.saucedemo.com`
- Browser projects: Chromium, Firefox, and WebKit
- HTML reporter enabled
- Traces captured on first retry
- Screenshots and videos retained on failure
- CI retries enabled

## Test Credentials

The E2E tests use SauceDemo's public sample credentials:

```text
Username: standard_user
Password: secret_sauce
```

Login validation tests also use SauceDemo's built-in locked-out user and invalid credential scenarios.

## Debugging

Run tests headed:

```bash
npx playwright test --headed
```

Run a specific spec:

```bash
npx playwright test tests/shopping-cart.spec.ts
```

Run a specific test by title:

```bash
npx playwright test --grep "REQ-8"
```

Open the HTML report after a run:

```bash
npm run report
```

## Notes

- The SauceDemo UI stores cart state in `localStorage` under `cart-contents`.
- Product fixture data in `src/data/products.ts` includes SauceDemo's internal cart indexes so hybrid tests can seed cart state directly.
- Page objects are kept assertion-light, with most expectations living in the spec files.
