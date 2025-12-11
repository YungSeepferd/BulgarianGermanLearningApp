# Svelte 5 Best Practices

## 🎯 Purpose
This document establishes comprehensive best practices for Svelte 5 development, focusing on leveraging the new runes reactivity system, TypeScript integration, component design principles, and project structure. These rules ensure clean, maintainable, and performant code across the project.

## 📚 Staying Current with Svelte 5 Syntax

To ensure you're using the latest Svelte 5 syntax and SvelteKit APIs:
- Use the Svelte MCP server (local via `@sveltejs/mcp`):
  - `list-sections` → discover relevant documentation sections
  - `get-documentation` → fetch full documentation content
  - `svelte-autofixer` → validate Svelte components before merge
- Always prefer current Svelte 5 patterns (components, runes, and APIs) over legacy syntax
- Consult the official Svelte docs when implementing new features

---

## 🧩 I. Runes and Reactivity

### **1. Embrace Runes for Explicit Reactivity**
- **Rule:** Use Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`) instead of legacy reactivity syntax in all new components
- **Constraint:** Avoid using `$:` reactive statements in new code
- **Reasoning:** Runes make reactivity explicit, portable, and easier to understand

**✅ Good:**
```svelte
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>
```

**❌ Bad:**
```svelte
<script lang="ts">
  let count = 0;
  $: doubled = count * 2;
</script>
```

### **2. State Management with `$state`**
- **Rule:** Use `let variable = $state(initialValue)` for all reactive state
- **Constraint:** Never use `export let` for internal component state
- **Best Practice:** Group related state variables together

**✅ Good:**
```svelte
<script lang="ts">
  let isLoading = $state(false);
  let items = $state<Item[]>([]);
  let error = $state<string | null>(null);
</script>
```

### **3. Computed Values with `$derived`**
- **Rule:** Use `$derived` for values computed from other reactive state
- **Constraint:** Avoid using `$derived` for complex computations that could be memoized
- **Best Practice:** Use `$derived.by` for expensive computations

**✅ Good:**
```svelte
<script lang="ts">
  let items = $state<Item[]>([]);
  let filteredItems = $derived(items.filter(item => item.active));
  let totalValue = $derived.by(() => {
    return items.reduce((sum, item) => sum + item.value, 0);
  });
</script>
```

### **4. Side Effects with `$effect`**
- **Rule:** Use `$effect` for side effects that need to synchronize with state
- **Constraint:** Always return a cleanup function to prevent memory leaks
- **Best Practice:** Use `$effect.pre` for effects that need to run before DOM updates

**✅ Good:**
```svelte
<script lang="ts">
  let position = $state({ x: 0, y: 0 });

  $effect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      position = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  });
</script>
```

### **5. Props Declaration with `$props`**
- **Rule:** Use `let { prop1, prop2 } = $props()` to declare component props
- **Constraint:** Never use `export let` for props in new components
- **Best Practice:** Destructure props with default values

**✅ Good:**
```svelte
<script lang="ts">
  let { items = [], title = 'Default Title' } = $props();
</script>
```

### **6. Two-Way Binding with `$bindable`**
- **Rule:** Use `$bindable` for props that need two-way binding
- **Constraint:** Only use when parent-child synchronization is required
- **Best Practice:** Make bindable props explicit

**✅ Good:**
```svelte
<script lang="ts">
  let { value = $bindable('') } = $props();
</script>

<input bind:value />
```

### **7. Avoid Unnecessary Effects**
- **Rule:** Only use `$effect` when necessary
- **Constraint:** Prefer `$derived` or component composition over effects
- **Best Practice:** Consider if the effect can be solved with derived state

**✅ Good (derived state):**
```svelte
<script lang="ts">
  let items = $state<Item[]>([]);
  let hasItems = $derived(items.length > 0);
</script>
```

**❌ Bad (unnecessary effect):**
```svelte
<script lang="ts">
  let items = $state<Item[]>([]);
  let hasItems = $state(false);

  $effect(() => {
    hasItems = items.length > 0;
  });
</script>
```

---

## 💻 II. Code Style and TypeScript

### **1. TypeScript Everything**
- **Rule:** Write all code in TypeScript with strict mode enabled
- **Constraint:** No `any` types allowed; use `unknown` for dynamic data
- **Best Practice:** Enable `strict: true` in `tsconfig.json`

**✅ Good:**
```ts
interface User {
  id: string;
  name: string;
  email: string;
}
```

**❌ Bad:**
```ts
type User = any;
```

### **2. Consistent Naming Conventions**
- **Rule:** Use PascalCase for component names and camelCase for variables/functions
- **Constraint:** Follow TypeScript naming conventions for types/interfaces
- **Best Practice:** Use descriptive, meaningful names

| Type | Convention | Example |
|------|------------|---------|
| Component | PascalCase | `UserProfile.svelte` |
| Variable | camelCase | `isLoading` |
| Function | camelCase | `fetchUserData` |
| Interface | PascalCase | `UserProfileProps` |
| Type | PascalCase | `UserRole` |
| Constant | UPPER_CASE | `MAX_RETRIES` |

### **3. Prefer Interfaces for Complex Types**
- **Rule:** Use interfaces for defining complex data structures and props
- **Constraint:** Use types for simple unions, intersections, and primitives
- **Best Practice:** Extend interfaces for component props

**✅ Good:**
```ts
interface UserProfileProps {
  user: User;
  showEmail?: boolean;
  onUpdate?: (user: User) => void;
}
```

### **4. Functional Programming Patterns**
- **Rule:** Favor functional and declarative programming patterns
- **Constraint:** Avoid unnecessary classes; use functions for state management
- **Best Practice:** Use pure functions for data transformations

**✅ Good:**
```ts
function filterActiveItems(items: Item[]): Item[] {
  return items.filter(item => item.active);
}
```

**❌ Bad:**
```ts
class ItemFilter {
  filterActive(items: Item[]) {
    return items.filter(item => item.active);
  }
}
```

### **5. Descriptive Naming**
- **Rule:** Use clear, descriptive variable and function names
- **Constraint:** Avoid abbreviations unless widely understood
- **Best Practice:** Use boolean prefixes for boolean variables

**✅ Good:**
```ts
let isUserAuthenticated = $state(false);
let hasCompletedOnboarding = $state(false);
let activeItemsCount = $derived(items.filter(item => item.active).length);
```

**❌ Bad:**
```ts
let auth = $state(false);
let onb = $state(false);
let cnt = $state(0);
```

### **6. Code Formatting**
- **Rule:** Maintain consistent code style using Prettier and ESLint
- **Constraint:** Use project-wide configuration files
- **Best Practice:** Format code before committing

**.prettierrc.json:**
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "svelteSortOrder": "options-scripts-markup-styles",
  "svelteStrictMode": true,
  "svelteBracketNewLine": true,
  "plugins": ["prettier-plugin-svelte"]
}
```

### **7. Type Safety in Components**
- **Rule:** Always type component props, state, and functions
- **Constraint:** Use TypeScript generics for complex component patterns
- **Best Practice:** Create type definitions for component APIs

**✅ Good:**
```svelte
<script lang="ts">
  interface ListProps<T> {
    items: T[];
    renderItem: (item: T) => string;
    keyExtractor: (item: T) => string;
  }

  let { items, renderItem, keyExtractor } = $props<ListProps<Item>>();
</script>
```

---

## 🏗️ III. Component Design and Structure

### **1. Single Responsibility Principle**
- **Rule:** Design components to do one thing well
- **Constraint:** Break large components into smaller, reusable subcomponents
- **Best Practice:** Keep components focused on specific functionality

**✅ Good:**
```svelte
<!-- UserProfile.svelte -->
<script lang="ts">
  let { user } = $props();
</script>

<div class="user-profile">
  <UserAvatar src={user.avatar} />
  <UserInfo name={user.name} email={user.email} />
  <UserActions />
</div>
```

### **2. Modularization**
- **Rule:** Prefer modularization over code duplication
- **Constraint:** Move complex logic into shared utility functions
- **Best Practice:** Create reusable utility functions in `src/lib/utils/`

**✅ Good:**
```ts
// src/lib/utils/date.ts
export function formatDate(date: Date, format: 'short' | 'long' = 'short'): string {
  // Implementation
}
```

### **3. Project Structure (SvelteKit)**
- **Rule:** Follow SvelteKit's file-based routing and project structure
- **Constraint:** Maintain consistent organization across the project
- **Best Practice:** Group related functionality together

```
src/
├── lib/
│   ├── components/      # Reusable UI components
│   ├── state/           # Global state management
│   ├── utils/           # Utility functions
│   ├── services/        # Business logic and services
│   ├── types/           # TypeScript type definitions
│   └── data/            # Data management
├── routes/
│   ├── +page.svelte     # Page components
│   ├── +layout.svelte   # Layout components
│   └── [slug]/          # Dynamic routes
└── app.css              # Global styles
```

### **4. Scoped CSS**
- **Rule:** Use component-scoped CSS with `<style>` tags
- **Constraint:** Avoid global CSS unless absolutely necessary
- **Best Practice:** Use CSS variables for theming

**✅ Good:**
```svelte
<style>
  .button {
    padding: 0.5rem 1rem;
    background: var(--primary-color);
    color: white;
    border-radius: 4px;
  }

  .button:hover {
    background: var(--primary-dark);
  }
</style>
```

### **5. Minimize Client-Side Logic**
- **Rule:** Favor server-side rendering (SSR) and server components
- **Constraint:** Limit client-only logic to browser-specific APIs
- **Best Practice:** Use SvelteKit's `+page.server.ts` for data loading

**✅ Good:**
```ts
// src/routes/+page.server.ts
export async function load() {
  const users = await db.query.users.findMany();
  return { users };
}
```

### **6. Accessibility (A11y)**
- **Rule:** Ensure proper semantic HTML and ARIA attributes
- **Constraint:** Support keyboard navigation for interactive elements
- **Best Practice:** Use Svelte's built-in accessibility warnings

**✅ Good:**
```svelte
<button
  on:click={handleClick}
  aria-label="Close dialog"
  aria-disabled={isDisabled}
>
  ×
</button>

<!-- Keyboard accessible navigation -->
<div role="navigation" aria-label="Main navigation">
  <a href="/" on:keydown={handleKeyDown}>Home</a>
  <a href="/about" on:keydown={handleKeyDown}>About</a>
</div>
```

### **7. Component Composition**
- **Rule:** Use slots for flexible component composition
- **Constraint:** Avoid prop drilling; use context or slots instead
- **Best Practice:** Create compound components for complex UIs

**✅ Good:**
```svelte
<!-- Card.svelte -->
<div class="card">
  <div class="card-header">
    <slot name="header" />
  </div>
  <div class="card-content">
    <slot />
  </div>
  <div class="card-footer">
    <slot name="footer" />
  </div>
</div>

<!-- Usage -->
<Card>
  <div slot="header">Card Title</div>
  <p>Card content goes here</p>
  <div slot="footer">
    <button>Action</button>
  </div>
</Card>
```

---

## 📦 IV. State Management

### **1. Local vs. Global State**
- **Rule:** Use local component state for component-specific data
- **Constraint:** Use global state only when data needs to be shared across components
- **Best Practice:** Prefer local state with prop drilling for simple cases

**✅ Good (local state):**
```svelte
<script lang="ts">
  let count = $state(0);
  let isExpanded = $state(false);
</script>
```

### **2. Global State with Runes**
- **Rule:** Use Svelte 5 runes for global state management
- **Constraint:** Avoid legacy `svelte/store` unless working with legacy code
- **Best Practice:** Create state management classes in `.svelte.ts` files

**✅ Good:**
```ts
// src/lib/state/user.svelte.ts
export class UserState {
  user = $state<User | null>(null);
  isAuthenticated = $derived(!!this.user);

  login(userData: User) {
    this.user = userData;
  }

  logout() {
    this.user = null;
  }
}

export const userState = new UserState();
```

### **3. State Persistence**
- **Rule:** Use localStorage for client-side persistence
- **Constraint:** Only persist essential data
- **Best Practice:** Create utility functions for state persistence

**✅ Good:**
```ts
// src/lib/utils/localStorage.ts
export function persistState<T>(key: string, state: T): void {
  localStorage.setItem(key, JSON.stringify(state));
}

export function loadState<T>(key: string, defaultValue: T): T {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
}
```

### **4. State Synchronization**
- **Rule:** Use `$effect` for synchronizing state with external systems
- **Constraint:** Always clean up effects to prevent memory leaks
- **Best Practice:** Use derived state for computed values

**✅ Good:**
```svelte
<script lang="ts">
  let items = $state<Item[]>([]);

  $effect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'items') {
        items = JSON.parse(e.newValue || '[]');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  });
</script>
```

---

## 🧪 V. Testing and Quality

### **1. Component Testing**
- **Rule:** Test components in isolation
- **Constraint:** Use `@testing-library/svelte` for component testing
- **Best Practice:** Test user interactions, not implementation details

**✅ Good:**
```ts
// src/lib/components/Button.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import Button from './Button.svelte';

test('calls onClick when button is clicked', async () => {
  const { component } = render(Button, { props: { onClick: vi.fn() } });
  const button = screen.getByRole('button');

  await fireEvent.click(button);
  expect(component.onClick).toHaveBeenCalled();
});
```

### **2. Unit Testing**
- **Rule:** Test utility functions and business logic
- **Constraint:** Use Vitest for unit testing
- **Best Practice:** Test edge cases and error conditions

**✅ Good:**
```ts
// src/lib/utils/date.test.ts
import { formatDate } from './date';

test('formats date correctly', () => {
  const date = new Date('2023-01-15');
  expect(formatDate(date, 'short')).toBe('1/15/2023');
  expect(formatDate(date, 'long')).toBe('January 15, 2023');
});
```

### **3. End-to-End Testing**
- **Rule:** Test critical user flows with Playwright
- **Constraint:** Use `@playwright/test` for E2E testing
- **Best Practice:** Test authentication, navigation, and key features

**✅ Good:**
```ts
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can login and logout', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'user@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('.user-profile')).toContainText('user@example.com');

  await page.click('button:has-text("Logout")');
  await expect(page).toHaveURL('/');
});
```

### **4. Code Quality Tools**
- **Rule:** Use ESLint and Prettier for consistent code quality
- **Constraint:** Enforce code quality in CI pipeline
- **Best Practice:** Configure rules for Svelte 5 and TypeScript

**.eslintrc.cjs:**
```js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'svelte'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:svelte/recommended',
    'prettier'
  ],
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    }
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    'svelte/no-at-html-tags': 'warn',
    'svelte/no-reactive-functions': 'error',
    'svelte/no-reactive-literals': 'error'
  }
};
```

---

## 🚀 VI. Performance Optimization

### **1. Lazy Loading**
- **Rule:** Use SvelteKit's lazy loading for non-critical components
- **Constraint:** Load heavy components only when needed
- **Best Practice:** Use dynamic imports for large components

**✅ Good:**
```svelte
<script lang="ts">
  let HeavyComponent = $state<typeof import('$lib/components/Heavy.svelte')>();

  async function loadHeavyComponent() {
    HeavyComponent = await import('$lib/components/Heavy.svelte');
  }
</script>

{#if HeavyComponent}
  <svelte:component this={HeavyComponent.default} />
{:else}
  <button on:click={loadHeavyComponent}>Load Component</button>
{/if}
```

### **2. Memoization**
- **Rule:** Use `$derived.by` for expensive computations
- **Constraint:** Avoid unnecessary recalculations
- **Best Practice:** Memoize derived state that depends on multiple variables

**✅ Good:**
```svelte
<script lang="ts">
  let items = $state<Item[]>([]);
  let filter = $state('');

  let filteredItems = $derived.by(() => {
    return items.filter(item =>
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  });
</script>
```

### **3. Virtual Lists**
- **Rule:** Use virtual lists for large datasets
- **Constraint:** Implement virtual scrolling for lists with > 100 items
- **Best Practice:** Use existing virtual list components

**✅ Good:**
```svelte
<script lang="ts">
  import { VirtualList } from '$lib/components/VirtualList.svelte';

  let items = $state<Item[]>(Array(1000).fill(0).map((_, i) => ({ id: i, name: `Item ${i}` })));
</script>

<VirtualList {items} itemSize={50} height={500}>
  {#snippet renderItem({ item })}
    <div class="item">{item.name}</div>
  {/snippet}
</VirtualList>
```

### **4. Image Optimization**
- **Rule:** Optimize images for web performance
- **Constraint:** Use modern image formats (WebP, AVIF)
- **Best Practice:** Implement responsive images with `srcset`

**✅ Good:**
```svelte
<img
  src="/images/photo.jpg"
  srcset="/images/photo-400.webp 400w,
          /images/photo-800.webp 800w,
          /images/photo-1200.webp 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="Description"
  loading="lazy"
/>
```

### **5. Bundle Analysis**
- **Rule:** Analyze bundle size regularly
- **Constraint:** Keep bundle size under 200KB for initial load
- **Best Practice:** Use `@sveltejs/enhanced-img` for image optimization

**✅ Good:**
```bash
# Install bundle analyzer
pnpm add -D rollup-plugin-visualizer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    svelte(),
    visualizer({
      emitFile: true,
      filename: 'stats.html'
    })
  ]
});
```

---

## 📚 VII. Documentation

### **1. Component Documentation**
- **Rule:** Document all components with JSDoc
- **Constraint:** Include props, slots, and events documentation
- **Best Practice:** Use Svelte's `<script context="module">` for component docs

**✅ Good:**
```svelte
<script lang="ts" context="module">
  /**
   * Button component with various styles and sizes
   *
   * @slot default - Button content
   * @slot icon - Icon to display alongside text
   *
   * @example
   * ```svelte
   * <Button variant="primary" size="medium">Click me</Button>
   * ```
   */
</script>

<script lang="ts">
  /**
   * Button variants
   * @typedef {'primary' | 'secondary' | 'danger' | 'ghost'} ButtonVariant
   */

  /**
   * Button sizes
   * @typedef {'small' | 'medium' | 'large'} ButtonSize
   */

  /**
   * @type {{
   *   variant?: ButtonVariant;
   *   size?: ButtonSize;
   *   disabled?: boolean;
   *   onClick?: () => void;
   * }}
   */
  let { variant = 'primary', size = 'medium', disabled = false } = $props();
</script>
```

### **2. Storybook Integration**
- **Rule:** Use Storybook for component documentation and testing
- **Constraint:** Document all reusable components in Storybook
- **Best Practice:** Include interactive examples and controls

**✅ Good:**
```ts
// src/lib/components/Button.stories.ts
import type { Meta, StoryObj } from '@storybook/svelte';
import Button from './Button.svelte';

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger', 'ghost']
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large']
    },
    disabled: { control: 'boolean' },
    onClick: { action: 'clicked' }
  }
} satisfies Meta<Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button'
  }
};

export const Disabled: Story = {
  args: {
    variant: 'secondary',
    disabled: true,
    children: 'Disabled Button'
  }
};
```

### **3. API Documentation**
- **Rule:** Document all public APIs and services
- **Constraint:** Use TypeDoc for TypeScript API documentation
- **Best Practice:** Generate API docs automatically

**✅ Good:**
```bash
# Install TypeDoc
pnpm add -D typedoc typedoc-plugin-markdown

# Add typedoc.json
{
  "entryPoints": ["src/lib"],
  "out": "docs/api",
  "plugin": ["typedoc-plugin-markdown"],
  "readme": "none"
}

# Add script to package.json
{
  "scripts": {
    "docs:api": "typedoc"
  }
}
```

---

## 🔧 VIII. Tooling and Configuration

### **1. TypeScript Configuration**
- **Rule:** Configure TypeScript for Svelte 5 development
- **Constraint:** Enable strict mode and proper module resolution
- **Best Practice:** Include Svelte types in `tsconfig.json`

**tsconfig.json:**
```json
{
  "extends": "@tsconfig/svelte/tsconfig.json",
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["svelte"]
  },
  "include": [
    "src/**/*.d.ts",
    "src/**/*.ts",
    "src/**/*.js",
    "src/**/*.svelte"
  ],
  "exclude": ["node_modules"]
}
```

### **2. Vite Configuration**
- **Rule:** Configure Vite for optimal Svelte 5 development
- **Constraint:** Use `@sveltejs/vite-plugin-svelte` with proper settings
- **Best Practice:** Enable hot module replacement and prebundling

**vite.config.ts:**
```ts
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { enhancedImages } from '@sveltejs/enhanced-img';

export default defineConfig({
  plugins: [
    enhancedImages(),
    svelte({
      compilerOptions: {
        runes: true
      }
    })
  ],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
      }
    }
  }
});
```

### **3. SvelteKit Configuration**
- **Rule:** Configure SvelteKit for optimal performance
- **Constraint:** Enable SSR and proper adapter settings
- **Best Practice:** Configure static adapter for deployment

**svelte.config.js:**
```js
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      $lib: 'src/lib',
      $components: 'src/lib/components'
    }
  }
};

export default config;
```

### **4. Playwright Configuration**
- **Rule:** Configure Playwright for E2E testing
- **Constraint:** Use proper test match patterns
- **Best Practice:** Configure multiple browsers and viewports

**playwright.config.ts:**
```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI
  }
});
```

---

## 📅 IX. Maintenance and Enforcement

### **1. Code Reviews**
- **Rule:** Conduct thorough code reviews for all changes
- **Constraint:** Enforce Svelte 5 best practices in reviews
- **Best Practice:** Use checklist for Svelte 5 specific items

**Code Review Checklist:**
- [ ] Runes used correctly (`$state`, `$derived`, `$effect`)
- [ ] TypeScript types are complete and accurate
- [ ] Component follows single responsibility principle
- [ ] State management is appropriate (local vs. global)
- [ ] Accessibility requirements are met
- [ ] Performance considerations addressed
- [ ] Proper file extensions used (`.svelte`, `.svelte.ts`, `.ts`)
- [ ] Documentation is complete and accurate

### **2. Continuous Integration**
- **Rule:** Enforce Svelte 5 best practices in CI pipeline
- **Constraint:** Fail builds on linting and type errors
- **Best Practice:** Run tests and bundle analysis in CI

**.github/workflows/ci.yml:**
```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Run linting
        run: pnpm lint

      - name: Run type checking
        run: pnpm check

      - name: Run unit tests
        run: pnpm test:unit

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Build project
        run: pnpm build
```

### **3. Regular Audits**
- **Rule:** Conduct regular code audits for Svelte 5 compliance
- **Constraint:** Schedule quarterly audits of the codebase
- **Best Practice:** Use automated tools to identify anti-patterns

**Audit Checklist:**
- [ ] Identify legacy reactivity patterns (`$:`, `export let`)
- [ ] Check for proper runes usage
- [ ] Verify TypeScript strict mode compliance
- [ ] Review component structure and modularization
- [ ] Assess state management patterns
- [ ] Evaluate performance optimizations
- [ ] Check documentation completeness

### **4. Dependency Updates**
- **Rule:** Keep Svelte and related dependencies up to date
- **Constraint:** Update dependencies monthly
- **Best Practice:** Test updates in a staging environment first

**Dependency Update Process:**
1. Check for outdated dependencies: `pnpm outdated`
2. Update dependencies: `pnpm up`
3. Run tests: `pnpm test`
4. Test application manually
5. Commit changes with detailed changelog

---

## 🔄 X. Migration Strategy

### **1. Legacy Code Migration**
- **Rule:** Migrate legacy code to Svelte 5 runes incrementally
- **Constraint:** Don't break existing functionality during migration
- **Best Practice:** Use feature flags for gradual migration

**Migration Steps:**
1. **Assessment:** Identify components using legacy reactivity
2. **Planning:** Create migration plan with priorities
3. **Testing:** Set up comprehensive test coverage
4. **Migration:** Convert one component at a time
5. **Validation:** Test thoroughly after each conversion
6. **Cleanup:** Remove legacy code after full migration

### **2. Migration Tools**
- **Rule:** Use codemods for automated migration where possible
- **Constraint:** Review automated changes manually
- **Best Practice:** Create custom codemods for project-specific patterns

**Example Codemod:**
```bash
# Install jscodeshift
pnpm add -D jscodeshift

# Create migration script
npx jscodeshift -t migrate-svelte-5.js src/lib/components
```

### **3. Migration Guidelines**
- **Rule:** Follow consistent migration patterns
- **Constraint:** Document migration decisions
- **Best Practice:** Create migration guide for the team

**Migration Patterns:**

**1. Legacy State to Runes:**
```svelte
<!-- Before -->
<script lang="ts">
  export let count = 0;
  $: doubled = count * 2;
</script>

<!-- After -->
<script lang="ts">
  let { count = 0 } = $props();
  let doubled = $derived(count * 2);
</script>
```

**2. Legacy Stores to Runes:**
```svelte
<!-- Before -->
<script lang="ts">
  import { writable } from 'svelte/store';
  const count = writable(0);
</script>

<!-- After -->
<script lang="ts">
  let count = $state(0);
</script>
```

**3. Legacy Effects to Runes:**
```svelte
<!-- Before -->
<script lang="ts">
  import { onMount } from 'svelte';
  let data = [];

  onMount(async () => {
    data = await fetchData();
  });
</script>

<!-- After -->
<script lang="ts">
  let data = $state([]);

  $effect(() => {
    fetchData().then(result => {
      data = result;
    });
  });
</script>
```

---

## 🔗 XI. Related Documents
- [Svelte File Extension Rules](/.roo/rules/15-svelte-file-extensions.md)
- [Tech Stack Rules](/.roo/rules/20-tech-stack.md)
- [Development Process Rules](/.roo/rules/40-development-process.md)
- [Workflow Rules](/.roo/rules/30-workflow.md)
- [Documentation Maintenance Rules](/.roo/rules/95-documentation-maintenance.md)

---

## 🔄 XII. Change Log

| Date | Author | Change |
|------|--------|--------|
| 2025-12-11 | Roo | Initial version |
| YYYY-MM-DD | Name | Description of change |