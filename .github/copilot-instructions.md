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
## MCP Tools Available

### Svelte MCP Server (CRITICAL for Svelte Development)
The official Svelte MCP server is available and MUST be used for all Svelte 5 development:

1. **list-sections**: Get all available Svelte 5 and SvelteKit documentation sections
   - Always call this FIRST for any Svelte question
   - Returns sections with "use_cases" field describing WHEN each section is relevant
   - Example: `list-sections` → returns runes, components, state management, etc.

2. **get-documentation**: Fetch full documentation for specific sections
   - Call AFTER analyzing list-sections output
   - Supports single section or array of sections
   - Example: `get-documentation({ section: ["$state", "$derived", "$effect"] })`
   - Always fetch ALL relevant sections at once

3. **svelte-autofixer**: Validate Svelte components for best practices
   - MUST use before finalizing any .svelte file
   - Checks Svelte 5 runes patterns, accessibility, best practices
   - Example: `svelte-autofixer({ code: componentCode, desired_svelte_version: 5, filename: "Component.svelte" })`
   - Returns issues, suggestions, and whether another call is needed
   - Fix all issues found before committing

4. **playground-link**: Generate Svelte REPL links for components
   - Use after finalizing component code
   - Ask user if they want playground link before calling
   - Example: `playground-link({ name: "My Component", tailwind: true, files: { "App.svelte": code } })`

**Svelte MCP Workflow**:
1. For any Svelte work → call `list-sections` first
2. Analyze use_cases to find relevant sections
3. Call `get-documentation` with ALL relevant sections
4. Write component code
5. Validate with `svelte-autofixer` before finalizing
6. Fix any issues found
7. Optionally generate playground link

### Sequential Thinking MCP (for Complex Problem Solving)
Use for multi-step reasoning and complex analysis:

- **sequentialthinking**: Break down complex problems into thought steps
  - Use when planning architecture changes
  - Use when debugging complex issues
  - Use when analyzing trade-offs
  - Example: Planning a new feature, analyzing Phase implementation
  - Supports thought revision, branching, and iterative refinement
  - Parameters: `thought`, `nextThoughtNeeded`, `thoughtNumber`, `totalThoughts`
  - Can adjust totalThoughts up/down as understanding deepens

**Sequential Thinking Workflow**:
1. Start with initial estimate of needed thoughts
2. Break problem into logical steps
3. Revise previous thoughts if new insights emerge
4. Continue until solution is clear
5. Verify hypothesis before finalizing
### Playwright MCP (for Interactive Testing & Debugging)
Use for live browser interaction, testing, and debugging during development:

**Core Tools**:
- **browser_snapshot**: Take accessibility snapshots of current page state
- **browser_console_messages**: Get console logs/errors from browser
- **browser_network_requests**: Monitor network activity and API calls
- **browser_evaluate**: Execute JavaScript in browser context
- **browser_tabs**: Manage browser tabs (list, create, close, select)
- **browser_drag**: Perform drag-and-drop operations
- **browser_wait_for**: Wait for specific text or conditions
- **browser_run_code**: Execute Playwright code snippets
- **evaluate_script**: Run JavaScript and return JSON results
- **get_network_request**: Get specific network request details
- **handle_dialog**: Handle browser alerts/confirms/prompts
- **upload_file**: Upload files through file inputs

**When to Use**:
- ✅ Interactive testing during development
- ✅ Debugging UI issues in live browser
- ✅ Verifying component behavior
- ✅ Checking network requests/responses
- ✅ Inspecting console errors
- ✅ Testing file uploads
- ✅ Validating accessibility
- ✅ Testing drag-and-drop interactions

**Common Use Cases**:
```javascript
// 1. Check page state and accessibility
browser_snapshot() // Get current page structure

// 2. Debug console errors
browser_console_messages({ level: "error" })

// 3. Monitor API calls
browser_network_requests({ includeStatic: false })

// 4. Test interactions
browser_evaluate({ function: "() => document.querySelector('.btn').click()" })

// 5. Wait for dynamic content
browser_wait_for({ text: "Loading complete", timeout: 5000 })

// 6. Test file upload
upload_file({ uid: "file-input-123", filePath: "/path/to/file.pdf" })
```

**Workflow for Testing Features**:
1. Start dev server (`pnpm run dev`)
2. Use `browser_snapshot` to understand page structure
3. Use `browser_evaluate` to interact with elements
4. Check `browser_console_messages` for errors
5. Monitor `browser_network_requests` for API issues
6. Use `browser_wait_for` for async operations
7. Verify results with accessibility snapshots
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
