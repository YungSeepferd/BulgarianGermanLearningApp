# Agents Guide for AI Coding Assistants

This guide keeps human developers and AI collaborators aligned with the Bulgarian–German learning app’s standards.

## Project Structure Guide

| Path | Purpose |
| --- | --- |
| `assets/js/` | Vanilla ES modules for flashcards, spaced repetition, language toggle, and utility helpers. |
| `assets/scss/` | Component/page SCSS partials compiled via Hugo Pipes; `main.scss` is the entry point. |
| `layouts/` | Hugo templates, partials, and shortcodes (e.g., `flashcards.html`, navigation). |
| `content/` | Markdown content and practice pages. |
| `data/` | Canonical JSON vocab/grammar sources consumed by Hugo and client scripts. |
| `static/` | PWA assets, service worker, fonts, images. |
| `tools/` | Go helpers for data processing (standalone Go module). |
| `docs/` | Architecture, development, testing, and daily notes. |
| `tests/playwright/` | E2E smoke tests. |
| `.windsurf/workflows/` | Windsurf automation and prompts. |
| `.github/workflows/` | GitHub Actions CI definitions. |

## Coding Conventions

### General
- Plan scope up front, keep diffs minimal, and avoid introducing new dependencies.
- Prefer pure functions and small modules; add succinct comments only when logic is non-obvious.
- Maintain accessibility, performance, and offline constraints described in `docs/DEVELOPMENT.md`.

### Hugo Templates
- Keep templates declarative; push imperative logic into JS modules.
- Reuse existing shortcodes/partials instead of duplicating markup.
- Localize strings where possible and respect `i18n/` usage patterns.

### JavaScript (ES Modules)
- Use `import`/`export` syntax and relative module paths.
- No external framework/bundler—stick to browser-ready ES modules.
- Persist spaced-repetition data with the `bgde:` localStorage prefix; follow SM-2 rules in `spaced-repetition.js`.
- Wire keyboard shortcuts (Space/Enter to flip, digits 0–5 to grade) and ensure ARIA/live-region updates for screen readers.
- Handle offline mode gracefully by preferring embedded JSON before network fetches.
- Speech practice lives in `assets/js/speech-recognition.js`; always guard usage behind `SpeechPractice.isSupported()` so unsupported browsers degrade gracefully.

### SCSS
- Organize styles as partials under `assets/scss/components/` and `assets/scss/pages/`; import them from `main.scss`.
- Use nesting sparingly, prefer BEM-style class names, and keep variables/mixins in `_variables.scss` / `_mixins.scss`.
- Rely on Hugo Pipes (`css.Sass | resources.Minify | resources.Fingerprint`)—no additional build tooling.

### Go Utilities
- Keep Go code inside `tools/`; format with `gofmt` and structure packages under `internal/`.
- Use the existing CLI pattern (`cmd/hugo-bg-de`) built on `urfave/cli/v2`.
- Avoid network access in helpers/tests; operate on local data files.

## Testing Requirements

- **Hugo build**: `hugo --logLevel debug -D` must run without warnings before merging.
- **Production build**: `npm run build` (wraps `hugo --gc --minify`) before release branches.
- **Data validation**: `npm run lint:data` to enforce schema rules for `data/*.json`.
- **ES module syntax**: `npm run lint:esm` validates browser modules without needing external tooling.
- **Go tests**: From the repo root run `GOCACHE=$(pwd)/.gocache go test ./tools/...`.
- **E2E smoke**: `npm test` (Playwright) for navigation and vocabulary regressions when touching UI flows.
- **Accessibility/UX**: Manually confirm keyboard flows, screen-reader announcements, and responsive layout at ~360 px width whenever flashcard/UI changes land.
- **PWA checks**: Ensure `static/sw.js` registers cleanly and offline shell works after asset changes.

## Programmatic Checks (Pre-commit)

Run these before submitting a PR or sharing a patch:

1. `hugo --logLevel debug -D`
2. `npm run lint:data`
3. `npm run lint:esm`
4. `GOCACHE=$(pwd)/.gocache go test ./tools/...`
5. `npm run build`
6. `npm test` (or targeted Playwright spec) when modifying interactive UI or data loading flows.

Log any sandbox or environment-related failures with clear rationale (e.g., network restrictions) in `docs/notes/TODAY.md` and your PR notes.

## MCP Tooling

- MCP servers are not provisioned in this workspace; running `/mcp` will report the absence of configured hosts.
- Until official MCP connectors (Codex tool, Figma sync, Playwright MCP) are available, note any manual sync steps in PR descriptions and operate with local tooling.
- Re-check availability before large tasks so the guide can be updated once integration is provided.

## PR Guidelines

- **Commits**: Use concise, imperative subjects (e.g., `Fix flashcard keyboard binding`). Group related changes; avoid mixing unrelated fixes.
- **Descriptions**: Summarize scope, list validation commands, and call out UX implications or screenshots when UI changes apply.
- **Reviews**: Ensure code and docs align; mention follow-up tasks in `docs/notes/NEXT.md` if work is deferred.
- **Documentation**: Update relevant guides (`docs/DEVELOPMENT.md`, `docs/PROGRAMMING_LINKS.md`, etc.) and append entries to `docs/notes/TODAY.md` with goal, plan, results, next steps.

## Collaboration Notes

- Reference files using workspace-relative paths (`assets/js/flashcards.js:156`) in discussions.
- Follow Windsurf workflows in `.windsurf/workflows/` when using automated loops.
- Surface technical debt or blockers by logging TODOs in `docs/notes/NEXT.md`.
