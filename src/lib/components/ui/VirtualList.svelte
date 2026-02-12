<script lang="ts">
  /**
   * VirtualList - High-performance virtual scrolling list
   *
   * Only renders visible items for large lists using native Svelte 5.
   * This is a lightweight implementation without external dependencies.
   */

  import type { Snippet } from 'svelte';

  interface Props<T> {
    items: T[];
    itemHeight: number;
    overscan?: number;
    children: Snippet<[T, number]>;
    class?: string;
    height?: number;
  }

  let {
    items,
    itemHeight,
    overscan = 5,
    children,
    class: className = '',
    height = 500
  }: Props<unknown> = $props();

  // Scroll position
  let scrollTop = $state(0);

  // Calculate visible range
  const visibleRange = $derived.by(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + height) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  });

  // Visible items
  const visibleItems = $derived(
    items.slice(visibleRange.startIndex, visibleRange.endIndex).map((item, i) => ({
      item,
      index: visibleRange.startIndex + i
    }))
  );

  // Total height for scrollbar
  const totalHeight = $derived(items.length * itemHeight);

  // Handle scroll
  function handleScroll(e: Event) {
    const target = e.target as HTMLElement;
    scrollTop = target.scrollTop;
  }
</script>

<div
  class="virtual-list {className}"
  style="height: {height}px; overflow-y: auto;"
  onscroll={handleScroll}
>
  <div style="height: {totalHeight}px; position: relative;">
    {#each visibleItems as { item, index }}
      <div
        class="virtual-item"
        style="position: absolute; top: {index * itemHeight}px; height: {itemHeight}px; width: 100%;"
      >
        {@render children(item, index)}
      </div>
    {/each}
  </div>
</div>

<style>
  .virtual-list {
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .virtual-item {
    contain: layout style paint;
    will-change: transform;
  }

  /* Smooth scrolling */
  @media (prefers-reduced-motion: no-preference) {
    .virtual-list {
      scroll-behavior: smooth;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .virtual-list {
      scroll-behavior: auto;
    }
  }
</style>