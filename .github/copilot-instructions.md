# AI Coding Agent Instructions for Bulgarian-German Learning App

## Project Status
**Single Source of Truth**: [docs/PROJECT_STATUS.md](../docs/PROJECT_STATUS.md)
**Status**: MVP Launch Readiness - Final Polish
**Grammar Reference**: [docs/GERMAN_BULGARIAN_GRAMMAR_GUIDE.md](../docs/GERMAN_BULGARIAN_GRAMMAR_GUIDE.md)

# AI Coding Agent Instructions (Concise)

These instructions capture the essential, project-specific rules AI agents must follow to be productive in this repo. For deeper context, see [AGENTS.md](../AGENTS.md).

## Big Picture
- **Documentation First**: ALWAYS scan the `docs/` folder first to understand the project state, architecture, and current phase. The documentation is the source of truth.
- **Stack**: SvelteKit 2 + Svelte 5 (Runes) + TypeScript strict + Tailwind v4; fully static (GitHub Pages), no backend.
- **State**: Single `appState` facade over `AppUIState` (UI, ephemeral) and `AppDataState` (persistent). Never instantiate state classes; always import `src/lib/state/app-state.ts`.
- **Data Flow**: `data/*.json` → `src/lib/data/loader.ts` (cache) → Zod schemas → derived UI state → components.
- **Bilingual Core**: `languageMode` (`DE_BG` | `BG_DE`) drives learning direction; UI language is separate (paraglide in `src/paraglide/`).

## Critical Workflows
- **Dev**: `pnpm install` → `pnpm run dev` (HMR). Do not restart dev server; verify one server via `lsof -nP -iTCP:5173 | grep LISTEN`.
- **Checks**: `pnpm run check`, `pnpm run simulate-ci` (TS + lint + unit + E2E), tests: `pnpm run test:unit|components|e2e|accessibility`.
- **Build/Deploy**: `pnpm run build`, `pnpm run build:gh-pages` (base path). Live at GitHub Pages.
- **Enrichment**: `pnpm run enrich:vocabulary` and variants; outputs in `enrichment-output/`.

## Project-Specific Conventions
- **Svelte 5 Runes only**: Use `$state`, `$derived`, `$effect`, `$props`. Do not use `export let` or reactive `$:` statements.
- **Components**: `.svelte` for markup; `.svelte.ts` for reactive logic; `.ts` for pure utilities.
- **Accessibility**: Interactive elements must be semantic (e.g., flashcards use `<button>` with keyboard support and ARIA). Example: flip handlers on Enter/Space.
- **Error Handling**: Use `src/lib/services/errors.ts` and `ErrorHandler.handleError()`; avoid ad-hoc `console.error`.
- **Events**: Cross-service comms via `src/lib/services/event-bus.ts`; avoid direct cyclic imports.

## Data & Validation
- **Grammar Verification**: ALWAYS verify German and Bulgarian grammar rules (articles, gender, cases) before adding data.
  - **German**: Check correct article (der/die/das) for nouns. NEVER use placeholders like "Das/Die/Der" or "Mein/Meine". Ensure correct case (Nominative, Accusative, Dative) in examples.
  - **Bulgarian**: Check correct gender and definite article forms (-та/-ът/-то). Ensure correct agreement in examples.
  - **Reference**: See [docs/GERMAN_BULGARIAN_GRAMMAR_GUIDE.md](../docs/GERMAN_BULGARIAN_GRAMMAR_GUIDE.md) for comprehensive grammar rules.
- **Validation**: Use `src/lib/schemas/vocabulary.ts` Zod schemas for all data.
- **Enrichment**: Use `pnpm run enrich:vocabulary` for adding new data with validation.

## Testing Tips
- Prefer Playwright MCP to interact with the live dev server (navigate, click, assert). Check runtime errors with Console Ninja.
- Test folders: `tests/unit`, `tests/components`, `tests/e2e`, `tests/accessibility`.

## Common Pitfalls (Do’s & Don’ts)
- Don’t spawn new dev servers or kill/restart HMR manually.
- Don’t create new state instances; import `appState`.
- Don’t bypass Zod validation for vocabulary data.
- Do wrap browser-only code with `if (browser)` from `$app/environment`.
- Do fix keyboard accessibility when adding interactive UI.

## Key Files & Examples
- State: `src/lib/state/app-state.ts`, `app-ui.svelte.ts`, `app-data.svelte.ts`.
- Data: `src/lib/data/loader.ts`, `db.svelte.ts`; schema: `src/lib/schemas/vocabulary.ts`.
- Services: `event-bus.ts`, `errors.ts`.
- Components: `src/lib/components/ui/VocabularyCard.svelte` (flashcard variant uses `<button>` and keyboard handlers).

## References
- Docs hub: [INDEX.md](../INDEX.md)
- Quick start: [docs/GETTING_STARTED.md](../docs/GETTING_STARTED.md)
- Architecture: [docs/architecture/ARCHITECTURE.md](../docs/architecture/ARCHITECTURE.md)
- Development & testing: [docs/development/DEVELOPMENT.md](../docs/development/DEVELOPMENT.md), [docs/development/TESTING.md](../docs/development/TESTING.md)
- This is **critical** for reliable iterative testing and refinement
