<script lang="ts">
  import type { Example } from '$lib/schemas/unified-vocabulary';

  interface Props {
    example: Example;
  }

  let { example }: Props = $props();
</script>

<div class="example-card">
  <div class="example-text german">
    <span class="language-tag">DE</span>
    <p>{example.german}</p>
  </div>
  
  <div class="example-divider">
    <span class="arrow">→</span>
  </div>
  
  <div class="example-text bulgarian">
    <span class="language-tag">BG</span>
    <p>{example.bulgarian}</p>
  </div>

  {#if example.context}
    <div class="example-context">
      <span class="context-icon">💡</span>
      <p>{example.context}</p>
    </div>
  {/if}

  <!-- Future: Audio button -->
  <!-- <button class="audio-button" aria-label="Play example">
    <span class="audio-icon">🔊</span>
  </button> -->
</div>

<style>
  .example-card {
    padding: var(--spacing-4, 1rem);
    background-color: var(--bg-card);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
  }

  .example-card:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--accent);
  }

  .example-text {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-3, 0.75rem);
    margin-bottom: var(--spacing-3, 0.75rem);
  }

  .language-tag {
    flex-shrink: 0;
    padding: var(--spacing-1, 0.25rem) var(--spacing-2, 0.5rem);
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-radius: var(--radius-sm);
    background-color: var(--bg-elevated);
    color: var(--text-secondary);
  }

  .example-text.german .language-tag {
    background-color: var(--accent);
    opacity: 0.2;
    color: var(--accent);
  }

  .example-text.bulgarian .language-tag {
    background-color: var(--warning);
    opacity: 0.2;
    color: var(--warning);
  }

  .example-text p {
    flex: 1;
    margin: 0;
    font-size: 1rem;
    line-height: 1.6;
    color: var(--text-primary);
  }

  .example-divider {
    display: flex;
    align-items: center;
    margin: var(--spacing-2, 0.5rem) 0;
  }

  .arrow {
    font-size: 1.25rem;
    color: var(--text-secondary);
    margin-left: var(--spacing-8, 2rem);
  }

  .example-context {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-2, 0.5rem);
    padding: var(--spacing-3, 0.75rem);
    margin-top: var(--spacing-3, 0.75rem);
    background-color: var(--success);
    opacity: 0.1;
    border-left: 3px solid var(--success);
    border-radius: var(--radius-sm);
  }

  .context-icon {
    font-size: 1rem;
    flex-shrink: 0;
  }

  .example-context p {
    flex: 1;
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--text-secondary);
    font-style: italic;
  }

  @media (max-width: 640px) {
    .example-text {
      flex-direction: column;
      gap: var(--spacing-2, 0.5rem);
    }

    .arrow {
      margin-left: 0;
    }
  }
</style>
