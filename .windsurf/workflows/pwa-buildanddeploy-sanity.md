---
description: PWA + Build/Deploy Sanity
auto_execution_mode: 1
---

Goal: Validate production build, PWA cache behavior, and Pages deployment fitness.

Context:
- Build: @file:hugo.toml @dir:assets @dir:layouts @file:.github/workflows/deploy.yml
- PWA: @file:static/manifest.webmanifest @file:static/sw.js @file:layouts/partials/pwa.html
- Docs: @file:docs/PROGRAMMING_LINKS.md

Constraints:
- Use Hugo Pipes for SCSS/JS minify+fingerprint; no un-fingerprinted assets in templates.
- Keep service worker minimal: app shell + critical assets; stale-while-revalidate for JSON.

Tasks:
1) Production build: `hugo --minify` (inspect `public/` for fingerprinted assets).
2) PWA check: first load online, then offline; confirm fallback works and SW updates with a new build.
3) Pages readiness: verify `baseURL`, workflow steps, and that Pages source is GitHub Actions.
4) Record: add docs/release-checklist.md (or update it) with pass/fail items and any fixes.

Deliverables:
- Build log, short notes in release-checklist.md, and any minimal code fixes.
