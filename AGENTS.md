# AI Agent Instructions - Bulgarian-German Learning App

**Last Updated**: December 16, 2025  
**Project Status**: Final Content Validation & Architecture Refinement  
**Current Focus**: Grammar accuracy validation, content verification, page architecture optimization  
**Tech Stack**: SvelteKit 2 + Svelte 5 + TypeScript + Tailwind v4

---

## 🎯 Project Overview

A **bilingual vocabulary learning application** for Bulgarian ↔ German with offline-first architecture, deployed to GitHub Pages.

### 🔍 Current Development Focus (December 16, 2025)

**Content Validation Priority**:
- **German Grammar Accuracy**: Verifying correct articles (der/die/das) for all 746 nouns
- **Declination Correctness**: Validating gender agreement and case usage
- **Bulgarian Grammar**: Checking definite article forms (-та/-ът/-то) and gender agreement
- **Category Accuracy**: Ensuring vocabulary items have correct semantic categories
- **Example Sentences**: Validating grammar in all German and Bulgarian examples

**Documentation Infrastructure**:
- **Single Source of Truth**: `docs/PROJECT_STATUS.md` - Always check first
- **Comprehensive Reports**: `docs/reports/` folder contains all phase completion summaries
- **Architecture Docs**: `docs/architecture/` for system design references
- **Testing Strategy**: `docs/development/TESTING.md` for test coverage requirements

**Architecture Analysis Priority**:
- **Vocabulary vs Learn Page Overlap**: Analyzing potential merger into unified learning hub
- **Word-Type Specifications**: Each part of speech (noun, verb, adjective, adverb) needs unique learning features
- **Learning Dashboard Design**: Creating type-specific learning experiences per vocabulary item

### Core Features
- **746 vocabulary items** with enriched definitions, examples, and cultural notes
- **Bidirectional learning**: DE→BG or BG→DE (user-controlled)
- **Bilingual UI**: Complete German and Bulgarian interface
- **Practice modes**: Flashcards, interactive practice, lessons
- **Grammar reference**: 12 Bulgarian grammar rules with examples
- **Offline-capable**: Static site with localStorage persistence
- **WCAG 2.1 AA compliant**: Full keyboard navigation and screen reader support

### Key Architectural Decisions
- **No backend** - All data bundled at build time
- **Svelte 5 Runes** - Modern reactivity with `$state`, `$derived`, `$effect`
- **Static-first** - Deployable to any CDN/static host
- **Type-safe** - TypeScript strict mode with Zod runtime validation
- **Design system** - 40+ CSS custom properties, consistent components

---

## 🚀 Quick Start Commands

### Development
```bash
# Install dependencies (ONLY use pnpm)
pnpm install

# Start dev server (HMR enabled)
pnpm run dev
# → http://localhost:5173

# Type checking + Svelte validation
pnpm run check

# Lint code
pnpm run lint

# Format code
pnpm run format
```

### Testing
```bash
# Run all checks before commit
pnpm run simulate-ci

# Unit tests (Vitest)
pnpm run test:unit

# Component tests (Playwright Component Testing)
pnpm run test:components

# End-to-end tests (Playwright)
pnpm run test:e2e

# Accessibility tests
pnpm run test:accessibility

# All tests
pnpm run test:all
```

### Building & Deployment
```bash
# Build for production
pnpm run build

# Build for GitHub Pages (with base path)
pnpm run build:gh-pages

# Preview production build
pnpm run preview

# Deploy to GitHub Pages (automatic via GitHub Actions)
git push origin main
```

---

## 📁 Project Structure

```
/Users/dinz/Coding Projects/BulgariaLearn/BulgarianApp-Fresh/
├── src/
│   ├── lib/
│   │   ├── components/       # UI components (Svelte 5 runes)
│   │   │   ├── ui/           # Atomic components (buttons, cards, modals)
│   │   │   ├── flashcard/    # Flashcard system
│   │   │   ├── practice/     # Practice mode components
│   │   │   └── layout/       # Layout wrappers
│   │   ├── data/             # Data loading & processing
│   │   │   ├── db.svelte.ts  # Vocabulary database (singleton)
│   │   │   └── loader.ts     # Data loader with caching
│   │   ├── schemas/          # Zod validation schemas
│   │   │   ├── vocabulary.ts # VocabularyItem schema
│   │   │   ├── lesson.ts     # Lesson schema
│   │   │   └── progress.ts   # Progress tracking schemas
│   │   ├── services/         # Business logic
│   │   │   ├── di-container.ts   # Dependency injection
│   │   │   ├── event-bus.ts      # Event-based communication
│   │   │   ├── errors.ts         # Error handling utilities
│   │   │   ├── progress.ts       # Progress tracking
│   │   │   └── search.ts         # Search functionality
│   │   ├── state/            # Global state (Svelte 5 runes)
│   │   │   ├── app-ui.svelte.ts   # UI state (search, filters, mode)
│   │   │   ├── app-data.svelte.ts # Persistent data (stats, favorites)
│   │   │   └── app.svelte.ts      # Backward-compatible facade
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Utility functions
│   ├── routes/               # SvelteKit file-based routing
│   │   ├── +page.svelte      # Home/Dashboard
│   │   ├── vocabulary/       # Vocabulary browser
│   │   ├── grammar/          # Grammar reference
│   │   ├── practice/         # Practice mode
│   │   └── learn/            # Flashcard learning
│   ├── paraglide/            # i18n translations
│   └── app.html              # Root HTML template
├── data/
│   └── unified-vocabulary.json   # 746 vocabulary items
├── static/                   # Static assets
├── tests/                    # Test files
│   ├── unit/                 # Vitest unit tests
│   ├── components/           # Playwright component tests
│   └── e2e/                  # Playwright E2E tests
├── docs/                     # Comprehensive documentation
│   ├── GETTING_STARTED.md    # 5-minute setup guide
│   ├── PROJECT_OVERVIEW.md   # What the app does
│   ├── architecture/         # System design docs
│   ├── development/          # Development guides
│   └── deployment/           # Deployment instructions
└── scripts/                  # Utility scripts
```

---

## 💻 Code Style Guidelines

### Svelte 5 Runes (Required)

**Always use Svelte 5 runes syntax** - No legacy stores or reactive statements:

```svelte
<script lang="ts">
  // ✅ Correct: Svelte 5 runes
  let count = $state(0);
  let doubled = $derived(count * 2);
  
  // Component props (REQUIRED)
  let { title = 'Default', items = [] } = $props();
  
  // Side effects with cleanup
  $effect(() => {
    const handler = () => console.log('resize');
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  });
  
  // ❌ Never use (legacy syntax)
  export let prop = 'value';  // Use $props() instead
  $: doubled = count * 2;      // Use $derived() instead
</script>
```

### TypeScript Strictness

```typescript
// ✅ Strict mode enabled - no 'any' allowed
function processItem(item: VocabularyItem): string {
  return item.german;
}

// ❌ Avoid
function processItem(item: any) {  // TypeScript error
  return item.german;
}

// Use type guards for narrowing
if (typeof value === 'string') {
  console.log(value.toUpperCase());
}
```

### State Management Pattern

```typescript
// ✅ Always use singleton appState
import { appState } from '$lib/state/app-state';

// Access UI state
console.log(appState.languageMode);  // 'DE_BG' | 'BG_DE'
console.log(appState.searchQuery);

// Access data state
console.log(appState.practiceStats);
console.log(appState.favorites);

// ❌ Never instantiate state classes directly
import { AppUIState } from '$lib/state/app-ui.svelte';
const state = new AppUIState();  // Don't do this!
```

### Component Organization

```typescript
// File extensions matter:
// - .svelte      → Component with markup (use Svelte 5 runes)
// - .svelte.ts   → Reactive logic/state (use Svelte 5 runes, export classes/functions)
// - .ts          → Pure utilities (no reactivity)
```

### Naming Conventions

- **Components**: PascalCase (`VocabularyCard.svelte`)
- **Files**: kebab-case (`app-state.ts`)
- **Functions**: camelCase (`handleClick`)
- **Constants**: UPPER_SNAKE_CASE (`APP_ICONS`)
- **Types**: PascalCase (`VocabularyItem`)

---

## 🧪 Testing Strategy

### Test Coverage Requirements

- **Unit tests**: 95% coverage target
- **Component tests**: 80% coverage target
- **E2E tests**: Critical user flows only
- **Accessibility**: WCAG 2.1 AA compliance (100%)

### Writing Tests

**Unit tests** (Vitest):
```typescript
// tests/unit/my-feature.test.ts
import { describe, it, expect } from 'vitest';

describe('Feature', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

**Component tests** (Playwright CT):
```typescript
// tests/components/MyComponent.test.ts
import { test, expect } from '@playwright/experimental-ct-svelte';
import MyComponent from '$lib/components/MyComponent.svelte';

test('renders correctly', async ({ mount }) => {
  const component = await mount(MyComponent, {
    props: { title: 'Test' }
  });
  await expect(component).toContainText('Test');
});
```

**E2E tests** (Playwright):
```typescript
// tests/e2e/vocabulary.test.ts
import { test, expect } from '@playwright/test';

test('can search vocabulary', async ({ page }) => {
  await page.goto('/vocabulary');
  await page.fill('input[type="search"]', 'Hallo');
  await expect(page.locator('.vocabulary-item')).toContainText('Здравей');
});
```

---

## 🔒 Security Considerations

### Data Validation

**Always validate external data with Zod**:

```typescript
import { UnifiedVocabularyItemSchema } from '$lib/schemas/vocabulary';

// ✅ Validate before use
try {
  const item = UnifiedVocabularyItemSchema.parse(rawData);
  // Safe to use
} catch (error) {
  console.error('Invalid vocabulary data:', error);
}

// ❌ Don't skip validation
const item = rawData as VocabularyItem;  // Unsafe!
```

### Content Security

- **No user-generated content** - All data pre-validated at build time
- **No external API calls** - Static data only
- **No authentication** - Public read-only application
- **LocalStorage sanitization** - Validate before loading persisted data

### Dependency Updates

```bash
# Check for security vulnerabilities
pnpm audit

# Update dependencies
pnpm update

# Always run tests after updates
pnpm run simulate-ci
```

---

## 📝 Commit Message Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code formatting (no logic change)
- **refactor**: Code restructuring (no behavior change)
- **perf**: Performance improvement
- **test**: Adding/updating tests
- **chore**: Build process, tooling

### Examples

```bash
git commit -m "feat(vocabulary): add enriched definitions from Langenscheidt"

git commit -m "fix(learn): flashcard not flipping on click

- Added isFlipped state to Learn page
- Replaced div with button for accessibility
- Added keyboard support (Enter/Space)

Fixes #42"

git commit -m "docs: update AGENTS.md with testing guidelines"
```

### Rules

1. **Keep subject line ≤ 50 characters**
2. **Use imperative mood** ("add" not "added" or "adds")
3. **Capitalize first letter**
4. **No period at end of subject**
5. **Separate subject and body with blank line**
6. **Wrap body at 72 characters**
7. **Reference issues**: `Fixes #123`, `Closes #456`

---

## 🚢 Deployment Instructions

### GitHub Pages (Automatic)

**Every push to `main` triggers deployment**:

1. Push changes to main:
   ```bash
   git push origin main
   ```

2. GitHub Actions workflow runs:
   - `pnpm run check` (TypeScript)
   - `pnpm run lint` (ESLint)
   - `pnpm run test:unit` (Vitest)
   - `pnpm run build:gh-pages` (Production build)
   - Deploy to `gh-pages` branch

3. Live site: https://yungseepferd.github.io/BulgarianGermanLearningApp/

### Manual Deployment

```bash
# Build with base path
pnpm run build:gh-pages

# Test locally
pnpm run preview

# Deploy manually
pnpm run deploy
```

### Environment Variables

No environment variables required - fully static build.

---

## 🐛 Common Issues & Solutions

### Issue: Port 5173 already in use

```bash
# Kill existing dev server
pkill -f "pnpm dev"

# Or use different port
PORT=5174 pnpm run dev
```

### Issue: TypeScript errors after dependency update

```bash
# Clear caches
rm -rf node_modules .svelte-kit .tsbuildinfo
pnpm install
pnpm run check
```

### Issue: Tests failing locally but passing in CI

```bash
# Run tests in CI mode
CI=true pnpm run test:all
```

### Issue: Vocabulary not loading

```bash
# Verify data file exists
ls -lh data/unified-vocabulary.json

# Rebuild
pnpm run build
```

---

## 📚 Key Documentation

### For New Developers
- **[docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)** - 5-minute setup guide
- **[docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md)** - What the app does
- **[docs/development/DEVELOPMENT.md](docs/development/DEVELOPMENT.md)** - Coding patterns

### For Architecture
- **[docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md)** - System design
- **[docs/architecture/DATA_ARCHITECTURE.md](docs/architecture/DATA_ARCHITECTURE.md)** - Data schemas

### For Testing
- **[docs/development/TESTING.md](docs/development/TESTING.md)** - Test strategy
- **[PHASE_4_ITERATIVE_TESTING_PLAN.md](PHASE_4_ITERATIVE_TESTING_PLAN.md)** - Manual testing guide

### For Deployment
- **[docs/deployment/DEPLOYMENT.md](docs/deployment/DEPLOYMENT.md)** - Deploy guide
- **[QUICK_START_DEPLOYMENT.md](QUICK_START_DEPLOYMENT.md)** - Quick deploy reference

### For Troubleshooting
- **[docs/DEBUGGING_GUIDE.md](docs/DEBUGGING_GUIDE.md)** - Common issues
- **[INDEX.md](INDEX.md)** - Complete documentation index

### For Grammar Validation
- **[docs/GERMAN_BULGARIAN_GRAMMAR_GUIDE.md](docs/GERMAN_BULGARIAN_GRAMMAR_GUIDE.md)** - Comprehensive grammar rules for both languages

---

## 🎓 Learning Resources

### Svelte 5
- **Official Docs**: https://svelte.dev/docs/svelte/overview
- **Runes Tutorial**: https://learn.svelte.dev/tutorial/introducing-runes
- **MCP Server**: Use `list-sections` → `get-documentation` for latest docs

### SvelteKit
- **Official Docs**: https://kit.svelte.dev/docs
- **Routing**: File-based with `+page.svelte`
- **Static Adapter**: `@sveltejs/adapter-static`

### Testing
- **Vitest**: https://vitest.dev/
- **Playwright**: https://playwright.dev/
- **Playwright CT**: https://playwright.dev/docs/test-components

---

## ⚠️ Critical Rules for AI Agents

### 🚨 NEVER Do This

1. **❌ Don't restart dev server** - It has HMR (Hot Module Reload)
   - Check if running: `lsof -nP -iTCP:5173 | grep LISTEN`
   - Ask user before restarting

2. **❌ Don't use legacy Svelte syntax**
   - No `export let prop`
   - No `$: reactive = statements`
   - No stores (use Svelte 5 runes)

3. **❌ Don't use `any` type**
   - TypeScript strict mode enabled
   - Use proper types or type guards

4. **❌ Don't skip data validation**
   - Always use Zod schemas for external data
   - Validate localStorage before loading

5. **❌ Don't create new state instances**
   - Always use singleton `appState`
   - Never `new AppUIState()`

### ✅ Always Do This

1. **✅ Run checks before committing**
   ```bash
   pnpm run simulate-ci
   ```

2. **✅ Validate data with Zod**
   ```typescript
   const item = UnifiedVocabularyItemSchema.parse(data);
   ```

3. **✅ Use singleton state**
   ```typescript
   import { appState } from '$lib/state/app-state';
   ```

4. **✅ Add tests for new features**
   - Unit tests (required)
   - Component tests (recommended)
   - E2E tests (for critical flows)

5. **✅ Update documentation**
   - Keep AGENTS.md current
   - Document breaking changes
   - Update architecture docs

---

## 🔧 Development Workflow

### Starting New Work

1. **Pull latest changes**
   ```bash
   git pull origin main
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

3. **Start dev server**
   ```bash
   pnpm run dev
   ```

4. **Make changes** (with HMR auto-reload)

### Before Committing

1. **Type check**
   ```bash
   pnpm run check
   ```

2. **Lint**
   ```bash
   pnpm run lint
   ```

3. **Test**
   ```bash
   pnpm run test:unit
   ```

4. **Full CI simulation**
   ```bash
   pnpm run simulate-ci
   ```

### Committing

1. **Stage changes**
   ```bash
   git add .
   ```

2. **Commit with conventional message**
   ```bash
   git commit -m "feat(scope): description"
   ```

3. **Push to remote**
   ```bash
   git push origin feature/my-feature
   ```

4. **Create Pull Request** on GitHub

---

## 📞 Support & Contact

- **Issues**: https://github.com/YungSeepferd/BulgarianGermanLearningApp/issues
- **Discussions**: Use GitHub Discussions
- **Documentation**: Start with [INDEX.md](INDEX.md)

---

**Version**: 2.0.0  
**Status**: Final Content Validation & Architecture Refinement  
**Last Updated**: December 16, 2025  
**Maintained By**: YungSeepferd

---

## 🎯 Quick Reference Card

```bash
# Daily commands
pnpm run dev              # Start dev server
pnpm run check            # Type check
pnpm run lint             # Lint code
pnpm run test:unit        # Unit tests
pnpm run simulate-ci      # Pre-commit checks

# Common tasks
pnpm run build            # Production build
pnpm run preview          # Preview build
pnpm run test:all         # All tests

# Data validation
pnpm run verify:vocabulary    # Check vocabulary
pnpm run quality:pipeline     # Run all data checks

# Troubleshooting
pkill -f "pnpm dev"           # Kill dev server
rm -rf node_modules .svelte-kit # Clean install
```

**Pro Tip**: Use `pnpm run` to see all available scripts!
pnpm run check            # Type check
pnpm run lint             # Lint code
pnpm run test:unit        # Unit tests
pnpm run simulate-ci      # Pre-commit checks

# Common tasks
pnpm run build            # Production build
pnpm run preview          # Preview build
pnpm run test:all         # All tests

# Data validation
pnpm run verify:vocabulary    # Check vocabulary
pnpm run quality:pipeline     # Run all data checks

# Troubleshooting
pkill -f "pnpm dev"           # Kill dev server
rm -rf node_modules .svelte-kit # Clean install
```

**Pro Tip**: Use `pnpm run` to see all available scripts!
