# Localization Audit

## Current Flow
- Language mode lives in `appState.languageMode` (`DE_BG` / `BG_DE`) and persists to localStorage.
- `LocalizationService` maps language mode to `de`/`bg`, loads `/translations/{lang}.json`, and notifies listeners via `onTranslationsChange`.
- Components call `t()` and update when translations reload; `/practice` also exposes `TandemToggle` to flip direction.

## Findings
- Translation files (`de.json`, `bg.json`) are complete; loading logic is sound.
- Toggle lived only on `/practice`, so other routes lacked a quick language control.
- During translation loading, `t()` returned empty strings, producing blank labels in shared UI.

## Fixes Made
- Added a global language toggle and status inside the main navigation so the direction is visible and changeable on any route.
- Added loading-friendly fallbacks for navigation labels to avoid empty text while translations load.

## Recommended Manual Checks
- Navigate to `/practice`, toggle direction, and confirm UI text swaps between German and Bulgarian.
- Move across `/`, `/vocabulary`, `/grammar`, `/learn`, `/practice` ensuring translations and data load each time and persist after refresh.
- Start on a non-root route, refresh, and confirm labels render (no blanks) while translations finish loading.

## Next Improvements
- Consider a lightweight inline loader for other translation-heavy components.
- Add an automated Playwright path that navigates to `/practice` and flips the toggle to guard regressions.
