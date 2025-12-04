# Component Development Guidelines

## 1. Overview
This guide provides best practices for developing components in the Bulgarian-German Learning App using Svelte 5 Runes, TypeScript, and Tailwind CSS.

---

## 2. Component Structure

### 2.1 File Organization
```
src/lib/components/
├── [component-name]/
│   ├── [ComponentName].svelte  # Main component file
│   ├── index.ts                # Component exports
│   └── [ComponentName].test.ts # Component tests
```

### 2.2 Component Template
```svelte
<!-- src/lib/components/ui/button/Button.svelte -->
<script lang="ts">
  import { $state, $props } from 'svelte';
  import { cn } from '$lib/utils';

  // Props with default values
  let {
    variant = $state('default'),
    size = $state('medium'),
    disabled = $state(false)
  } = $props<{
    variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
  }>();

  // Derived state
  let buttonClass = $derived(cn(
    'button',
    `button-${variant}`,
    `button-${size}`,
    { 'button-disabled': disabled }
  ));
</script>

<!-- Accessible markup -->
<button
  class={buttonClass}
  disabled={disabled}
  onclick={handleClick}
  onkeydown={handleKeydown}
  aria-disabled={disabled}
>
  <slot />
</button>
```

---

## 3. Svelte 5 Runes Best Practices

### 3.1 State Management
**Use `$state` for reactive state:**
```svelte
<script lang="ts">
  let count = $state(0); // Reactive state
  let name = $state(''); // Reactive state
</script>
```

**Use `$derived` for computed values:**
```svelte
<script lang="ts">
  let count = $state(0);
  let double = $derived(count * 2); // Computed value
</script>
```

**Use `$effect` for side effects:**
```svelte
<script lang="ts">
  let count = $state(0);

  $effect(() => {
    console.log(`Count changed to: ${count}`);
    // Side effect logic here
  });
</script>
```

### 3.2 Props Management
**Use `$props` for component props:**
```svelte
<script lang="ts">
  let { variant = $state('default'), size = $state('medium') } = $props<{
    variant?: string;
    size?: string;
  }>();
</script>
```

**Type props with TypeScript:**
```svelte
<script lang="ts">
  let { item, flipped = $state(false) } = $props<{
    item: VocabularyItem;
    flipped?: boolean;
  }>();
</script>
```

### 3.3 Event Handling
**Use standard HTML event attributes:**
```svelte
<button onclick={handleClick} onkeydown={handleKeydown}>
  Click me
</button>
```

**Use callback props for custom events:**
```svelte
<!-- Child component -->
<script lang="ts">
  let { onanswer = () => {} } = $props<{
    onanswer?: (isCorrect: boolean) => void;
  }>();

  function checkAnswer() {
    const isCorrect = /* logic */;
    onanswer(isCorrect);
  }
</script>

<!-- Parent component -->
<QuizController onanswer={handleAnswer} />
```

---

## 4. Accessibility Guidelines

### 4.1 ARIA Attributes
**Always include appropriate ARIA attributes:**
```svelte
<div
  role="button"
  tabindex="0"
  aria-label="Flashcard: {item.german}"
  aria-expanded={flipped}
>
  <!-- content -->
</div>
```

### 4.2 Keyboard Navigation
**Ensure all interactive elements are keyboard accessible:**
```svelte
<script lang="ts">
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onFlip();
    }
  }
</script>

<div
  tabindex="0"
  onkeydown={handleKeydown}
>
  <!-- content -->
</div>
```

### 4.3 Focus Management
**Manage focus for dynamic content:**
```svelte
<script lang="ts">
  let open = $state(false);
  let triggerElement = $state<HTMLButtonElement | null>(null);
  let dialogElement = $state<HTMLElement | null>(null);

  $effect(() => {
    if (open && dialogElement) {
      dialogElement.focus();
    } else if (!open && triggerElement) {
      triggerElement.focus();
    }
  });
</script>
```

### 4.4 Live Regions
**Use `aria-live` for dynamic content:**
```svelte
<div class="feedback-section" aria-live="polite">
  {#if isCorrect}
    <p>Correct!</p>
  {:else}
    <p>Incorrect. The correct answer is: {correctAnswer}</p>
  {/if}
</div>
```

---

## 5. Styling Guidelines

### 5.1 Tailwind CSS
**Use Tailwind utility classes:**
```svelte
<div class="flex flex-col gap-4 p-4 rounded-lg bg-white shadow-md">
  <!-- content -->
</div>
```

**Use `cn` utility for conditional classes:**
```svelte
<script lang="ts">
  import { cn } from '$lib/utils';
</script>

<div class={cn('button', { 'button-active': isActive })}>
  <!-- content -->
</div>
```

### 5.2 Responsive Design
**Use responsive prefixes:**
```svelte
<div class="text-sm md:text-base lg:text-lg">
  Responsive text
</div>
```

**Use responsive breakpoints:**
```svelte
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- content -->
</div>
```

### 5.3 Dark Mode
**Use dark mode classes:**
```svelte
<div class="bg-white dark:bg-gray-800 text-black dark:text-white">
  <!-- content -->
</div>
```

---

## 6. Type Safety

### 6.1 TypeScript Integration
**Always use TypeScript in components:**
```svelte
<script lang="ts">
  // TypeScript types
  let count: number = $state(0);
  let items: VocabularyItem[] = $state([]);
</script>
```

**Use interfaces for props:**
```svelte
<script lang="ts">
  import type { VocabularyItem } from '$lib/types/vocabulary';

  let { item } = $props<{
    item: VocabularyItem;
  }>();
</script>
```

### 6.2 Zod Validation
**Validate props with Zod:**
```typescript
// src/lib/schemas/componentProps.ts
import { z } from 'zod';

export const FlashCardPropsSchema = z.object({
  item: VocabularyItemSchema,
  flipped: z.boolean().default(false)
});
```

**Use validation in components:**
```svelte
<script lang="ts">
  import { FlashCardPropsSchema } from '$lib/schemas/componentProps';

  let { item, flipped = $state(false) } = $props<z.infer<typeof FlashCardPropsSchema>>();

  $effect(() => {
    const result = FlashCardPropsSchema.safeParse({ item, flipped });
    if (!result.success) {
      console.error('Invalid props:', result.error);
    }
  });
</script>
```

---

## 7. Component Communication

### 7.1 Parent-Child Communication
**Props (Parent → Child):**
```svelte
<!-- Parent -->
<ChildComponent propValue={parentValue} />

<!-- Child -->
<script lang="ts">
  let { propValue } = $props();
</script>
```

**Events (Child → Parent):**
```svelte
<!-- Child -->
<script lang="ts">
  let { onEvent } = $props<{
    onEvent?: (data: EventData) => void;
  }>();

  function triggerEvent() {
    onEvent?.({ data: 'example' });
  }
</script>

<!-- Parent -->
<ChildComponent onEvent={handleEvent} />
```

**Two-way Binding:**
```svelte
<!-- Parent -->
<ChildComponent bind:value={parentValue} />

<!-- Child -->
<script lang="ts">
  let { value } = $props();
  let internalValue = $state(value);

  $effect(() => {
    value = internalValue; // Update parent when internal value changes
  });
</script>
```

### 7.2 Cross-Component Communication
**Global State:**
```typescript
// src/lib/state/app.svelte.ts
class AppState {
  count = $state(0);
  increment() { this.count++; }
}

export const appState = new AppState();
```

**Context API:**
```svelte
<!-- Parent -->
<script lang="ts">
  import { setContext } from 'svelte';

  let value = $state('shared value');
  setContext('sharedValue', value);
</script>

<!-- Child -->
<script lang="ts">
  import { getContext } from 'svelte';

  let value = $state(getContext<string>('sharedValue'));
</script>
```

---

## 8. Performance Optimization

### 8.1 Memoization
**Use `$derived` for expensive computations:**
```svelte
<script lang="ts">
  let items = $state<VocabularyItem[]>([]);
  let filteredItems = $derived(items.filter(item => item.difficulty > 3));
</script>
```

### 8.2 Lazy Loading
**Lazy load non-critical components:**
```svelte
<script lang="ts">
  import { $state } from 'svelte';

  let HeavyComponent = $state<typeof import('./HeavyComponent.svelte')>();

  async function loadComponent() {
    HeavyComponent = await import('./HeavyComponent.svelte');
  }
</script>

{#if HeavyComponent}
  <svelte:component this={HeavyComponent.default} />
{/if}
```

### 8.3 Virtual Scrolling
**Use virtual scrolling for large lists:**
```svelte
<script lang="ts">
  import { VirtualList } from '$lib/components/ui/virtual-list';
</script>

<VirtualList
  items={largeArray}
  itemSize={50}
  renderItem={(item) => (
    <div class="item">{item.name}</div>
  )}
/>
```

---

## 9. Testing Components

### 9.1 Unit Testing
**Test component logic:**
```typescript
// tests/unit/button.test.ts
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Button from '$lib/components/ui/button/Button.svelte';

describe('Button Component', () => {
  it('renders with default props', () => {
    const { getByText } = render(Button, { props: { children: 'Click' } });
    expect(getByText('Click')).toBeInTheDocument();
  });

  it('calls onclick handler when clicked', async () => {
    const handleClick = vi.fn();
    const { getByText } = render(Button, {
      props: { children: 'Click', onclick: handleClick }
    });

    await fireEvent.click(getByText('Click'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### 9.2 Component Testing
**Test component interactions:**
```typescript
// tests/components/Button.test.ts
import { test, expect } from '@playwright/experimental-ct-svelte';
import Button from '$lib/components/ui/button/Button.svelte';

test('Button renders and responds to click', async ({ mount }) => {
  const handleClick = vi.fn();
  const component = await mount(Button, {
    props: { children: 'Click', onclick: handleClick }
  });

  await expect(component).toContainText('Click');
  await component.click();
  expect(handleClick).toHaveBeenCalled();
});
```

### 9.3 Accessibility Testing
**Test accessibility attributes:**
```typescript
// tests/components/Button.test.ts
test('Button has proper accessibility attributes', async ({ mount }) => {
  const component = await mount(Button, {
    props: { children: 'Click', disabled: true }
  });

  await expect(component).toHaveAttribute('aria-disabled', 'true');
  await expect(component).toBeDisabled();
});
```

---

## 10. Component Documentation

### 10.1 Prop Documentation
**Document all component props:**
```svelte
<script lang="ts">
  /**
   * Button component
   *
   * @prop {string} [variant='default'] - Button variant (default, destructive, outline, ghost, link)
   * @prop {string} [size='medium'] - Button size (small, medium, large)
   * @prop {boolean} [disabled=false] - Whether button is disabled
   * @prop {Function} [onclick] - Click handler
   */
  let { variant = $state('default'), size = $state('medium') } = $props();
</script>
```

### 10.2 Storybook Integration
**Create stories for components:**
```typescript
// src/lib/components/ui/button/Button.stories.ts
import type { Meta, StoryObj } from '@storybook/svelte';
import Button from './Button.svelte';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'ghost', 'link']
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large']
    },
    disabled: { control: 'boolean' }
  }
} satisfies Meta<Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default Button'
  }
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true
  }
};
```

---

## 11. Component Lifecycle

### 11.1 Component Initialization
**Initialize component state:**
```svelte
<script lang="ts">
  import { $state, $effect } from 'svelte';

  let count = $state(0);

  $effect(() => {
    // Initialization logic
    console.log('Component initialized');

    return () => {
      // Cleanup logic
      console.log('Component destroyed');
    };
  });
</script>
```

### 11.2 State Updates
**React to state changes:**
```svelte
<script lang="ts">
  let count = $state(0);

  $effect(() => {
    console.log(`Count changed to: ${count}`);
  });
</script>
```

### 11.3 Prop Updates
**React to prop changes:**
```svelte
<script lang="ts">
  let { value } = $props();

  $effect(() => {
    console.log(`Value changed to: ${value}`);
  });
</script>
```

---

## 12. Best Practices Checklist

### 12.1 Component Checklist
- [ ] Component uses Svelte 5 Runes (`$state`, `$derived`, `$effect`)
- [ ] Component has proper TypeScript types
- [ ] Component is accessible (ARIA, keyboard navigation)
- [ ] Component has responsive design
- [ ] Component has dark mode support
- [ ] Component has proper documentation
- [ ] Component has tests (unit, component, accessibility)
- [ ] Component follows naming conventions
- [ ] Component uses Tailwind CSS effectively
- [ ] Component has proper error handling

### 12.2 Performance Checklist
- [ ] Component uses memoization for expensive computations
- [ ] Component lazy loads non-critical assets
- [ ] Component uses virtual scrolling for large lists
- [ ] Component minimizes re-renders
- [ ] Component uses efficient DOM updates

### 12.3 Accessibility Checklist
- [ ] Component has proper ARIA attributes
- [ ] Component is keyboard accessible
- [ ] Component has proper focus management
- [ ] Component has sufficient color contrast
- [ ] Component supports screen readers
- [ ] Component respects reduced motion preferences
- [ ] Component has proper labels and instructions

---

## 13. Component Examples

### 13.1 Button Component
```svelte
<!-- src/lib/components/ui/button/Button.svelte -->
<script lang="ts">
  import { $state, $props } from 'svelte';
  import { cn } from '$lib/utils';

  let {
    variant = $state('default'),
    size = $state('medium'),
    disabled = $state(false)
  } = $props<{
    variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
  }>();

  let buttonClass = $derived(cn(
    'button',
    `button-${variant}`,
    `button-${size}`,
    { 'button-disabled': disabled }
  ));

  function handleClick(e: MouseEvent) {
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // Handle click
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e as unknown as MouseEvent);
    }
  }
</script>

<button
  class={buttonClass}
  disabled={disabled}
  onclick={handleClick}
  onkeydown={handleKeydown}
  aria-disabled={disabled}
>
  <slot />
</button>
```

### 13.2 FlashCard Component
```svelte
<!-- src/lib/components/flashcard/FlashCard.svelte -->
<script lang="ts">
  import { $state, $props } from 'svelte';
  import type { VocabularyItem } from '$lib/types/vocabulary';

  let { item, flipped = $state(false) } = $props<{
    item: VocabularyItem;
    flipped?: boolean;
  }>();

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

### 13.3 Dialog Component
```svelte
<!-- src/lib/components/ui/dialog/Dialog.svelte -->
<script lang="ts">
  import { $state, $props, $effect } from 'svelte';
  import { Dialog as DialogPrimitive } from 'bits-ui';

  let { open = $state(false) } = $props<{
    open?: boolean;
  }>();

  let triggerElement = $state<HTMLButtonElement | null>(null);
  let dialogElement = $state<HTMLElement | null>(null);

  $effect(() => {
    if (open && dialogElement) {
      dialogElement.focus();
    } else if (!open && triggerElement) {
      triggerElement.focus();
    }
  });
</script>

<DialogPrimitive.Root bind:open>
  <DialogPrimitive.Trigger bind:this={triggerElement}>
    <slot name="trigger" />
  </DialogPrimitive.Trigger>

  <DialogPrimitive.Content bind:this={dialogElement} tabindex="-1">
    <slot />
  </DialogPrimitive.Content>
</DialogPrimitive.Root>
```

---

## 14. Future Enhancements

### 14.1 Component Library
- Create a comprehensive component library
- Document all components with Storybook
- Add prop validation and documentation
- Implement component theming

### 14.2 Advanced Patterns
- Implement compound components
- Create higher-order components
- Develop render props pattern
- Implement component composition

### 14.3 Performance Improvements
- Implement server-side rendering
- Add progressive hydration
- Optimize component updates
- Reduce bundle size

### 14.4 Accessibility Enhancements
- Add more ARIA patterns
- Improve screen reader support
- Enhance keyboard navigation
- Add more accessibility tests