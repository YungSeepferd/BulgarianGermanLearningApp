## Claude Code — Usage guide for BulgarianGermanLearningApp

This document expands the short guidance in `CLAUDE.md` with practical examples, a short checklist, and recommended workflows for using Claude Code with this repository.

### Goals

- Make it easy for contributors to run Claude Code on relevant parts of the repo.
- Provide safe defaults and templates to avoid accidental disclosure of sensitive data.
- Provide repeatable prompts and verification steps so generated changes are easy to review.

### Quick checklist before you run Claude Code

1. Ensure you're on a feature branch.
2. Make sure you have local environment versions installed (Node 18+, Go 1.21+, Hugo Extended). Consider using a devcontainer.
3. Export no secrets to the terminal/session that Claude will read. Replace them with placeholders if you must include code that references keys.
4. Limit context to the minimal files required and summarize the task in 1–3 sentences.

### Where to point Claude for common tasks

- Fix ESM lint errors: focus on `assets/js/`.
- Accessibility fixes: focus on `layouts/` and `assets/js/`.
- Spaced repetition docs or logic: `assets/js/unified-spaced-repetition.js`, `docs/`, and `layouts/flashcards.html`.
- Data processing tools (Go): `tools/` folder and its `go.mod`.

### Example detailed prompts (expanded)

1) Run and fix ESM lint

Task description (example prompt):

"Run `npm run lint:esm` in this repository and summarize the errors. For each error that is clearly fixable, propose a minimal patch in unified diff format. Limit modifications to files under `assets/js/`. If an error requires deeper design changes, list the recommended change and why it is risky to auto-apply."

Why this helps: This prompt keeps patches focused, avoids touching templates or build artifacts, and asks for human review on risky changes.

2) Accessibility review (short)

"Review `layouts/` and `assets/js/` for keyboard-accessibility and ARIA issues. Produce a short list of issues and for each give a one-file patch (or a one-paragraph code suggestion) with an explanation. Prioritize fixes that improve keyboard navigation (space/enter flips, focus order)."

3) Explain and improve spaced repetition docs

"Summarize how SM-2 is implemented in `assets/js/unified-spaced-repetition.js`. Propose 3 small doc edits to `docs/` or `CLAUDE.md` that would make maintenance easier (max 120 words each)."

### Verification steps after receiving a patch

1. Run `npm run lint:esm` and `npm test` locally.
2. Run `hugo server -D --logLevel=debug` and visit the affected pages.
3. For style or accessibility changes, run a small manual test (keyboard nav) or an automated accessibility audit if configured.
4. Include the verification commands and results in the PR description.

### Storing and evolving prompts

- Keep templates small and task-focused. If a template grows beyond a few lines, make it a documentation example, not a committed prompt.
- Periodically review `.claude/prompts/` for outdated templates.

### Troubleshooting

- If Claude returns large, noisy diffs, reject and ask for smaller, targeted changes.
- If Claude attempts to reference private data, stop and redact. Report the event to the maintainer if it happened accidentally.

---

If you want, I can add a short developer script to run a recommended pre-run checklist (e.g., `scripts/claude-check.sh`) to help contributors follow the guidance automatically.
