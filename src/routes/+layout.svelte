<script lang="ts">
  import Navigation from '$lib/components/Navigation.svelte';
  // Layout shell: no page-level logic needed here

  let { children } = $props();
</script>

<div class="app-layout">
  <Navigation />
  <main>
    {@render children()}
  </main>
</div>


<style>
  :global(html) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    font-size: 16px;
    line-height: 1.5;
    color: #333;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
  }

  .app-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    flex: 1;
    padding: 2rem;
    background-color: white;
  }

  @media (min-width: 769px) {
    main {
      max-width: 1200px;
      margin: 0 auto;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
  }
</style>