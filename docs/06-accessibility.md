# 6. Accessibility Testing

Accessibility (a11y) testing checks that people using screen readers, keyboards,
or other assistive technology can use the app. It's a standard part of modern QA,
and it's easy to automate a baseline.

## axe-core scans

`tests/a11y/accessibility.spec.ts` uses [`@axe-core/playwright`](https://www.npmjs.com/package/@axe-core/playwright)
to scan each page against WCAG rules:

```ts
import AxeBuilder from '@axe-core/playwright';

test('login page has no serious/critical violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  const blocking = results.violations.filter(
    v => v.impact === 'serious' || v.impact === 'critical'
  );
  expect(blocking.map(v => `${v.id} (${v.impact})`)).toEqual([]);
});
```

We **fail on `serious`/`critical`** issues (the ones that actually block AT
users) and let lower-impact findings show up in the report without failing the
build. That keeps a11y testing actionable instead of a wall of noise.

Run just these:

```bash
npm run test:a11y
```

## What axe can and can't catch

Automated scans catch ~30–50% of issues: missing labels, low contrast, bad ARIA,
missing landmarks. They **cannot** judge whether your focus order makes sense or
whether a label is *meaningful*. So pair axe with manual checks:

- **Keyboard only** — unplug the mouse. Can you reach and operate everything?
  Does the modal trap focus and restore it on close? Does Escape close it?
- **Visible focus** — is there always a clear focus ring? (The demo CSS uses
  `:focus-visible`.)
- **Screen reader** — do errors and status updates get announced? The demo uses
  `role="alert"` / `role="status"` for exactly this.

## The demo pages are teaching examples

The pages in `app/public/` are deliberately built accessibly — semantic
`<button>`/`<label>`, `aria-label` on the icon-only cart link, live regions for
errors, ≥44px touch targets. Read them as examples of *correct* markup.

Try breaking one (remove a `<label>`, or swap a `<button>` for a `<div>`) and
watch the a11y test catch it. The `accessibility-reviewer` Claude skill/agent can
review markup changes for you — see [AI-assisted QA](08-ai-assisted-qa.md).

Next: [Tags & CI](07-tags-and-ci.md).
