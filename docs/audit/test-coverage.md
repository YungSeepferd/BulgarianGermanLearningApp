# Test Coverage Assessment

Last Updated: 2025-10-19

## Scope

Evaluate automated test coverage across JavaScript, Hugo templates, data validation, and service worker paths. Inventoried Playwright E2E specs, data linting scripts, Go utilities, and manual testing protocols.

## Summary Findings

- **Playwright suite:** Located under `tests/playwright/`. Contains `smoke.spec.js`, `language-toggle.spec.js`, `flashcards-retry.spec.js`, `inline-fallback.spec.js`, plus README instructions. Focus areas: homepage smoke, language toggle, flashcard retry flow, and inline fallback content. Coverage limited to high-level UI flows; no dedicated specs for enhanced practice session, vocabulary filters, or offline PWA behavior.
- **Data lints:** `npm run lint:data` executes `scripts/validate-data.mjs` (Node-based JSON schema checks). `npm run lint:esm` ensures ES module paths are valid. No automated tests validate `data/cultural-grammar.json` relationships or directional note completeness.
- **Go utilities:** No `go test` suites under `tools/`; existing CLI commands rely on manual testing. `tools/internal/processor` writes `static/search-index.json` but lacks unit coverage.
- **Hugo build checks:** Standard `hugo --logLevel debug -D` (manual) and `npm run build` (CI) detect template errors but not logic regressions.
- **Manual testing protocols:** `docs/TESTING.md` and `docs/COMPLETE_LOCAL_TEST_PLAN.md` describe manual smoke tests (language toggle, flashcards, PWA install). Execution frequency unclear; automation gap remains.
- **CI pipeline:** `.github/workflows/ci.yml` (not inspected within this slice due to time) assumed to run lint + Playwright. Need verification in future audit.

## Detailed Inventory

### Playwright Specs (`tests/playwright/`)

| File | Scenario Coverage | Status |
| --- | --- | --- |
| `smoke.spec.js` | Core navigation, hero content, vocabulary list landing | ✅ Active |
| `language-toggle.spec.js` | Toggle persistence, direction switching, page updates | ✅ Active | 
| `flashcards-retry.spec.js` | Legacy flashcard session reload & retry flow | ✅ Active (legacy-focused) |
| `inline-fallback.spec.js` | Inline fallback markup when JS disabled | ✅ Active |
| *Missing* | Enhanced practice session keyboard flow, SM-2 scheduling validation, cultural note toggles, PWA offline smoke | ⚠️ Gaps |

### Node Lint Scripts

- `scripts/validate-data.mjs`: Validates vocabulary/grammar JSON structure (presence of required fields, duplicates). Does not enforce directional note completeness or cross-file consistency.
- `scripts/check-esm.mjs`: Ensures ES module imports resolve. Acts as structural lint, not behavioral test.

### Go Tooling

- `tools/internal/...`: Generates search index, processes vocabulary. No automated tests; relies on manual `go run` invocations.

### Manual Guides

- `docs/TESTING.md`: Outlines manual regressions (language toggle, SM-2 behavior). No evidence of recorded outcomes.
- `docs/COMPLETE_LOCAL_TEST_PLAN.md`: Comprehensive manual checklist; not automated.

## Coverage Gaps & Risks

- **Enhanced UI untested:** No automated tests for `assets/js/unified-practice-session.js`, `assets/js/enhanced-bidirectional-system.js`, `layouts/vocabulary/list.html` filters, or cultural context toggles.
- **SM-2 correctness:** Algorithm tested only through manual inspection. No unit or integration tests verifying `scheduleNext()` outputs or localStorage persistence.
- **Offline/PWA regression risk:** Service worker behavior (`static/sw.js`) and update notifications lack automated coverage.
- **Data integrity:** Enhanced fields (`notes_bg_to_de`, `notes_de_to_bg`, cultural notes) not checked by lint script; risk of missing data breaking DE→BG experiences.
- **Go tooling:** Search index generation lacks tests; schema changes could break runtime without detection.

## Recommendations

- **Add unit tests:** Introduce targeted tests for `EnhancedSpacedRepetition.scheduleNext()` and legacy `SpacedRepetition` using Node-based test runner or lightweight browser harness.
- **Expand Playwright suite:** Add specs for enhanced practice session (keyboard grading, direction flip), vocabulary filter interactions, offline mode (network offline). Leverage fixtures to seed localStorage states.
- **Automate data validation:** Extend `scripts/validate-data.mjs` to ensure directional notes, cultural notes, and difficulty fields meet schema expectations. Possibly integrate JSON schema definitions.
- **Introduce Go tests:** Add `go test ./tools/...` covering search index generation, ensuring deterministic output.
- **CI verification:** Review `.github/workflows/ci.yml` in a later slice to confirm coverage of new tests and align with recommended additions.

## Next Steps

Pending user direction, proceed to **Audit Slice 7: Documentation suite review**.
