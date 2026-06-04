# 7. Tags & CI

## Tags

Every test carries one or more tags so you can run meaningful subsets. Tags are
just `@`-prefixed strings in the title-options object:

```ts
test.describe('Shopping Cart Requirements', { tag: '@regression' }, () => {
  test('adding one item increments the badge', { tag: '@smoke' }, async ({ inventoryPage }) => {
    // ...
  });
});
```

A test inherits its describe's tag and can add its own.

| Tag | Meaning | Run it |
|---|---|---|
| `@smoke` | Critical happy paths — fast confidence check | `npm run test:smoke` |
| `@regression` | Full behavioural coverage | (runs in `npm test`) |
| `@api` | Pure-API + hybrid/network tests | `npm run test:api` |
| `@unit` | Browser-less model tests | `npm run test:unit` |
| `@a11y` | Accessibility scans | `npm run test:a11y` |

Run any tag expression directly:

```bash
npx playwright test --grep @smoke
npx playwright test --grep-invert @a11y     # everything except a11y
```

### When to use which tag

- Tag a test `@smoke` only if its failure means "the app is broken for everyone"
  (login works, you can check out). Keep this suite small and fast.
- Everything else is `@regression`.
- `@api`, `@unit`, `@a11y` describe the *kind* of test, and map to folders.

## Continuous Integration

`.github/workflows/playwright.yml` runs the full suite on every push/PR to
`main`/`master`:

```yaml
- run: npm ci
- run: npx playwright install --with-deps
- run: npx playwright test
  env:
    TEST_ENV: ci
- uses: actions/upload-artifact@v4   # uploads the HTML report
  with:
    name: playwright-report
    path: playwright-report/
```

Notice there's **no "start the app" step** — the `webServer` block in the config
starts and stops it automatically, in CI exactly as it does locally.

`TEST_ENV=ci` selects the `ci` profile (longer timeouts, 2 retries) from
`config/env.ts`. After a CI run, download the `playwright-report` artifact to see
traces and screenshots for any failure.

### A faster PR check (optional)

If the full matrix gets slow, gate PRs on smoke first:

```yaml
- run: npx playwright test --grep @smoke --project=chromium
  env: { TEST_ENV: ci }
```

Next: [AI-assisted QA](08-ai-assisted-qa.md).
