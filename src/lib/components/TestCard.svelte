<script lang="ts">
  // Get props using new Svelte 5 runes syntax
  import { logger } from '$lib/services/logger';

  const props = $props<{
    title: string;
    content: string;
    showShadow?: boolean;
    isHighlighted?: boolean;
    link?: string;
  }>();

  // Provide defaults for optional props
  let showShadow = $derived(props.showShadow ?? true);
  let isHighlighted = $derived(props.isHighlighted ?? false);
  let title = $derived(props.title);
  let content = $derived(props.content);
  let link = $derived(props.link);

  // Create local state using $state runes
  let count = $state(0);

  // Create derived/computed values with $derived
  let isEven = $derived(count % 2 === 0);

  // Create effects using $effect
$effect(() => {
     
    logger.debug('TestCard', `Count changed to: ${count}`);
    return () => {
       
      logger.debug('TestCard', 'Count effect cleanup');
    };
  });

  // Create a component function
  function increment() {
    count++;
  }
</script>

  <div class="card" class:shadow={showShadow} class:highlight={isHighlighted}>
    <h2>{title}</h2>
    <p>{content}</p>
    <p>Count: {count} ({isEven ? 'even' : 'odd'})</p>
    <button onclick={increment}>Increment</button>

    <!-- Card footer -->
    <div class="card-footer">
      <small>Card about: {title}</small>
    </div>

  {#if link}
    <!-- Link to page using standard attribute -->
    <a href={link} class="cta-button">Go to {title}</a>
  {/if}
</div>

<style>
  .card {
    padding: 1rem;
    margin: 1rem 0;
    border: 1px solid var(--border-default);
    border-radius: 4px;
  }

  .shadow {
    box-shadow: var(--shadow-md);
  }

  .highlight {
    background-color: var(--bg-surface);
    border-left: 3px solid var(--accent);
  }

  button {
    padding: 0.5rem 1rem;
    background-color: var(--accent);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 1rem;
  }

  button:hover {
    background-color: var(--accent-dim);
  }

  .cta-button {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background-color: var(--success);
    color: white;
    text-decoration: none;
    border-radius: 4px;
  }

  .cta-button:hover {
    background-color: #2d9248;
  }
</style>