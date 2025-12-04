# 🚀 Developer Onboarding Guide

Welcome to the Bulgarian-German Learning App! This guide will help you set up the project, understand the codebase, and start contributing effectively.

---

## 🛠️ Tech Stack Overview

| Technology       | Purpose                          | Documentation Link                     | Key Features |
|------------------|----------------------------------|----------------------------------------|--------------|
| **Svelte 5**     | Frontend framework               | [Svelte 5 Docs](https://svelte.dev/docs/svelte-5) | Runes (`$state`, `$derived`, `$effect`), reactivity |
| **SvelteKit**    | Full-stack framework             | [SvelteKit Docs](https://kit.svelte.dev/) | File-based routing, SSR/SSG, load functions |
| **TypeScript**   | Type-safe JavaScript             | [TypeScript Docs](https://www.typescriptlang.org/docs/) | Strict mode, Zod integration |
| **Zod**          | Runtime validation               | [Zod Docs](https://zod.dev/) | Schema validation, type inference |
| **Playwright**   | E2E testing                      | [Playwright Docs](https://playwright.dev/) | Cross-browser testing, axe-core integration |
| **Vitest**       | Unit testing                     | [Vitest Docs](https://vitest.dev/) | Fast unit tests, mocking |
| **Tailwind CSS** | Styling                          | [Tailwind Docs](https://tailwindcss.com/docs) | Utility-first CSS, responsive design |
| **bits-ui**      | Headless UI components           | [bits-ui Docs](https://bits-ui.com/) | Accessible, unstyled components |
| **shadcn-svelte**| Styled components                | [shadcn-svelte Docs](https://www.shadcn-svelte.com/) | Beautiful, customizable components |

---

## 📁 Project Structure

```
.
├── .github/                # GitHub workflows and issue templates
├── .roo/                   # Project configuration and rules
├── data/                   # Vocabulary and grammar data
├── docs/                   # Project documentation
│   ├── ARCHITECTURE.md     # Technical architecture
│   ├── DEVELOPER_ONBOARDING.md # This file
│   ├── ROADMAP_DETAILED.md # Detailed roadmap
│   └── ...                 # Other documentation files
├── scripts/                # Utility scripts
├── src/
│   ├── lib/
│   │   ├── components/     # Reusable UI components (Svelte 5)
│   │   │   ├── flashcard/  # Flashcard components
│   │   │   ├── gamification/ # Gamification components
│   │   │   └── ui/        # UI primitives (buttons, dialogs, etc.)
│   │   ├── data/          # Data loading and processing
│   │   ├── schemas/       # Zod schemas for validation
│   │   ├── state/         # Global state management (Svelte 5 Runes)
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   ├── routes/            # SvelteKit pages and routes
│   │   ├── +layout.svelte # Root layout
│   │   ├── +page.svelte   # Home page
│   │   ├── learn/         # Learning pages
│   │   ├── practice/      # Practice pages
│   │   └── ...            # Other routes
│   └── app.html           # Root HTML template
├── static/                # Static assets (images, fonts, etc.)
├── tests/                 # Test files
│   ├── accessibility/     # Accessibility tests
│   ├── components/        # Component tests
│   ├── e2e/               # End-to-end tests
│   └── unit/              # Unit tests
├── package.json           # Project dependencies and scripts
└── README.md              # Project overview and quick start
```

---

## 💻 Local Development Setup

### Prerequisites
- **Node.js**: 20+ (LTS recommended)
- **pnpm**: Install via `npm install -g pnpm`
- **Git**: Version control system

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd bulgarian-german-learning-app
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 📜 Development Workflow

### Key Commands
| Command | Description | Usage |
|---------|-------------|-------|
| `pnpm run dev` | Start local dev server | Development |
| `pnpm run build` | Build for production | Production build |
| `pnpm run preview` | Preview production build | Testing production build |
| `pnpm run test` | Run all tests | Testing |
| `pnpm run test:unit` | Run unit tests | Unit testing |
| `pnpm run test:accessibility` | Run accessibility tests | Accessibility testing |
| `pnpm run lint` | Run ESLint | Code quality |
| `pnpm run check` | Run Svelte/TypeScript checks | Type checking |

### Branching Strategy
- **`main`**: Production-ready code (protected)
- **`develop`**: Integration branch for features (protected)
- **Feature branches**: `feature/[description]` (e.g., `feature/accessibility-wcag-audit`)
- **Bugfix branches**: `fix/[description]` (e.g., `fix/flashcard-flip-bug`)
- **Documentation branches**: `docs/[description]` (e.g., `docs/onboarding-guide`)

### Pull Request Process
1. Create a feature branch from `develop`
2. Implement changes and commit with descriptive messages
3. Push changes to remote repository
4. Create a pull request to `develop`
5. Ensure all checks pass (tests, linting, type checking)
6. Request review from at least one team member
7. Address feedback and update PR
8. Merge after approval

---

## 🧪 Testing Workflow

### Test Types
| Test Type | Framework | Location | Purpose |
|-----------|-----------|----------|---------|
| Unit | Vitest | `tests/unit/` | Test individual functions and logic |
| Component | Playwright CT | `tests/components/` | Test UI components in isolation |
| E2E | Playwright | `tests/e2e/` | Test critical user flows |
| Accessibility | Playwright + axe-core | `tests/accessibility/` | Test WCAG 2.1 AA compliance |

### Running Tests
```bash
# Run all tests
pnpm run test:all

# Run specific test suites
pnpm run test:unit          # Unit tests
pnpm run test:components    # Component tests
pnpm run test:e2e           # End-to-end tests
pnpm run test:accessibility # Accessibility tests

# Run tests in watch mode
pnpm run test:unit:watch
```

### Adding Tests
1. **Unit Tests**: Add to `tests/unit/` with `.test.ts` extension
   ```typescript
   // Example: tests/unit/localStorage.test.ts
   import { describe, it, expect } from 'vitest';
   import { validateUserProgressStorage } from '$lib/schemas/localStorage';

   describe('LocalStorage Validation', () => {
     it('should validate valid user progress data', () => {
       const validData = { stats: [], favorites: [], recentSearches: [], lastUpdated: new Date().toISOString() };
       const result = validateUserProgressStorage(validData);
       expect(result.success).toBe(true);
     });
   });
   ```

2. **Component Tests**: Add to `tests/components/` with `.test.ts` extension
   ```typescript
   // Example: tests/components/FlashCard.test.ts
   import { test, expect } from '@playwright/experimental-ct-svelte';
   import FlashCard from '$lib/components/flashcard/FlashCard.svelte';

   test('FlashCard flips when clicked', async ({ mount }) => {
     const component = await mount(FlashCard, {
       props: { item: { german: 'Hallo', bulgarian: 'Здравей' } }
     });
     await expect(component).toContainText('Hallo');
     await component.click();
     await expect(component).toContainText('Здравей');
   });
   ```

3. **E2E Tests**: Add to `tests/e2e/` with `.test.ts` extension
   ```typescript
   // Example: tests/e2e/practiceFlow.test.ts
   import { test, expect } from '@playwright/test';

   test('Practice flow works correctly', async ({ page }) => {
     await page.goto('/practice');
     await expect(page).toHaveTitle(/Practice/);
     await page.click('text=Start Practice');
     await expect(page.locator('.flashcard')).toBeVisible();
   });
   ```

4. **Accessibility Tests**: Add to `tests/accessibility/` with `.test.ts` extension
   ```typescript
   // Example: tests/accessibility/flashCard.test.ts
   import { test, expect } from '@playwright/test';
   import { injectAxe, checkA11y } from 'axe-playwright';

   test('FlashCard has no accessibility violations', async ({ page }) => {
     await page.goto('/practice');
     await injectAxe(page);
     await checkA11y(page, {
       axeOptions: {
         rules: {
           'aria-allowed-attr': { enabled: true },
           'aria-required-attr': { enabled: true }
         }
       }
     });
   });
   ```

---

## 🔒 Type Safety & Validation

### Zod Schema Validation
All runtime data is validated using Zod schemas with TypeScript type inference.

**Example: Vocabulary Item Schema**
```typescript
// src/lib/schemas/vocabulary.ts
import { z } from 'zod';

export const VocabularyItemSchema = z.object({
  id: z.string(),
  type: z.enum(['word', 'rule']),
  bulgarian: z.string(),
  german: z.string(),
  difficulty: z.number().min(1).max(5),
  category: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export type VocabularyItem = z.infer<typeof VocabularyItemSchema>;
```

**Example: LocalStorage Validation**
```typescript
// src/lib/schemas/localStorage.ts
import { z } from 'zod';

export const UserProgressStorageSchema = z.object({
  stats: z.array(z.object({
    id: z.string(),
    correct: z.number(),
    incorrect: z.number(),
    lastPracticed: z.string().datetime()
  })),
  favorites: z.array(z.string()),
  recentSearches: z.array(z.string()),
  lastUpdated: z.string().datetime()
});

export function validateUserProgressStorage(data: unknown) {
  return UserProgressStorageSchema.safeParse(data);
}
```

### Type Guards
Use type guards for safe JSON parsing and runtime validation.

```typescript
// src/lib/utils/localStorage.ts
import { validateUserProgressStorage } from '$lib/schemas/localStorage';

export function getUserProgress(): UserProgress | null {
  const data = localStorage.getItem('userProgress');
  if (!data) return null;

  try {
    const parsedData = JSON.parse(data);
    const validationResult = validateUserProgressStorage(parsedData);

    if (!validationResult.success) {
      console.error('Invalid user progress data:', validationResult.error);
      return null;
    }

    return validationResult.data;
  } catch (error) {
    console.error('Error parsing user progress:', error);
    return null;
  }
}
```

---

## ♿ Accessibility Guidelines

### ARIA Attributes
All interactive components must include proper ARIA attributes.

| Component | ARIA Attribute | Purpose |
|-----------|----------------|---------|
| FlashCard | `aria-expanded` | Indicates flip state |
| Dialog | `aria-modal="true"` | Indicates modal dialog |
| Button | `aria-label` | Describes button purpose |
| Feedback | `aria-live="polite"` | Announces feedback messages |
| Loading | `aria-live="polite"` | Announces loading states |

**Example: Accessible FlashCard**
```svelte
<!-- src/lib/components/flashcard/FlashCard.svelte -->
<script lang="ts">
  import { $state } from 'svelte';
  let flipped = $state(false);

  function onFlip() {
    flipped = !flipped;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onFlip();
    }
  }
</script>

<div
  class="scene"
  role="button"
  tabindex="0"
  onclick={onFlip}
  onkeydown={handleKeydown}
  aria-label="Flashcard: {item.german}. Click or press Enter to flip."
  aria-expanded={flipped}
>
  <div class="card {flipped ? 'flipped' : ''}">
    <div class="card-face front">
      {item.german}
    </div>
    <div class="card-face back">
      {item.bulgarian}
    </div>
  </div>
</div>
```

### Keyboard Navigation
- **FlashCard**: Enter/Space to flip
- **Recommendations**: Arrow keys to navigate, Enter to select
- **All Buttons**: Keyboard accessible with proper focus management

### Focus Management
Use `$effect` for proper focus management in dynamic content.

```svelte
<script lang="ts">
  import { $state, $effect } from 'svelte';

  let open = $state(false);
  let triggerElement = $state<HTMLButtonElement | null>(null);

  $effect(() => {
    if (!open && triggerElement) {
      triggerElement.focus(); // Return focus when dialog closes
    }
  });
</script>
```

### Screen Reader Support
- Use `aria-live` regions for dynamic content changes
- Ensure all interactive elements have descriptive labels
- Test with screen readers (VoiceOver, NVDA, JAWS)

---

## 🚀 Svelte 5 Best Practices

### Runes Usage
| Rune | Purpose | Example |
|------|---------|---------|
| `$state` | Reactive state | `let count = $state(0);` |
| `$derived` | Derived values | `let double = $derived(count * 2);` |
| `$effect` | Side effects | `$effect(() => { console.log(count); });` |

**Example: Reactive State Management**
```svelte
<script lang="ts">
  let count = $state(0);
  let double = $derived(count * 2);

  $effect(() => {
    console.log(`Count changed to: ${count}`);
  });
</script>

<button onclick={() => count++}>
  Count: {count}, Double: {double}
</button>
```

### Event Handling
Use standard HTML event attributes instead of Svelte's `on:` directive.

**Legacy (Svelte 4):**
```svelte
<button on:click={handleClick}>Click</button>
```

**Svelte 5:**
```svelte
<button onclick={handleClick}>Click</button>
```

### Props with `$state`
Use `$state` for default prop values to make them reactive.

```svelte
<script lang="ts">
  let { open = $state(false) } = $props();
</script>
```

---

## 📊 Project Roadmap

### Current Priorities
1. **Accessibility**: Finalize WCAG 2.1 AA compliance
2. **Type Safety**: Extend Zod schemas to all runtime data
3. **Testing**: Expand test coverage (unit, component, E2E, accessibility)
4. **Performance**: Optimize bundle size and loading performance
5. **Internationalization**: Add i18n support for German/Bulgarian

### Upcoming Features
- **Spaced Repetition Algorithm**: Optimize learning with adaptive scheduling
- **Audio Pronunciation**: Add audio support for vocabulary items
- **Grammar Exercises**: Interactive grammar practice
- **User Accounts**: Sync progress across devices
- **Social Features**: Share progress with friends

---

## 🤝 Contributing

### Code Quality Standards
- **TypeScript**: Strict mode, no `any` types
- **Testing**: 100% test coverage for new features
- **Accessibility**: WCAG 2.1 AA compliant
- **Performance**: Optimized bundle size and rendering
- **Documentation**: Comprehensive and up-to-date

### Getting Help
- **Questions**: Ask in GitHub Discussions or Slack
- **Bug Reports**: Create a GitHub issue with reproduction steps
- **Feature Requests**: Create a GitHub issue with detailed proposal

---

## 🎯 Next Steps for New Contributors

1. **Set up the project** using the instructions above
2. **Run the tests** to ensure everything works
3. **Check the roadmap** for current priorities
4. **Pick an issue** from GitHub or create a new one
5. **Create a branch** and start coding!
6. **Submit a PR** and request a review

Welcome to the team! 🚀