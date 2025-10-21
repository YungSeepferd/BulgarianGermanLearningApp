# Hugo Templates Inventory

Last Updated: 2025-10-19

## Scope

Audit of all Hugo layout files under `layouts/`, including defaults, section templates, partials, shortcodes, experimental templates, and JSON outputs. Each entry records purpose, usage, and retirement recommendations.

## Summary Findings

- **Active foundation:** `layouts/_default/baseof.html` orchestrates global partials (`header`, `footer`, `pwa-register`) and the CSS/JS pipeline. `_default/list.html` and `_default/single.html` serve as fallbacks for generic content.
- **Dedicated sections:** `layouts/vocabulary/list.html`, `layouts/grammar/list.html`, and `layouts/practice/single.html` implement key experiences with embedded data scripts and JS hooks. `layouts/practice/single.html` mixes inline CSS/JS that should migrate to assets in future slices.
- **API & PWA assets:** JSON outputs (`layouts/_default/vocabulary-api.json`, `layouts/_default/manifest.json`, `layouts/_default/sw.js`) power the SPA-like features and must remain aligned with `static/manifest.webmanifest` and `static/sw.js`.
- **Shortcode ecosystem:** Vocabulary and flashcard shortcodes are widely used; the legacy `flashcards` shortcode still depends on `window.BgDeApp.initPractice` fallback.
- **Experimental templates:** `layouts/test-flashcards/single.html` is isolated for sandboxing JS (loads legacy modules) and may be removed or moved under `content/` drafts when legacy flow is retired.
- **Orphan layouts:** `layouts/offline/single.html` appears unused now that `/offline/` is served from `content/offline.md` via `_default/single.html`. Confirm before removal.

## Inventory Tables

### Core Defaults

| File Path | Bytes | Last Modified | Usage | Status | Recommendation | Notes |
| --- | ---: | --- | --- | --- | --- | --- |
| `_default/baseof.html` | 2,618 | 2025-10-19 | Global | ACTIVE | Retain | Wraps main content, injects CSS/JS, partials, and PWA registration. |
| `_default/list.html` | 1,081 | 2025-08-17 | Section fallback | ACTIVE | Retain | Minimal list template, used when section lacks custom list layout. |
| `_default/single.html` | 3,965 | 2025-08-17 | Content fallback (`content/practice.md`, etc.) | ACTIVE | Retain | Provides hero banner layout. |
| `_default/offline.html` | 3,206 | 2025-08-17 | Deprecated offline route | DEPRECATED | Consider archive | Superseded by `/offline.md`; duplicates offline page markup. |
| `_default/flashcard-practice.html` | 1,601 | 2025-08-28 | Referenced by `content/practice/markdown-flashcards.md` (`layout: "flashcard-practice"`) | ACTIVE | Retain | Markdown-friendly flashcard rendering. |
| `_default/manifest.json` | 2,917 | 2025-08-17 | `/manifest.json` | ACTIVE | Retain | Mirrors `static/manifest.webmanifest`; ensure consistency. |
| `_default/sw.js` | 7,956 | 2025-08-17 | Hugo-generated SW (unused) | ORPHAN | Remove after confirmation | Actual SW served from `static/sw.js`; this duplicate may confuse builds. |
| `_default/vocabulary-api.json` | 3,522 | 2025-08-25 | `/api/vocabulary/` | ACTIVE | Retain | Powers vocabulary API endpoint for client-side fetches. |

### Section Templates

| File Path | Bytes | Last Modified | Usage | Status | Recommendation | Notes |
| --- | ---: | --- | --- | --- | --- | --- |
| `practice/single.html` | 14,861 | 2025-10-19 | `/practice/` content | ACTIVE | Refactor later | Heavy inline CSS/JS; relies on enhanced practice stack. |
| `practice/list.html` | 2,540 | 2025-08-28 | Section list for `/practice/` | ACTIVE | Retain | Lists practice articles. |
| `vocabulary/list.html` | 8,541 | 2025-10-19 | `/vocabulary/` | ACTIVE | Retain | Embeds JSON data and loads vocabulary JS modules. |
| `grammar/list.html` | 3,401 | 2025-10-19 | `/grammar/` | ACTIVE | Retain | Loads `assets/js/grammar.js`. |
| `index.html` | 6,795 | 2025-10-19 | Home page | ACTIVE | Retain | Landing layout, references hero sections. |
| `offline/single.html` | 7,680 | 2025-08-25 | Legacy offline page | ORPHAN | Remove after verification | Duplicate of `_default/offline.html`; no content references found. |
| `test-flashcards/single.html` | 7,213 | 2025-10-12 | `/test-flashcards/` (sandbox) | LEGACY | Keep until legacy JS retired | Used for manual testing of `flashcards.js`/`spaced-repetition.js`. |
| `grammar/list.html` | 3,401 | 2025-10-19 | `/grammar/` | ACTIVE | Retain | Duplicate entry due to data listing—keep. |

### Partials

| File Path | Bytes | Last Modified | Usage Count | Status | Recommendation | Notes |
| --- | ---: | --- | ---: | --- | --- | --- |
| `partials/head.html` | 1,733 | 2025-08-28 | 1 (`baseof.html`) | ACTIVE | Retain | Meta tags, fonts. |
| `partials/header.html` | 3,968 | 2025-08-28 | 1 (`baseof.html`) | ACTIVE | Retain | Global nav, includes `language-toggle` and `search`. |
| `partials/footer.html` | 1,073 | 2025-08-17 | 1 | ACTIVE | Retain | Footer links. |
| `partials/search.html` | 620 | 2025-08-17 | 1 (inside header) | ACTIVE | Retain | Search overlay markup. |
| `partials/language-toggle.html` | 256 | 2025-10-12 | 1 | ACTIVE | Retain | Language toggle button markup. |
| `partials/pwa-register.html` | 2,540 | 2025-08-28 | 1 (`baseof.html`) | ACTIVE | Retain | Inline PWA registration script and styles. |
| `partials/analytics.html` | 1,638 | 2025-08-25 | Optional include (commented in base) | ACTIVE | Retain | Analytics snippet; ensure toggled via config. |

### Shortcodes

| File Path | Bytes | Last Modified | Usage | Status | Recommendation | Notes |
| --- | ---: | --- | --- | --- | --- | --- |
| `_shortcodes/vocab.html` | 2,661 | 2025-09-24 | Used in content to render vocab sections | ACTIVE | Retain | Embeds `vocab-cards.js` (ES module). |
| `_shortcodes/vocab-grid.html` | 7,908 | 2025-08-28 | Complex grid display | ACTIVE | Retain | Provides filtering grid inside Markdown. |
| `_shortcodes/vocab-card.html` | 4,356 | 2025-08-28 | Single card render | ACTIVE | Retain | Works with `vocab-grid`. |
| `_shortcodes/flashcard.html` | 2,278 | 2025-08-28 | Legacy flip card | LEGACY | Evaluate consolidation | Pure CSS flip; may overlap with enhanced UI. |
| `_shortcodes/flashcards.html` | 8,025 | 2025-10-17 | Legacy JS session | LEGACY | Document fallback path | Relies on `window.BgDeApp`. |
| `_shortcodes/vocab-search.html` | 10,020 | 2025-08-28 | Embeds search widget | ACTIVE | Retain | Connects to vocabulary data. |

### Markup Overrides (`layouts/_default/_markup/`)

| File Path | Bytes | Last Modified | Purpose | Status | Recommendation | Notes |
| --- | ---: | --- | --- | --- | --- | --- |
| `render-codeblock.html` | 509 | 2025-08-17 | Adds copy button markup | ACTIVE | Retain | Pairs with `assets/js/code.js`. |
| `render-heading.html` | 218 | 2025-08-17 | Anchor headings | ACTIVE | Retain | Enables deep links. |
| `render-link.html` | 361 | 2025-08-17 | External link handling | ACTIVE | Retain | Adds target/rel attributes. |
| `render-image.html` | 1,186 | 2025-08-17 | Responsive images | ACTIVE | Retain | Wraps figures and captions. |

## Observations

- **Inline assets:** `layouts/practice/single.html` and `layouts/_shortcodes/flashcards.html` embed inline scripts/styles. Later refactoring should move these into compiled assets to maintain single source of truth.
- **Duplicate offline layouts:** Both `_default/offline.html` and `offline/single.html` exist, yet the site uses `content/offline.md` with default layout. Confirm which version is canonical.
- **Service worker duplication:** The layout-provided `sw.js` is likely outdated; the active service worker resides in `static/sw.js`. Removing duplicate outputs reduces confusion.
- **Legacy testing layout:** `layouts/test-flashcards/single.html` is valuable during transition but should be marked deprecated in docs and excluded from production navigation.

## Recommendations

- **Document template roles:** Update `docs/ARCHITECTURE.md` or `docs/DEVELOPMENT.md` to clarify which templates power major flows versus legacy backups.
- **Plan cleanup slices:** Include removal or consolidation of redundant offline layouts and the unused `_default/sw.js` in the refactoring roadmap after verifying no build steps depend on them.
- **Refactor inline assets:** Schedule a future slice to migrate inline CSS/JS into `assets/` bundles, reducing maintenance overhead.

## Next Steps

Await user direction on whether to continue with the next audit slice (e.g., static assets or data files). Track deprecation decisions in `docs/DEPRECATIONS.md` during subsequent phases.
