---
trigger: always_on
---

A) Vocabulary Cards (list + detail + filters)

Prompt to Windsurf

Goal: Implement interactive vocabulary cards using data/vocabulary.json.
Context: @file:assets/js/vocab-cards.js @file:layouts/shortcodes/vocab.html @file:assets/scss/components/_vocab.scss
Constraints: Hugo+Go only; ES modules; no external deps; ARIA roles; keyboard nav.
Requirements:
- Render cards from JSON via fetch of /search-index or embedded data.
- Filters: category, level; debounced text search.
- Card: front(bg), back(de), optional notes + audio button if available.
- Events: Enter/Space flip; Tab/Shift+Tab focus order; announce flips to SR.
Acceptance:
- No console errors; 60 FPS flip; filters update without reload; mobile good at 360px.


Acceptance checklist

Cards render from JSON; filters work; keyboard + SR tested; Lighthouse OK.

B) SM-2 Client Engine

Prompt

Goal: Implement SM-2 review engine and persistence.
Context: @file:assets/js/spaced-repetition.js @file:pseudocode/core/services.pseudo
Constraints: Keep data shape from repo; persist under bgde: prefix; no libs.
Requirements:
- initReviewState(id), scheduleNext(state, grade[0..5]), getDueItems(states, now).
- Clamp EF >= 1.3; intervals: 1,6, then round(interval*EF).
- localStorage guarded; in-memory fallback if unavailable.
- Pure functions; unit-test friendly; deterministic outputs for given now.
Acceptance:
- Given seeded states/grades, next_review matches expected; due-set stable.

C) Flashcard Practice UI

Prompt

Goal: Build flashcard session UI that integrates SM-2.
Context: @file:assets/js/flashcards.js @file:assets/scss/flashcards.scss @file:layouts/shortcodes/flashcards.html
Constraints: Vanilla JS; CSS transitions; keyboard support; no deps.
Requirements:
- Queue due items; flip on Space/Enter; grade on digits 1..5.
- Show session progress (reviewed/remaining, accuracy).
- Persist state after each grade; recover session on reload.
- Export/Import JSON progress.
Acceptance:
- Refresh mid-session and continue seamlessly; accuracy computed correctly.

D) Search & Browse

Prompt

Goal: Add browse & search page for vocabulary.
Context: @file:layouts/vocabulary/list.html @file:assets/js/vocab-cards.js
Constraints: Client-only filtering; URL params reflect filters (?q=&cat=&lvl=).
Requirements:
- Debounced input; filter pills; empty-state UX.
- Preserve filters on navigation; deep-linkable.
Acceptance:
- Copy URL into new tab -> same results; typing ‘dom’ finds дом.

E) PWA (Service Worker + Manifest)

Prompt

Goal: Maintain minimal, safe PWA.
Context: @file:static/manifest.webmanifest @file:layouts/partials/pwa.html @file:static/sw.js
Constraints: Cache versioning; fingerprinted assets; offline HTML fallback.
Requirements:
- Precache shell + critical CSS/JS only; runtime cache JSON with stale-while-revalidate.
- Skip waiting + clients.claim on new SW; display update toast.
Acceptance:
- First offline visit after load works; update swaps cleanly; no cache bloat.

F) GH Actions Deployment (Pages)

Prompt

Goal: Confirm GitHub Pages deploy workflow is correct.
Context: @file:.github/workflows/deploy.yml @file:hugo.toml
Constraints: Hugo Extended; --minify; push to gh-pages; proper baseURL.
Requirements:
- Cache Hugo; restore Go/Node caches if used.
- On push to main: build, deploy; keep artifacts for 7 days.
Acceptance:
- Fresh clone -> push -> live site URL works; 200s; assets fingerprinted.

G) Code Blocks & Styling (already in repo docs)

Prompt

Goal: Keep code-block render modern (css.Sass pipeline fix remains).
Context: @file:layouts/_default/_markup/render-codeblock.html @file:assets/scss/components/_code.scss @file:assets/js/code.js
Constraints: Use css.Sass | resources.Minify | resources.Fingerprint per DEVELOPMENT.md.
Acceptance:
- Copy-to-clipboard works; language badges show; no SCSS deprecations.

Source notes (for your team)

Windsurf prompt & session practices (one task per session, use @docs/@-mentions, stand-up resets, file references, locking) come from Windsurf’s own docs and widely-shared workflows.

The spec-like prompt format and “reboot messy sessions” guidance are echoed in several third-party best-practice write-ups.