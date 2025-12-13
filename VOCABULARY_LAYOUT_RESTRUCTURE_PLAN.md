# Vocabulary Page Layout Restructure — Implementation Plan
**Goal**: Fully overhaul the vocabulary page layout to improve clarity, accessibility, and tandem-learning workflows while aligning with the expanded design tokens. This plan is implementation-focused (what to change, where, and in what order) and assumes the newly added tokens in `src/lib/styles/tokens.css`.

**Target Routes/Files**
- Primary: `src/routes/vocabulary/+page.svelte`
- Supporting components: `src/lib/components/ui/VocabularyCard.svelte`, `src/lib/components/ui/ActionButton.svelte` (only if needed for spacing), optional new partials under `src/lib/components/vocabulary/` (e.g., filters/header/summary)
- Styles: reuse tokens from `src/lib/styles/tokens.css`

---
## Phase 0 — Readiness & Guardrails
- Keep filters **always visible on desktop** (no burger menu). On tablet/mobile, stack filters above content without hiding them.
- Maintain functional parity: search, category/difficulty/POS filters, load more, selection, practice.
- Preserve bilingual direction toggle; make it more prominent.
- Avoid regressions to accessibility (keyboard focus, ARIA labels) and pagination logic.

---
## Phase 1 — Layout Skeleton (Low-Risk Refactor)
1) **Grid Container**
   - Replace existing `.vocabulary-container` structure with a two-column CSS grid using tokens:
     - `grid-template-columns: var(--filter-panel-width) 1fr` on desktop.
     - Collapse to single column on tablet/mobile using `--breakpoint-tablet`.
     - Apply `max-width: var(--container-max-width)` and center via margin auto.

2) **Persistent Filter Panel**
   - Use `position: sticky; top: var(--space-6);` to keep filters visible while scrolling.
   - Apply new filter tokens: `--filter-panel-padding`, `--color-filter-bg`, `--shadow-filter-panel`.
   - Ensure filter groups use `--filter-group-spacing` for vertical rhythm.

3) **Main Content Area**
   - Add a header block with:
     - Eyebrow: language-aware label (Wortschatz / Речник)
     - Title & subtitle using typography tokens.
     - Direction toggle button (prominent, gradient optional later).
     - Results summary (count + selection summary placeholder).

4) **Active Filter Pills** (non-functional placeholder ready for Phase 2 wiring)
   - Add a container below the header to show active filters with remove buttons.
   - Use new badge/transition tokens for hover/focus.

Deliverable: Structural CSS + HTML in `+page.svelte` with existing logic intact.

---
## Phase 2 — Filter UX & Responsiveness
1) **Filter Controls**
   - Redesign filter controls to align with tokens: consistent paddings, focus rings, hover states.
   - Difficulty buttons: use CEFR colors (`--color-cefr-*`) for active states.
   - Dropdowns: apply `--color-focus-ring` and `--color-card-border`.

2) **Responsive Behavior**
   - Tablet/mobile: stack filters above content; maintain visibility (no hidden menus).
   - Add `gap: var(--vocabulary-grid-gap)` on containers for breathing room.

3) **Result Summary Bar**
   - Insert summary bar (shows items count and selected count) using `--color-filter-bg` and `--shadow-sm`.

Deliverable: Fully styled filter panel and summary bar, responsive and accessible.

---
## Phase 3 — Card Grid & Interaction Polish
1) **Grid Tuning**
   - Use `grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));`
   - Apply `--vocabulary-grid-gap` and `--vocabulary-card-padding`.

2) **Card States (minimal wiring)**
   - Map tokens to existing card styles: `--color-card-*`, `--shadow-card*`, `--transition-card-hover`, CEFR badges.
   - Ensure selection state uses `--color-card-selected` and `--color-filter-active` for borders.

3) **Hover/Focus/Keyboard**
   - Add focus ring using `--color-focus-ring` and `--color-focus-ring-offset`.
   - Keep hover animations subtle with `--transition-card-hover`.

Deliverable: Grid and cards visually aligned with new tokens; no logic changes.

---
## Phase 4 — Tandem & Direction UX (Optional but Recommended)
1) **Direction Toggle**
   - Promote to header button; consider gradient between `--color-german-primary` and `--color-bulgarian-primary`.
   - Announce changes via aria-live region if feasible.

2) **Selection Actions**
   - Add floating partner actions panel (share/export) gated behind selection count.

3) **Active Filter Pills Wiring**
   - Connect pills to existing filter state to clear individual filters.

Deliverable: Collaboration-friendly UX with clear direction controls.

---
## Phase 5 — Accessibility & QA
- Keyboard navigation for filters, pills, cards, load-more.
- Screen reader labels for filter controls, cards, toggles.
- Color contrast audit with new palette.
- Responsive snapshots (mobile/tablet/desktop) for layout verification.

---
## Phase 6 — Performance Safeguards (If Needed)
- Consider virtualized list if we exceed ~1k items.
- Ensure load-more keeps scroll position stable.
- Defer example expansions until clicked.

---
## Work Sequencing & Branch Strategy
1) Branch: `feature/vocab-layout-phase1`
2) Implement Phase 1 + baseline styles; PR.
3) Phase 2 on `feature/vocab-filters-phase2`; PR.
4) Phase 3 on `feature/vocab-cards-phase3`; PR.
5) Optional Phase 4 on `feature/vocab-tandem-phase4`; PR.
6) Phase 5 accessibility fixes merged last.

Each phase should:
- Include before/after screenshots (desktop/tablet/mobile).
- Run `pnpm run check` and relevant Playwright smoke (vocabulary page) when available.
- Keep filter functionality intact after each PR.

---
## Quick Checklist per Phase
- [ ] Layout grid updated
- [ ] Filter panel sticky on desktop, stacked on mobile
- [ ] Active filter pills present
- [ ] Direction toggle prominent
- [ ] Summary bar present
- [ ] Grid/cards using new tokens
- [ ] Focus/hover states tokenized
- [ ] Accessibility check run
- [ ] Load-more unchanged functionally

---
## Minimal Code Touch Points (by file)
- `src/routes/vocabulary/+page.svelte`
  - Restructure outer grid, header, filter panel, summary bar, active pills placeholders.
  - Apply new CSS using tokens; keep script logic intact.
- `src/lib/components/ui/VocabularyCard.svelte`
  - Map state classes to new tokens (colors/shadows/spacing/focus) without logic changes.
- (Optional) `src/lib/components/vocabulary/` new partials
  - `FilterPanel.svelte`, `ActiveFilters.svelte`, `ResultsSummary.svelte` to declutter `+page.svelte` if desired later.

---
## Risks & Mitigations
- **Risk**: Layout shift on mobile if sidebar assumptions break → Mitigation: test with 320px width early.
- **Risk**: Focus outline clashes with card border → Mitigation: use `outline-offset: var(--color-focus-ring-offset)`.
- **Risk**: Sticky sidebar overlapping header → Mitigation: set top offset with tokenized spacing.
- **Risk**: Token mismatches with existing Tailwind utilities → Mitigation: prefer custom CSS blocks for layout, leave Tailwind utilities for text where stable.

---
## Ready-to-Implement Next
- Start Phase 1: Adjust `+page.svelte` layout grid and filter panel scaffolding using new tokens (no logic changes).
- Add active filter pills placeholder and summary bar markup.
- Style header/direction toggle containers; keep existing buttons for now.
