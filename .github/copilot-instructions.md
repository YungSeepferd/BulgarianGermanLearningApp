# AI Coding Agent Instructions for Bulgarian-German Learning App

## Project Status
**Last Updated**: 12 December 2025 | **Status**: MVP v2 - Clean, focused learning platform  
A SvelteKit + Svelte 5 bilingual learning app (Bulgarian ↔ German) with no backend, offline-capable, static GitHub Pages deployment.

**Recent Updates**: Vocabulary enrichment system completed (Dec 12); all critical issues resolved.

---

## The "Big Picture" Architecture

**Service Boundaries**:
- **UI Layer**: SvelteKit file-based routing + Svelte 5 components (runes-based, no legacy stores)
- **State**: Two-layer pattern - `AppUIState` (ephemeral: language mode, search) + `AppDataState` (persistent: stats, favorites)
- **Data Flow**: JSON-in-build → loader.ts (cache) → schema validation (Zod) → state filters → components
- **Static-First**: All data bundled at build time; no server APIs (can extend `/routes/api/+server.ts` later)
- **Bilingual Core**: `languageMode: 'DE_BG' | 'BG_DE'` drives learning direction; UI language is separate

**Critical Pattern**: Use singleton `appState` from `src/lib/state/app-state.ts` everywhere. It facades both UI and Data state. **Never** instantiate new state classes.

---

## Developer Quick Start

```bash
pnpm install              # ONLY pnpm (never npm/yarn)
pnpm run dev              # Starts localhost:5173 with auto-reload
pnpm run check            # TypeScript + Svelte check
pnpm run simulate-ci      # Lint + type check + unit + E2E tests (before push)
```

---

## 🚨 CRITICAL: Dev Server Management

**NEVER restart the dev server yourself.** It has HMR (Hot Module Replacement) and updates live.

**Rules**:
1. ❌ **DO NOT** run `pnpm run dev` if a server is already running
2. ❌ **DO NOT** kill and restart the dev server after making changes
3. ✅ **DO** check if server is running: `lsof -nP -iTCP:5173 | grep LISTEN`
4. ✅ **DO** ask user if you need the server started/restarted
5. ✅ **DO** use Playwright MCP tools to test the live application

**Why**: Vite HMR updates instantly. Restarting wastes time and breaks iterative testing flow.

**Testing with Playwright MCP**:
- Use `mcp_playwright_browser_navigate` to load pages
- Use `mcp_playwright_browser_click` to interact with elements
- Use `console-ninja_runtimeErrors` to check for runtime errors
- This is **critical** for reliable iterative testing and refinement

**Port 5173 Rule**: If you absolutely must check port status, use `lsof -nP -iTCP:5173 | grep LISTEN`

---

## Vocabulary Enrichment System (NEW - Dec 12)

**Status**: Production-ready, ~745 entries enriched with definitions/examples from Langenscheidt  
**Orchestrator**: `scripts/enrichment/orchestrate-enrichment.ts`  
**Output**: Reports in `enrichment-output/`

Common workflows:
```bash
pnpm run enrich:vocabulary              # Full pipeline: scrape → validate → merge
pnpm run enrich:vocabulary:validate     # Validation only (no scraping)
pnpm run enrich:vocabulary:cache        # Use cached data only
pnpm run enrich:vocabulary:dry          # Dry run preview
pnpm run enrich:vocabulary:pilot        # Test on single batch
```

**How it works**: Scrapes definitions → validates duplicates → merges into unified vocabulary → produces JSON + markdown report.

---

## Essential Svelte 5 Patterns

**ONLY use Svelte 5 runes syntax.** No legacy stores, no reactive statements (`$:`), no `export let`.

```svelte
<script lang="ts">
  // ✅ State
  let count = $state(0);
  let doubled = $derived(count * 2);
  
  // ✅ Props (REQUIRED for components)
  let { title = 'Default', items = [] } = $props();
  
  // ✅ Effects with cleanup
  $effect(() => {
    const handler = () => console.log('resize');
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  });
</script>
```

**Never use**: `export let prop = 'value'` or `$: doubled = count * 2` in NEW code.

---

## State Management Principles

**File Structure**:
- `src/lib/state/app-state.ts` → singleton `appState` (**import everywhere**)
- `src/lib/state/app-ui.svelte.ts` → UI state (search, language mode, filters)
- `src/lib/state/app-data.svelte.ts` → Persistent data (practice stats, favorites)

**Language Mode** (`DE_BG` vs `BG_DE`):
- Determines: question language ← answer language
- Example: `DE_BG` = show German, user answers in Bulgarian
- **UI language is SEPARATE** (controlled by paraglide i18n in `src/paraglide/`)
- Update mode: `appState.setLanguageMode('BG_DE'); localStorage.setItem('app-language-mode', 'BG_DE');`

---

## Data Architecture & Validation

**Vocabulary Schema** (Zod-validated, `src/lib/schemas/vocabulary.ts`):
```typescript
VocabularyItem {
  id: string                    // Required
  german: string                // Required
  bulgarian: string             // Required (Cyrillic)
  partOfSpeech: string          // Required: "noun" | "verb" | "adjective" | ...
  difficulty: 1-5               // Required
  categories: string[]          // Required
  exampleSentences?: object[]   // Optional (enrichment)
  alternatives?: string[]       // Optional
}
```

**Always validate**: `UnifiedVocabularyItemSchema.parse(data)` catches incomplete data early.

**Maintenance scripts**:
```bash
pnpm run verify:vocabulary          # Check structure
pnpm run deduplicate:vocabulary     # Remove duplicates  
pnpm run clean:vocabulary           # Format normalization
pnpm run quality:pipeline           # Run all three sequentially
```

---

## Component Conventions

**File organization**:
```
src/lib/components/
├── ui/                    # Atomic: buttons, modals, forms
├── flashcard/            # Feature: flashcard system
├── practice/             # Feature: practice mode
└── layout/               # Layout wrappers
```

**File extensions matter**:
- `.svelte` = component with markup (use Svelte 5 runes)
- `.svelte.ts` = reactive logic/state (use Svelte 5 runes, export classes/functions)
- `.ts` = pure utilities (no reactivity)

**TypeScript strictness**: `strict: true` in tsconfig. NO `any`, NO `@ts-ignore` (justify in comments if unavoidable).

---

## Testing Commands & Structure

```bash
pnpm run test:unit              # Vitest: business logic
pnpm run test:components        # Playwright CT: isolated components
pnpm run test:e2e               # Playwright: full user flows
pnpm run test:accessibility     # a11y compliance
pnpm run test:visual            # Visual regression
pnpm run test:all               # All of the above
```

**Before pushing**: `pnpm run simulate-ci` (replaces pre-push hook—manually invoke to avoid hangs).

**Test file structure**:
```
tests/
├── unit/              # Vitest files (src/lib logic)
├── components/        # Component tests (Playwright CT)
├── e2e/               # User flows (Playwright)
└── accessibility/     # a11y checks (Playwright + axe)
```

---

## Error Handling Pattern

**File**: `src/lib/services/errors.ts`

Custom error classes: `StateError`, `DataError`, `ServiceError`. Use `ErrorHandler.handleError(error, 'context', { extra: 'details' })`.

```typescript
import { StateError, ErrorHandler } from '$lib/services/errors';

try {
  appState.setLanguageMode('INVALID');
} catch (err) {
  ErrorHandler.handleError(err, 'language-mode-change', { attempted: 'INVALID' });
}
```

---

## Cross-Service Communication

**Avoid direct dependencies** → use EventBus (`src/lib/services/event-bus.ts`):

```typescript
import { eventBus } from '$lib/services/event-bus';

// Subscribe in one service:
const unsubscribe = eventBus.subscribe('practice-result', (data) => {
  console.log(`Item ${data.itemId}: ${data.correct ? 'correct' : 'incorrect'}`);
});

// Emit from another:
await eventBus.emit('practice-result', { itemId: '123', correct: true, time: 5000 });

// Cleanup: unsubscribe();
```

---

## Build & Deployment

```bash
pnpm run build                # Outputs to build/
pnpm run build:gh-pages       # Adds /BulgarianApp-Fresh/ base path
```

**Static assets**: Served from `static/` and `public/`; bundled at build time.

---

## Common Gotchas & Solutions

| Problem | Cause | Fix |
|---------|-------|-----|
| Circular dependencies | Service A imports B, B imports A | Use EventBus instead of direct imports |
| Page not rendering | Browser-only code running during SSR | Wrap in `if (browser) { ... }` from `$app/environment` |
| Vocabulary not loading | Missing `unified-vocabulary.json` in build | Run `pnpm run build` to create it |
| Language not persisting | State updated but not localStorage | Update both: `appState.setLanguageMode('BG_DE'); localStorage.setItem('app-language-mode', 'BG_DE');` |
| One feature breaks, others fail | Cascade failure from one data issue | Validate early! Check `pnpm run verify:vocabulary` |
| Silent errors in console | Zod validation catches errors silently | Check browser console in dev mode |
| Multiple dev servers | Running 2+ pnpm instances on 5173 | Kill existing: `pkill -f "pnpm dev"` |
| Tests fail on new fields | Test fixtures out of sync with schema | Update test fixture vocabulary to match schema |

---

## Code Discovery Workflow

When exploring unfamiliar code:
1. **Semantic search first** (ask for patterns/features, not files)
2. **Read context**: Always read 20+ lines before/after target code
3. **Follow imports**: Trace through state/service layers to understand data flow
4. **Check schemas**: Look in `src/lib/schemas/` to understand data contracts
5. **Verify in browser**: Use console to inspect `appState` values during execution

---

## Key Documentation

- **[docs/GETTING_STARTED.md](../docs/GETTING_STARTED.md)** — 5-min setup
- **[docs/PROJECT_OVERVIEW.md](../docs/PROJECT_OVERVIEW.md)** — What the app does
- **[docs/ARCHITECTURE.md](../docs/architecture/ARCHITECTURE.md)** — System design
- **[docs/DEVELOPMENT.md](../docs/development/DEVELOPMENT.md)** — Coding patterns
- **[docs/TESTING.md](../docs/development/TESTING.md)** — Test strategy
- **[docs/DEBUGGING_GUIDE.md](../docs/DEBUGGING_GUIDE.md)** — Troubleshooting
- **[docs/VOCABULARY_ENRICHMENT_GUIDE.md](../docs/VOCABULARY_ENRICHMENT_GUIDE.md)** — Enrichment system
- **[INDEX.md](../INDEX.md)** — Full documentation index

---

## When You're Stuck

1. Check [docs/DEBUGGING_GUIDE.md](../docs/DEBUGGING_GUIDE.md) for known issues
2. Run `pnpm run check` to catch TypeScript errors
3. Inspect **browser console** (errors logged there, not just terminal)
4. Verify vocabulary: `pnpm run verify:vocabulary`
5. Trace state: `console.log(appState.languageMode)`, `appState.searchQuery`, etc.

---

**Framework**: SvelteKit 2.49.2 + Svelte 5 | **Target**: GitHub Pages | **Last Updated**: Dec 12, 2025
