---
trigger: always_on
---

Hard constraints (must-follow)

Tech: Hugo Extended (SCSS via Hugo Pipes), Go tools, vanilla JS modules only. No frameworks, no new build tools.

Data: Primary sources are data/vocabulary.json and data/grammar.json.

Structure:

assets/js/ (ES modules), assets/scss/ (SCSS), layouts/ (templates/partials/shortcodes), content/ (Markdown), static/ (audio/images), tools/ (Go CLI & internal pkgs).

PWA: Keep service worker + manifest minimal and cache-safe.

Accessibility: Keyboard support for flashcards; ARIA on interactive controls.

Performance: Use Hugo Pipes for minify + fingerprint; prefer lazy rendering; avoid large inline scripts.
(See repo docs: pseudocode/IMPLEMENTATION_GUIDE.md, docs/DEVELOPMENT.md.)

SM-2 algorithm rules (consistency with repo pseudocode)

Keep state shape: {item_id, interval, ease_factor, repetitions, next_review, last_review}.

Recompute ease_factor per SM-2; clamp to ≥ 1.3; update interval (1, 6, then EF-scaled).

Persist under localStorage prefix bgde:; write idempotent reads/writes; handle no-storage fallback (in-memory).

Provide deterministic helpers: initReviewState(id), scheduleNext(state, grade), getDueItems(states, now).

Frontend interaction rules

Flashcards (assets/js/flashcards.js):

Flip animations via CSS; space/enter to flip, 1-5 to grade; show progress and session stats.

No external libs; keep module size small; no global pollution.

Filtering/Search: Client-side filter by category, level; debounced text search.

Import/Export: JSON files (download/upload) for progress; validate schema.

Hugo template rules

Shortcodes for vocabulary/flashcards; keep templates pure—push logic to JS.

SCSS entry assets/scss/main.scss compiled via css.Sass | resources.Minify | resources.Fingerprint. (Matches DEVELOPMENT.md fix.)

Testing & acceptance

Local: hugo server -D --logLevel=debug starts clean; no console errors.

Lighthouse: Good scores for Perf/Accessibility/Best Practices/SEO.

PWA: Offline works, install prompt present, no cache-poison.

Visual: Mobile-first layouts remain usable under 360px width.

PR discipline

Each PR = one scope. Include what changed / why / acceptance checklist.

Include before/after screenshots or short GIF for UI changes.

No unrelated file churn; keep diffs minimal.