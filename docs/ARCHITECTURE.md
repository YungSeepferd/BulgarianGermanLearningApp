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
        I[flashcards.js] --> J[spaced-repetition.js]
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
  - `flashcards.js` drives the practice session, sourcing card data, tracking SM-2 state, wiring accessibility, and coordinating speech practice.
  - `spaced-repetition.js` persists scheduling metadata in `localStorage` (`bgde:review:*`) and exposes SM-2 helpers.
  - `speech-recognition.js` wraps the Web Speech API to provide pronunciation feedback and auto-grading hooks.
  - `language-toggle.js` synchronises study direction (DE→BG / BG→DE) across modules via custom events.
  - `vocab-cards.js` powers listing pages, sharing data loading utilities with the flashcard flow.
- **State management** is browser-local and deterministic:
  - Session state (current card, accuracy, attempts) lives in-memory within `Flashcards`.
  - Long-term spaced-repetition progress is stored per-word using JSON blobs keyed by `bgde:review:<slug>`.
  - User preferences (theme, language direction, PWA hints) sit in `localStorage` via helper modules.
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
│   ├── js/                # ES modules (flashcards, spaced repetition, UI helpers)
│   └── scss/              # SCSS partials compiled via Hugo Pipes
├── content/               # Hugo content pages (practice, vocabulary articles)
├── data/                  # JSON sources (vocabulary, grammar, search index)
├── docs/                  # Project documentation
├── layouts/               # Templates, partials, shortcodes
├── static/                # Manifest, service worker, static images/audio
├── tools/                 # Go utilities for preprocessing data
└── AGENTS.md              # AI assistant guidance
```

## Core Components

- **Templates & Shortcodes (`layouts/`)**: Render vocabulary lists, flashcard interfaces, and embed JSON for offline initialization.
- **Client Modules (`assets/js/`)**: Implement SM-2 scheduling (`spaced-repetition.js`), flashcard UI (`flashcards.js`), language toggles, and storage helpers.
- **Data Sources (`data/`)**: Central vocabulary and grammar JSON files used by Hugo at build time and injected into the front end.
- **Styles (`assets/scss/`)**: Component-driven SCSS compiled to a fingerprinted stylesheet referenced from `layouts/_default/baseof.html`.
- **Go Tools (`tools/`)**: Optional command-line helpers for data processing; no long-running backend services.

## Data Flow

1. **Build time**: Hugo loads JSON from `data/`, renders pages and shortcodes, and embeds serialized vocabulary data into HTML.
2. **Page load**: Browser downloads HTML, CSS, and ES modules. Service worker handles caching for offline reuse.
3. **Runtime interactions**:
   - `flashcards.js` parses embedded JSON or fetches fallback endpoints.
   - User flips cards and assigns grades; `spaced-repetition.js` recalculates schedule and writes to `localStorage` (prefix `bgde:`).
   - UI updates reflect progress, accuracy, and next-review intervals.

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
