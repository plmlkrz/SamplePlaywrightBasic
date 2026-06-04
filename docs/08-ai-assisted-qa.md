# 8. AI-Assisted QA

This framework includes a set of [Claude Code](https://claude.com/claude-code)
skills, agents, and a command in `.claude/`. They're optional — the framework
works without them — but they show how AI fits into a modern QA workflow. They
only run if you use Claude Code in this repo.

## Skills (`.claude/skills/`)

Invoke a skill by name (e.g. `/e2e-scenario`) or just describe what you want.

| Skill | Use it to… |
|---|---|
| **e2e-scenario** | Generate a runnable Playwright spec from a plain-English scenario. It reads the fixtures, page objects, accounts, and tag conventions first, so the generated test fits this framework. |
| **qa-engineer** | Get a risk assessment, coverage-gap analysis, prioritized test recommendations, and a manual checklist for a change. |
| **accessibility-reviewer** | Review a change to the demo pages for a11y issues (semantics, ARIA, focus, contrast, touch targets). |
| **task-kickoff** | Run a single scoped task with an explicit kickoff and a closeout quality gate. |

Example:

> "Use **e2e-scenario** to test that a user who seeds two items, removes one in
> the cart, and checks out sees the correct total."

The skill produces the spec, tells you which fixtures/POM methods it used, and
gives you the exact command to run it.

## Agents (`.claude/agents/`)

`qa-engineer` and `accessibility-reviewer` also exist as **subagents**, which run
the review in their own context (useful for a focused, isolated review of a diff
before merge).

## The `/heal-tests` command (`.claude/commands/`)

When the UI changes and locators break, `/heal-tests`:

1. Runs the full suite and collects the `test-results/**/error-context.md` files
   Playwright writes for each failure (these include the *current* DOM snapshot).
2. Spawns a fixer subagent **per failing spec, in parallel**, that updates the
   broken locator/assertion — preferring to fix the shared page object so every
   spec benefits — while preserving each assertion's intent.
3. Re-runs the edited specs, then the full suite, looping up to 3 times.

It **fixes** selector/text/role drift; it **flags** (never silently deletes)
elements that vanished from the DOM or genuine app-logic bugs.

Try it: rename a `data-test` attribute in a demo page, run `/heal-tests`, and
watch it locate and repair the affected tests.

## Why this matters

The tedious parts of QA automation — scaffolding a new spec, keeping locators in
sync with UI churn, triaging which tests to add — are exactly what these tools
accelerate. You stay in charge of *what* to test and *whether the result is
right*; the AI handles the mechanical work. Read each `.claude/**/*.md` file to
see precisely what it does.
