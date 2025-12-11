# Svelte File Extension Rules

## 🎯 Purpose
This document establishes rules for proper Svelte file extension usage to ensure consistency and compatibility across the project.

---

## 📁 File Extension Guidelines

### **1. Standard Svelte Components**
- **Rule:** Use `.svelte` extension for all Svelte components
- **Format:** `<script lang="ts">` for TypeScript support
- **Example:**
  ```svelte
  <script lang="ts">
    // TypeScript code here
  </script>

  <!-- HTML markup here -->

  <style>
    /* CSS here */
  </style>
  ```

### **2. Svelte Runes Files (Reactive Logic)**
- **Rule:** Use `.svelte.ts` extension for reusable reactive logic using Svelte 5 runes
- **Purpose:** For creating stateful logic that can be imported into `.svelte` components
- **Example:**
  ```ts
  // state.svelte.ts
  export function createCounter() {
    let count = $state(0);
    return {
      get count() { return count; },
      increment: () => count++
    };
  }
  ```

### **3. Utility Files**
- **Rule:** Use `.ts` extension for non-component utility functions and logic
- **Purpose:** For pure TypeScript/JavaScript code without Svelte templating
- **Example:**
  ```ts
  // utils.ts
  export function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  ```

---

## 🔄 Conversion Rules

### **1. From `.svelte.ts` to `.svelte`**
- **When:** File contains component markup (HTML)
- **How:** Convert to `.svelte` file with `<script lang="ts">` block
- **Example Conversion:**
  ```ts
  // Before: counter.svelte.ts
  let count = $state(0);
  export const increment = () => count++;
  ```

  ```svelte
  <!-- After: counter.svelte -->
  <script lang="ts">
    let count = $state(0);
    export const increment = () => count++;
  </script>

  <button on:click={increment}>
    Count: {count}
  </button>
  ```

### **2. From `.ts` to `.svelte.ts`**
- **When:** File contains Svelte 5 runes but no markup
- **How:** Rename to `.svelte.ts` and ensure proper exports
- **Example Conversion:**
  ```ts
  // Before: state.ts
  export function createCounter() {
    let count = $state(0);
    return { count, increment: () => count++ };
  }
  ```

  ```ts
  // After: state.svelte.ts
  export function createCounter() {
    let count = $state(0);
    return { count, increment: () => count++ };
  }
  ```

---

## 🚫 Anti-Patterns

### **1. Incorrect Usage**
- ❌ `.svelte` files without `<script>` tag for logic
- ❌ `.ts` files using Svelte runes (`$state`, `$derived`, etc.)
- ❌ `.svelte.ts` files containing HTML markup
- ❌ Importing `.svelte` files as if they were `.ts` modules

### **2. Common Mistakes**
- ❌ Using TypeScript type annotations in `.svelte` files without `lang="ts"`
- ❌ Mixing component markup with pure logic in `.svelte.ts` files
- ❌ Forgetting to update import paths when changing file extensions

---

## ✅ Best Practices

### **1. Component Structure**
```svelte
<script lang="ts">
  // Imports
  import { onMount } from 'svelte';

  // State
  let count = $state(0);

  // Computed
  $: doubled = $derived(count * 2);

  // Methods
  function increment() {
    count++;
  }

  // Lifecycle
  onMount(() => {
    console.log('Component mounted');
  });
</script>

<!-- HTML markup -->
<button on:click={increment}>
  Count: {count}, Doubled: {doubled}
</button>

<style>
  button {
    padding: 0.5rem 1rem;
  }
</style>
```

### **2. Runes File Structure**
```ts
// state.svelte.ts
export function createTimer() {
  let time = $state(0);
  let interval: number | null = $state(null);

  function start() {
    if (interval) return;
    interval = window.setInterval(() => time++, 1000);
  }

  function stop() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }

  return {
    get time() { return time; },
    start,
    stop
  };
}
```

---

## 🔧 Tooling Support

### **1. ESLint Configuration**
Ensure your ESLint config includes rules for Svelte file extensions:

```json
{
  "overrides": [
    {
      "files": ["*.svelte"],
      "processor": "svelte3/svelte3"
    }
  ],
  "settings": {
    "svelte3/typescript": true
  }
}
```

### **2. TypeScript Configuration**
Update `tsconfig.json` to include Svelte files:

```json
{
  "compilerOptions": {
    "types": ["svelte"]
  },
  "include": ["src/**/*.svelte", "src/**/*.ts"]
}
```

### **3. Vite Configuration**
Ensure Vite is configured to handle Svelte files:

```js
// vite.config.js
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()]
});
```

---

## 📅 Maintenance Schedule

| Frequency   | Task |
|-------------|------|
| **Before each PR** | Verify file extensions follow these rules |
| **During refactoring** | Update file extensions as needed |
| **Quarterly** | Review and update rules based on Svelte ecosystem changes |

---

## 🔗 Related Documents
- [Tech Stack Rules](/.roo/rules/20-tech-stack.md)
- [Svelte 5 Best Practices](/.roo/rules/25-svelte5-best-practices.md)
- [Development Process Rules](/.roo/rules/40-development-process.md)
- [Workflow Rules](/.roo/rules/30-workflow.md)

---

## 🔄 Change Log

| Date | Author | Change |
|------|--------|--------|
| 2025-12-11 | Roo | Initial version |