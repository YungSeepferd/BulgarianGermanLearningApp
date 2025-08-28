# Bulgarian-German Learning App

A Hugo-based static site generator application for learning Bulgarian and German vocabulary with spaced repetition. Built with Hugo Extended, Go tools, and vanilla JavaScript.

## 🚀 Quick Start

```bash
# Prerequisites: Hugo Extended v0.128.0+
hugo server -D --logLevel=debug

# Visit: http://localhost:1313/BulgarianGermanLearningApp/
```

## 📁 Project Structure

```text
.
├── content/              # Markdown content (vocabulary, grammar)
├── layouts/              # Hugo templates and partials
│   ├── _default/         # Default layouts
│   ├── vocabulary/       # Vocabulary page templates
│   ├── practice/         # Practice session templates
│   └── partials/         # Reusable template components
├── assets/               # Source assets
│   ├── js/               # JavaScript functionality
│   └── scss/             # SCSS stylesheets
├── static/               # Static files (manifest, service worker)
├── data/                 # JSON data files
│   ├── vocabulary.json   # 1000+ vocabulary items
│   └── grammar.json      # Grammar rules and examples
├── tools/                # Go backend tools
└── docs/                 # Comprehensive documentation
```

## ✨ Key Features

- **🧠 Spaced Repetition**: SM-2 algorithm for optimal learning intervals
- **📚 1000+ Vocabulary Items**: Organized by CEFR levels (A1, A2, B1, B2)
- **🔄 Bidirectional Learning**: Bulgarian ↔ German with difficulty adjustments
- **📱 Progressive Web App**: Offline support with service worker
- **🎯 Interactive Practice**: Flashcard sessions with keyboard shortcuts
- **📊 Progress Tracking**: LocalStorage-based progress persistence
- **🎨 Responsive Design**: Mobile-first, accessible interface

## 🛠️ Technology Stack

**Core Technologies** (Hugo + Go only):
- **Hugo Extended**: Static site generator with SCSS processing
- **Go**: Backend tools and data processing
- **Vanilla JavaScript**: Client-side interactivity (no frameworks)
- **SCSS**: Styling with Hugo Pipes processing
- **JSON**: Data storage and Hugo data pipeline

## 📖 Documentation

**⚠️ IMPORTANT**: Always check documentation first before implementing features!

### Documentation Priority Order:
1. **[docs/PROGRAMMING_LINKS.md](docs/PROGRAMMING_LINKS.md)** - Official Hugo/Go documentation links
2. **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Development setup and recent fixes
3. **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture
4. **[pseudocode/](pseudocode/)** - Implementation guides
5. **[README.md](README.md)** - This overview

### Key Documentation Files:
- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Setup, troubleshooting, recent fixes
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design and decisions
- **[PROGRAMMING_LINKS.md](docs/PROGRAMMING_LINKS.md)** - Hugo, Go, GitHub docs
- **[TESTING.md](docs/TESTING.md)** - Testing strategy and validation
- **[CONTRIBUTING.md](docs/CONTRIBUTING.md)** - Contribution guidelines

## 🏗️ Development

### Local Development
```bash
# Start Hugo development server
hugo server -D --logLevel=debug

# Build for production
hugo --minify

# Test JavaScript syntax
node -c assets/js/vocabulary.js
node -c assets/js/practice-simple.js
```

### Current Implementation Status
- ✅ **Simplified JavaScript Architecture**: Global functions, no ES modules
- ✅ **Vocabulary Browsing**: Filtering, search, card selection
- ✅ **Practice Sessions**: Flashcard interface with spaced repetition
- ✅ **SCSS Processing**: Hugo Pipes with css.Sass pipeline
- ✅ **PWA Support**: Manifest, service worker, offline capability
- ✅ **GitHub Pages Deployment**: Automated via GitHub Actions

### Recent Fixes (August 2025)
- Fixed Hugo SCSS compilation using `css.Sass | resources.Minify | resources.Fingerprint`
- Simplified JavaScript from ES modules to global functions
- Fixed practice page infinite loading by creating proper content files
- Updated templates to use Hugo's `relURL` for proper path handling
- Resolved vocabulary page button functionality with simplified event binding

## 🎮 Usage

### Vocabulary Browsing
1. Visit `/vocabulary/` to browse word collection
2. Use filters: Level (A1-B2), Category, Search
3. Select words by clicking cards
4. Click "Practice Selected" to start session

### Practice Sessions
1. Navigate to `/practice/` or use "Practice Selected"
2. Use keyboard shortcuts:
   - **Space/Enter**: Flip card
   - **1**: Mark incorrect
   - **2**: Mark correct
3. Track progress with session statistics

## 🚀 Deployment

Automatically deployed to GitHub Pages via GitHub Actions:
- **Production URL**: https://yungseepferd.github.io/BulgarianGermanLearningApp/
- **Trigger**: Push to `main` branch
- **Build**: Hugo with minification and fingerprinting

## 🤝 Contributing

1. Check [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines
2. Review [DEVELOPMENT.md](docs/DEVELOPMENT.md) for setup
3. Follow Hugo + Go only constraint
4. Test locally with `hugo server -D`
5. Submit PR with detailed description

## 📄 License

Open source under the [MIT License](LICENSE).

---

**Built with ❤️ using Hugo Extended and Go**
