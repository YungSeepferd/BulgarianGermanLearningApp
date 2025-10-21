# Refactoring Roadmap

Last Updated: 2025-10-19

## Objective

Synthesize audit findings across JavaScript modules, SCSS assets, Hugo templates, static assets, data schemas, testing coverage, documentation, and security posture into an actionable incremental refactoring plan. Goals: modernize codebase, preserve learner progress, maintain backward compatibility, and respect tech constraints (Hugo Extended, Go tools, vanilla JS, SCSS via Hugo Pipes).

## Guiding Principles

- **Backward compatibility:** Preserve `bgde:` localStorage data, existing vocabulary datasets, and current learner flow during refactors.
- **Incremental delivery:** Ship refactors in scoped PRs keyed to roadmap phases; avoid monolithic rewrites.
- **Stack discipline:** No new frameworks/dependencies; leverage Hugo Pipes, ES modules, and Go tooling.
- **Accessibility & performance:** Maintain keyboard support, ARIA semantics, offline readiness, and Lighthouse targets.

## Phase 1 — Stabilize Core Infrastructure

- **[SW alignment]** Update `static/sw.js` to consume Hugo-generated fingerprinted assets (e.g., via templated manifest). Ensure cache versioning tied to build hash. Add regression tests for offline shell.
- **[Security headers]** Introduce CSP, HSTS, and Permissions-Policy (via `_headers` or `netlify.toml`). Document expectations in `docs/DEPLOYMENT_STATUS.md`.
- **[Dependabot & scans]** Enable Dependabot for npm/go/actions, add `npm audit` and `govulncheck` steps to `.github/workflows/ci.yml`, and pin GitHub Action SHAs.
- **[Data validation]** Extend `scripts/validate-data.mjs` to enforce directional notes (`notes_bg_to_de`/`notes_de_to_bg`), cultural fields, difficulty defaults. Add CI gate.

## Phase 2 — Consolidate Learning Logic

- **[SM-2 unification]** Merge `assets/js/enhanced-spaced-repetition.js` and legacy `assets/js/spaced-repetition.js`. Create migration helper to convert `bgde:review:<id>` into enhanced schema (`bgde:review_<id>_<direction>`). Provide export/import compatibility.
- **[Practice session convergence]** Refactor `assets/js/unified-practice-session.js` and legacy `assets/js/practice.js` into single module. Ensure directional notes render for all entries; add keyboard tests.
- **[Vocabulary dataset merge]** Consolidate `data/vocabulary.json` and `data/vocabulary-enhanced.json` or clearly scope usage. Introduce preprocessing script to deduplicate entries and fill missing directional notes.

## Phase 3 — Template & Asset Cleanup

- **[Template archiving]** Move unused templates (`layouts/_default/sw.js`, `layouts/offline/single.html`, older reports) into archive or remove after validation. Update `docs/DOCS_ORGANIZATION.md` accordingly.
- **[Inline asset extraction]** Migrate inline JS/CSS from `layouts/practice/single.html` and similar into `assets/js/` and `assets/scss/` bundles. Use Hugo Pipes fingerprinting.
- **[Static legacy JS]** Evaluate `static/js/practice-simple.js`, `static/js/spaced-repetition-simple.js`, `static/js/language-toggle.js`; archive or delete once replacement confirmed.

## Phase 4 — Test & Documentation Expansion

- **[Playwright coverage]** Add specs for enhanced practice flow (flip & grade), vocabulary filters, cultural toggles, offline mode (using `context.setOffline`). Extend smoke tests to check service worker registration.
- **[Unit tests]** Create lightweight Node-based tests (e.g., Vitest or vanilla assert) for SM-2 scheduling logic, language toggle persistence, and data adapters. Explore using `npm test:unit` script.
- **[Documentation refresh]** Update `docs/README.md`, `docs/DEVELOPMENT.md`, and `docs/ARCHITECTURE.md` to describe enhanced systems and new tooling. Create `docs/audit/README.md` summarizing slices. Archive redundant historical reports under `docs/archive/`.

## Phase 5 — UX & Performance Polish

- **[Icon optimization]** Compress `static/images/icons/app-icon-192.png` / `512.png` to reduce asset weight. Document asset pipeline.
- **[Cultural grammar UX]** Ensure cultural notes load lazily, with toggles accessible via screen readers. Consider precomputing UI-friendly groupings.
- **[Analytics consent]** Implement consent banner gating Google Analytics script load; update documentation for compliance.

## Tracking & Ownership

- Maintain task checklist in `docs/notes/NEXT.md` referencing roadmap phases.
- Each refactor PR should cite relevant audit file (`docs/audit/*.md`) and include updated tests/docs.
- After each phase, rerun complete test matrix: `npm run lint:data`, `npm run lint:esm`, `go test ./tools/...`, `npm run build`, `npm test`.

## Next Steps

Await stakeholder prioritization to schedule Phase 1 tasks. Recommend creating GitHub issues per bullet (tagged `refactor`, `audit-followup`) to track progress.
