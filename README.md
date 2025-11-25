# Bulgarian–German Learning App

Hugo Extended site for learning Bulgarian and German with spaced repetition flashcards, vocabulary search, and offline-friendly PWA capabilities. The project pairs Hugo templates with vanilla ES modules and Go helper tools—no external JS frameworks.

## 🚀 Quick Start

```bash
# Prerequisites: Hugo Extended v0.128.0+, Go 1.21+ (for tools), Node 18+

# Start local dev server
hugo server -D --logLevel=debug

# or via npm script
npm run dev

# Build for production
hugo --minify

# Visit local site
open http://localhost:1313/
```

## 📁 Project Structure

```text
.
├── assets/
│   ├── js/                # Unified ES modules (v2.0) - no legacy duplication
│   │   ├── modules/       # Specialized modules (search, API client, etc.)
│   │   └── unified-*.js   # Core unified modules for practice & spaced repetition
│   └── scss/              # SCSS sources compiled via Hugo Pipes
├── content/               # Markdown content (practice pages, vocabulary articles)
├── data/                  # Consolidated JSON sources - single source of truth
│   ├── vocabulary.json    # Main vocabulary database (968KB)
│   ├── cultural-grammar.json # Grammar rules and cultural notes
│   └── archive-data-cleanup/ # Legacy batch files (safely archived)
├── docs/                  # Streamlined documentation - essential files only
│   ├── archive-docs-cleanup/ # Historical completion reports (archived)
│   └── *.md              # Current project documentation
├── layouts/               # Hugo templates, partials, and shortcodes
├── static/                # Manifest, service worker, and static assets
├── tools/                 # Go utilities (no Go module in repo root)
└── CLAUDE.md              # Claude Code guidance for future development
```

## ✨ Key Features

- **🧠 Spaced repetition** powered by unified SM-2 v2 implementation in `unified-spaced-repetition.js`
- **📚 Vocabulary explorer** with category, CEFR level, and text filters - single consolidated database
- **🔄 Bidirectional flashcards** with direction-aware difficulty multipliers and session management
- **📊 Progress persistence** with automatic schema migration stored under the `bgde:` localStorage namespace
- **📱 PWA shell** with offline cache, manifest, and update handling
- **🎨 Mobile-first design** compiled via Hugo Pipes with fingerprinted CSS

## 🛠️ Technology Stack

- **Static site**: Hugo Extended (SCSS via `css.Sass | resources.Minify | resources.Fingerprint`)
- **Client logic**: Unified vanilla JavaScript ES modules v2.0 (zero dependencies, consolidated architecture)
- **Styling**: Component-driven SCSS partials compiled by Hugo Pipes
- **Data**: Single vocabulary database + grammar JSON for optimal performance
- **Tooling**: Go utilities in `tools/`, npm scripts for convenience
- **Deployment**: GitHub Pages via `.github/workflows/deploy.yml`

## 📖 Documentation & Resources

- **Project overview**: `README.md` (this file)
- **Coding assistant guide**: [`AGENTS.md`](AGENTS.md)
- **Development workflow**: [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)
- **Architecture reference**: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- **Hugo survival guide**: [`docs/HUGO_GUIDELINES.md`](docs/HUGO_GUIDELINES.md)
- **Hugo official digest**: [`docs/HUGO_OFFICIAL_GUIDELINES.md`](docs/HUGO_OFFICIAL_GUIDELINES.md)
- **Testing checklist**: [`docs/TESTING.md`](docs/TESTING.md)
- **Project plan**: [`docs/PROJECT_PLAN.md`](docs/PROJECT_PLAN.md)
- **Programming references**: [`docs/PROGRAMMING_LINKS.md`](docs/PROGRAMMING_LINKS.md)
- **Implementation pseudocode**: [`pseudocode/`](pseudocode/)

> **Tip**: Start each work session by logging goal, plan, and results in `docs/notes/TODAY.md`.

## 🏗️ Development

```bash
# Start dev server (drafts + future content)
hugo server -D --logLevel=debug

# Build production bundle with garbage collection + minify
npm run build

# Optional: build Go helper binary
npm run build-tools

# Regenerate derived data
npm run process-data
```

- **JavaScript syntax**: Use an ES module-aware checker (e.g., `node --experimental-warnings --check` or an esbuild/rollup dry run). Plain `node -c` is not ESM aware.
- **Go tests**: Run inside `tools/` where modules are defined; repo root has no Go module.
- **Accessibility**: Verify keyboard controls (space/enter to flip, digits 0–5 to grade).
- **Mobile**: Test at 360 px width to ensure touch targets and layout behave.

## ✅ Code Quality & Testing

This project enforces code quality standards through automated linting, formatting, and testing. All developers should follow these guidelines.

### Quick Commands

```bash
# Install dependencies (required once)
npm install

# Enable pre-commit hooks (automatically runs linters before commit)
npx husky install

# Run all quality checks
npm run lint              # Check all code
npm run format            # Auto-format code (ESLint, Prettier, Stylelint)

# Run tests
npm run test:unit         # Jest unit tests
npm run test:coverage     # Generate coverage report
npm test                  # Playwright end-to-end tests
npm run test:a11y         # Accessibility tests (axe-core)
npm run test:keyboard     # Keyboard navigation tests

# Build and validate
npm run build             # Production build
npm run validate          # Full validation suite
```

### Quality Standards

**Code Linting** (ESLint + Unicorn Plugin):
- ES2021 environment with strict rules
- Semicolons required, single quotes, const/let only
- 100-character line limit, 2-space indentation
- `===` equality checks, arrow functions required
- Pre-commit hooks automatically fix auto-fixable issues

**Code Formatting** (Prettier):
- Automatically formats JavaScript, SCSS, HTML, JSON, Markdown
- 100-character line width
- Single quotes with escape avoidance
- Trailing commas: none
- Runs automatically before commits via husky

**SCSS Linting** (Stylelint):
- Standard SCSS rules
- Kebab-case selectors, variables, mixins
- Validated before commits

**Testing** (Jest + Playwright + axe-core):
- Unit tests: Jest with jsdom environment (`tests/unit/`)
- E2E tests: Playwright (`tests/playwright/`)
- Accessibility tests: axe-core integration with WCAG 2.1 AA compliance
- Minimum coverage threshold: 70% (branches, functions, lines, statements)
- SM-2 algorithm thoroughly tested with 25+ unit test cases

### Contribution Guidelines

Before submitting a pull request:

1. **Read** [`CONTRIBUTING.md`](CONTRIBUTING.md) for detailed guidelines
2. **Run locally**:
   ```bash
   npm run lint              # Must pass with 0 errors
   npm run format            # Auto-fixes most issues
   npm run test:unit         # All tests must pass
   npm run build             # Must build successfully
   ```
3. **Commit** with descriptive messages (see CONTRIBUTING.md for format)
4. **PR template** must be completed with:
   - Description of changes
   - Type of change (bug fix, feature, refactor, etc.)
   - Testing details and results
   - Link to related issues

### CI/CD Enforcement

GitHub Actions enforces code quality on every push and pull request:

- ✅ Security audits (npm audit, Go vulncheck, CodeQL)
- ✅ ESLint validation
- ✅ SCSS linting
- ✅ Unit test execution
- ✅ Code coverage tracking (Codecov)
- ✅ Build validation
- ✅ Data integrity checks
- ✅ Accessibility testing (axe-core WCAG 2.1 AA)
- ✅ Keyboard navigation testing

All checks must pass before merging to main.

### Data & Tools

**Data Validation**:
- Vocabulary data validated before every commit
- Pre-commit hook checks JSON syntax and schema
- Run manually: `npm run validate`

**Go Tools** (in `tools/` directory):
- `npm run build-tools` - Compile CLI utilities
- `npm run process-data` - Process vocabulary data
- See [`tools/README.md`](tools/README.md) for detailed documentation

**For Detailed Info**: See [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`tools/README.md`](tools/README.md)

## 🎮 Usage Highlights

- **Vocabulary browsing**: `/vocabulary/` lists words with filters for CEFR level, categories, and search.
- **Flashcard practice**: `/practice/` or embedded shortcodes launch sessions with SM-2 grading (keys `0–5`).
- **Progress**: Session stats and review states persist automatically via spaced-repetition engine.
- **Offline**: Load once online to cache assets; service worker provides an offline shell.

## 🚀 Deployment

- **CI/CD**: `.github/workflows/deploy.yml` builds with `hugo --minify` and deploys to GitHub Pages.
- **Production URL**: [yungseepferd.github.io/BulgarianGermanLearningApp](https://yungseepferd.github.io/BulgarianGermanLearningApp/)
- **Cache busting**: Fingerprinted CSS/JS via Hugo Pipes keeps PWA cache clean.

## 🤝 Contributing

- **Read first**: [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`AGENTS.md`](AGENTS.md)
- **Workflow**: One scoped change per PR; log notes in `docs/notes/TODAY.md`
- **Testing**: Start `hugo server -D`, verify no console errors, and ensure accessibility tests pass
- **Accessibility**: Run `npm run test:a11y` to verify WCAG 2.1 AA compliance
- **PRs**: Include summary, acceptance checklist, and screenshots/GIFs for UI updates

## 📄 License

Open source under the [MIT License](LICENSE).

---

Built with ❤️ using Hugo Extended and Go.
