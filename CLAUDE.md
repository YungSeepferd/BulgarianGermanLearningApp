# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
# Start local dev server with drafts and future content
hugo server -D --logLevel=debug
# or via npm script
npm run dev

# Build for production with garbage collection and minification
npm run build
# or directly
hugo --gc --minify

# Validate data and check ESM modules
npm run validate
npm run lint:data
npm run lint:esm
```

### Testing
```bash
# Run all Playwright tests
npm test

# Run tests with UI mode
npm run test:ui

# Debug tests (opens browser)
npm run test:debug

# Update test snapshots
npm run test:update-snapshots
```

### Data Processing
```bash
# Build Go tools (optional - creates ./hugo-bg-de binary)
npm run build-tools

# Process/regenerate data (requires Go tools)
npm run process-data
```

## Architecture Overview

This is a **Hugo Extended static site** that implements a Bulgarian-German language learning app with spaced repetition flashcards. The architecture follows these principles:

- **Hugo builds static pages** with embedded JSON data for offline-first functionality
- **Vanilla ES modules** provide all client-side interactivity (no external JS frameworks)
- **SCSS compiled via Hugo Pipes** with fingerprinting for cache-busting
- **Go utilities** for data processing (no runtime backend services)
- **PWA capabilities** with service worker for offline use

### Key Technology Stack
- **Static site generator**: Hugo Extended v0.128.0+ (required for SCSS processing)
- **Frontend**: Vanilla JavaScript ES modules, SCSS
- **Theme**: Hugo Relearn theme (customized)
- **Data format**: JSON files in `data/` directory
- **Build tools**: Go 1.21+, Node 18+, npm
- **Testing**: Playwright for E2E testing
- **Deployment**: GitHub Pages via GitHub Actions

## Core Components

### Data Layer (`data/`)
- `vocabulary.json` - Main vocabulary database with bidirectional translations
- `cultural-grammar.json` - Grammar rules and cultural context
- All vocabulary items have unique IDs, CEFR levels, categories, and bidirectional translations

### Client-Side Modules (`assets/js/`)
**Core Modules (v2.0 - Refactored October 2025)**:
- `unified-spaced-repetition.js` - SM-2 algorithm with schema v2, handles bidirectional learning with difficulty multipliers
- `unified-practice-session.js` - Practice session management with keyboard shortcuts and session history
- `vocab-cards.js` - Vocabulary browsing with filtering and search
- `language-toggle.js` - Language direction switching (DE→BG / BG→DE)
- `speech-recognition.js` - Web Speech API integration

**Specialized Modules (`assets/js/modules/`)**:
- `api-client.js`, `search-engine.js`, `performance-monitor.js` - Utility modules for specific functionality

**Legacy Cleanup (Completed)**:
- Consolidated `flashcards.js` and `spaced-repetition.js` into unified modules
- Removed `assets/js/archive/` directory with outdated implementations

### Spaced Repetition System
- **Schema v2** format: `bgde:review_<id>_<direction>` in localStorage
- **Automatic migration** from legacy `bgde:review:<id>` format
- **Bidirectional difficulty multipliers**: BG→DE (1.1x), DE→BG (1.2x)
- **Progress tracking**: Session history stored in `bgde:session_history`

### Templates & Shortcodes (`layouts/`)
- `flashcards.html` - Renders flashcard interfaces with embedded JSON
- `vocab-card.html` - Individual vocabulary card display
- `vocab-grid.html` - Grid layout for vocabulary browsing
- All templates follow ARIA accessibility guidelines

## Development Guidelines

### File Structure Navigation
```text
assets/js/           # Unified ES modules (v2.0 - refactored October 2025)
  ├── modules/       # Specialized modules (API, search, monitoring)
  └── unified-*.js   # Core unified modules (practice, spaced repetition)
assets/scss/         # SCSS source files
content/             # Markdown content (vocabulary, grammar, practice)
data/                # Consolidated JSON sources (single source of truth)
  ├── vocabulary.json             # Main vocabulary database (968KB)
  ├── cultural-grammar.json       # Grammar rules and cultural notes
  └── archive-data-cleanup/       # Legacy batch files (safely archived)
docs/                # Streamlined documentation
  ├── archive-docs-cleanup/       # Historical reports (archived)
  └── *.md                       # Current essential documentation
layouts/             # Hugo templates, partials, shortcodes
static/              # Static assets (manifest, service worker, images)
tools/               # Go utilities (has its own go.mod)
```

### Important Development Notes
- **Hugo Extended required** - Standard Hugo won't work due to SCSS processing
- **Unified modules only** - Use consolidated v2.0 modules, avoid legacy implementations
- **Single data source** - `vocabulary.json` is the single source of truth (968KB)
- **No external JS dependencies** - Everything is vanilla JS
- **Go tools are optional** - Located in `tools/` with separate go.mod
- **LocalStorage prefix**: All app data uses `bgde:` prefix
- **Keyboard shortcuts**: Space/Enter flip cards, digits 0-5 for grading
- **Archive directories**: Legacy files preserved in `archive-*-cleanup/` folders

### Testing
- **Manual testing**: Start `hugo server -D`, verify no console errors
- **Accessibility**: Verify keyboard navigation works (space/enter, 0-5 keys)
- **Mobile**: Test at 360px width for touch targets
- **PWA**: Test offline functionality after initial load

### Common Patterns
- **Data embedding**: Hugo shortcodes inject consolidated JSON into HTML for offline access
- **Asset fingerprinting**: Hugo Pipes handles CSS/JS cache-busting for unified modules
- **Progressive enhancement**: Base functionality works without JS
- **Responsive design**: Mobile-first SCSS with component-based architecture
- **Module consolidation**: Use unified modules instead of legacy scattered implementations

### Data Schema Notes
- Vocabulary items have `id`, `bulgarian`, `german`, `level`, `category`, `examples`
- SM-2 reviews use camelCase: `easeFactor`, `nextReview`, `lastReview`, etc.
- Session data includes timestamps, accuracy tracking, and streak counters

## Troubleshooting

### Common Issues
- **Build failures**: Ensure Hugo Extended v0.128.0+ is installed
- **SCSS errors**: Check `assets/scss/main.scss` imports
- **JS module errors**: Use `npm run lint:esm` to check ES module syntax
- **Go tools**: Run from `tools/` directory where go.mod exists
- **Cache issues**: Service worker may need manual refresh for updates

### Debug Commands
```bash
# Check Hugo version (must be Extended)
hugo version

# Verbose build output
hugo server -D --logLevel=debug

# Check JavaScript syntax (ES modules)
npm run lint:esm

# Validate data integrity
npm run validate
```

This project emphasizes simplicity, performance, and offline-first functionality while maintaining modern development practices with Hugo's powerful static site generation capabilities.