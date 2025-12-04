# Strategic Roadmap & Architecture Analysis

## Executive Summary
The Bulgarian-German Learning App is at a pivotal stage. While the core Svelte 5 migration is complete, the current architectural assumptions regarding data loading and testing are creating friction. The primary bottleneck is the tight coupling between data and application logic (via dynamic imports) and a CI/CD pipeline that tolerates failure rather than ensuring quality.

This document challenges existing assumptions, proposes a corrected architectural path, and outlines a detailed roadmap for Phases 3-6.

## 1. Challenging Assumptions

### Assumption A: "Dynamic Imports for JSON Data are Sufficient"
**Status**: ❌ **INCORRECT**
**Current State**: `DataLoader` uses `await import('./vocabulary.json')`.
**Problem**:
- **Testing**: Playwright cannot easily intercept or mock dynamic module imports in the same way it intercepts network requests. This leads to the current situation where 10/40 tests fail, and the CI pipeline is configured to ignore these failures.
- **Performance**: Large JSON files are bundled or treated as chunks. Any data change invalidates the code cache (or vice-versa depending on bundler config).
- **Flexibility**: We cannot easily switch to a remote backend or CMS later without refactoring.

**Correction**: Move to `fetch('/data/vocabulary.json')`.
- **Benefit**: Decouples data from code. Allows standard browser caching. Enables precise E2E mocking (intercepting the network request).

### Assumption B: "CI Should Tolerate Known Failures"
**Status**: ❌ **DANGEROUS**
**Current State**: CI passes even if 10 tests fail.
**Problem**: This "normalization of deviance" masks real regressions. If a new bug causes an 11th test to fail, it might be missed or dismissed.
**Correction**: Fix the architecture (see A) so 100% of tests pass. CI must be strict (Green or Red).

### Assumption C: "LocalStorage is just a temporary cache"
**Status**: ⚠️ **UNDERVALUED**
**Current State**: LocalStorage is used, but basic.
**Correction**: LocalStorage should be the *primary* persistence layer for a PWA-like experience. It needs a robust schema, versioning, and migration strategy (e.g., if we change the vocabulary ID structure, user progress shouldn't be lost).

## 2. Technical Strategy: The "Fetch & Cache" Architecture

### Core Architecture Change
Instead of bundling data:
1. **Static Data Asset**: Place `vocabulary.json` in `static/data/`.
2. **Fetch-First Loader**: `DataLoader` uses `fetch()` to retrieve this asset.
3. **Smart Caching Layer**:
   - **L1 (Memory)**: Instant access for the current session.
   - **L2 (IndexedDB/LocalStorage)**: Persistent cache to work offline.
   - **L3 (Network)**: Source of truth.
4. **Resilient Testing**: Playwright intercepts `**/vocabulary.json` network requests to inject specific test scenarios (empty data, server error, specific items) without relying on the actual file.

### E2E Testing Strategy
- **Mock Everything External**: No test should rely on the real `vocabulary.json` file content, which changes. Tests should define their own data fixtures.
- **Visual Regression**: Snapshot testing for the complex "Flashcard" component states.
- **Accessibility**: Automated Axe scans on every route transition in E2E.

## 3. Future Outlook & Roadmap

### Phase 3: Data Architecture Optimization (Immediate Priority)
*Focus: Robustness & Testability*

1.  **Refactor DataLoader**:
    -   Replace `import()` with `fetch()`.
    -   Implement `ETag` or version checking to only re-fetch if data changed.
    -   Add strict Zod validation schema for incoming JSON data to prevent runtime crashes.
2.  **Fix E2E Tests**:
    -   Update Playwright to use `page.route('**/data/vocabulary.json', ...)`
    -   Mock failure scenarios (500, 404, malformed JSON).
3.  **Schema Refinement**:
    -   Define a strict `VocabularyItem` interface with `zod`.
    -   Add `uuid` stable identifiers if not present (don't rely on array index).

### Phase 4: UI Implementation & Polish
*Focus: Engagement & Performance*

1.  **Micro-Interactions**: Use Svelte 5 snippets and transitions for satisfying feedback (correct/incorrect animations).
2.  **"Practice This" Action**: Quick entry from Search list directly into Practice mode for specific items.
3.  **Mobile-First Touch targets**: Ensure 44px+ touch targets for all interactive elements.

### Phase 5: Testing & Quality Assurance
*Focus: Confidence*

1.  **Strict CI**: Revert CI config to fail on ANY error.
2.  **Fuzz Testing**: Input random strings into the answer field to ensure no crashes.
3.  **State Management Testing**: Unit tests for `AppState` scenarios (e.g., race conditions when switching modes).

### Phase 6: CI/CD & Deployment
*Focus: Automation*

1.  **Consolidated Workflow**: Single `ci.yml` that handles PR checks and Main branch deployment.
2.  **Preview Environments**: (Optional) Deploy PR builds to a sub-path for manual QA.
3.  **Lighthouse CI**: Gate merges on Performance and Accessibility scores > 90.

## 4. Summary of Repository

The repository is a modern **Svelte 5 (Runes)** application using **Vite**. It is designed as a Static Single Page Application (SPA).

-   **State Management**: Centralized `AppState` class using Runes (`$state`, `$derived`, `$effect`).
-   **Data**: Currently static JSON, moving to fetched assets.
-   **Styling**: Tailwind CSS v4.
-   **Testing**: Hybrid approach (Vitest for logic, Playwright for browser interactions).

**Strengths**:
-   Clean Svelte 5 implementation.
-   Type-safe TypeScript.
-   Simple, maintainable structure.

**Weaknesses (to be addressed)**:
-   Data coupling (Dynamic Imports).
-   Test brittleness (Reliance on real data).
-   Lack of offline-first PWA capabilities.

## 5. Implementation Plan (Next Steps)

1.  **Refactor `DataLoader`**: Switch to `fetch`.
2.  **Update Tests**: Mock network requests.
3.  **Update CI**: Enforce strict passing.
4.  **Feature Work**: Resume roadmap features.