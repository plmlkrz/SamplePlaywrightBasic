Run the full Playwright suite and automatically fix any failing tests by healing broken locators and outdated assertions. Loop until all tests pass or 3 iterations are exhausted.

## Test command

```powershell
.\node_modules\.bin\playwright.cmd test --config playwright.config.ts
```

(The demo app starts automatically via the `webServer` block in the config, so you do not need to start it yourself.)

## The healing loop

Repeat up to **3 iterations**. Each iteration:

### Step 1 — Run the full suite

Execute the test command above. Capture which tests failed and their spec file paths.

If **0 tests failed**: report success and stop. Do not continue.

### Step 2 — Collect error contexts

Use Glob to find all files matching `test-results/**/error-context.md`.

Read each one. Each file contains:
- **Test info**: spec file path and line number
- **Error details**: the exact assertion/locator failure message, plus the current page accessibility tree (what the DOM actually looks like right now)
- **Test source**: the spec code with `>` marking the failing line

### Step 3 — Fix failures (parallel per spec file)

Group the failing error-context files by their spec file. For each distinct spec file that has failures, **spawn a subagent** (use the Agent tool) with this prompt — fill in the placeholders:

> You are a Playwright test fixer. The spec file `[SPEC_FILE_PATH]` has [N] failing test(s). Fix only the broken lines — do not touch passing tests.
>
> Error context files for the failures:
> [PASTE FULL CONTENT OF EACH error-context.md FOR THIS SPEC]
>
> Current spec file content:
> [PASTE FULL SPEC FILE CONTENT]
>
> Rules:
> - Fix test code to match the current UI. Never edit app source files in `app/`.
> - This framework uses page objects in `pages/` and fixtures in `src/fixtures/test-fixtures.ts`. If a locator changed, prefer fixing it in the POM method (so every spec benefits) rather than in the spec.
> - Preserve each assertion's intent. If a control was renamed, update the locator — do not delete the assertion.
> - If the DOM snapshot shows the element no longer exists at all (feature removed), do NOT delete the test silently — leave a comment `// HEAL: element not found in DOM — needs manual review` and return a warning.
> - Prefer `getByRole`/`getByText`/`[data-test=...]` over brittle CSS class chains.
> - Fix the minimum number of lines needed. Do not refactor surrounding code.
> - After editing, report exactly: which lines/files changed, old locator/text, new locator/text.

When multiple spec files need fixing, launch all their subagents **in parallel** in a single message. Wait for all to complete before proceeding.

### Step 4 — Verify fixes

Clear stale error contexts, then re-run only the edited specs:

```powershell
Remove-Item -Recurse -Force test-results -ErrorAction SilentlyContinue
.\node_modules\.bin\playwright.cmd test --config playwright.config.ts [space-separated spec file paths]
```

### Step 5 — Decide next action

- **All target specs pass**: run the full suite once more to check for regressions, then report what was fixed and the final pass count.
- **Same tests fail with the same error**: the healer is stuck. Stop, report them, and ask the user to investigate.
- **Tests fail with a different error**: go back to Step 1 (count the iteration).
- **3 iterations exhausted without full green**: stop and report remaining failures with their latest error contexts.

## What the healer fixes vs. flags

| Situation | Action |
|---|---|
| `data-test` / text / role changed | Update the locator (in the POM if shared) |
| Heading level or label changed | Update the locator |
| Strict-mode violation (matches 2 elements) | Narrow with `.filter()` or a role |
| Element removed from DOM entirely | Leave a `// HEAL` comment, warn — do not delete |
| App logic bug (wrong total, missing redirect) | Flag to user — this is an app bug, not a selector issue |

## Output format

```
## Heal Results — [pass/partial/failed]

Iterations: X of 3
Tests fixed: N
Tests still failing: N

### Fixed
- tests/e2e/shopping-cart.spec.ts — updated InventoryPage.addToCart locator button[id^="add"] → button[id^="add-to-cart"]

### Still failing (manual review needed)
- tests/ui-patterns/table.spec.ts:21 — element [data-test="filter"] not found in DOM snapshot
```
