# JavaScript Module Inventory

Last Updated: 2025-10-19

## Scope

This audit covers every JavaScript file under `assets/js/` and `assets/js/modules/`. For each module the table captures its purpose, load path, dependency usage, status classification, and initial removal recommendation. Usage counts are based on Hugo template references, shortcode inclusions, or direct imports observed during the audit snapshot (commit time stamps from `stat`).

## Summary Findings

- **Active entry points:** `assets/js/app.js`, `assets/js/code.js`, `assets/js/language-toggle.ts`, `assets/js/language-toggle-confirmation.js`, and `assets/js/onboarding.js` are loaded globally from `layouts/_default/baseof.html:41-57`.
- **Practice stack:** `assets/js/unified-practice-session.js`, `assets/js/enhanced-bidirectional-system.js`, and `assets/js/enhanced-spaced-repetition.js` are loaded by `layouts/practice/single.html:272-288` for the modern session flow. They depend on the unified practice session class and SM-2 helpers exported on `window`.
- **Vocabulary page:** `assets/js/modules/vocabulary-page.js`, `assets/js/enhanced-vocab-cards.js`, `assets/js/vocabulary-adapter.js`, and shared cultural data scripts are loaded via `layouts/vocabulary/list.html:166-199`.
- **Legacy / fallback code:** `assets/js/flashcards.js`, `assets/js/practice.js`, `assets/js/bidirectional-flashcards.js`, `assets/js/session-stats-dashboard.js`, `assets/js/home.js`, and the modules bundle in `assets/js/modules/` (other than `vocabulary-page.js`) are not referenced by current templates. They appear to be legacy or experimental slices preserved for backwards compatibility but no longer wired up.
- **SM-2 duplication:** Both `assets/js/spaced-repetition.js` and `assets/js/enhanced-spaced-repetition.js` implement SM-2 variants. Only the enhanced version is loaded by production templates; the legacy version is reachable through the `flashcards.js` import chain and the test template (`layouts/test-flashcards/single.html`).
- **Namespace consistency:** Live modules expose globals on `window.*` (e.g., `window.EnhancedPracticeSession`, `window.VocabularyAdapter`). Future refactoring should consolidate module loading to ES module syntax with bundling or consistent resource pipelines.

## Inventory Table — Top-Level `assets/js/`

| File Path | Bytes | Last Modified | Usage Count | Loaded From | Status | Removal Recommendation | Impact Analysis |
| --- | ---: | --- | ---: | --- | --- | --- | --- |
| `assets/js/app.js` | 10,083 | 2025-10-19 | 1 | `layouts/_default/baseof.html:41-42` | ACTIVE | NO | Core bootstrap, theme toggle, SW registration; removal breaks global initialization. |
| `assets/js/code.js` | 878 | 2025-08-17 | 1 | `layouts/_default/baseof.html:44-45` | ACTIVE | NO | Handles copy-to-clipboard for `render-codeblock`; removing breaks code block UX. |
| `assets/js/language-toggle.ts` | 16,944 | 2025-10-17 | 2 | `layouts/_default/baseof.html:48-49`, imports in `flashcards.js`, `vocab-cards.js` | ACTIVE | NO | Critical for site-wide language state. |
| `assets/js/language-toggle-confirmation.js` | 6,946 | 2025-10-17 | 1 | `layouts/_default/baseof.html:52-53` | ACTIVE | NO | Provides confirmation modal for language switch. |
| `assets/js/onboarding.js` | 23,090 | 2025-10-19 | 1 | `layouts/_default/baseof.html:56-57` | ACTIVE | NO | Guides new users through onboarding; interacts with `window.enhancedPracticeSession`. |
| `assets/js/enhanced-bidirectional-system.js` | 15,042 | 2025-10-12 | 2 | `layouts/practice/single.html:278-282`, `layouts/vocabulary/list.html:166-181` | ACTIVE | NO | Central logic for bidirectional vocabulary, event bus for language direction. |
| `assets/js/unified-practice-session.js` | 14,991 | 2025-10-19 | 1 | `layouts/practice/single.html:284-287` | ACTIVE | NO | Runs interactive practice UI; removing breaks `/practice/`. |
| `assets/js/enhanced-spaced-repetition.js` | 4,359 | 2025-08-28 | 1 | `layouts/practice/single.html:272-276` | ACTIVE | NO | Enhanced SM-2 engine consumed by practice session; removal breaks scheduling. |
| `assets/js/enhanced-vocab-cards.js` | 2,384 | 2025-08-28 | 1 | `layouts/vocabulary/list.html:178-181` | ACTIVE | NO | Applies language direction and cultural data to vocabulary cards. |
| `assets/js/vocabulary-adapter.js` | 2,800 | 2025-08-28 | 1 | `layouts/vocabulary/list.html:172-176` | ACTIVE | NO | Harmonizes dataset schema between legacy and enhanced vocab; removal breaks vocabulary page. |
| `assets/js/modules/vocabulary-page.js` | 17,314 | 2025-10-19 | 1 | `layouts/vocabulary/list.html:184-187` | ACTIVE | NO | Entry-point orchestrator for vocabulary filters, search, and pagination. |
| `assets/js/grammar.js` | 9,570 | 2025-10-19 | 1 | `layouts/grammar/list.html:79-94` | ACTIVE | NO | Grammar list filtering and bookmarking. |
| `assets/js/bidirectional-flashcards.js` | 8,461 | 2025-10-12 | 0 | — | DEPRECATED | MAYBE | Replaced by enhanced practice stack; only referenced in docs/README examples. Removal requires confirming no hidden shortcodes rely on it. |
| `assets/js/flashcards.js` | 27,248 | 2025-10-17 | 1 | `layouts/test-flashcards/single.html:173-188` | LEGACY | MAYBE | Legacy ES module entry (uses `import` statements). Only test template references it; removal safe once tests migrate to enhanced flow. |
| `assets/js/practice.js` | 14,345 | 2025-08-17 | 0 | — | DEPRECATED | YES | Superseded by enhanced practice session and no longer linked. Confirm no manual inclusions before removal. |
| `assets/js/session-stats-dashboard.js` | 23,981 | 2025-10-12 | 0 | — | ORPHAN | MAYBE | Not loaded by templates; functionality may have moved into `enhanced-practice-session.js`. Evaluate before removal. |
| `assets/js/home.js` | 2,829 | 2025-08-17 | 0 | — | ORPHAN | YES | No template references; likely obsolete home-page script. |
| `assets/js/vocab-cards.js` | 12,758 | 2025-10-17 | 1 | Imported in `layouts/_shortcodes/vocab.html:76` via inline `<script type="module">` | LEGACY | MAYBE | Module-based (ESM) initializer for shortcode; confirm shortcode usage before deprecating. |
| `assets/js/vocabulary.js` | 9,399 | 2025-08-28 | 0 | — | ORPHAN | YES | Old vocabulary page logic replaced by modules architecture. |
| `assets/js/speech-recognition.js` | 2,985 | 2025-10-11 | 1 | `layouts/test-flashcards/single.html:176-188` | LEGACY | MAYBE | Tied to legacy flashcards. Integrate into enhanced system or remove. |
| `assets/js/app.js` (SM-2 classes) | — | — | — | — | NOTE | — | Contains a second SM-2 implementation (`SpacedRepetition` class) and progress tracker unrelated to enhanced flow; consider consolidation later. |
| `assets/js/spaced-repetition.js` | 13,498 | 2025-10-17 | 1 | `layouts/test-flashcards/single.html:174` | LEGACY | MAYBE | Legacy SM-2 module still imported by `flashcards.js`. |
| `assets/js/vocab-cards.js` (module import) | — | — | — | — | NOTE | — | Only file in tree using `import` syntax; requires Hugo 0.121+ ESBuild transpile or direct module load. Currently referenced by shortcode inline script. |
| `assets/js/onboarding.js` dependencies | — | — | — | — | NOTE | — | Pulls cultural hints, session data, interacts with `window.EnhancedPracticeSession`. |

## Inventory Table — `assets/js/modules/`

| File Path | Bytes | Last Modified | Usage Count | Loaded From | Status | Removal Recommendation | Impact Analysis |
| --- | ---: | --- | ---: | --- | --- | --- | --- |
| `assets/js/modules/vocabulary-page.js` | 17,314 | 2025-10-19 | 1 | `layouts/vocabulary/list.html:184-187` | ACTIVE | NO | Coordinates filters, pagination, and practice buttons; removal breaks `/vocabulary/`. |
| `assets/js/modules/api-client.js` | 11,197 | 2025-08-24 | 0 | — | ORPHAN | MAYBE | Not imported; appears to have supported REST endpoints that do not exist in Hugo static mode. |
| `assets/js/modules/learning-session.js` | 15,166 | 2025-08-24 | 0 | — | ORPHAN | MAYBE | Possibly replaced by enhanced practice; confirm before removal. |
| `assets/js/modules/performance-monitor.js` | 17,335 | 2025-08-24 | 0 | — | ORPHAN | MAYBE | Provides FPS / memory insights; not wired into templates. |
| `assets/js/modules/practice-page.js` | 25,746 | 2025-10-12 | 0 | — | ORPHAN | MAYBE | Large bundle for practice orchestration; superseded by enhanced stack. |
| `assets/js/modules/search-engine.js` | 18,289 | 2025-08-24 | 0 | — | ORPHAN | MAYBE | Legacy search helper; current vocabulary page handles filtering via `VocabularyPageModule`. |
| `assets/js/modules/service-worker.js` | 11,280 | 2025-10-19 | 0 | — | ORPHAN | MAYBE | Alternative SW registration not used (actual SW handled in `layouts/partials/pwa-register.html`). |
| `assets/js/modules/user-preferences.js` | 11,164 | 2025-08-24 | 0 | — | ORPHAN | MAYBE | Old abstraction for storing preferences; functionality now dispersed across enhanced modules. |

## Dependency Notes

- **Global namespace:** Many legacy files rely on globals (`window.BgDeApp`, `window.languageToggle`). The enhanced stack creates `window.EnhancedPracticeSession`, `window.VocabularyAdapter`, and `window.VocabularyPageModule`. Any consolidation must carefully migrate these globals or introduce a compatibility adapter.
- **SM-2 duplication:**
  - `assets/js/enhanced-spaced-repetition.js` exports `window.EnhancedSpacedRepetition` with the new data shape (`{ item_id, interval, ease_factor, repetitions, next_review, last_review }`).
  - `assets/js/spaced-repetition.js` exports `window.spacedRepetition` (legacy).
  - `assets/js/app.js` still contains an inline `SpacedRepetition` class. These three implementations should be reconciled in future slices.
- **Legacy practice fallback:** `layouts/_shortcodes/flashcards.html` still calls `window.BgDeApp.initPractice()` as a fallback if enhanced modules fail to load. That flow depends on `assets/js/practice.js` and `assets/js/spaced-repetition.js`, implying some legacy compatibility requirement.

## Import Chain Highlights

- `layouts/_default/baseof.html` → `app.js`, `code.js`, `language-toggle.ts`, `language-toggle-confirmation.js`, `onboarding.js`.
- `layouts/practice/single.html` (JS layout) → `enhanced-spaced-repetition.js` → `window.EnhancedSpacedRepetition`; `enhanced-bidirectional-system.js` → event bus; `enhanced-practice-session.js` → session UI.
- `layouts/vocabulary/list.html` → `enhanced-bidirectional-system.js`, `vocabulary-adapter.js`, `enhanced-vocab-cards.js`, `modules/vocabulary-page.js`.
- `layouts/_shortcodes/flashcards.html` → fallback `window.BgDeApp.initPractice()` which depends on globals defined in legacy `assets/js/practice.js` chain (requires confirmation).
- `layouts/test-flashcards/single.html` → `flashcards.js` (ES module importing `spaced-repetition.js`, `language-toggle.ts`, `speech-recognition.js`). This template appears to be a sandbox for manual testing and not part of production build.

## Recommendations

- **Document legacy stack dependencies:** Update `docs/DEVELOPMENT.md` to clarify which templates still rely on `window.BgDeApp` and whether those code paths are officially supported.
- **Plan SM-2 consolidation:** Schedule a refactoring slice to unify `spaced-repetition.js`, the `SpacedRepetition` class inside `app.js`, and `enhanced-spaced-repetition.js` into a single module exposed through a compatibility wrapper.
- **Evaluate orphan modules:** Confirm whether `assets/js/modules/*.js` (excluding `vocabulary-page.js`) can be removed or archived. If they are retained for reference, mark them as deprecated in code headers and docs.
- **Modernize imports:** Consider converting legacy inline ESM import usage (`vocab-cards.js` and `flashcards.js`) into Hugo pipeline-managed bundles to satisfy browsers without native module support, or enforce module loading via `<script type="module">` in templates.
- **Create removal checklist:** Before deleting any DEPRECATED/CANDIDATE modules, verify there are no references in Markdown content, shortcodes, or the published `public/` artifact. Document impact assessments in `docs/REFACTORING_LOG.md` when executed.

## Next Steps

Pending user approval, proceed with the next audit slice (SCSS or templates) while keeping this inventory as the baseline for future refactoring roadmaps.
