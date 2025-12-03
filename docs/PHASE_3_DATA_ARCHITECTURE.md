# Phase 3: Data Architecture Optimization

## Overview
This phase focuses on enhancing the robustness, type safety, and scalability of the application's data layer. We will transition from a simple JSON load to a strictly validated, versioned, and resilient data service.

## Objectives
1.  **Schema Enforcement**: Guarantee that all data matches the TypeScript `VocabularyItem` interface at build time.
2.  **Smart Loading**: Optimize data fetching with versioned caching and potential chunking.
3.  **Resilient Persistence**: Abstract `localStorage` interactions to handle errors, quota limits, and migrations.

## Detailed Plan

### 3.1. Schema Refinement & Validation Script
**Goal**: Prevent broken data from reaching production.

*   **Task 3.1.1**: Audit `src/lib/schemas/vocabulary.ts` to ensure it covers all edge cases (optional fields, legacy data formats).
*   **Task 3.1.2**: Create a build script `scripts/validate-data.ts` that:
    *   Reads `static/data/vocabulary.json`.
    *   Parses it with `zod`.
    *   Fails the build if validation fails.
    *   (Optional) Generates a "minified" version for production.
*   **Task 3.1.3**: Add this script to `package.json`'s `build` command (pre-build step).

### 3.2. Data Optimization
**Goal**: Reduce initial load time and bandwidth.

*   **Task 3.2.1**: Analyze current JSON size. If > 500KB (gzipped), split into:
    *   `vocabulary-core.json` (A1 level, top 100 words).
    *   `vocabulary-full.json` (The rest).
*   **Task 3.2.2**: Update `DataLoader` to fetch "Core" first, then lazy-load "Full" in the background.

### 3.3. Smart Loading & Caching
**Goal**: "Stale-while-revalidate" behavior for instant load.

*   **Task 3.3.1**: Implement Versioning.
    *   Add a `version` field to the JSON metadata.
    *   `DataLoader` checks `localStorage` version vs. fetched version.
    *   If `localVersion < remoteVersion`, update cache.
*   **Task 3.3.2**: Error Recovery.
    *   If `fetch` fails, strictly serve from cache.
    *   If cache is corrupt, wipe and retry fetch.

### 3.4. LocalStorage Persistence Layer
**Goal**: Robust user progress tracking.

*   **Task 3.4.1**: Create `src/lib/services/persistence.ts`.
    *   Methods: `saveProgress()`, `loadProgress()`, `exportData()`, `importData()`.
    *   Error handling: Wrap all `localStorage` calls in try-catch.
*   **Task 3.4.2**: Data Migration Strategy.
    *   If we change the `UserProgress` schema, the service must detect old data and migrate it on load.

## Success Metrics
*   Build fails if `vocabulary.json` has a single typo.
*   App loads instantly (from cache) on 2nd visit.
*   User progress is never lost due to JSON parse errors.