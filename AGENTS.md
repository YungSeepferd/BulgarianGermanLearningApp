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
- **Single Source of Truth**: `docs/PROJECT_STATUS.md` - Always check first (created Dec 19, 2025)
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

## 🛠️ MCP Tools for AI Agents

### Svelte MCP Server (CRITICAL - Use for ALL Svelte Work)

The official Svelte MCP server provides authoritative Svelte 5 and SvelteKit documentation. **ALWAYS use this for Svelte development.**

#### Available Tools:

**1. list-sections**
- Lists all available Svelte 5 and SvelteKit documentation sections
- **MUST call this FIRST** for any Svelte question or task
- Returns sections with "use_cases" field describing when each is relevant
- Example use cases: "runes", "state management", "components", "routing", etc.

```javascript
// Example: Get all available documentation sections
list-sections()
// Returns: List of sections with titles, use_cases, and paths
```

**2. get-documentation**
- Fetches full documentation content for specific sections
- Call AFTER analyzing list-sections output
- Can accept single section or array of sections
- **Best Practice**: Fetch ALL relevant sections at once

```javascript
// Example: Get documentation for Svelte 5 runes
get-documentation({ 
  section: ["$state", "$derived", "$effect", "$props"] 
})
```

**3. svelte-autofixer** (VALIDATION REQUIRED)
- Validates Svelte components for Svelte 5 best practices
- **MUST use before finalizing ANY .svelte file**
- Checks:
  - Svelte 5 runes patterns ($state, $derived, $effect, $props)
  - Accessibility (ARIA, semantic HTML, screen reader support)
  - Best practices (each block keys, tag closing, etc.)
  - Common pitfalls and anti-patterns
- Returns: issues, suggestions, and whether another call is needed

```javascript
// Example: Validate a component
svelte-autofixer({
  code: componentCode,
  desired_svelte_version: 5,
  filename: "MyComponent.svelte",
  async: false // true if component uses top-level await
})
```

**4. playground-link**
- Generates Svelte REPL playground links
- Use AFTER component is finalized and validated
- **Always ask user** if they want playground link before calling
- Supports multiple files and Tailwind CSS

```javascript
// Example: Create playground link
playground-link({
  name: "My Feature",
  tailwind: true,
  files: {
    "App.svelte": componentCode,
    "utils.js": utilityCode
  }
})
```

#### Svelte MCP Workflow (REQUIRED):

```
1. For ANY Svelte work → call list-sections FIRST
2. Analyze use_cases to identify relevant sections
3. Call get-documentation with ALL relevant sections at once
4. Write component code using official patterns
5. Validate with svelte-autofixer BEFORE finalizing
6. Fix ALL issues found (iterate if needed)
7. Run pnpm run check to verify TypeScript
8. Optionally offer playground link to user
```

#### When to Use Svelte MCP:

- ✅ Creating new .svelte components
- ✅ Refactoring existing components
- ✅ Debugging Svelte-specific issues
- ✅ Learning new Svelte 5 features
- ✅ Validating component best practices
- ✅ Before committing component changes
- ✅ When user asks about Svelte patterns

#### Example Usage:

```bash
# Step 1: Get available sections
list-sections()

# Step 2: Analyze output, identify relevant sections
# User wants to build interactive component → need: $state, $derived, $effect, events

# Step 3: Fetch ALL relevant documentation
get-documentation({ section: ["$state", "$derived", "$effect", "event-handlers"] })

# Step 4: Write component using patterns from docs

# Step 5: VALIDATE before finalizing
svelte-autofixer({
  code: myComponentCode,
  desired_svelte_version: 5,
  filename: "InteractiveCard.svelte"
})

# Step 6: Fix any issues found
# Step 7: Repeat validation if needed
# Step 8: Run pnpm run check
```

---

### Sequential Thinking MCP (for Complex Problem Solving)

Use for multi-step reasoning, planning, and complex analysis.

#### Available Tool:

**sequentialthinking**
- Breaks down complex problems into thought steps
- Supports iterative refinement and revision
- Can adjust total thoughts as understanding deepens
- Ideal for architecture decisions and debugging

#### Parameters:
- `thought`: Current thinking step (can revise previous thoughts)
- `nextThoughtNeeded`: Boolean - whether more thinking is needed
- `thoughtNumber`: Current thought number in sequence
- `totalThoughts`: Estimated total thoughts (can adjust up/down)
- `isRevision`: Boolean - whether this revises previous thinking
- `revisesThought`: Which thought number is being reconsidered
- `branchFromThought`: Branching point thought number
- `branchId`: Identifier for current branch
- `needsMoreThoughts`: If more thoughts needed at "end"

#### When to Use Sequential Thinking:

- ✅ Planning new feature architecture
- ✅ Analyzing Phase implementation strategy
- ✅ Debugging complex multi-file issues
- ✅ Evaluating trade-offs between approaches
- ✅ Breaking down large tasks into steps
- ✅ Refactoring complex systems
- ✅ Performance optimization analysis
- ✅ Design pattern selection

#### Sequential Thinking Workflow:

```
1. Identify complex problem requiring multi-step analysis
2. Start with initial estimate of needed thoughts
3. Break problem into logical reasoning steps
4. Generate hypothesis at key decision points
5. Verify hypothesis based on chain of thought
6. Revise previous thoughts if new insights emerge
7. Continue until satisfactory solution reached
8. Provide single, correct answer as final output
```

#### Example Usage:

```javascript
// Problem: Should we merge Vocabulary and Learn pages?
sequentialthinking({
  thought: "First, let's identify what each page currently does. Vocabulary page shows all words with search/filter. Learn page shows flashcards for active learning.",
  nextThoughtNeeded: true,
  thoughtNumber: 1,
  totalThoughts: 8
})

sequentialthinking({
  thought: "Next, let's analyze overlap. Both pages deal with vocabulary items. Both have practice features. This suggests potential for unification.",
  nextThoughtNeeded: true,
  thoughtNumber: 2,
  totalThoughts: 8
})

// ... continue through all thoughts ...

sequentialthinking({
  thought: "Final decision: Merge into unified Learning Hub with tabs for Browse, Practice, and Progress. This reduces navigation complexity and creates cohesive learning experience.",
  nextThoughtNeeded: false,
  thoughtNumber: 8,
  totalThoughts: 8
})
```

#### Best Practices:

1. **Start with clear problem statement**
2. **Use for problems requiring 5+ reasoning steps**
3. **Don't hesitate to revise earlier thoughts**
4. **Adjust totalThoughts if problem is more/less complex**
5. **Branch thinking for alternative approaches**
6. **Generate and verify hypotheses**
7. **Ignore irrelevant information**
8. **Provide single, clear answer at end**

---

### Playwright MCP (for Interactive Testing & Debugging)

Use for live browser interaction, testing, and debugging during development.

#### Available Tools:

**Browser Navigation & Interaction**:
- `browser_snapshot` - Take accessibility snapshot of current page
- `browser_tabs` - Manage tabs (list, new, close, select)
- `browser_run_code` - Execute Playwright code snippets
- `browser_close` - Close the current page

**Element Interaction**:
- `browser_evaluate` - Execute JavaScript on page or element
- `browser_drag` - Perform drag-and-drop operations
- `evaluate_script` - Run JavaScript function and return JSON results

**Testing & Debugging**:
- `browser_console_messages` - Get console logs/errors/warnings
- `browser_network_requests` - Monitor network activity
- `get_network_request` - Get specific request details by ID
- `browser_wait_for` - Wait for text to appear/disappear or time to pass

**File Operations**:
- `upload_file` - Upload files through file input elements

**Dialog Handling**:
- `handle_dialog` - Accept/dismiss browser dialogs (alert, confirm, prompt)

**Performance**:
- `performance_analyze_insight` - Analyze performance insights from traces

#### When to Use Playwright MCP:

**Interactive Development**:
- ✅ Testing new components in live browser
- ✅ Debugging UI behavior during development
- ✅ Verifying responsive design changes
- ✅ Testing user interactions (clicks, drags, forms)

**Debugging**:
- ✅ Inspecting console errors in browser
- ✅ Checking network requests/responses
- ✅ Verifying API integration
- ✅ Debugging async/timing issues

**Quality Assurance**:
- ✅ Validating accessibility (snapshots)
- ✅ Testing file upload functionality
- ✅ Verifying dialog handling
- ✅ Performance analysis

**Rapid Prototyping**:
- ✅ Quick component behavior validation
- ✅ Testing before writing formal tests
- ✅ Exploring edge cases interactively

#### Common Use Cases:

**1. Debug Console Errors**:
```javascript
// Get all console errors from browser
browser_console_messages({ level: "error" })
// Returns: Array of error messages with stack traces
```

**2. Monitor API Calls**:
```javascript
// Get all non-static network requests
browser_network_requests({ includeStatic: false })
// Returns: List of API calls with status codes

// Get specific request details
get_network_request({ reqid: 123 })
// Returns: Full request/response data
```

**3. Take Accessibility Snapshot**:
```javascript
// Capture current page structure
browser_snapshot()
// Returns: Accessibility tree with elements, roles, labels
```

**4. Test Interactive Elements**:
```javascript
// Execute JavaScript to interact with page
browser_evaluate({ 
  function: "() => { document.querySelector('.flashcard').click(); return document.querySelector('.flashcard').classList.contains('flipped'); }"
})
// Returns: true/false based on interaction result
```

**5. Test Drag-and-Drop**:
```javascript
// Drag one element onto another
browser_drag({
  startElement: "Vocabulary item",
  startRef: "vocab-item-123",
  endElement: "Practice zone",
  endRef: "practice-drop-zone"
})
```

**6. Wait for Dynamic Content**:
```javascript
// Wait for loading to complete
browser_wait_for({ text: "Vocabulary loaded", timeout: 5000 })

// Wait for text to disappear
browser_wait_for({ textGone: "Loading...", timeout: 3000 })

// Wait for specific time
browser_wait_for({ time: 2 }) // 2 seconds
```

**7. Test File Upload**:
```javascript
// Upload file through input element
upload_file({ 
  uid: "file-input-vocab", 
  filePath: "/path/to/vocabulary.json" 
})
```

**8. Handle Browser Dialogs**:
```javascript
// Accept a confirm dialog
handle_dialog({ action: "accept" })

// Dismiss an alert
handle_dialog({ action: "dismiss" })

// Enter text in prompt
handle_dialog({ action: "accept", promptText: "New vocabulary word" })
```

**9. Manage Browser Tabs**:
```javascript
// List all open tabs
browser_tabs({ action: "list" })

// Open new tab
browser_tabs({ action: "new" })

// Switch to tab by index
browser_tabs({ action: "select", index: 1 })

// Close current tab
browser_tabs({ action: "close" })
```

**10. Execute Custom Playwright Code**:
```javascript
// Run complex Playwright interactions
browser_run_code({ 
  code: `async (page) => {
    await page.getByRole('button', { name: 'Start Practice' }).click();
    await page.fill('input[placeholder="Your answer"]', 'Здравей');
    await page.click('button:has-text("Check")');
    return await page.textContent('.feedback');
  }`
})
```

#### Playwright MCP Workflow:

**Development Testing**:
```
1. Start dev server: pnpm run dev
2. Navigate to feature in browser
3. Take snapshot: browser_snapshot()
4. Interact: browser_evaluate() or browser_run_code()
5. Check console: browser_console_messages()
6. Monitor network: browser_network_requests()
7. Validate behavior
8. Write formal tests based on findings
```

**Debugging Issues**:
```
1. Reproduce issue in browser
2. Check console errors: browser_console_messages({ level: "error" })
3. Monitor network: browser_network_requests()
4. Take snapshot: browser_snapshot()
5. Execute diagnostic code: browser_evaluate()
6. Identify root cause
7. Fix and verify
```

**Testing New Features**:
```
1. Navigate to feature
2. Test interactions: browser_evaluate() or browser_drag()
3. Wait for results: browser_wait_for()
4. Verify state: browser_snapshot()
5. Check no errors: browser_console_messages()
6. Validate network calls: browser_network_requests()
```

#### Best Practices:

1. **Always check console messages** - Catch errors early
2. **Monitor network requests** - Verify API integration
3. **Use snapshots for validation** - Accessibility tree shows structure
4. **Wait for dynamic content** - Avoid race conditions
5. **Test interactively first** - Then write formal tests
6. **Use evaluate for complex logic** - Return results for validation
7. **Clean up tabs** - Close unused tabs to avoid confusion
8. **Handle dialogs promptly** - Dialogs block other operations

#### Example: Complete Feature Test Flow

```javascript
// 1. Take initial snapshot
const initialState = await browser_snapshot();

// 2. Interact with flashcard
await browser_evaluate({ 
  function: "() => document.querySelector('.flashcard-button').click()" 
});

// 3. Wait for animation
await browser_wait_for({ time: 0.5 });

// 4. Verify no console errors
const errors = await browser_console_messages({ level: "error" });
// Should be empty array

// 5. Check network activity
const requests = await browser_network_requests({ includeStatic: false });
// Verify expected API calls

// 6. Take final snapshot
const finalState = await browser_snapshot();
// Compare states to verify changes

// 7. Validate result
await browser_evaluate({ 
  function: "() => document.querySelector('.flashcard').classList.contains('flipped')" 
});
// Should return true
```

#### Integration with Testing Strategy:

**Playwright MCP complements formal tests**:
- Use for **rapid prototyping** and **interactive debugging**
- Write **formal Playwright tests** for CI/CD pipeline
- Use MCP tools to **develop test scenarios** interactively
- **Validate fixes** before running full test suite
- **Explore edge cases** that are hard to reproduce

**When to use each**:
- **Playwright MCP**: Interactive development, debugging, exploration
- **Unit Tests (Vitest)**: Business logic, utilities, pure functions
- **Component Tests**: Isolated component behavior
- **E2E Tests (Playwright)**: Critical user flows, CI/CD

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

## 🧹 Repository Maintenance Routine

**Documentation Organization Policy**

To maintain a clean and organized repository, follow these guidelines:

### File Location Rules

**Documentation Files** (`*.md`):
- **Project documentation**: `docs/` directory
- **Audit/validation reports**: `docs/audit/` directory  
- **Enrichment process docs**: `docs/enrichment/` directory
- **MCP configuration docs**: `docs/mcp/` directory
- **Architecture docs**: `docs/architecture/` directory
- **Development guides**: `docs/development/` directory

**Data/Report Files** (`*.json`, `*.csv`):
- **Validation reports**: `reports/` directory
- **Migration reports**: `reports/migration-reports/` directory
- **Vocabulary data**: `data/` directory
- **Enrichment output**: `enrichment-output/` directory

**Configuration Files**:
- **Build/config files**: Root directory (`.eslintrc`, `tsconfig.json`, etc.)
- **Script files**: Root directory (`*.sh` files)
- **VSCode settings**: Root directory

### Repository Cleanup Procedure

1. **Scan for misplaced files**
   ```bash
   find . -name "*.md" -not -path "./node_modules/*" -not -path "./.git/*"
   find . -name "*.json" -not -path "./node_modules/*" -not -path "./.git/*"
   ```

2. **Identify files in wrong locations**
   - Documentation files (`*.md`) should be in `docs/` subdirectories
   - Data/report files (`*.json`, `*.csv`) should be in `reports/` or appropriate data directories
   - Configuration files should stay in root directory

3. **Move files to correct locations**
   ```bash
   mv filename.md docs/appropriate-subdirectory/
   mv report.json reports/
   ```

4. **Update documentation references**
   - Update `docs/INDEX.md` with new file locations
   - Update `docs/README.md` with any changed references
   - Update any other files that reference moved documentation

5. **Verify cleanup**
   ```bash
   # Check root directory should only contain config files
   ls -la | grep -v "^d" | grep -v "\.git" | grep -v "node_modules"
   ```

### Documentation Update Workflow

1. **After moving files**, update all references:
   - `docs/INDEX.md` - Main documentation index
   - `docs/README.md` - Documentation hub
   - `docs/AGENTS.md` - Agent instructions
   - Any other files that reference documentation

2. **Use relative paths** for documentation links:
   ```markdown
   [Documentation](docs/filename.md)
   ```

3. **Keep documentation organized** by topic:
   - Architecture → `docs/architecture/`
   - Development → `docs/development/`
   - Testing → `docs/testing/`
   - Reports → `reports/`
   - Data → `data/`

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
