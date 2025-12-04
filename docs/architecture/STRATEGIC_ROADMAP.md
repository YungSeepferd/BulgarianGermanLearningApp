# Strategic Architecture & Repository Outlook

## 1. Executive Summary
The Bulgarian-German Learning App is a modern, client-side-first progressive web application (PWA) built with SvelteKit. It leverages local persistence and static data generation to provide a fast, offline-capable learning experience. The current architecture uses a singleton `DataLoader` pattern with Zod-validated schemas, ensuring data integrity despite the static nature of the content.

### Future Outlook
The repository is transitioning from a prototype/MVP phase into a robust, production-ready educational platform. The future direction involves:
*   **Decoupled Data Layer**: Moving from monolithic JSON files to a chunked or database-backed source for scalability.
*   **Hybrid Testing Strategy**: Shifting away from fragile E2E tests for state logic towards Component Integration Tests (CT).
*   **Automated Quality Gates**: Strict CI/CD pipelines ensuring accessibility, type safety, and visual consistency.
*   **User-Centric Features**: "Smart" practice algorithms based on spaced repetition (SRS), persisted via robust local storage sync.

---

## 2. CI/CD & Testing Strategy (The "Playwright Problem")

**The Challenge:**
You identified issues with Playwright E2E tests failing on "objects or things that are not optimal for it." This typically occurs when E2E tests are used to verify internal state or complex logic that is hidden from the DOM, or when network dependencies (like fetching `vocabulary.json`) are flaky or not properly intercepted in SSR contexts.

**The Solution: Testing Pyramid Re-alignment**

### A. The "Object" Problem
Instead of using Playwright E2E to test data loading logic or state mutations (which requires waiting for UI side-effects), we will:
1.  **Isolate Logic**: Test `DataLoader` and `AppState` logic purely with **Vitest Unit Tests**. We mock `fetch` and `localStorage` directly.
2.  **Component Testing (CT)**: Use `playwright-ct-svelte` to test components like `<TandemPractice />` in isolation. This allows us to pass mock props and intercept internal events without spinning up the full app.
3.  **State Hydration**: For E2E tests that *must* check a user flow (e.g., "Review Favorites"), we will **not** click through the UI to create favorites. Instead, we inject the state directly:
    ```typescript
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('tandem_stats_cache', JSON.stringify(mockStats));
        });
    });
    ```

### B. CI/CD Pipeline Configuration
We will implement a resilient pipeline in `.github/workflows/ci.yml`:

1.  **Build & Lint (Fast Feedback)**:
    *   Lint, Prettier, Typecheck.
    *   Unit Tests (Vitest) - Covers `DataLoader`, `AppState`.
2.  **Component Tests (Visual & Functional)**:
    *   `playwright-ct` runs here. Checks animations (frozen), interactions, and accessibility of isolated components.
3.  **E2E Tests (Critical Paths Only)**:
    *   Production Build Preview (`vite preview`).
    *   Smoke tests: "Can a user load the page?", "Can they complete one practice item?".
    *   **Network Mocking**: STRICT network mocking for data. The test should never hit the real `vocabulary.json`.
    ```typescript
    await page.route('**/data/vocabulary.json', route => route.fulfill({ json: mockData }));
    ```

---

## 3. Phase 3: Data Architecture Optimization

**Goal**: scalable, type-safe data management.

1.  **Schema Refinement**:
    *   **Strict Typing**: Enforce `VocabularyItem` interface across the entire app.
    *   **Migration Script**: Create a script to validate `vocabulary.json` against the Zod schema and output a "clean" version during build time. This ensures no broken data ever reaches production.

2.  **Smart Loading**:
    *   **Stale-While-Revalidate**: The `DataLoader` already implements this logic. We will enhance it to support **Versioned Caching**. If the app updates, the cache key changes, forcing a fresh fetch.
    *   **Pagination/Chunking**: If vocabulary exceeds 1MB, split into `vocabulary-a1.json`, `vocabulary-verbs.json`, etc.

3.  **Persistence Layer**:
    *   Encapsulate `localStorage` interaction into a `PersistenceService`.
    *   Add **Error Recovery**: If `localStorage` is corrupted (JSON parse error), automatically wipe and reset to a safe default state without crashing the app.

---

## 4. Phase 4: UI Implementation & Polish

**Goal**: A seamless, native-app-like feel.

1.  **Enhanced Practice Mode**:
    *   **Animation Hygiene**: Use `prefers-reduced-motion` media query to disable animations automatically for users (and CI) who request it.
    *   **Micro-interactions**: Add haptic feedback (using `navigator.vibrate`) for mobile users on correct/incorrect answers.

2.  **"Practice This" Action**:
    *   Implement a "Quick Start" intent. From the Search page, clicking an item immediately transitions to Practice Mode with *only* that item (or similar items) in the queue.
    *   **Route State**: Use URL parameters (`/practice?item=zdravej_001`) so deep links work.

3.  **Mobile Experience**:
    *   **Touch Targets**: Ensure all buttons are min 44x44px.
    *   **Virtual Keyboard Handling**: Prevent layout shifts when the keyboard opens on mobile (using `interactive-widget=resizes-content` in viewport meta tag).

---

## 5. Phase 5: Testing & Quality Assurance

**Goal**: Confidence in every deploy.

1.  **Unit Testing State**:
    *   Write tests for `app.svelte.ts` covering edge cases: "What if stats are malformed?", "What if `localStorage` is full?".

2.  **Accessibility (A11y)**:
    *   Integrate `axe-playwright` into the E2E suite.
    *   Fail the build if critical A11y violations (contrast, missing labels) are found.

3.  **Visual Regression**:
    *   Use Playwright's snapshot testing for critical components (e.g., the Practice Card layout) to catch CSS regressions.

---

## 6. Phase 6: CI/CD & Deployment

**Goal**: Click-button deployment.

1.  **GitHub Actions**:
    *   **Preview Deployments**: (Optional) Deploy PRs to a temporary URL (e.g., using Netlify/Vercel or GitHub Pages environments) for manual review.
    *   **Release Tagging**: Auto-generate release notes based on commit messages when merging to main.

2.  **GitHub Pages**:
    *   Configure `base` path correctly in `svelte.config.js`.
    *   Use `adapter-static` with fallback to `index.html` (SPA mode) if we don't need distinct per-page SEO, or generate all routes if we do.

---

## Challenge to Assumptions

1.  **"We need a backend for user progress."**
    *   *Challenge*: No. For a language learning app, `localStorage` is sufficient for MVP. Users rarely switch devices for casual practice. We can offer a "Export/Import Data" JSON feature instead of a full auth system, keeping costs at $0.

2.  **"E2E tests should test everything."**
    *   *Challenge*: Incorrect. E2E tests are expensive and flaky. 80% of testing should happen at the Unit/Component level. E2E is only for "Does the app launch and navigate?".

3.  **"Dynamic Imports were better than Fetch."**
    *   *Challenge*: Dynamic imports couple the data to the bundler. Using `fetch` decouples the data, allowing it to be hosted anywhere (CDN, CMS) later without changing the code. It also makes testing easier (mocking fetch vs mocking Vite internals).
