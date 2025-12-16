<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';
  import type { VocabularyItem } from '$lib/types/vocabulary';

  let { item, examples: propExamples } = $props<{ item: VocabularyItem, examples?: any[] }>();

  let currentIndex = $state(0);
  let examples = $derived(propExamples || item.examples || []);
  let hasExamples = $derived(examples.length > 0);

  function next() {
    if (currentIndex < examples.length - 1) {
      currentIndex++;
    } else {
      currentIndex = 0;
    }
  }

  function prev() {
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      currentIndex = examples.length - 1;
    }
  }
</script>

{#if hasExamples}
  <div class="example-carousel">
    <div class="carousel-content">
      <div class="example-card">
        <p class="german">{examples[currentIndex].german}</p>
        <p class="bulgarian">{examples[currentIndex].bulgarian}</p>
        {#if examples[currentIndex].context}
          <p class="context">({examples[currentIndex].context})</p>
        {/if}
      </div>
    </div>

    {#if examples.length > 1}
      <div class="controls">
        <Button variant="ghost" size="icon" onclick={prev} aria-label="Previous example">
          <ChevronLeft size={16} />
        </Button>
        <span class="indicator">{currentIndex + 1} / {examples.length}</span>
        <Button variant="ghost" size="icon" onclick={next} aria-label="Next example">
          <ChevronRight size={16} />
        </Button>
      </div>
    {/if}
  </div>
{/if}

<style>
  .example-carousel {
    margin-top: 1rem;
    background-color: var(--color-surface-alt);
    border-radius: var(--radius-md);
    padding: 1rem;
    border: 1px solid var(--color-border);
  }

  .example-card {
    text-align: center;
  }

  .german {
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 0.25rem;
  }

  .bulgarian {
    color: var(--color-text-secondary);
    font-style: italic;
  }

  .context {
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
    margin-top: 0.25rem;
  }

  .controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .indicator {
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
  }
</style>
