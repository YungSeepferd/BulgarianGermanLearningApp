# Getting Started - New Developer Guide

**Time to read**: 10 minutes  
**Time to setup**: 5 minutes

Welcome! This guide will get you up and running quickly.

---

## 📋 Prerequisites

- **Node.js**: 20 or higher (`node --version`)
- **pnpm**: Latest version (`pnpm --version`)
  - **Important**: Use ONLY `pnpm`. Don't use `npm` or `yarn`
  - Install: `npm install -g pnpm`

---

## ⚡ Quick Setup (5 minutes)

### 1. Clone the repository
```bash
git clone https://github.com/YungSeepferd/BulgarianGermanLearningApp
cd BulgarianApp-Fresh
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Start development server
```bash
pnpm run dev
```

### 4. Open in browser
Navigate to **http://localhost:5173**

You should see the app home page with navigation tabs.

**Latest Updates (Dec 13, 2025)**:
- ✅ Phase 2 Complete: VocabularyCard unified component + Design token system
- ✅ Phase 3 Complete: ActionButton migrations + Flashcard variant
- 🚀 Phase 4 In Progress: Comprehensive tab-by-tab testing

---

## 🧪 Verify Installation

### Check everything works
```bash
# TypeScript & Svelte checks
pnpm run check

# Lint code
pnpm run lint

# Run unit tests
pnpm run test:unit
```

All three should pass with no errors.

---

## 📚 Next Steps

### Understand the Project
- Read **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** (5 minutes)
  - What does this app do?
  - What features are implemented?
  - What's the tech stack?

### Understand the Code
- Read **[ARCHITECTURE.md](architecture/ARCHITECTURE.md)** (15 minutes)
  - How is the code organized?
  - What's the state management pattern?
  - How does data flow through the app?

### Development Guidelines
- Read **[DEVELOPMENT.md](development/DEVELOPMENT.md)** (20 minutes)
  - How to write components
  - Svelte 5 syntax patterns
  - Component best practices

---

## 🚀 Common Development Tasks

### Start coding
```bash
pnpm run dev
# App reloads automatically as you edit
```

### Run all checks before pushing
```bash
pnpm run simulate-ci
# This runs: TypeScript check + Lint + Tests
# Must pass before push to main
```

### Run specific tests
```bash
pnpm run test:unit              # Unit tests only
pnpm run test:e2e               # E2E tests only
pnpm run test:components        # Component tests only
```

### Build for production
```bash
pnpm run build
```

---

## 🐛 When Things Go Wrong

### Port 5173 already in use
```bash
# Kill existing process
pkill -f "pnpm dev"

# Start again
pnpm run dev
```

### Dependencies changed
```bash
# Reinstall everything
rm -rf node_modules
pnpm install
pnpm run dev
```

### TypeScript errors
```bash
# Check what's wrong
pnpm run check

# Auto-fix if possible
pnpm run lint --fix
```

### Tests failing
```bash
# Run with more details
pnpm run test:unit -- --reporter=verbose
```

For more issues, see **[DEBUGGING_GUIDE.md](../DEBUGGING_GUIDE.md)**.

---

## 📱 App Overview

Once you start `pnpm run dev`, you'll see:

### Navigation (Top)
- 🏠 **Home** - Dashboard with quick links
- 📚 **Vocabulary** - Search/filter vocabulary
- 📖 **Grammar** - Grammar rules and examples
- 🎯 **Practice** - Interactive practice mode
- 🧠 **Learn** - Flashcard learning

### Features
- **Language Toggle** (top right) - Switch between German→Bulgarian and Bulgarian→German
- **UI Language** - Entire UI available in German and Bulgarian
- **Search** - Real-time vocabulary search with filters
- **Offline** - App works offline once loaded

---

## 🎯 Your First Contribution

### 1. Pick a task
Look for tasks labeled `good-first-issue` or `help-wanted`

### 2. Create a branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Make changes
Edit files in `src/` folder

### 4. Test your changes
```bash
pnpm run dev
# Test manually in browser
```

### 5. Run checks
```bash
pnpm run simulate-ci
# Must pass with no errors
```

### 6. Commit
```bash
git add .
git commit -m "Description of your change"
```

### 7. Push
```bash
git push origin feature/your-feature-name
```

### 8. Create Pull Request
Go to GitHub and create a PR from your branch

---

## 📖 Documentation Map

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **PROJECT_OVERVIEW.md** | What this app does | 5 min |
| **ARCHITECTURE.md** | How the code is organized | 15 min |
| **DEVELOPMENT.md** | How to write code | 20 min |
| **TESTING.md** | How to test | 15 min |
| **DEBUGGING_GUIDE.md** | How to fix problems | 10 min |
| **CRITICAL_ISSUES_ANALYSIS.md** | Deep dive on 3 bugs (resolved) | 30 min |
| **DEPLOYMENT.md** | How to deploy | 10 min |

---

## ✅ Checklist - You're Ready If...

- ✅ Node.js and pnpm installed
- ✅ Repository cloned
- ✅ Dependencies installed with `pnpm install`
- ✅ Dev server running with `pnpm run dev`
- ✅ App loads at http://localhost:5173
- ✅ All checks pass with `pnpm run simulate-ci`

---

## 🤔 Questions?

- **How do I...?** → Check **[DEVELOPMENT.md](development/DEVELOPMENT.md)**
- **Something's broken** → See **[DEBUGGING_GUIDE.md](../DEBUGGING_GUIDE.md)**
- **I want to understand the code** → Read **[ARCHITECTURE.md](architecture/ARCHITECTURE.md)**
- **I'm deploying** → Follow **[DEPLOYMENT.md](deployment/DEPLOYMENT.md)**

---

**You're all set! Happy coding! 🚀**
