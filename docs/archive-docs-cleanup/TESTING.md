# Testing Guide - Bulgarian-German Learning App

## Overview

This document provides comprehensive testing guidelines for the Bulgarian-German Learning App, including setup, execution, and best practices.

## Testing Strategy

Focus on lightweight, repeatable checks aligned with the Hugo + vanilla JS stack. Prioritize smoke tests during development and broaden coverage before release milestones.

### Local Smoke Tests

- **Hugo server** – `hugo server -D --logLevel=debug` must start without warnings or template errors.
- **Production build** – `npm run build` (wraps `hugo --gc --minify`) should succeed before merging.
- **Linting/formatting** – Run `npm run lint` or equivalent when available; otherwise spot-check modified files.

### JavaScript & Data Validation

- **Syntax check** – `node --experimental-warnings --check assets/js/flashcards.js` (repeat for other modules as touched).
- **ES module syntax** – `npm run lint:esm` runs the offline parser to ensure browser modules parse cleanly.
- **Data schema check** – `npm run lint:data` validates `data/vocabulary.json` and `data/grammar.json` against rules in `docs/API.md`.
- **SM-2 helpers** – Add or update unit tests under `assets/js/` where feasible; use Jest-style assertions via `npm test` when configured.
- **Data regeneration** – After editing `data/*.json`, run `npm run process-data` and verify output diffs.

### PWA & Offline Checks

- **Service worker** – With the dev server running, load the app in Chrome, open DevTools > Application, and confirm `static/sw.js` registers without errors.
- **Offline shell** – In DevTools, tick "Offline" and refresh; verify key pages render using cached assets.
- **Update flow** – After touching assets, run `npm run build`, reload the site, and ensure the update toast appears when the service worker activates.

### Accessibility & UX Manual Tests

- **Keyboard navigation** – Ensure flashcards flip on Space/Enter and that grading via digits 1–5 works in `assets/js/flashcards.js` flows.
- **Screen reader hints** – Validate ARIA announcements using VoiceOver or NVDA during flips and grading.
- **Responsive layout** – Resize or use device emulation at 360 px width to confirm layout integrity.
- **Speech practice** – In a browser that supports the Web Speech API (e.g., Chrome desktop with microphone access):
  1. Visit `/test-flashcards/` and ensure the microphone button is enabled.
  2. Trigger “Practice Pronunciation”, speak the prompted term, and confirm the feedback banner acknowledges the attempt.
  3. Verify successful matches auto-grade the card (grade 5) and unsuccessful attempts surface a retry hint without breaking keyboard flows.

### Optional Automated Coverage

- **Playwright smoke suite** – Use scripts in `tests/playwright/` (if present) to cover navigation, grading, and filter interactions.
- **Go helper tests** – When modules are added inside `tools/`, run `go test ./...` from that directory.

## Debugging Checklist

- **Console monitoring** – Keep DevTools open for JS errors and service-worker warnings.
- **Local storage** – Inspect keys under the `bgde:` prefix to verify spaced-repetition persistence.
- **Network throttling** – Test under "Slow 3G" to expose performance bottlenecks or missing lazy loading.

## Release Readiness

- **Acceptance walkthrough** – Execute the acceptance criteria from `docs/notes/TODAY.md` or the relevant task checklist.
- **Lighthouse audit** – Run Lighthouse (Desktop + Mobile) targeting Performance, Accessibility, Best Practices, and SEO.
- **Regression log** – Record test results and outstanding issues in `docs/notes/TODAY.md` before sign-off.

### Playwright E2E Tests

Use the Playwright smoke suite for basic navigation and vocabulary interactions.

- Location: `tests/playwright/`
- Config: `playwright.config.js`

Setup (first time only):

```bash
npm install
npx playwright install
```

Run tests:

```bash
npm test            # headless
npm run test:ui     # interactive UI mode
npm run test:debug  # with debugger
```

Notes:

- The config auto-starts `npm run dev` and targets `http://localhost:1313`.
- Tests assert that vocabulary cards render via inline JSON or network fetch.
- Extend with an offline test by toggling the browser context offline to verify inline data load.
