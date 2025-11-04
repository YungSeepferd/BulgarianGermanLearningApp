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
Check and use your MCP server tools as much as possible where it makes sense. For example use sequential thinking to make more structured plans and Playwright MCP to manually test. Use fetch to make sure data is correct. Always make sure the files you create are created in the right dedicated directory in the folder hierarchy and not just in the top level. 

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

## Claude Code — repo usage (quickstart & safety)

This section provides concise, repo-specific instructions for using Claude Code safely and effectively with this project. It complements Anthropic's official docs: https://docs.claude.com/en/docs/claude-code/overview

### Development Container Support

This repository includes a devcontainer configuration optimized for Claude Code integration:

```bash
# Open in devcontainer
code . 
# Then: Command Palette (Cmd/Ctrl+Shift+P) -> "Reopen in Container"
```

The devcontainer includes:
- Node.js 20 and Go 1.21 for all build tools
- Hugo Extended for site generation
- Claude Code VS Code extension
- ESLint, Prettier, and Playwright for testing
- Automatic mounting of `.claude/prompts` for consistent templates

### Language Learning Automation

The repository includes specialized Claude Code automation for vocabulary management:

1. Fetch and process new vocabulary:
```bash
npm run vocab:fetch <URL>
# Example: npm run vocab:fetch https://example.com/bulgarian-vocab
```

2. Analyze existing vocabulary:
```bash
npm run vocab:analyze
```

These commands leverage Claude Code templates in `.claude/prompts/`:
- `fetch-vocabulary.txt` - Extract and structure new vocabulary
- `semantic-chunk.txt` - Group vocabulary by meaning and usage
- `validate-progression.txt` - Verify CEFR levels and learning order

The analysis produces:
- Semantic groupings of related terms
- Learning progression validation
- Integration suggestions with grammar lessons
- Detailed reports in `data/vocabulary-analysis/`

### Quickstart (repo-specific)

- Install Claude Code (see official docs). Example (macOS / Linux):
```bash
curl -fsSL https://claude.ai/install.sh | bash
```
- From the project root, run `claude` to start an interactive session. On first run you'll be prompted to authenticate.
- Example invocations tailored to this repo:
  - `claude -p "Run \`npm run lint:esm\` and produce a minimal patch that only touches files under assets/js/"`
  - `claude -p "Summarize the spaced-repetition implementation and suggest small doc changes to docs/ or CLAUDE.md"`
- If you prefer an IDE experience, install the Claude VS Code extension (see official docs). We recommend using the extension inside a devcontainer if you rely on exact node/go versions.

### Safety & privacy (must-read)

- Do NOT paste secrets, API keys, or user data into prompts. Redact or replace sensitive values with placeholders before sending code or data snippets.
- Avoid sending full large generated folders (e.g., `public/`, `node_modules/`) or the full `data/vocabulary.json` unless absolutely necessary. Instead send small, representative excerpts.
- Link to Anthropic docs for privacy & data handling: https://docs.claude.com/en/docs/claude-code/data-usage and https://docs.claude.com/en/docs/claude-code/security
- When in doubt, run Claude locally (not in shared CI) and keep generated patches small and well-scoped.

### Scope control & good context hygiene

- Limit the code context you provide. Recommended include paths: `assets/js/`, `layouts/`, `data/` (small snippets), `tools/` (if working on Go utilities). Exclude: `public/`, `node_modules/`, `search-index.json`, and other large generated artifacts.
- Prefer attaching a short file list (3–6 files) plus a 2–4 sentence summary of the task instead of dumping entire files.
- If you must include a data file for a bug report, redact sensitive fields and include only the minimal failing dataset.

### Prompt templates and reproducible examples

We keep a small set of vetted prompt templates under `.claude/prompts/` for repeatable, safe interactions. Use these as a starting point and adapt only the task-specific parts.

Example templates included (see `.claude/prompts/`):
- `fix-esm-lint.txt` — Run ESM lint and produce a patch limited to `assets/js/`.
- `fix-accessibility.txt` — Scan `layouts/` and `assets/js/` for keyboard/ARIA issues and propose minimal diffs.
- `summarize-spaced-rep.txt` — Explain the SM-2 implementation and propose doc improvements.

### CI, automation & PR policy for AI-assisted changes

- If you run Claude in CI or automation, ensure service credentials have minimal privileges and never expose secrets to the agent.
- All AI-assisted commits or PRs must be clearly labeled in the PR description (see `.github/PULL_REQUEST_TEMPLATE.md`) and must include:
  1. Short summary of what was generated.
  2. List of commands/tests run to verify behavior (e.g., `npm test`, `npm run lint:esm`, `hugo --minify`).
  3. At least one human reviewer approval before merging.

### Where to store curated prompts (optional)

- Create `.claude/prompts/` (committed) for small, non-sensitive templates. Keep them short and generic; never store secrets.

### Example safe prompts (copy-and-run)

- "Run `npm run lint:esm` and summarize errors; for each error propose a minimal patch touching only `assets/js/` files. Provide the patch in unified diff format."
- "I have a failing Playwright test `tests/e2e/flashcards.spec.ts` — list likely causes and suggest a focused patch limited to `assets/js/unified-practice-session.js` and `layouts/flashcards.html`."

---

If you'd like, we can add a separate `docs/claude-usage.md` with longer examples and a short checklist for reviewers. See the new `docs/` file added alongside this edit.

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