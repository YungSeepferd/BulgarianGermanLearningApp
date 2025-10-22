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
│   ├── js/                # ES module scripts (flashcards, spaced repetition, UI helpers)
│   └── scss/              # SCSS sources compiled via Hugo Pipes
├── content/               # Markdown content (practice pages, vocabulary articles)
├── data/                  # JSON data sources (vocabulary, grammar, search index)
├── docs/                  # Project documentation (architecture, development, testing)
├── layouts/               # Hugo templates, partials, and shortcodes
├── static/                # Manifest, service worker, and static assets
├── tools/                 # Go utilities (no Go module in repo root)
└── AGENTS.md              # Coding assistant instructions
```

## ✨ Key Features

- **🧠 Spaced repetition** powered by an SM-2 implementation in `assets/js/spaced-repetition.js`
- **📚 Vocabulary explorer** with category, CEFR level, and text filters
- **🔄 Bidirectional flashcards** with keyboard shortcuts and accessibility support
- **📊 Progress persistence** stored under the `bgde:` localStorage namespace
- **📱 PWA shell** with offline cache, manifest, and update handling
- **🎨 Mobile-first design** compiled via Hugo Pipes with fingerprinted CSS

## 🛠️ Technology Stack

- **Static site**: Hugo Extended (SCSS via `css.Sass | resources.Minify | resources.Fingerprint`)
- **Client logic**: Vanilla JavaScript ES modules (no third-party dependencies)
- **Styling**: SCSS partials compiled by Hugo Pipes
- **Data**: JSON sources under `data/` consumed by Hugo and client scripts
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
- **Mobile**: Test at 360 px width to ensure touch targets and layout behave.

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

- **Read first**: [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) and [`AGENTS.md`](AGENTS.md)
- **Workflow**: One scoped change per PR; log notes in `docs/notes/TODAY.md`
- **Testing**: Start `hugo server -D`, verify no console errors, and ensure accessibility checks pass
- **PRs**: Include summary, acceptance checklist, and screenshots/GIFs for UI updates

## 📄 License

Open source under the [MIT License](LICENSE).

---

Built with ❤️ using Hugo Extended and Go.
