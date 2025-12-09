<script lang="ts">
  import TestCard from '$lib/components/TestCard.svelte';

  // Using Svelte 5 features - reactive state
  let grammarRules = $state([
    { rule: "Present Tense", example: "Az kaza - I say", description: "Standard present tense conjugation" },
    { rule: "Past Tense", example: "Kazah - I said", description: "Standard past tense conjugation" },
    { rule: "Future Tense", example: "Shte kazam - I will say", description: "Future tense with 'shte' + present" }
  ]);

  // Search functionality with reactive state
  let searchTerm = $state('');

  // Using $derived for computed/reactive values
  let filteredRules = $derived(
    searchTerm.length > 0
      ? grammarRules.filter(rule =>
          rule.rule.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rule.example.toLowerCase().includes(searchTerm.toLowerCase()))
      : grammarRules
  );

  // Show examples flag
  let showExamples = $state(true);

  // Toggle examples functionality
  function toggleExamples() {
    showExamples = !showExamples;
  }

  // Add more examples
  let loading = $state(false);
  async function loadMoreExamples() {
    loading = true;
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    grammarRules = [
      ...grammarRules,
      { rule: "Imperfect Tense", example: "Kazah - I used to say", description: "Past tense describing habitual actions" },
      { rule: "Conditional", example: "Bih kazal - I would say", description: "Forms with 'bih' + lax aorist" }
    ];
    loading = false;
  }
</script>

<h1>Bulgarian Grammar Rules</h1>

<div class="page-grid">
  <!-- Test card component example -->
  <TestCard
    title="Grammar"
    content="Learn and master Bulgarian grammar rules"
    showShadow
    link="#"
  />

  <div class="controls">
    <div class="search-container">
      <input
        type="search"
        placeholder="Search grammar rules..."
        bind:value={searchTerm}
        class="search-input"
        aria-label="Search grammar rules"
      />
    </div>

    <div class="toggle-container">
      <label>
        <input
          type="checkbox"
          checked={showExamples}
          onchange={toggleExamples}
          role="switch"
          aria-label="Show examples"
        />
        Show examples
      </label>
    </div>
  </div>

  <!-- Grammar rules table -->
  <div class="grammar-container" role="region" aria-label="Grammar rules">
    {#if filteredRules.length > 0}
      <table class="grammar-table" aria-label="Grammar rules table">
        <thead>
          <tr>
            <th scope="col">Rule</th>
            {#if showExamples}
              <th scope="col">Example</th>
            {/if}
            <th scope="col">Description</th>
          </tr>
        </thead>
        <thead>
          <!-- Table headers moved above -->
        </thead>
        <tbody>
          {#each filteredRules as { rule, example, description }}
            <tr>
              <td>{rule}</td>
              {#if showExamples}
                <td>{example}</td>
              {/if}
              <td>{description}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <div class="no-results">No grammar rules match your search.</div>
    {/if}
  </div>

  <!-- Load more button with event replaced by attribute -->
  <button
    onclick={loadMoreExamples}
    disabled={loading}
    aria-label={loading ? 'Loading more examples' : 'Show more examples'}
  >
    {loading ? 'Loading...' : 'Show More Examples'}
  </button>
</div>

<!-- CSS using Svelte's scoped styles -->
<style>
  .page-grid {
    display: grid;
    gap: 1rem;
  }

  .controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 1rem 0;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .search-input {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    min-width: 250px;
    font-size: 1rem;
  }

  .toggle-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .grammar-container {
    margin: 1rem 0;
  }

  .grammar-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
  }

  .grammar-table th, .grammar-table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  .grammar-table th {
    background-color: #f5f5f5;
    font-weight: 600;
  }

  .grammar-table tr:hover {
    background-color: #f9f9f9;
  }

  button {
    padding: 0.5rem 1rem;
    background-color: #4285f4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  .no-results {
    padding: 1rem;
    text-align: center;
    color: #666;
  }
</style>