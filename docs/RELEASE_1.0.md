# Release 1.0 Guide

This document summarizes the stable, deployable v1.0 of the Bulgarian-German Learning App, focusing exclusively on tested and verified core functionalities.

## Core Scope (Verified)
- Dashboard: progress overview, quick actions
- Vocabulary: search, filter, practice
- Lessons: generation based on validated data
- Accessibility: WCAG 2.1 AA (keyboard + screen reader)
- Offline support, responsive UI

## Environment & Setup
```bash
# Prerequisites
node -v   # 20+
pnpm -v   # ensure pnpm is installed

# Install & run
git clone https://github.com/YungSeepferd/BulgarianApp-Fresh.git
cd BulgarianApp-Fresh
pnpm install
pnpm run dev
```

## Local CI Checks
```bash
pnpm run check
pnpm run lint
pnpm run test:unit
pnpm run test:components
pnpm run test:e2e
pnpm run test:accessibility
pnpm run simulate-ci
```

## Build & Deploy
```bash
pnpm run build
pnpm run preview
```
- Output: `build/`
- Deploy target: GitHub Pages (static)

## Troubleshooting
- Dev server hangs: ensure no other `pnpm dev` running; `pkill -f "pnpm dev"`
- Vocabulary not loading: check `build/data/unified-vocabulary.json` exists
- Browser-only errors during SSR: guard with `if (browser) { ... }`
- Accessibility announcements missing: ensure `aria-live` regions are visible
- TypeScript errors: run `pnpm run check` and fix strict mode issues

## Out of Scope (until validated)
- Quiz system
- Gamification (XP, levels, streaks)
- Social features / leaderboards
- Accounts / cloud sync
- Advanced analytics

## Verification
All interactive elements (buttons, links, forms) are covered by Playwright component/E2E tests. Run `pnpm run simulate-ci` before pushing to confirm no regressions.
