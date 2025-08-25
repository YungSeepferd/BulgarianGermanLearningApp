---
description: “Tandem Mode” Sprintlet — Two-Language UX improvement
auto_execution_mode: 1
---

Goal: Plan and ship a small UX increment that improves tandem Bulgarian↔German practice.

Context:
- Code: @dir:layouts/shortcodes @dir:assets/js @dir:assets/scss @dir:data
- Docs: @file:docs/PROJECT_PLAN.md @file:docs/DEVELOPMENT.md @file:docs/PROGRAMMING_LINKS.md

Constraints:
- Vanilla JS; keyboard-first; ARIA labels; mobile-first cards/lists.
- Data-driven from data/vocabulary.json + data/grammar.json.

Tasks:
1) Plan: write a 10-line one-pager in docs/tandem/SPRINT.md (problem, hypothesis, acceptance).
2) Implement: a micro-feature (e.g., quick-switch BG↔DE side, spaced-repetition indicator, or per-category mini-session).
3) Test: `hugo server -D`, keyboard nav, 360px viewport; ensure state persists to localStorage (`bgde:` prefix).
4) Evaluate: add usage notes + next step ideas to SPRINT.md.

Deliverables:
- Code diffs and SPRINT.md with outcome + next steps.
