# Next Documentation Follow-ups

- [x] **Align project plan with stack** — Update `docs/PROJECT_PLAN.md` to remove Rust/WebAssembly references and reflect the Hugo + vanilla JS roadmap. *(Completed September 24, 2025)*
- [x] **Add API doc placeholder** — Create `docs/API.md` (or document absence) detailing planned content/data interfaces. *(Completed September 24, 2025)*
- [x] **Expand testing matrix** — Refresh `docs/TESTING.md` to cover current PWA/offline checks, SM-2 persistence, and JS syntax validation commands. *(Completed September 24, 2025)*
- [x] **Document data tooling** — Extend `docs/DEVELOPMENT.md` with usage notes for `npm run process-data` and Go helpers under `tools/`. *(Completed September 24, 2025)*

## Upcoming Tasks

- [x] **Detail API schemas** — Flesh out `docs/API.md` with vocabulary/grammar JSON structures, field definitions, and validation rules. *(Completed September 24, 2025 PM)*
- [x] **Add automation notes** — Document Playwright (or equivalent) smoke suite setup in `docs/TESTING.md` once scripts exist. *(Completed September 25, 2025)*
- [x] **Service worker runbook** — Capture update + rollback steps for `static/sw.js` in `docs/DEVELOPMENT.md` or a new ops note. *(Completed September 25, 2025)*
- [x] **Data pipeline diagram** — Add an architecture snippet illustrating how `npm run process-data` feeds Hugo templates. *(Completed September 25, 2025)*
- [ ] **Validation tooling** — Add `npm run lint:data` (esbuild/js schema check) to enforce vocabulary/grammar constraints outlined in `docs/API.md`.
- [ ] **Confirm Windsurf doc URLs** — When network access is available, verify that `https://docs.windsurf.ai/memories` and `/workflows` resolve; adjust `docs/PROGRAMMING_LINKS.md` if canonical paths differ. *(Logged October 10, 2025)*
- [x] **Document ES module lint flow** — Update `docs/DEVELOPMENT.md` with an esbuild (or equivalent) command that succeeds for ESM syntax checks so the new link guidance matches our tooling. *(Completed October 10, 2025)*
- [ ] **Sync project plan references** — Cross-check `docs/PROJECT_PLAN.md` against refreshed programming links to ensure upcoming work (e.g., SM-2 tooling) cites the same official docs. *(Logged October 10, 2025)*
- [ ] **Project plan doc status** — Update `docs/PROJECT_PLAN.md` technical documentation list so `API.md` and `CONTRIBUTING.md` are marked as published with live links. *(Logged October 12, 2025)*
- [ ] **Project plan checklist audit** — Revisit Phase 1 foundational checklist items and check off anything already delivered (e.g., `AGENTS.md` guidance). *(Logged October 12, 2025)*
- [ ] **Share Windsurf doc workflow** — Mirror the refreshed Windsurf consultation steps from `docs/PROGRAMMING_LINKS.md` into `AGENTS.md`. *(Logged October 12, 2025)*
- [ ] **Document Pages deploy flow** — Add a brief GitHub Pages deployment note in `docs/DEVELOPMENT.md` pointing to the official guide. *(Logged October 12, 2025)*
- [ ] **Manual speech QA** — Verify flashcard pronunciation flow in a Web Speech-enabled browser, capture observations/screenshots, and log QA notes. *(Logged October 10, 2025)*
- [ ] **Playwright CI enablement** — Re-enable Playwright once runners with accessible localhost networking are available and update docs accordingly. *(Logged October 10, 2025)*
- [ ] **MCP integration update** — Update `AGENTS.md` when `/mcp` reports active Codex/Figma/Playwright connectors. *(Logged October 10, 2025)*

## 🚨 URGENT: Mobile Fixes for Public Launch (Added October 19, 2025)

**Status**: Desktop ready, mobile blocked. Estimated 4-6 hours to unblock public launch.

- [ ] **P0: Fix mobile navigation visibility (2-3 hours)** — Navigation links not visible on mobile viewports. 10+ tests failing. Files: `assets/scss/components/_navigation.scss`, `layouts/partials/header.html`. *(CRITICAL - Blocks launch)*
- [ ] **P0: Fix vocabulary card loading timing (1-2 hours)** — Cards load inconsistently, causing blank states. 8 tests failing. Files: `assets/js/vocab-cards.js`, `assets/js/enhanced-vocab-cards.js`. *(CRITICAL - Blocks launch)*
- [ ] **P1: Fix keyboard event persistence (1 hour)** — Keyboard grading lost after flashcard re-initialization. 5 tests failing. Files: `assets/js/flashcards.js`, use event delegation pattern. *(HIGH - UX issue)*
- [ ] **P1: Fix language toggle state sync (1 hour)** — Practice sessions don't reflect language direction changes. 2 tests failing. Files: `assets/js/unified-practice-session.js`, localStorage sync. *(HIGH - Feature broken)*

**After these fixes**: Re-run `npm test` and verify >80% pass rate before public launch.

---

## Repository Cleanup Tasks (Completed October 19, 2025)

- [x] **Phase 1: Remove build artifacts** — Removed 140+ committed build outputs and updated .gitignore. *(Completed Oct 19, 2025)*
- [x] **Phase 2: Remove duplicate config.toml** — Removed, keeping only hugo.toml. *(Completed Oct 19, 2025)*
- [x] **Phase 3: Delete deprecated JS files** — Removed all *-simple.js and vocabulary-old.js files. *(Completed Oct 19, 2025)*
- [x] **Phase 4: Audit enhanced-*.js files** — Verified all active in production, documented in assets/js/README.md. *(Completed Oct 19, 2025)*
- [ ] **Phase 5: Convert theme to submodule** — Move themes/learn to git submodule to reduce repo bloat (209 files). *(Medium Priority)*
- [ ] **Phase 6: Refactor Go tooling** — Remove minification TODOs from tools/cmd/hugo-bg-de/main.go, focus on data processing only. *(Medium Priority)*
- [ ] **Phase 7: Document API persistence** — Complete TODO in docs/API.md line 108: "Document persistence lifecycle and fallback behavior". *(Medium Priority)*
- [ ] **Phase 8: Document audio conventions** — Complete TODO in docs/API.md line 114: "Define conventions for filenames, locales, and caching". *(Low Priority)*
- [ ] **Phase 9: Audit js/modules/** — Determine if modules/ subfolder files are used or redundant with top-level JS files. *(Medium Priority)*
- [ ] **Phase 10: Create tools/README.md** — Document Go tooling purpose and commands. *(Low Priority)*

Logged: September 24, 2025 (updated October 17, 2025)
