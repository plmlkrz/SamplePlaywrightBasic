---
name: task-kickoff
description: "Run a single focused task with full discipline: an explicit kickoff (understanding, files to read, failure points, scope lock, assumption surfacing) and a closeout quality gate (correctness, edge cases, regressions, plain-language summary). Use for a scoped change to this framework — a new test, a POM method, a demo-page tweak, a bug fix. Not for multi-area features."
---

# Task Kickoff

A lightweight discipline wrapper for a single scoped task in this framework.

## Kickoff (before writing code)

1. **Restate the task** in one sentence so intent is locked.
2. **Files to read** — list the specific files this touches (a POM in `pages/`,
   a spec in `tests/`, a page in `app/public/`, a fixture or config). Read them.
3. **Failure points** — name what could break: a selector the demo page doesn't
   expose, a fixture not wired up, a tag typo, a flaky wait.
4. **Scope lock** — state explicitly what is *out* of scope so the change stays
   small.
5. **Surface assumptions** — if anything is ambiguous (which account? which tag?
   unit vs e2e?), state your assumption or ask before proceeding.

## Doing the work

- Reuse existing fixtures and POM methods; add a POM method rather than putting
  raw locators in a spec.
- Match the surrounding style: comment density, `data-test` selector preference,
  web-first assertions.

## Closeout quality gate (before declaring done)

- **Correctness** — does it do exactly what was asked?
- **Edge cases** — empty/invalid inputs, zero items, error states considered?
- **Regressions** — run the affected suite (`npm run test:smoke` at minimum) and
  report the result honestly, including failures.
- **Summary** — a plain-language note of what changed and how it was verified.
