# Data Schema & localStorage Audit

Last Updated: 2025-10-19

## Scope

Map the structure of vocabulary/grammar JSON data under `data/` and document all persisted learner progress keys within localStorage (prefix `bgde:` plus legacy variants). Identify duplication, schema inconsistencies, and migration considerations.

## Summary Findings

- **Primary vocabulary source:** `data/vocabulary.json` remains the canonical dataset (~2000 lines). `data/vocabulary-enhanced.json` is a curated subset with richer annotations; both share core fields (`id`, `word`, `translation`, `source_lang`, `target_lang`, `category`, `level`, notes, etymology, cultural/linguistic notes, examples). Enhanced file adds more examples per entry but duplicates data from the main file.
- **Supplementary datasets:** `data/cultural-grammar.json` provides cross-cultural explanations keyed by `id`, while `data/grammar.json` contains grammar lessons with `title`, `examples`, `level`, `id`, `content`, `summary` (some `category: null`). `data/vocabulary-expansion-plan.json` documents roadmap metadata (CEFR goals) rather than runtime content.
- **localStorage namespace:** Modern modules use `bgde:` prefix (e.g., `bgde:review_<id>_<direction>`, `bgde:language-direction`, `bgde:practice_selection`, `bgde:current_session`, `bgde:session_history`). Legacy keys include `bgde:review:<id>`, `bgde:learning_direction`, and non-prefixed keys like `theme`, `audio-enabled`, `grammar-bookmarks`.
- **Schema divergence:** Three SM-2 implementations (in `assets/js/enhanced-spaced-repetition.js`, `assets/js/spaced-repetition.js`, `assets/js/app.js`) store similar but not identical review state structures. Enhanced module uses camelCase (`easeFactor`, `lastReview`), legacy uses snake/camel mix (`easinessFactor`, `lastReviewDate`). Consolidation required to avoid incompatible data during migration.
- **Data duplication risk:** Enhanced practice system relies on `notes_bg_to_de` / `notes_de_to_bg`; these fields exist in `data/vocabulary.json` but not consistently in `data/vocabulary-enhanced.json`. Ensure schema alignment before deprecating either dataset.

## JSON Data Files

### `data/vocabulary.json`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | Unique identifier (slug-like). |
| `word` | string | yes | Bulgarian term. |
| `translation` | string | yes | German equivalent. |
| `source_lang` | string | yes | Defaults to `"bg"`. |
| `target_lang` | string | yes | Defaults to `"de"`. |
| `category` | string | optional | e.g., `"Begrüßung"`. |
| `level` | string | optional | CEFR level (`A1`, `A2`). |
| `notes` | string/null | optional | General note. |
| `notes_bg_to_de` | string/null | optional | Direction-specific hints (BG→DE). |
| `notes_de_to_bg` | string/null | optional | Direction-specific hints (DE→BG). |
| `etymology` | string/null | optional | Word origin. |
| `cultural_note` | string/null | optional | Cultural context. |
| `linguistic_note` | string/null | optional | Grammar/pronunciation tips. |
| `difficulty` | number/null | optional | 1–5 difficulty. |
| `frequency` | number/null | optional | Usage frequency (0–100). |
| `examples` | array | optional | Each example object contains `sentence`, `translation`, optional `context`. |

**Consumers:** `assets/js/unified-practice-session.js` (via embedded script), `assets/js/vocabulary-adapter.js`, `layouts/_shortcodes/vocab.html`, `layouts/vocabulary/list.html`.

**Observations:** Some entries lack `difficulty`/`frequency`; consider defaulting values during preprocessing. Directional notes enable bidirectional hints; ensure all future vocabulary additions include both variants.

### `data/vocabulary-enhanced.json`

- Mirrors `vocabulary.json` schema but currently contains a smaller curated list with richer `examples`. Some fields (`notes_bg_to_de`, `notes_de_to_bg`) are absent; directionality handled within enhanced modules via fallback to `notes`.
- **Recommendation:** Either merge into `data/vocabulary.json` with standardized fields or treat as `beta` dataset. Document selection criteria (A/B testing, future expansion). Remove duplication once roadmap finalizes.

### `data/grammar.json`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | Unique slug. |
| `title` | string | yes | Lesson heading. |
| `summary` | string | yes | Short description. |
| `content` | string | yes | Markdown-friendly text with newlines. |
| `examples` | array | optional | Each containing `sentence`, `translation`. |
| `level` | string | optional | CEFR label (`A1`, `A2`). |
| `category` | string/null | optional | Currently `null`; consider taxonomy. |

**Consumers:** `layouts/grammar/list.html`, `assets/js/grammar.js` (bookmarking). Ensure consistent `id` when adding new lessons.

### `data/cultural-grammar.json`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | Cross-lingual concept identifier. |
| `title` | string | yes | Topic heading. |
| `bulgarian_concept` | string | yes | BG term. |
| `german_concept` | string | yes | DE term. |
| `difficulty` | string | optional | e.g., `"A2"`, `"B1"`. |
| `cultural_context` | object | yes | Contains `bulgarian_perspective`, `german_perspective`. |
| `cross_linguistic_explanation` | object | yes | Contains `bg_to_de`, `de_to_bg`. |
| `examples` | array | optional | Each with `bulgarian`, `german`, `explanation_bg_to_de`, `explanation_de_to_bg`. |
| `common_mistakes` | object | optional | `bg_to_de` and `de_to_bg` arrays. |
| `cultural_insight` | string | optional | Narrative insight. |

**Consumers:** `assets/js/enhanced-bidirectional-system.js` and associated cultural toggles. Ensure consistent `id` mapping with vocabulary topics if cross-linking.

### `data/vocabulary-expansion-plan.json`

- Planning document with fields: `phase`, `target_levels`, `word_count`, `categories`, `notes`. Not consumed at runtime; used for roadmap documentation.

## localStorage Keys

| Key | Producer | Data Shape | Purpose | Notes |
| --- | --- | --- | --- | --- |
| `bgde:language-direction` | `language-toggle.js`, `enhanced-bidirectional-system.js`, `enhanced-practice-session.js` | string (`"bg-de"`/`"de-bg"`) | Current learning direction | Replaces legacy `bgde:learning_direction`. |
| `bgde:learning_direction` | Legacy modules (`bidirectional-flashcards.js`) | string | Deprecated | Migrated to `bgde:language-direction` on load. |
| `bgde:review_<itemId>_<direction>` | `EnhancedSpacedRepetition.saveState()` | object `{ itemId, interval, easeFactor, repetitions, nextReview, lastReview, direction, totalReviews, correctStreak }` | Enhanced SM-2 state | Direction-specific storage. |
| `bgde:review:<wordId>` | `SpacedRepetition.saveState()` | object `{ wordId, easinessFactor, interval, repetitions, nextReviewDate, lastReviewDate, totalReviews, correctAnswers, streak, created, updated }` | Legacy SM-2 state | No direction field; uses ISO strings. |
| `bgde:current_session` | `modules/practice-page.js` | object (session metadata, queue, stats) | Legacy practice session recovery | Not used by enhanced session (currently). |
| `bgde:session_history` | `modules/practice-page.js`, `session-stats-dashboard.js` | array of session summaries | Historical stats | Enhanced session yet to integrate. |
| `bgde:practice_selection` | `vocabulary.js`, `modules/vocabulary-page.js`, `modules/practice-page.js` | array of word IDs | Custom practice selection cache | Enhanced modules may not use; confirm before removal. |
| `bgde:pwa-install-dismissed` | `modules/service-worker.js` | timestamp string | Tracks dismissed PWA install prompts | Used for UX gating. |
| `bgde:progress` / other prefixed keys | (none currently) | — | Reserved | Documentation mentions but no active usage found. |
| `grammar-bookmarks` | `assets/js/grammar.js` | array of grammar IDs | Bookmarking grammar articles | Lacks `bgde:` prefix; consider migration. |
| `theme` | `assets/js/app.js` | string (`"light"`/`"dark"`) | UI theme | Non-prefixed (global). |
| `audio-enabled` | `assets/js/app.js` | string (`"true"`/`"false"`) | Audio preference | Non-prefixed. |

## Observations & Risks

- **Schema Fragmentation:** Multiple review state schemas risk data loss when migrating between legacy and enhanced sessions. No automatic migration exists; running both systems concurrently duplicates storage (`bgde:review:<id>` and `bgde:review_<id>_<direction>`).
- **Directional notes:** `enhanced-practice-session.js` expects directional notes fields; ensure vocabulary entries include these to avoid empty hints during DE→BG mode.
- **Bookmarks & preferences:** Some keys (e.g., `grammar-bookmarks`, `theme`, `audio-enabled`) lack `bgde:` prefix, violating current convention. Document before renaming to avoid breaking existing user data.
- **Data redundancy:** `search-index.json` generated from vocabulary data (via Go tool); ensure source-of-truth is `data/vocabulary.json`. Enhanced dataset should merge or clearly state purpose to prevent drift.
- **LocalStorage cleanup:** Neither enhanced nor legacy modules expose TTL management; storage could grow indefinitely. Consider retention strategy in refactoring roadmap.

## Recommendations

- **Unify SM-2 state:** Plan migration to a single storage schema (prefer enhanced structure) with compatibility adapters to convert legacy keys (`bgde:review:<id>`) and preserve streaks/EF.
- **Standardize prefix:** Adopt `bgde:` for all preference keys (`theme`, `audio-enabled`, `grammar-bookmarks`) or document legacy behavior. Provide migration script to copy values.
- **Document dataset roles:** Clarify in `docs/DEVELOPMENT.md` when to update `vocabulary.json` vs `vocabulary-enhanced.json`; consolidate once enhanced rollout completes.
- **Schema validation tooling:** Add lint step (Go or Node script) to verify vocabulary entries include required directional notes, difficulty defaults, and unique IDs.
- **Storage lifecycle:** Implement export/import utilities in enhanced practice UI tied to `bgde:` keys, and define cleanup triggers for obsolete entries.

## Next Steps

Await guidance to proceed with Audit Slice 6 (Test coverage assessment). Track schema migration decisions in the refactoring roadmap.
