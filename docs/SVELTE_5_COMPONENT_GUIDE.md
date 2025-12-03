# Svelte 5 Component Guide: `bits-ui` & `shadcn-svelte`

This guide provides best practices for integrating `bits-ui` and `shadcn-svelte` in a Svelte 5 project using Runes.

## 1. Core Concepts with Svelte 5 Runes

Svelte 5's Runes (`$state`, `$derived`, `$effect`) fundamentally change how reactivity is managed, making state management more explicit and powerful.

- **`$state`**: Use for all mutable component state. It's the foundation of reactivity.
- **`$derived`**: Use for computed values that depend on one or more `$state` variables. This is highly optimized.
- **`$effect`**: Use for side effects, such as logging, data fetching, or interacting with the DOM, in response to state changes.

## 2. Best Practices for `bits-ui`

`bits-ui` provides unstyled, accessible component primitives. With Svelte 5, you can wrap them in your own components to manage state cleanly.

### Example: A Reusable Dialog Component

Let's create a reusable `Dialog` component that encapsulates `bits-ui` logic and state.

**File: `src/lib/components/ui/dialog/Dialog.svelte`**
```svelte
<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui";

  let { open = $state(false) } = $props();

  function onOpenChange(v: boolean) {
    open = v;
  }
</script>

<DialogPrimitive.Root bind:open={open} onOpenChange={onOpenChange}>
  <slot {open} />
</DialogPrimitive.Root>
```

**Usage:**
```svelte
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';

  let isOpen = $state(false);
</script>

<Dialog bind:open={isOpen}>
  <DialogTrigger>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Svelte 5 Dialog</DialogTitle>
    </DialogHeader>
    <p>This dialog's state is managed with `$state`!</p>
  </DialogContent>
</Dialog>
```

**Key Principles:**
- **State Ownership**: The parent component owns the `open` state (`isOpen`).
- **`bind:open`**: Two-way binding keeps the parent and the `Dialog` primitive in sync.
- **Props with `$state`**: Default prop values can be reactive using `$state`.

## 3. Integrating `shadcn-svelte`

`shadcn-svelte` builds upon `bits-ui` and provides beautifully styled components. Its `cn()` utility works perfectly with Svelte 5's reactivity.

### Example: Dynamic Button Variants

You can dynamically change component styles based on state.

```svelte
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";

  let count = $state(0);

  let buttonVariant = $derived(count > 5 ? "destructive" : "default");
</script>

<Button
  variant={buttonVariant}
  onclick={() => count++}
>
  Count: {count}
</Button>

<p>Button becomes destructive when count is greater than 5.</p>
```

**Key Principles:**
- **`$derived` for Styles**: Use `$derived` to compute class names or variants based on state. This is more efficient than inline ternary operators in markup for complex logic.
- **`cn()` Utility**: Continue using the `cn()` utility from `tailwind-variants` and `tailwind-merge` to conditionally apply classes without conflicts.

## 4. Performance Optimization

- **Prefer `$derived` for Computations**: `$derived` is memoized. The calculation only re-runs when its dependencies change. This is perfect for filtering lists, formatting text, or computing styles.
- **Use `$effect` for Side Effects**: Keep side effects out of your rendering logic. `$effect` is the correct place for them. For example, focusing an element when a dialog opens.

```svelte
<script lang="ts">
  import { Dialog, DialogContent, DialogTrigger } from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  
  let open = $state(false);
  let triggerElement = $state<HTMLButtonElement | null>(null);

  $effect(() => {
    if (!open && triggerElement) {
      triggerElement.focus();
    }
  });
</script>

<Dialog bind:open>
  <DialogTrigger>
    <Button bind:this={triggerElement}>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <p>When this closes, the button will be focused.</p>
  </DialogContent>
</Dialog>
```

This guide provides a solid foundation for building robust, reactive, and performant UIs with `bits-ui`, `shadcn-svelte`, and Svelte 5.

## 5. Portaling and Transitions

In `bits-ui` v1+, components like `Dialog`, `Popover`, and `Tooltip` no longer automatically portal their content to the `document.body`. This can cause z-index and overflow issues.

**Solution**: Explicitly use the `Portal` component.

The `dialog-content.svelte` component has been refactored to include this pattern:

**File: `src/lib/components/ui/dialog/dialog-content.svelte`**
```svelte
<script lang="ts">
  // ... imports
  import DialogPortal from "./dialog-portal.svelte";
  import DialogOverlay from "./dialog-overlay.svelte";
  // ...
</script>

<DialogPortal>
  <DialogOverlay />
  <DialogPrimitive.Content {...$$props}>
    {@render children()}
    <DialogPrimitive.Close>
      <X />
    </DialogPrimitive.Close>
  </DialogPrimitive.Content>
</DialogPortal>
```

### Handling Transitions with `forceMount`

Svelte transitions require an element to be in the DOM to work correctly. If a component is conditionally rendered with an `{#if}` block, transitions may not work as expected.

While `bits-ui` doesn't expose `forceMount` on the `Content` component directly, you can achieve the same effect by controlling the component's presence in the DOM from the parent.

**Example:**
```svelte
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Dialog, DialogContent, DialogTrigger } from '$lib/components/ui/dialog';
  let open = $state(false);
</script>

<Dialog bind:open>
  <DialogTrigger><Button>Open</Button></DialogTrigger>
  {#if open}
    <DialogContent transition={fly} transitionConfig={{ y: 8, duration: 150 }}>
      <p>I am transitioned!</p>
    </DialogContent>
  {/if}
</Dialog>
```

By wrapping the `DialogContent` in an `{#if open}` block, you ensure it's in the DOM when the transition needs to run, effectively replicating the purpose of `forceMount`.

## 6. Modern Event Handling in Svelte 5

Svelte 5 moves away from `createEventDispatcher` and the `on:` directive in favor of a more explicit and type-safe approach using callback props.

### From `createEventDispatcher` to Callback Props

Instead of dispatching events, components now accept functions as props to handle events.

**Legacy Pattern (`createEventDispatcher`)**
```svelte
<!-- Child.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>
<button on:click={() => dispatch('notify', { message: 'Hello' })}>Notify</button>
``````svelte
<!-- Parent.svelte -->
<script lang="ts">
  import Child from './Child.svelte';
</script>
<Child on:notify={(e) => alert(e.detail.message)} />
```

**Svelte 5 Pattern (Callback Props)**
```svelte
<!-- Child.svelte -->
<script lang="ts">
  let { onnotify = () => {} } = $props<{
    onnotify?: (detail: { message: string }) => void;
  }>();
</script>
<button onclick={() => onnotify({ message: 'Hello' })}>Notify</button>
``````svelte
<!-- Parent.svelte -->
<script lang="ts">
  import Child from './Child.svelte';
  function handleNotify(detail: { message: string }) {
    alert(detail.message);
  }
</script>
<Child onnotify={handleNotify} />
```

### From `on:` Directive to `onclick` Attribute

DOM events are now handled using the standard HTML `onclick`, `oninput`, etc., attributes. This improves consistency with standard web platform features.

**Legacy:** `<button on:click={handleClick}>`
**Svelte 5:** `<button onclick={handleClick}>`

This change makes Svelte components feel more like plain HTML and JavaScript, simplifying the learning curve and improving readability.