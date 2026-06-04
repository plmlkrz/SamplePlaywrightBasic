# 1. Getting Started

This framework is **self-contained**: it includes the web app you test, so you
don't depend on any external website.

## Install

```bash
npm install
npx playwright install     # one-time: downloads Chromium, Firefox, WebKit
```

## Run the tests

```bash
npm test
```

You'll see Playwright **start the demo store automatically**, then run every
suite across Chromium, Firefox, and WebKit. The first thing to understand:

> You never start the app manually for tests. The `webServer` block in
> `playwright.config.ts` boots `app/server.ts`, waits for it to respond, runs the
> tests, then shuts it down.

For a faster inner loop while learning, run one browser:

```bash
npm run test:chromium
```

## See the app yourself

To click around the pages you're testing:

```bash
npm run app:start
# open http://localhost:3100
```

Log in with `standard_user` / `secret_sauce`, then explore the inventory, cart,
checkout, and the practice pages (table, forms, modal, upload, dynamic loading).

## Read the report

After any run:

```bash
npm run report
```

The HTML report shows each test, and for failures: a trace, a screenshot, and a
video. The trace viewer (click a failed test → "Trace") lets you scrub through
the run step by step — the single most useful debugging tool in Playwright.

## How the pieces fit

```
config/env.ts        → which URL/timeouts to use
   ↓ read by
playwright.config.ts → starts the app, configures browsers + reporters
   ↓ tests import
src/fixtures/...     → hands each test ready-made page objects + login
   ↓ which wrap
pages/*.ts           → page objects with action methods
   ↓ that drive
app/public/*.html    → the demo store under test
```

Next: [Write your first test](02-write-your-first-test.md).
