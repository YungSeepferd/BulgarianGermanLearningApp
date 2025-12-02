# SCSS Asset Inventory

Last Updated: 2025-10-19

## Scope

Survey of every SCSS source in `assets/scss/`, including entry points, component partials, and page-level styles. The audit records compilation flow, downstream template usage, and highlights partials that are currently not imported into the main bundle.

## Summary Findings

- **Single entry point:** `assets/scss/main.scss` is the only stylesheet compiled via Hugo Pipes (`layouts/_default/baseof.html:9-19`). Any partial not imported there is excluded from production builds.
- **Core foundation:** `_variables.scss`, `_mixins.scss`, and `_base.scss` remain active and underpin the global theme.
- **Active components:** Flashcards, vocabulary, practice (component-level), navigation, bidirectional helpers, service worker UI, cultural context, code blocks, onboarding, header/footer, cards, and buttons partials are imported and align with active templates.
- **Orphan partials:** Eight component partials and `pages/_practice.scss` are not imported by `main.scss`. These appear to belong to legacy or experimental flows (language toggle, stats dashboard, etc.).
- **Inline styling:** `layouts/practice/single.html` still contains extensive inline styles replicating flashcard UI, suggesting the unused `pages/_practice.scss` may be redundant or awaiting reintegration.
- **Duplication risk:** Both `components/_vocab.scss` and `components/_vocab-cards.scss` exist, yet only the former is compiled. Confirm whether enhanced vocabulary views require the latter to ensure feature parity.

## Inventory Tables

### Entry & Foundation Files

| File Path | Bytes | Last Modified | Role | Imported By | Status | Removal Recommendation | Notes |
| --- | ---: | --- | --- | --- | --- | --- | --- |
| `assets/scss/main.scss` | 706 | 2025-10-17 | Entry point | Hugo Pipes (`layouts/_default/baseof.html:9-19`) | ACTIVE | NO | Controls bundle composition; removing breaks CSS pipeline. |
| `assets/scss/_variables.scss` | 5,494 | 2025-08-17 | Variables | `main.scss` | ACTIVE | NO | Defines color palette, breakpoints. |
| `assets/scss/_mixins.scss` | 4,134 | 2025-08-17 | Mixins | `main.scss` | ACTIVE | NO | Utility mixins used across partials. |
| `assets/scss/_base.scss` | 3,493 | 2025-08-17 | Base styles | `main.scss` | ACTIVE | NO | Global resets and typography. |

### Component Partials (Imported)

| File Path | Bytes | Last Modified | Usage Count | Status | Removal Recommendation | Notes |
| --- | ---: | --- | ---: | --- | --- | --- |
| `components/_header.scss` | 2,652 | 2025-08-17 | 1 | ACTIVE | NO | Supports site header (`layouts/partials/header.html`). |
| `components/_footer.scss` | 1,735 | 2025-08-17 | 1 | ACTIVE | NO | Footer layout. |
| `components/_buttons.scss` | 3,049 | 2025-08-17 | 1 | ACTIVE | NO | Shared button styles referenced across templates. |
| `components/_cards.scss` | 6,607 | 2025-08-17 | 1 | ACTIVE | NO | Base card layout used by vocabulary listings. |
| `components/_flashcards.scss` | 21,952 | 2025-10-11 | 1 | ACTIVE | NO | Enhanced flashcard UI (`layouts/practice/single.html`, `layouts/_shortcodes/flashcards.html`). |
| `components/_vocab.scss` | 1,753 | 2025-08-28 | 1 | ACTIVE | NO | Vocabulary list styles (`layouts/vocabulary/list.html`). |
| `components/_practice.scss` | 4,108 | 2025-08-28 | 1 | ACTIVE | NO | Component-level practice controls (buttons, loaders). |
| `components/_navigation.scss` | 4,912 | 2025-08-28 | 1 | ACTIVE | NO | Main navigation bar. |
| `components/_bidirectional-flashcards.scss` | 5,232 | 2025-08-28 | 1 | ACTIVE | NO | Direction-aware flashcards enhancements. |
| `components/_service-worker.scss` | 6,597 | 2025-08-25 | 1 | ACTIVE | NO | Styles the update notification defined in `layouts/partials/pwa-register.html`. |
| `components/_cultural-context.scss` | 11,089 | 2025-08-18 | 1 | ACTIVE | NO | Cultural context panel for vocabulary page. |
| `components/_code.scss` | 1,799 | 2025-08-17 | 1 | ACTIVE | NO | Supports rendered code blocks (`layouts/_default/_markup/render-codeblock.html`). |
| `components/_onboarding.scss` | 11,896 | 2025-10-19 | 1 | ACTIVE | NO | Tied to onboarding flow (`assets/js/onboarding.js`). |
| `components/_confirmation-modal.scss` | 3,163 | 2025-10-17 | 1 | ACTIVE | NO | Confirmation modal for language toggle.

### Component Partials (Not Imported)

| File Path | Bytes | Last Modified | Usage Count | Status | Removal Recommendation | Notes |
| --- | ---: | --- | ---: | --- | --- | --- |
| `components/_badges.scss` | 2,157 | 2025-08-17 | 0 | ORPHAN | MAYBE | Legacy badge styles; not referenced by current templates.
| `components/_language-toggle.scss` | 5,736 | 2025-08-17 | 0 | ORPHAN | MAYBE | Could apply to language toggle UI (`assets/js/language-toggle.js`); currently unused due to inline or other styles.
| `components/_vocab-cards.scss` | 7,177 | 2025-08-17 | 0 | ORPHAN | MAYBE | Likely intended for shortcode cards; enhanced cards may rely on inline styles instead.
| `components/_forms.scss` | 4,779 | 2025-08-17 | 0 | ORPHAN | MAYBE | Generic form styling; confirm if filters require it.
| `components/_progress.scss` | 5,511 | 2025-08-17 | 0 | ORPHAN | MAYBE | Might have supported legacy progress widgets.
| `components/_pagination.scss` | 5,515 | 2025-08-25 | 0 | ORPHAN | MAYBE | Vocabulary pagination currently styled via other partials or inline CSS.
| `components/_search.scss` | 5,138 | 2025-08-25 | 0 | ORPHAN | MAYBE | Search overlay uses different styles.
| `components/_stats-dashboard.scss` | 6,979 | 2025-08-25 | 0 | ORPHAN | MAYBE | Tied to deprecated `assets/js/session-stats-dashboard.js`.

### Page Partials

| File Path | Bytes | Last Modified | Imported | Status | Removal Recommendation | Notes |
| --- | ---: | --- | --- | --- | --- | --- |
| `pages/_home.scss` | 2,883 | 2025-08-17 | YES | ACTIVE | NO | Styles home landing page sections.
| `pages/_vocabulary.scss` | 3,133 | 2025-08-25 | YES | ACTIVE | NO | Additional layout for `/vocabulary/`.
| `pages/_grammar.scss` | 2,406 | 2025-08-17 | YES | ACTIVE | NO | Grammar page specifics.
| `pages/_practice.scss` | 5,884 | 2025-08-17 | NO | ORPHAN | MAYBE | Possibly superseded by component-level flashcard styles; actual page relies on inline styling.

## Observations

- **Unused bundle size:** Orphan partials collectively represent ~40 KB uncompiled SCSS. If still needed, they must be imported; otherwise consider removal to avoid confusion.
- **Inline duplication:** Inline styles in `layouts/practice/single.html` overlap with definitions expected in `_flashcards.scss` and `_practice.scss`. Refactoring should consolidate styling in SCSS to maintain consistency.
- **Language toggle styling gap:** The language toggle modal relies on `_confirmation-modal.scss`, but the toggle control itself may use inline styles. Investigate whether `_language-toggle.scss` should be reintroduced via `main.scss`.
- **Pagination & search alignment:** The vocabulary page uses custom controls that might benefit from reactivating `_pagination.scss` and `_search.scss`. Confirm whether current design intentionally excludes them.

## Recommendations

- **Decide on orphan partial fate:** Either reintegrate relevant partials (language toggle, vocab cards) into `main.scss` or mark for deprecation/removal in subsequent refactoring slices.
- **Normalize practice page styling:** Replace repeated inline styles in `layouts/practice/single.html` with SCSS definitions (potential future refactoring slice).
- **Document stylesheet architecture:** Update `docs/DEVELOPMENT.md` to clarify which partials are active, ensuring future contributors understand the compilation pipeline.
- **Monitor bundle size:** During refactoring, consider grouping related component partials to simplify imports and reduce redundant definitions.

## Next Steps

Pending approval, proceed to the next audit area (e.g., Hugo templates or static assets) while tracking orphan SCSS partial decisions in the refactoring roadmap.
