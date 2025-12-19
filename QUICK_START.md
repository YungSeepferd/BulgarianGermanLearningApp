# 🚀 Quick Start Guide

**⏱️ Time**: 10 minutes  
**🎯 Goal**: Get the app running and understand the project

---

## 1️⃣ Get Started (5 minutes)

### Clone & Install
```bash
# Clone repository
git clone https://github.com/YungSeepferd/BulgarianGermanLearningApp
cd BulgarianApp-Fresh

# Install dependencies (ONLY pnpm)
pnpm install

# Start development server
pnpm run dev
```

### Verify Installation
Open **http://localhost:5173** in your browser.

You should see:
- ✅ Home page with navigation tabs
- ✅ Search functionality working
- ✅ Language toggle in top right

---

## 2️⃣ Understand the Project (5 minutes)

### Choose Your Path

| Role | Read | Time |
|------|------|------|
| **I'm a developer** | [GETTING_STARTED.md](docs/GETTING_STARTED.md) | 5 min |
| **I want to learn the project** | [PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md) | 10 min |
| **I want to understand the architecture** | [ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md) | 15 min |
| **I'm ready to code** | [DEVELOPMENT.md](docs/development/DEVELOPMENT.md) | 20 min |
| **I want the complete roadmap** | [ROADMAP_5_PHASES.md](docs/ROADMAP_5_PHASES.md) | 10 min |

---

## 3️⃣ First Tasks

### Verify Everything Works
```bash
# Run all checks
pnpm run simulate-ci
```

Should see:
- ✅ Type checking passed
- ✅ Linting passed
- ✅ Tests passed

### Next: Pick a Task
1. **Read [AGENTS.md](AGENTS.md)** - Project instructions & conventions
2. **Check [docs/ROADMAP_5_PHASES.md](docs/ROADMAP_5_PHASES.md)** - See current phase
3. **Look at open issues** - Find something to work on

---

## 🎓 Essential Documents

| Document | Purpose | Size |
|----------|---------|------|
| [AGENTS.md](AGENTS.md) | Project instructions & conventions | 15 min read |
| [docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md) | What the app does | 10 min read |
| [docs/ROADMAP_5_PHASES.md](docs/ROADMAP_5_PHASES.md) | 5-phase roadmap | 10 min read |
| [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) | New dev setup | 5 min read |
| [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md) | Technical architecture | 20 min read |
| [docs/development/DEVELOPMENT.md](docs/development/DEVELOPMENT.md) | Coding patterns | 20 min read |
| [docs/GERMAN_BULGARIAN_GRAMMAR_GUIDE.md](docs/GERMAN_BULGARIAN_GRAMMAR_GUIDE.md) | Grammar rules | Reference |

---

## 🔥 Most Used Commands

```bash
# Start development
pnpm run dev

# Run all checks (before push)
pnpm run simulate-ci

# Run specific tests
pnpm run test:unit
pnpm run test:e2e
pnpm run test:components

# Build for production
pnpm run build

# Format code
pnpm run format
```

---

## ❓ When You Get Stuck

| Problem | Solution |
|---------|----------|
| "Port 5173 already in use" | `pkill -f "pnpm dev"` then `pnpm run dev` |
| "Dependencies not installed" | `rm -rf node_modules && pnpm install` |
| "TypeScript errors" | `pnpm run check` to see details |
| "Tests failing" | `pnpm run test:unit -- --reporter=verbose` |
| "Don't know what to do" | Read [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) |

---

## 📚 Documentation Structure

```
docs/
├── README.md ........................ Navigation hub
├── GETTING_STARTED.md .............. Developer setup
├── PROJECT_OVERVIEW.md ............. Project description
├── ROADMAP_5_PHASES.md ............. Complete roadmap
├── PHASE_1_IMPLEMENTATION_SPRINT.md  Phase 1 (reference)
├── PHASE_2_EXERCISE_SYSTEM.md ....... Phase 2 (ready-to-execute)
│
├── architecture/
│   ├── ARCHITECTURE.md ............. System design
│   ├── DATA_ARCHITECTURE.md ........ Data schemas
│   └── STATE_MANAGEMENT.md ......... State (Svelte 5 runes)
│
├── development/
│   ├── DEVELOPMENT.md .............. Coding patterns
│   └── TESTING.md .................. Test strategy
│
├── deployment/
│   ├── DEPLOYMENT.md ............... GitHub Pages setup
│   └── CI_CD.md .................... CI/CD pipeline
│
├── design/
│   ├── DESIGN_SYSTEM.md ............ Design tokens
│   └── ACCESSIBILITY.md ............ WCAG 2.1 AA
│
└── _archive/ ........................ Old docs (reference only)
    ├── README.md ................... Archive guide
    ├── historic-analysis/ .......... Research & planning
    ├── deprecated-phases/ .......... Old phase plans
    └── temporary-reports/ .......... Status reports
```

---

## ✅ Checklist - You're Ready If...

- ✅ Node.js and pnpm installed
- ✅ Repository cloned
- ✅ Dependencies installed (`pnpm install`)
- ✅ Dev server running (`pnpm run dev`)
- ✅ App visible at http://localhost:5173
- ✅ All checks pass (`pnpm run simulate-ci`)

---

## 🎯 Next Steps

1. **Start dev server**: `pnpm run dev`
2. **Read AGENTS.md**: Understand project conventions
3. **Pick a phase**: Review [docs/ROADMAP_5_PHASES.md](docs/ROADMAP_5_PHASES.md)
4. **Make a branch**: `git checkout -b feature/your-feature`
5. **Start coding**: Follow patterns in [docs/development/DEVELOPMENT.md](docs/development/DEVELOPMENT.md)
6. **Run tests**: `pnpm run simulate-ci` before pushing
7. **Push changes**: Create a PR

---

## 💡 Pro Tips

- 🔄 **HMR Magic**: Dev server hot-reloads - no need to restart
- 📝 **TypeScript First**: TypeScript strict mode is enabled
- 🧪 **Test Before Push**: Always run `pnpm run simulate-ci`
- 📚 **Read AGENTS.md**: It has all the project rules
- 🎓 **Learn by Doing**: Pick a small task and start coding

---

## 🤝 Need Help?

| Question | Answer |
|----------|--------|
| How do I run the app? | [GETTING_STARTED.md](docs/GETTING_STARTED.md) |
| What does this app do? | [PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md) |
| How is the code organized? | [ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md) |
| How do I write code? | [DEVELOPMENT.md](docs/development/DEVELOPMENT.md) |
| How do I test? | [TESTING.md](docs/development/TESTING.md) |
| What's the roadmap? | [ROADMAP_5_PHASES.md](docs/ROADMAP_5_PHASES.md) |
| Something is broken | Check [docs/_archive/deprecated-phases/](docs/_archive/deprecated-phases/) for known issues |

---

**You're all set! Happy coding! 🚀**

**Last Updated**: December 17, 2025  
**Status**: Production Ready
