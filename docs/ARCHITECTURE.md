# Bulgarian–German Learning App – Architecture

## Overview

The app is a Hugo Extended site that delivers vocabulary study tools, flashcard practice, and spaced-repetition scheduling in the browser. Hugo renders static pages and shortcodes, while vanilla ES modules provide interactive behavior such as flashcards and SM-2 scheduling.

## System Diagram

```mermaid
graph TD
    subgraph Hugo Build
        A[content/*] -->|Markdown| B[layouts/*]
        C[data/vocabulary.json] --> B
        C --> D[Shortcodes<br/>flashcards.html / vocab.html]
        E[assets/scss/*] --> F[Hugo Pipes<br/>(Sass, Minify, Fingerprint)]
        G[assets/js/*] --> H[Hugo JS Pipeline]
    end

    subgraph Browser Runtime
        I[unified-practice-session.js] --> J[unified-spaced-repetition.js]
        I --> K[language-toggle.js]
        I --> L[speech-recognition.js]
        I --> M[localStorage<br/>bgde:*]
        N[vocab-cards.js] --> K
        O[Service Worker] --> P[Cache Storage]
        Q[Playwright Tests] --> R[UI & Accessibility]
    end

    H --> I
    H --> N
    F --> Browser Runtime
    D --> Browser Runtime
```

## Component Model

- **Hugo layer** renders HTML skeletons and embeds JSON data for offline-first behaviour. Shortcodes such as `flashcards.html` output ARIA-friendly markup and inline vocabulary payloads.
- **Client modules** manage interaction:
  - **Core Modules (v2.0 - October 2025)**:
    - `unified-spaced-repetition.js` (schema v2) handles SM-2 scheduling with automatic migration from legacy `bgde:review:<id>` to enhanced `bgde:review_<id>_<direction>` format. Supports bidirectional difficulty multipliers (BG→DE: 1.1x, DE→BG: 1.2x).
    - `unified-practice-session.js` drives practice sessions with direction-aware notes, keyboard shortcuts, session history, and SM-2 integration.
    - `speech-recognition.js` wraps the Web Speech API for pronunciation feedback.
    - `language-toggle.js` synchronizes study direction (DE→BG / BG→DE) via custom events and localStorage.
    - `vocab-cards.js` powers listing pages with filtering and search.
  - **Legacy Modules (archived)**:
    - Legacy `flashcards.js` and `spaced-repetition.js` have been consolidated into the unified modules above for better maintainability and performance.
- **State management** is browser-local and deterministic:
  - **Session state** (current card, accuracy, attempts) lives in-memory within practice session modules.
  - **Spaced-repetition progress** (SM-2 v2 schema):
    - Modern format: `bgde:review_<id>_<direction>` with camelCase fields, timestamps
    - Legacy format: `bgde:review:<id>` (auto-migrated on first load)
    - Schema version 2 includes: `itemId`, `direction`, `easeFactor`, `interval`, `repetitions`, `nextReview`, `lastReview`, `totalReviews`, `correctAnswers`, `correctStreak`
  - **User preferences**: Theme, language direction (`bgde:language-direction`), audio settings, PWA hints stored in localStorage.
  - **Session history**: Last 50 sessions in `bgde:session_history` for progress tracking.
- **PWA/service worker** under `static/sw.js` caches fingerprints and surfaced pages; updates rely on cache-version bumps documented in `docs/DEVELOPMENT.md`.

## High-Level Layout

```text
┌───────────────────────────────────────────────────────────┐
│                           Browser                         │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                     Hugo Pages                      │  │
│  │  ┌─────────────┐  ┌──────────────────────────────┐ │  │
│  │  │  Templates  │  │  Embedded Data (JSON)        │ │  │
│  │  └──────┬──────┘  └──────────────┬───────────────┘ │  │
│  │         │                        │                 │  │
│  │  ┌──────▼────────────────────────▼───────────────┐ │  │
│  │  │      Client Scripts (ES Modules)              │ │  │
│  │  │  flashcards.js, spaced-repetition.js, etc.    │ │  │
│  │  └───────────────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

- Hugo generates HTML from `layouts/` and injects vocabulary data from `data/` into shortcodes such as `flashcards.html`.
- Client-side modules under `assets/js/` handle interactions: loading embedded data, flipping cards, applying SM-2 scheduling, persisting progress to `localStorage`.
- SCSS in `assets/scss/` is compiled and fingerprinted through Hugo Pipes, ensuring cache-busting for the PWA.

## Directory Map

```text
├── assets/
│   ├── js/                # ES modules (unified modules, UI helpers)
│   │   ├── modules/       # Specialized modules (API client, search, etc.)
│   │   └── unified-*.js   # Core unified modules (v2.0)
│   └── scss/              # SCSS partials compiled via Hugo Pipes
├── content/               # Hugo content pages (practice, vocabulary articles)
├── data/                  # JSON sources (vocabulary, grammar) - cleaned up
│   ├── vocabulary.json    # Main vocabulary database (single source)
│   ├── cultural-grammar.json # Grammar rules and cultural notes
│   └── archive-data-cleanup/ # Legacy batch files (archived)
├── docs/                  # Project documentation - streamlined
│   ├── archive-docs-cleanup/ # Historical reports (archived)
│   └── *.md              # Current essential documentation
├── layouts/               # Templates, partials, shortcodes
├── static/                # Manifest, service worker, static images/audio
├── tools/                 # Go utilities for preprocessing data
└── CLAUDE.md              # Claude Code guidance
```

## Core Components

- **Templates & Shortcodes (`layouts/`)**: Render vocabulary lists, flashcard interfaces, and embed JSON for offline initialization.
- **Client Modules (`assets/js/`)**: Unified modules implement SM-2 scheduling (`unified-spaced-repetition.js`), practice sessions (`unified-practice-session.js`), language toggles, and storage helpers.
- **Data Sources (`data/`)**: Single vocabulary database (`vocabulary.json`) and grammar rules (`cultural-grammar.json`) used by Hugo at build time and injected into the front end.
- **Styles (`assets/scss/`)**: Component-driven SCSS compiled to a fingerprinted stylesheet referenced from `layouts/_default/baseof.html`.
- **Go Tools (`tools/`)**: Optional command-line helpers for data processing; no long-running backend services.

## Data Flow

1. **Build time**: Hugo loads JSON from `data/`, renders pages and shortcodes, and embeds serialized vocabulary data into HTML.
2. **Page load**: Browser downloads HTML, CSS, and ES modules. Service worker handles caching for offline reuse.
3. **Runtime interactions**:
   - `unified-practice-session.js` parses embedded JSON and manages flashcard sessions.
   - User flips cards and assigns grades; `unified-spaced-repetition.js` recalculates schedule and writes to `localStorage` (prefix `bgde:`).
   - UI updates reflect progress, accuracy, and next-review intervals with bidirectional learning support.

## Non-Functional Considerations

- **Performance**: Asset fingerprinting with Hugo Pipes, minimal inline scripts, lazy initialization of modules, offline shell cached by service worker.
- **Accessibility**: Keyboard shortcuts (space/enter, digits 0–5), ARIA roles announced via `announceToScreenReader()` helper.
- **PWA Hygiene**: Service worker caches only critical assets; updates prompt clients to refresh.
- **Security**: No server-side user data; progress stored locally in the browser. External requests limited to static assets.

## Related Docs

- `README.md` – project overview and quick links.
- `docs/DEVELOPMENT.md` – workflow, prerequisites, commands.
- `docs/TESTING.md` – testing checklist and manual QA steps.
- `AGENTS.md` – instructions for AI coding assistants.
