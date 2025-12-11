# Documentation Index

## 🎯 Quick Navigation

**For New Developers**: [GETTING_STARTED.md](GETTING_STARTED.md) (start here)

---

## 📚 Core Documentation

### Entry Points
- **[GETTING_STARTED.md](GETTING_STARTED.md)** - 5-minute setup guide and first run
- **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - What the app does and why
- **[CRITICAL_ISSUES_ANALYSIS.md](CRITICAL_ISSUES_ANALYSIS.md)** - 3 bugs found and fixed

### Reference Guides
- **[DEVELOPMENT.md](development/DEVELOPMENT.md)** - Coding patterns and conventions
- **[ARCHITECTURE.md](architecture/ARCHITECTURE.md)** - System design and data flows
- **[TESTING.md](development/TESTING.md)** - Test strategy and how to run tests
- **[DEBUGGING_GUIDE.md](DEBUGGING_GUIDE.md)** - Troubleshooting common issues
- **[DEPLOYMENT.md](deployment/DEPLOYMENT.md)** - How to deploy to GitHub Pages

### Reference
- **[BILINGUAL_SUPPORT.md](BILINGUAL_SUPPORT.md)** - How the bilingual system works
- **[CHANGELOG.md](CHANGELOG.md)** - What changed in recent versions
- **[SIMPLIFICATION.md](SIMPLIFICATION.md)** - What was removed and why

---

## 🔍 Deep Dives

### For Technical Issues
See **[CRITICAL_ISSUES_DETAILS.md](CRITICAL_ISSUES_DETAILS.md)** for complete technical analysis (2000+ lines):
- Issue #1: Vocabulary data incomplete (root cause + fix)
- Issue #2: Practice/Learn routes blank (cascade failure)
- Issue #3: Grammar text in Latin (cosmetic issue)

### Archived Documentation
Old MVP-related docs are in [archive/](archive/) for reference:
- MVP summaries and execution reports
- Type safety refactoring results
- Repository audit reports

---

## 📋 By Role

### 👨‍💻 I'm a developer
1. [GETTING_STARTED.md](GETTING_STARTED.md) - Get set up (5 min)
2. [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Understand the app (10 min)
3. [DEVELOPMENT.md](development/DEVELOPMENT.md) - Learn coding patterns (20 min)
4. [ARCHITECTURE.md](architecture/ARCHITECTURE.md) - Deep dive into design (15 min)

### 🐛 I need to fix something
1. [DEBUGGING_GUIDE.md](DEBUGGING_GUIDE.md) - Common troubleshooting
2. [CRITICAL_ISSUES_ANALYSIS.md](CRITICAL_ISSUES_ANALYSIS.md) - Known issues
3. [CRITICAL_ISSUES_DETAILS.md](CRITICAL_ISSUES_DETAILS.md) - Deep technical analysis

### 🧪 I need to test
1. [TESTING.md](development/TESTING.md) - Test strategy
2. Run: `pnpm run test:unit && pnpm run test:e2e`

### 🚀 I need to deploy
1. [DEPLOYMENT.md](deployment/DEPLOYMENT.md) - Deployment guide

### 🌍 I need to add translations
1. [BILINGUAL_SUPPORT.md](BILINGUAL_SUPPORT.md) - How i18n works
2. Edit files in `src/paraglide/` and `messages/`

---

## 📂 Directory Structure

```
docs/
├── README.md (this file)
├── GETTING_STARTED.md
├── PROJECT_OVERVIEW.md
├── CRITICAL_ISSUES_ANALYSIS.md
├── CRITICAL_ISSUES_DETAILS.md
├── DEBUGGING_GUIDE.md
├── BILINGUAL_SUPPORT.md
├── CHANGELOG.md
├── SIMPLIFICATION.md
├── architecture/
│   ├── ARCHITECTURE.md
│   └── [more architecture docs]
├── development/
│   ├── DEVELOPMENT.md
│   ├── TESTING.md
│   └── [more dev docs]
├── deployment/
│   ├── DEPLOYMENT.md
│   └── [more deployment docs]
├── ci-cd/
├── design/
├── testing/
├── migration/
├── roadmap/
├── analysis/
└── archive/
    └── [old MVP docs]
```

---

## 🔗 Links & Resources

### Repository
- GitHub: https://github.com/YungSeepferd/BulgarianApp-Fresh
- Issues: https://github.com/YungSeepferd/BulgarianApp-Fresh/issues

### Dependencies
- [SvelteKit Docs](https://kit.svelte.dev/)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/runes)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zod Validation](https://zod.dev/)
- [Playwright Testing](https://playwright.dev/)

---

## ✅ Documentation Checklist

- ✅ Entry points for new developers (GETTING_STARTED.md)
- ✅ Clear project overview (PROJECT_OVERVIEW.md)
- ✅ Critical issues documented with fixes (CRITICAL_ISSUES_ANALYSIS.md)
- ✅ Development patterns documented (DEVELOPMENT.md)
- ✅ Architecture documented (ARCHITECTURE.md)
- ✅ Testing strategy documented (TESTING.md)
- ✅ Troubleshooting guide (DEBUGGING_GUIDE.md)
- ✅ Old docs archived (archive/)
- ✅ Clean root README with links to docs
- ✅ Organized folder structure

---

**Last Updated**: December 11, 2025

