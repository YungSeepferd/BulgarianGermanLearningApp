<script lang="ts">
 let { children } = $props();
</script>

<main>
 {#render children()}
</main>

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

  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    background-color: white;
    min-height: 100vh;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
</style>