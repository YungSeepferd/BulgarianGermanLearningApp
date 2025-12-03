# Phase 4: UI Implementation & Polish

## Overview
This phase elevates the user experience from "functional" to "delightful" and "native-like". Focus is on mobile usability, micro-interactions, and seamless navigation flows.

## Objectives
1.  **Enhanced Practice Mode**: Reduce friction and add visual feedback.
2.  **"Practice This" Action**: Enable deep linking to specific practice items.
3.  **Mobile Polish**: Ensure the app feels like a native mobile app.

## Detailed Plan

### 4.1. Enhanced Practice Mode
**Goal**: Make practice sessions engaging and smooth.

*   **Task 4.1.1**: **Reduced Motion Support**.
    *   Wrap all transitions (fly, fade) in a helper function that checks `matchMedia('(prefers-reduced-motion: reduce)')`.
    *   Disable animations entirely in `ci-mode` (already started, but needs standardizing).
*   **Task 4.1.2**: **Haptic Feedback**.
    *   Use `navigator.vibrate(50)` on correct answers and `vibrate(200)` on incorrect ones (mobile only).
*   **Task 4.1.3**: **Stats Visualization**.
    *   Add a mini-chart (SVG) showing the last 7 days of activity on the dashboard.

### 4.2. "Practice This" Quick Action
**Goal**: Seamless transition from Search to Practice.

*   **Task 4.2.1**: **Route State Management**.
    *   Update `src/routes/practice/+page.svelte` to read URL search params: `/practice?itemId=xyz`.
    *   If `itemId` is present, `DataLoader` fetches that specific item immediately and `AppState` enters "Single Item Practice" mode.
*   **Task 4.2.2**: **Contextual Buttons**.
    *   In `SearchList.svelte`, clicking "Practice" should navigate to `/practice?itemId=...` instead of setting global state and hoping the router keeps up. This decouples the components.

### 4.3. Mobile & Responsive Design
**Goal**: Pass the "Thumb Zone" test.

*   **Task 4.3.1**: **Touch Targets**.
    *   Audit all buttons. Ensure `min-height: 44px` and `min-width: 44px` with sufficient padding.
*   **Task 4.3.2**: **Virtual Keyboard Handling**.
    *   Add `<meta name="viewport" content="... interactive-widget=resizes-content">` to `app.html`.
    *   Ensure the "Check Answer" button isn't hidden behind the keyboard on small screens (use `position: sticky` or layout adjustments).
*   **Task 4.3.3**: **PWA Manifest**.
    *   Ensure `manifest.json` is correctly configured for "standalone" display to remove browser chrome.

## Success Metrics
*   Lighthouse Accessibility score > 95.
*   No layout shifts when opening keyboard on mobile.
*   Deep links to specific words work reliably.