<script lang="ts">
  // Get props using new Svelte 5 runes syntax
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
     
    console.log(`Count changed to: ${count}`);
    return () => {
       
      console.log(`Count effect cleanup`);
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
    border: 1px solid #eee;
    border-radius: 4px;
  }

  .shadow {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .highlight {
    background-color: #f5f5f5;
    border-left: 3px solid #4285f4;
  }

  button {
    padding: 0.5rem 1rem;
    background-color: #4285f4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 1rem;
  }

  button:hover {
    background-color: #3367d6;
  }

  .cta-button {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background-color: #34a853;
    color: white;
    text-decoration: none;
    border-radius: 4px;
  }

  .cta-button:hover {
    background-color: #2d9248;
  }
</style>