# 🇧🇬 Bulgarian-German Learning App

**Status**: Production Ready (v1.0)  
**Framework**: SvelteKit 2 + Svelte 5  
**Language**: TypeScript (strict mode)  
**Last Updated**: December 11, 2025

> A clean, focused **tandem language learning platform** for Bulgarian ↔ German vocabulary and lessons, fully offline-capable.

---

## 🚀 5-Minute Start

**New here?** Read **[GETTING_STARTED.md](docs/GETTING_STARTED.md)** first (5 min setup guide)

```bash
# 1. Clone & Install
git clone https://github.com/YungSeepferd/BulgarianApp-Fresh.git
cd BulgarianApp-Fresh
pnpm install

# 2. Start Development Server
pnpm run dev

# 3. Open browser to http://localhost:5173
```

## 🌐 Live Deployment

🎉 **Access the live application:** [https://yungseepferd.github.io/BulgarianGermanLearningApp/](https://yungseepferd.github.io/BulgarianGermanLearningApp/)

---

**Note:** The live deployment is updated with each successful push to the `main` branch.

## 📚 Documentation Hub

**For Different Audiences:**

| Role | Start Here |
|------|-----------|
| **New Developer** | [GETTING_STARTED.md](docs/GETTING_STARTED.md) (setup + first run) |
| **Understanding the App** | [PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md) (features + architecture) |
| **Writing Code** | [DEVELOPMENT.md](docs/development/DEVELOPMENT.md) (patterns + conventions) |
| **Fixing Issues** | [DEBUGGING_GUIDE.md](docs/DEBUGGING_GUIDE.md) (troubleshooting) |
| **Running Tests** | [TESTING.md](docs/development/TESTING.md) (test strategy) |
| **System Design** | [ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md) (data flows + state) |
| **Deploying** | [DEPLOYMENT.md](docs/deployment/DEPLOYMENT.md) (GitHub Pages) |
| **Critical Issues** | [CRITICAL_ISSUES_ANALYSIS.md](docs/CRITICAL_ISSUES_ANALYSIS.md) (bugs + fixes) |

---

## ✨ Features

### ✅ Implemented
- Bidirectional learning (German ↔ Bulgarian)
- Bilingual UI (German + Bulgarian)
- Vocabulary search & filtering
- Flashcard practice system
- Lesson generation
- Offline capability
- Local progress tracking
- Responsive design
- Accessibility (WCAG 2.1 AA)

### ❌ Out of Scope (v1.0)
- User accounts
- Cloud sync
- Gamification
- Social features

---

## 🛠️ Commands

```bash
pnpm run dev              # Start dev server
pnpm run build            # Build for production
pnpm run check            # TypeScript + Svelte checks
pnpm run lint             # ESLint + formatting
pnpm run test:unit        # Unit tests (Vitest)
pnpm run test:e2e         # E2E tests (Playwright)
pnpm run test:components  # Component tests
pnpm run simulate-ci      # Full CI simulation
```

---

## 🏗️ Project Structure

```
src/
├── lib/
│   ├── components/        # Svelte 5 components
│   ├── state/            # Global state (runes)
│   ├── services/         # Business logic
│   ├── schemas/          # Zod validation
│   ├── data/             # Data loading
│   └── utils/            # Utilities
├── routes/               # SvelteKit pages
└── paraglide/            # Translations (i18n)

docs/
├── GETTING_STARTED.md    # Setup guide
├── PROJECT_OVERVIEW.md   # What does it do?
├── architecture/         # System design
├── development/          # Coding patterns
└── deployment/           # Deployment guide
```

---

## ⚙️ Stack & Tools

| Layer | Tools |
|-------|-------|
| **Framework** | SvelteKit 2, Svelte 5 (Runes) |
| **Styling** | Tailwind CSS v4 |
| **Language** | TypeScript (strict) |
| **Validation** | Zod |
| **Testing** | Playwright, Vitest |
| **Deployment** | GitHub Pages (static) |

---

## 🐛 Troubleshooting

**Pages not loading?** → See [DEBUGGING_GUIDE.md](docs/DEBUGGING_GUIDE.md)

**Tests failing?** → See [TESTING.md](docs/development/TESTING.md)

**Critical issues found?** → See [CRITICAL_ISSUES_ANALYSIS.md](docs/CRITICAL_ISSUES_ANALYSIS.md)

---

## 🤝 Contributing

1. Read [DEVELOPMENT.md](docs/development/DEVELOPMENT.md) for coding patterns
2. Create feature branch
3. Run `pnpm run simulate-ci` before pushing
4. Submit PR with description

---

## 📖 More Information

- **What was removed?** → [SIMPLIFICATION.md](docs/SIMPLIFICATION.md)
- **What changed?** → [CHANGELOG.md](docs/CHANGELOG.md)
- **Bilingual support?** → [BILINGUAL_SUPPORT.md](docs/BILINGUAL_SUPPORT.md)

---

**Questions?** Check the [documentation](docs/) or open an issue.
