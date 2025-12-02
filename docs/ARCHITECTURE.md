# System Architecture & Technical Guidelines

## 1. Overview
The **Bulgarian-German Learning App** is a modern Single Page Application (SPA) designed to facilitate vocabulary and grammar acquisition through tandem learning (German <-> Bulgarian). It is built for performance, offline capability, and ease of deployment via static hosting (GitHub Pages).

## 2. Technology Stack
- **Framework**: [SvelteKit](https://kit.svelte.dev/) (Static Adapter)
- **UI Library**: [Svelte 5](https://svelte.dev/) (Runes mode enabled)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Package Manager**: `pnpm`
- **Testing**: [Playwright](https://playwright.dev/) (E2E & Component Testing), [Vitest](https://vitest.dev/) (Unit Testing)
- **Deployment**: GitHub Pages

## 3. Application State Management
We utilize **Svelte 5 Runes** (`$state`, `$derived`, `$effect`) for all reactive state management, moving away from Svelte 4 stores.

### Global State (`src/lib/state/app.svelte.ts`)
The `AppState` class is a singleton reactive object that manages:
- **User Preferences**: Learning direction (`DE->BG` / `BG->DE`), themes.
- **Session State**: Current search queries, active filters.
- **Practice State**: Current flashcard, answer visibility, score tracking.

### Persistence
- Critical user state (progress, settings) is persisted to `localStorage` to ensure continuity across reloads.
- Data synchronization handles conflict resolution between local state and potential future backend extensions.

## 4. Data Architecture
### Source of Truth
- **Static Data**: The core vocabulary database lives in `static/data/vocabulary-unified.json`.
- **Schema**: Data follows the `VocabularyItem` interface defined in `src/lib/types/vocabulary.ts`.

### Data Loading (`src/lib/data/loader.ts`)
- **Singleton Pattern**: The `DataLoader` class ensures data is fetched only once and cached in memory.
- **Performance**: Large datasets are indexed by ID and Category on load to optimize search and filtering performance.

## 5. Directory Structure
```
/
├── src/
│   ├── lib/
│   │   ├── components/   # UI Components (Atomic Design principles)
│   │   ├── data/         # Data loading & processing logic
│   │   ├── state/        # Global state managers (Svelte Runes)
│   │   └── types/        # TypeScript interfaces & types
│   └── routes/           # SvelteKit File-based routing
├── static/
│   └── data/             # Static JSON datasets
├── docs/                 # Project documentation
│   ├── archive/          # Legacy docs & scripts
│   ├── ARCHITECTURE.md   # This file
│   └── ROADMAP.md        # Development plan
└── tests/                # Playwright E2E tests
```

## 6. Coding Standards
- **Runes First**: Always prefer `$state` over `writable` stores.
- **Type Safety**: strict TypeScript configuration. No `any` unless absolutely necessary.
- **Components**: Use Svelte 5 Snippets for reusable UI logic within components.
- **CSS**: Utility-first with Tailwind. encapsulate complex styles in `@layer components` if reused often.