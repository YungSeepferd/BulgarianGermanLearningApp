<script lang="ts">
  /**
   * SkeletonList - Loading placeholder for lists of items
   *
   * Shows multiple skeleton rows with configurable count
   */

  import SkeletonCard from './SkeletonCard.svelte';

  interface Props {
    count?: number;
    class?: string;
  }

  let { count = 5, class: className = '' }: Props = $props();
</script>

<div class="skeleton-list {className}" role="status" aria-label="Loading list">
  {#each Array(count) as _, i (i)}
    <SkeletonCard class="skeleton-list-item" />
  {/each}
</div>

<style>
  .skeleton-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-3, 0.75rem);
    width: 100%;
  }

  :global(.skeleton-list-item) {
    /* Inherits from SkeletonCard */
  }
</style>
