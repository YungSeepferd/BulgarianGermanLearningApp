# AI Coding Agent Instructions for Bulgarian-German Learning App

## Project Status & Recent Changes
**Last Updated**: 11 December 2025 | **Status**: MVP (v2 - Streamlined) - **Critical Issues Identified & Documented**

The app was recently transformed from a commercial platform to a focused personal learning MVP. **3500+ lines of non-essential code removed** (gamification, user accounts, social features). This is the **clean, maintained codebase**—not legacy code with features to preserve.

### ⚠️ Critical Issues Found (December 11, 2025)
**Complete analysis in**: [docs/CRITICAL_ISSUES_ANALYSIS.md](../docs/CRITICAL_ISSUES_ANALYSIS.md)

| Issue | Status | Impact | Fix Time | Docs |
|-------|--------|--------|----------|------|
| **#1: Vocabulary JSON incomplete** | 🔴 Blocking | Vocabulary, Practice, Learn broken | 15 min | [CRITICAL_ISSUES_ANALYSIS.md](../docs/CRITICAL_ISSUES_ANALYSIS.md) |
| **#2: Practice/Learn routes blank** | 🔴 Cascading | Cascade from Issue #1 | 0 min (auto) | [CRITICAL_ISSUES_ANALYSIS.md](../docs/CRITICAL_ISSUES_ANALYSIS.md) |
| **#3: Grammar text in Latin** | 🟡 Cosmetic | 6 lines need replacement | 5 min | [CRITICAL_ISSUES_ANALYSIS.md](../docs/CRITICAL_ISSUES_ANALYSIS.md) |

**Action**: See [IMMEDIATE_ACTION_PLAN.md](../IMMEDIATE_ACTION_PLAN.md) for step-by-step fixes (30 min total).

## Project Overview
A **SvelteKit + Svelte 5 Runes** tandem learning platform for Bulgarian ↔ German vocabulary and lessons, with bilingual UI, offline capability, and accessibility features. Deployed on GitHub Pages as a static site. **No user accounts, no gamification, no cloud sync—pure focused learning.**

## Architecture & Key Decisions

### Why This Structure Matters
- **SvelteKit** provides file-based routing and automatic SSR optimization
- **Svelte 5 Runes** (`$state`, `$derived`) are the standard—no legacy stores here
- **Bilingual UI** requires careful language state management (`LanguageMode: 'DE_BG' | 'BG_DE'`)
- **Static-first**: No server-side APIs; all data bundles in the build as JSON files
- **Minimal scope**: No user infrastructure (auth, profiles, cloud) or gamification—intentional simplification for maintainability

### Core State Pattern
**Files**: [src/lib/state/app-ui.svelte.ts](src/lib/state/app-ui.svelte.ts), [src/lib/state/app-data.svelte.ts](src/lib/state/app-data.svelte.ts)

Two-layer state (simplified after MVP transformation):
1. **AppUIState**: Language mode, search query, current item, display direction
2. **AppDataState**: Practice stats, favorites, recent searches (all localStorage-persisted)

Access via `appState` singleton from `src/lib/state/app-state.ts`. This is the only state instance you'll need. No creation of new state classes—maintain the singleton pattern.

### Data Flow
1. **Load**: [src/lib/data/loader.ts](src/lib/data/loader.ts) loads `unified-vocabulary.json` from build output and caches in-memory
2. **Filter**: [src/lib/state/app-ui.svelte.ts](src/lib/state/app-ui.svelte.ts) applies search + language mode filters via `filteredItems` derived state
3. **Persist**: [src/lib/state/app-data.svelte.ts](src/lib/state/app-data.svelte.ts) automatically persists stats, favorites, searches to localStorage

### Vocabulary Schema
**File**: [src/lib/schemas/vocabulary.ts](src/lib/schemas/vocabulary.ts) (Zod-validated)
```
VocabularyItem: {
  id, german, bulgarian, partOfSpeech, difficulty, category, 
  grammaticalInfo?, alternativeTranslations?, exampleSentences?
}
```
Always validate new data with `UnifiedVocabularyItemSchema.parse(data)`.

## Developer Workflows

### Quick Start
```bash
pnpm install              # One-time setup (NEVER use npm or yarn)
pnpm run dev              # Starts http://localhost:5173
pnpm run check            # TypeScript + Svelte check (catches errors early)
2. Run `pnpm run simulate-ci` — replaces pre-push hook (manually invoked to avoid hangs)
3. Run relevant tests: `pnpm run test:unit` and/or `pnpm run test:e2e`
4. Verify no unused imports/variables (strict mode enforces this)

**Package Manager Rule**: ONLY use `pnpm`. Never `npm` or `yarn`. Generate only `pnpm-lock.yaml`.

### Testing Strategy
- **Unit**: `pnpm run test:unit` → Vitest in jsdom environment
- **Components**: `pnpm run test:components` → Playwright component tests
- **E2E**: `pnpm run test:e2e` → Playwright full browser tests
- **Server Management
Before starting a dev server:
1. Check if one is already running: `ps aux | grep pnpm`
2. Kill existing: `pkill -f "pnpm dev"` if needed
3. Start fresh: `pnpm run dev`

**Never** run multiple dev servers on port 5173 simultaneously.
### Build & Deploy
- `pnpm run build` → Outputs to `build/` (uses `outDir` from [vite.config.ts](vite.config.ts))
- `pnpm run build:gh-pages` → Adds `/BulgarianApp-Fresh/` base path for GitHub Pages
- Static files served from `static/` and `public/` directories

### Critical: No Pre-Push Hook
The project deliberately removed pre-push hooks (they caused hangs). Instead:
- Run `pnpm run check && pnpm run lint` locally before pushing
- GitHub Actions runs same checks on PR (simulated via CI simulation)

## Project-Specific Patterns

### Language Mode & Direction
- **Language Mode** (`DE_BG` / `BG_DE`): Which language is the question, which is the answer
- **Display Direction** (derived): Human-readable label, e.g., "German → Bulgarian"
- When implementing UI: Check `appState.languageMode` to determine which translation to show first
- **Localization Service** ([src/lib/services/localization.ts](src/lib/services/localization.ts)): Handles UI language (separate from learning language)

### Error Handling Pattern
**File**: [src/lib/services/errors.ts](src/lib/services/errors.ts)

Use `ErrorHandler.handleError(error, 'context')` for user-facing errors. Custom error classes: `StateError`, `DataError`, `ServiceError`. Always provide context objects for debugging.

### Event Bus for Decoupled Communication
**File**: [src/lib/services/event-bus.ts](src/lib/services/event-bus.ts)

Use when services need to communicate without direct dependencies:
```typescript
const unsubscribe = eventBus.subscribe('practice-result', (data) => { ... });
await eventBus.emit('practice-result', { itemId, correct, time });
```

## Component Conventions

### File Organization
- **Components**: [src/lib/components/](src/lib/components/) organized by feature (flashcard/, gamification/, ui/)
- **UI Primitives**: [src/lib/components/ui/](src/lib/components/ui/) for reusable Tailwind-based components
- **Page Routes**: [src/routes/](src/routes/) with `+page.svelte`, `+layout.svelte`, `+page.ts` (loader functions)

### Svelte 5 Syntax Best Practices
- Prefer Svelte 5 syntax across components and runes:
- Use `let variable = $state(initial)` for reactive state (avoid legacy `$:`)
- Use `let derived = $derived(computation)` for computed values
- Use `$props()` for component props (avoid `export let`)
- Use latest SvelteKit APIs per upstream docs

### TypeScript Strictness
All `tsconfig.json` strict flags enabled (`strict: true`, `noImplicitAny`, `noUnusedLocals`). TypeScript errors must be resolved before merging. No `@ts-ignore` without strong justification.

### File Extension Conventions
- `.svelte` - Standard components with markup and interactivity
- `.svelte.ts` - Reusable reactive logic using Svelte 5 runes (state, services)
- `.ts` - Pure TypeScript utilities and functions (no reactivity)

### Reactivity Pattern (Svelte 5 Syntax)
Replace all legacy patterns with Svelte 5 runes:
```typescript
// ✅ State (new pattern)
let count = $state(0);
let filtered = $derived(items.filter(x => x.active));

// ✅ Effects with cleanup
$effect(() => {
  const handler = () => { /* ... */ };
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
});
$: doubled = count * 2;  // Legacy reactive statement
export let prop = 'value';  // Wrong pattern for props
```

Component props MUST use `$props`:
```typescript
// ✅ Correct
let { title = 'Default', items = [] } = $props();

// ❌ Incorrect
export let title = 'Default';
export let items = [];
```

## Vocabulary & Data Management

### Vocabulary Loading
The unified vocabulary is cached in memory on first load. Modifications (favorites, practice stats) are ephemeral unless explicitly persisted to localStorage.

**Scripts for data maintenance**:
- `pnpm run verify:vocabulary` → Validate vocabulary structure
- `pnpm run deduplicate:vocabulary` → Remove duplicates
- `pnpm run clean:vocabulary` → Clean formatting
- `pnpm run quality:pipeline` → Run all maintenance tasks sequentially

### Adding New Vocabulary Features
- Extend [src/lib/schemas/vocabulary.ts](src/lib/schemas/vocabulary.ts) with new Zod schema
- Update [src/lib/data/unified-vocabulary.json](src/lib/data/unified-vocabulary.json) format (requires re-export)
- Add migration script in [scripts/vocabulary-migration/](scripts/vocabulary-migration/)

## External Dependencies & Integrations

### Key Libraries
- **@sveltejs/kit**: Framework (SSR + routing)
- **svelte**: v5 (Runes-based reactivity)
- **@tailwindcss/postcss**: CSS framework (v4)
- **zod**: Schema validation
- **@inlang/paraglide**: I18n (managed in [src/paraglide/](src/paraglide/))

### Accessibility Requirements
5. **Tests Failing on New Features**: Ensure vocabulary JSON in test fixtures matches schema validation
6. **File Deletion**: If deleting a file, verify all imports/exports are removed to prevent broken builds
7. **Legacy Reactivity**: Do NOT use `$:` reactive statements or `svelte/store` in new code (legacy)
8. **Prop Pattern**: Do NOT use `export let` for component props; use `let { prop } = $props()` instead
9. **TSConfig Strictness**: No `any` types allowed—strict mode is enforced; use proper types always
10. **One Issue at a Time**: Focus on fixing one major issue before moving to the next (avoid scope creep)
### No Backend/API
All data is static JSON files. To add server features later:
- Extend `routes/api/` with SvelteKit server routes (`+server.ts`)
- Never hardcode API endpoints—use environment variables

## Common Gotchas & Warnings

### Critical Issues (December 11, 2025)
1. **Vocabulary Data Incomplete** 🔴
   - `data/unified-vocabulary.json` has incomplete items (missing fields)
   - **Fix**: Run `pnpm run rebuild:vocabulary` (15 min)
   - **Details**: [CRITICAL_ISSUES_ANALYSIS.md](../docs/CRITICAL_ISSUES_ANALYSIS.md)

2. **Practice/Learn Routes Blank** 🔴
   - Cascade failure from incomplete vocabulary data
   - **Fix**: Automatic once vocabulary is rebuilt
   - **Details**: [CRITICAL_ISSUES_ANALYSIS.md](../docs/CRITICAL_ISSUES_ANALYSIS.md)

3. **Grammar Examples in Latin** 🟡
   - `src/routes/grammar/+page.svelte` has 6 hardcoded Latin examples (should be Cyrillic)
   - **Fix**: Find & replace Latin text → Cyrillic (5 min)
   - **Details**: [CRITICAL_ISSUES_ANALYSIS.md](../docs/CRITICAL_ISSUES_ANALYSIS.md)

### General Gotchas
1. **Circular Dependencies**: Use EventBus for cross-service communication instead of direct imports
2. **SSR Issues**: Wrap browser-only code in `if (browser) { ... }` checks
3. **Language Mode Persistence**: Always trigger `localStorage.setItem('app-language-mode', mode)` when changing modes
4. **Vocabulary Not Loading**: Check that `unified-vocabulary.json` exists in `build/data/` after build
5. **Tests Failing on New Features**: Ensure vocabulary JSON in test fixtures matches schema validation
6. **Silent Error Handling**: Validation errors are caught silently (not logged). Check browser console in dev mode
7. **Cascade Failures**: One data issue can cascade to multiple features (see Issue #2)

## Code Discovery Workflow
When exploring unfamiliar code:
1. **Always start with codebase search** (semantic search) before file inspection
2. **Read files entirely** before editing—check 20+ lines before/after any target section
3. **Never assume** file structure without examination
4. **Use grep for patterns** across files when searching for specific strings

## Documentation & Maintenance

### Comprehensive Documentation Available
Complete repository analysis and documentation completed December 11, 2025:
- **[docs/GETTING_STARTED.md](../docs/GETTING_STARTED.md)** — 5-minute setup guide
- **[docs/PROJECT_OVERVIEW.md](../docs/PROJECT_OVERVIEW.md)** — What does the app do?
- **[docs/ARCHITECTURE.md](../docs/architecture/ARCHITECTURE.md)** — System design & data flows
- **[docs/DEVELOPMENT.md](../docs/development/DEVELOPMENT.md)** — Coding patterns & conventions
- **[docs/DEBUGGING_GUIDE.md](../docs/DEBUGGING_GUIDE.md)** — Troubleshooting common issues
- **[docs/TESTING.md](../docs/development/TESTING.md)** — Test strategy & how to run tests
- **[docs/DEPLOYMENT.md](../docs/deployment/DEPLOYMENT.md)** — Deploy to GitHub Pages
- **[docs/CRITICAL_ISSUES_ANALYSIS.md](../docs/CRITICAL_ISSUES_ANALYSIS.md)** — 3 critical bugs found & fixes
- **[docs/README.md](../docs/README.md)** — Documentation hub (index of all docs)
- **[INDEX.md](../INDEX.md)** — Root-level documentation index

### Single Source of Truth
Keep these docs in `/docs/` synchronized:
- **architecture/** — System architecture, data flows, UI structure
- **development/** — Component guidelines, testing strategy, best practices
- **roadmap/** — Project roadmap, next steps, implementation phases
- **design/** — Design concepts, style guide, accessibility

Root `README.md` must link to all major `/docs/` entries and stay concise (<300 lines).

### File Naming
- `UPPERCASE.md` for primary docs (e.g., `ARCHITECTURE.md`)
- `PHASE_*` for implementation phases
- Subdirectories group related topics (no docs outside `/docs/`)

### Documentation Ownership
Documentation updates **must be atomic with code changes**—never leave docs outdated. PRs modifying functionality require corresponding documentation updates.

---
**Last Updated**: 11 December 2025 | **Framework**: SvelteKit 2.49.2 + Svelte 5 | **Target**: GitHub Pages Static Site | **Rules Source**: .roo/rules/
| [src/lib/schemas/](src/lib/schemas/) | All Zod validation schemas |
| [src/lib/services/](src/lib/services/) | Business logic (lesson, quiz, localization, etc.) |
| [vite.config.ts](vite.config.ts) | Build & dev server config |
| [playwright.config.ts](playwright.config.ts) | E2E test configuration |
| [.github/workflows/](../../.github/workflows/) | CI/CD automation |

---
**Last Updated**: 11 December 2025 | **Framework**: SvelteKit 2.49.2 + Svelte 5 | **Target**: GitHub Pages Static Site
