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
- Ensure all learner-facing strings and assets appear solely in Bulgarian or German; remove or translate any English content before shipping.

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

## Bidirectional Tandem Learning System (✅ October 2025)

**Status**: Fully implemented and tested

### Core Requirements

1. **Direction-Specific Explanations**:
   - ALL vocabulary entries (157/157) have both `notes_de_to_bg` and `notes_bg_to_de`
   - German explanations for German speakers learning Bulgarian
   - Bulgarian explanations for Bulgarian speakers learning German
   - Word breakdowns, roots, grammatical info included

2. **Language-Aware Note Display**:
   - Template includes both note variants with `data-direction` attributes
   - JavaScript (`vocabulary-page.js`) shows/hides correct notes based on active direction
   - Notes automatically switch language when user toggles DE→BG ↔ BG→DE
   - Smooth UX without page reload

3. **Icon-Based Quick Filters**:
   - Visual, touch-friendly buttons for tandem sessions
   - **Levels**: 🌐 All, 🌱 A1, 🌿 A2, 🌳 B1, 🏆 B2
   - **Categories**: 📚 All, 👋 Begrüßung, 📦 Substantiv, ⚡ Verb, 🎨 Adjektiv, ⏩ Adverb, 💬 Ausdruck, 👨‍👩‍👧‍👦 Familie, 🍽️ Lebensmittel, ⏰ Zeit, 🔢 Zahl
   - One-click filtering synced with dropdown selects
   - Active state highlighting
   - Mobile-responsive (≥80px touch targets)

### Implementation Details

**Data Structure**:
```json
{
  "word": "Здравей",
  "translation": "Hallo",
  "notes_de_to_bg": "Für Deutschsprachige: 'Здравей' ≈ 'Hallo'; von 'здрав' (gesund)...",
  "notes_bg_to_de": "Wörtlich ein Gesundheitsgruß; informell und ganztägig nutzbar...",
  "etymology": "From Proto-Slavic 'zdravъ' (healthy)...",
  "cultural_note": "Standard informal greeting...",
  "linguistic_note": "Stress on first syllable..."
}
```

**Template Pattern** (`layouts/vocabulary/list.html`):
```html
<!-- Both notes included; JS controls visibility -->
<div class="vocab-note vocab-note-direction" data-direction="de-bg">
  🎯 {{ .notes_de_to_bg }}
</div>
<div class="vocab-note vocab-note-direction" data-direction="bg-de">
  🎯 {{ .notes_bg_to_de }}
</div>
```

**JavaScript Control** (`assets/js/modules/vocabulary-page.js`):
```javascript
updateDirectionUI(dir) {
  document.querySelectorAll('.vocab-note-direction').forEach(note => {
    note.style.display = (note.dataset.direction === dir) ? '' : 'none';
  });
}
```

**Quick Filter Handler**:
```javascript
handleQuickFilter(event) {
  const filterType = event.currentTarget.dataset.filterType;
  const filterValue = event.currentTarget.dataset.filterValue;
  this.filters[filterType].value = filterValue;
  this.applyFilters();
}
```

### Testing Checklist

When modifying bidirectional features, verify:
- [x] Direction notes switch language on toggle (DE→BG shows German, BG→DE shows Bulgarian)
- [x] Quick filter buttons sync with dropdown selects
- [x] Active button styling updates correctly
- [x] Touch targets ≥80px on mobile
- [x] Keyboard navigation works (Tab/Enter)
- [x] Screen readers announce filter changes
- [x] No console errors during direction switch
- [x] Dark mode styling correct
- [x] Notes display for ALL vocabulary (100% coverage)

### Tandem Session Best Practices

**For Developers**:
- Never remove or modify `data-direction` attributes
- Keep both `notes_de_to_bg` and `notes_bg_to_de` in sync semantically
- Test both directions when adding new vocabulary
- Maintain emoji consistency for category icons
- Ensure quick filter buttons have descriptive titles

**For Content Creators**:
- Write direction notes from native speaker's perspective
- Include word breakdown for compound words
- Specify grammatical gender/form
- Add usage frequency hints (sehr häufig/често използвана)
- Keep translations culturally appropriate

### Files to Know

- **Data**: `data/vocabulary.json` (all 157 entries with bidirectional notes)
- **Scripts**: `scripts/add-direction-notes.mjs` (systematic note generation)
- **Template**: `layouts/vocabulary/list.html` (quick filters + note display)
- **JS Module**: `assets/js/modules/vocabulary-page.js` (direction switching logic)
- **Styles**: `assets/scss/components/_quick-filters.scss` (icon button styling)
- **Docs**: `docs/BIDIRECTIONAL_TANDEM_ENHANCEMENT_COMPLETE.md` (full spec)

## Current Focus (October 2025)

- Validate direction-aware vocabulary explanations on both the list and practice experiences. ✅ DONE
- Exercise every learner flow (home → vocabulary → practice → results) after each change.
- Keep live documentation tidy: archive completed reports, keep active guides in `docs/` root.
- Treat `npm run dev` as the canonical dev server; confirm no stray SW registration in dev logs.
- When testing, verify:
  - Language toggle (`layouts/partials/language-toggle.html`) updates cards, notes, and practice queues. ✅ WORKING
  - Vocabulary filters/search (`layouts/vocabulary/list.html`, `assets/js/modules/vocabulary-page.js`) change counts. ✅ WORKING
  - Quick filter buttons (`assets/scss/components/_quick-filters.scss`) apply filters instantly. ✅ NEW
  - Practice session stats (`assets/js/unified-practice-session.js`) reflect user input and show direction-aware notes.
  - Cultural/linguistic notes render for spotlight entries like `заедно`. ✅ ALL ENTRIES
  - Direction-specific notes switch language correctly when toggling DE→BG ↔ BG→DE. ✅ NEW
- Record findings and gaps in `docs/notes/TODAY.md` before finishing the day.
