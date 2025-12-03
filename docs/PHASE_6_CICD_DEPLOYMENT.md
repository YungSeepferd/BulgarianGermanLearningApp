# Phase 6: CI/CD & Deployment

## Overview
This phase automates the delivery pipeline, ensuring that every commit is verified and every merge to main is deployed.

## Objectives
1.  **Pipeline Reliability**: Fast, deterministic builds.
2.  **Automated Deployment**: Zero-touch deploy to GitHub Pages.
3.  **Release Management**: Automated changelogs and tagging.

## Detailed Plan

### 6.1. GitHub Actions Workflow
**Goal**: Catch bugs before they merge.

*   **Task 6.1.1**: **Staged Execution** (Completed).
    *   Stage 1: Validate (Lint, Typecheck, Unit).
    *   Stage 2: Component Tests (UI Logic).
    *   Stage 3: E2E & A11y (Critical Flows).
    *   Stage 4: Deploy (Only on Main).
*   **Task 6.1.2**: **Caching Strategy**.
    *   Cache `node_modules` and `ms-playwright` binaries to speed up runs.
    *   Use `actions/cache` with keys based on `pnpm-lock.yaml`.

### 6.2. Deployment Configuration
**Goal**: Reliable hosting on GitHub Pages.

*   **Task 6.2.1**: **Static Adapter Config**.
    *   Ensure `svelte.config.js` uses `@sveltejs/adapter-static`.
    *   Set `fallback: 'index.html'` (SPA mode) or `strict: true` (Prerender mode) depending on SEO needs.
*   **Task 6.2.2**: **Base Path Handling**.
    *   If deployed to `user.github.io/repo-name`, ensure `base` path is dynamically set in `svelte.config.js`.

### 6.3. Release Automation
**Goal**: Keep track of changes.

*   **Task 6.3.1**: **Semantic Release**.
    *   Use `semantic-release` or standard-version to analyze commits.
    *   Auto-increment version in `package.json`.
    *   Generate `CHANGELOG.md` and create GitHub Release.

## Success Metrics
*   CI Pipeline duration < 5 minutes.
*   100% Uptime on GitHub Pages (deployment success rate).
*   Every production bug can be traced to a specific git commit/release.