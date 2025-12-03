# Phase 5: Testing & Quality Assurance

## Overview
This phase restructures the testing strategy to align with the "Pyramid of Testing," moving complex logic verification to faster, more reliable unit/component tests and reserving E2E for critical flows.

## Objectives
1.  **Unit Test Expansion**: Cover 100% of State and Data logic.
2.  **Component Testing**: Verify UI logic in isolation.
3.  **Accessibility Automation**: Catch a11y regressions in CI.

## Detailed Plan

### 5.1. Unit Testing Strategy (Vitest)
**Goal**: Verify logic without a browser.

*   **Task 5.1.1**: **Mocking Infrastructure**.
    *   Create `tests/mocks/localStorage.ts` and `tests/mocks/fetch.ts`.
    *   Setup `vitest.setup.ts` to reset these mocks between tests.
*   **Task 5.1.2**: **State Logic Tests**.
    *   Test `AppState` transitions: "Does `toggleFavorite` actually update the list?".
    *   Test `DataLoader` error handling: "Does it return cached data if fetch fails?".
*   **Task 5.1.3**: **Schema Tests**.
    *   Verify that `zod` schemas correctly reject invalid data and accept valid data.

### 5.2. Component Testing (Playwright CT)
**Goal**: Verify UI logic in isolation.

*   **Task 5.2.1**: **Interaction Tests**.
    *   Test `<TandemPractice />`: "Does clicking 'Check' show feedback?".
    *   Test `<SearchList />`: "Does typing filter the list?".
*   **Task 5.2.2**: **Visual Stability**.
    *   Use `mount` to render components with fixed props (no random data).
    *   Ensure no layout shifts occur during state changes.

### 5.3. E2E Stabilization (Playwright)
**Goal**: Verify critical user flows.

*   **Task 5.3.1**: **Network Mocking**.
    *   Refactor `tests/e2e/*.test.ts` to use `page.route` exclusively for data.
    *   **NEVER** allow tests to hit the real `vocabulary.json` (it makes tests dependent on content).
*   **Task 5.3.2**: **State Injection**.
    *   Use `page.addInitScript` to pre-seed `localStorage` with user progress.
    *   Example: Test "Review Favorites" by injecting 5 favorites, not by clicking "Heart" 5 times.
*   **Task 5.3.3**: **A11y Checks**.
    *   Integrate `axe-playwright` into every E2E test suite `afterEach` hook to scan the page.

## Success Metrics
*   Unit Test Coverage > 90%.
*   E2E Flakiness < 1% (no random failures on CI).
*   Zero "WCAG 2.1 AA" violations.