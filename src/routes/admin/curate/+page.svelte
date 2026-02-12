<script lang="ts">
  /**
   * Admin Curation Page
   *
   * Interface for manually curating vocabulary enrichment data.
   * Features:
   * - Review queue showing items needing enrichment
   * - Curation panel for editing metadata
   * - Real-time save to vocabulary chunks
   */

  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import type { VocabularyItem } from '$lib/types/vocabulary';
  import CurationPanel from '$lib/components/learning/CurationPanel.svelte';
  import ReviewQueue from '$lib/components/learning/ReviewQueue.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { vocabularyRepository } from '$lib/data/vocabulary-repository.svelte';

  // State
  let items = $state<VocabularyItem[]>([]);
  let currentItem = $state<VocabularyItem | null>(null);
  let isLoading = $state(true);
  let saveStatus = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
  let errorMessage = $state('');

  // Load all vocabulary items
  async function loadVocabulary() {
    if (!browser) return;

    isLoading = true;
    try {
      // Initialize repository
      if (!vocabularyRepository.loaded) {
        await vocabularyRepository.initialize();
      }

      // Load all levels
      await vocabularyRepository.loadAll();

      // Get all items
      items = vocabularyRepository.getAll();

      // Select first item needing enrichment
      const firstNeedingEnrichment = items.find(item => {
        const hasMnemonic = item.mnemonic?.text || item.metadata?.mnemonic;
        const hasEtymology = item.etymology || item.metadata?.etymology;
        const hasCultural = item.culturalNotes || item.metadata?.culturalNote;
        return !hasMnemonic || !hasEtymology || !hasCultural;
      });

      currentItem = firstNeedingEnrichment || items[0] || null;

    } catch (error) {
      console.error('Failed to load vocabulary:', error);
      errorMessage = 'Failed to load vocabulary data';
    } finally {
      isLoading = false;
    }
  }

  // Save changes to vocabulary
  async function handleSave(updatedItem: VocabularyItem) {
    saveStatus = 'saving';
    errorMessage = '';

    try {
      // Update in repository
      const level = updatedItem.cefrLevel || 'A1';
      const levelItems = vocabularyRepository.getByLevel(level as any);
      const index = levelItems.findIndex(i => i.id === updatedItem.id);

      if (index !== -1) {
        levelItems[index] = updatedItem;
      }

      // Update current selection
      currentItem = updatedItem;

      // Update items list
      const globalIndex = items.findIndex(i => i.id === updatedItem.id);
      if (globalIndex !== -1) {
        items[globalIndex] = updatedItem;
      }

      saveStatus = 'saved';
      setTimeout(() => {
        saveStatus = 'idle';
      }, 2000);

    } catch (error) {
      console.error('Failed to save:', error);
      saveStatus = 'error';
      errorMessage = 'Failed to save changes';
    }
  }

  // Handle skip
  function handleSkip() {
    // Move to next item needing enrichment
    const currentIndex = items.findIndex(i => i.id === currentItem?.id);
    const nextItem = items.slice(currentIndex + 1).find(item => {
      const hasMnemonic = item.mnemonic?.text || item.metadata?.mnemonic;
      const hasEtymology = item.etymology || item.metadata?.etymology;
      const hasCultural = item.culturalNotes || item.metadata?.culturalNote;
      return !hasMnemonic || !hasEtymology || !hasCultural;
    });

    currentItem = nextItem || items[(currentIndex + 1) % items.length] || null;
  }

  // Select item from queue
  function handleSelect(item: VocabularyItem) {
    currentItem = item;
  }

  onMount(() => {
    loadVocabulary();
  });

  // Stats
  const stats = $derived.by(() => {
    const total = items.length;
    const enriched = items.filter(i => {
      const hasMnemonic = i.mnemonic?.text || i.metadata?.mnemonic;
      const hasEtymology = i.etymology || i.metadata?.etymology;
      const hasCultural = i.culturalNotes || i.metadata?.culturalNote;
      return hasMnemonic && hasEtymology && hasCultural;
    }).length;

    return {
      total,
      enriched,
      percent: total > 0 ? Math.round((enriched / total) * 100) : 0
    };
  });
</script>

<svelte:head>
  <title>Admin | Vocabulary Curation</title>
</svelte:head>

<div class="curation-page">
  <header class="page-header">
    <div class="header-content">
      <div class="header-titles">
        <h1>Vocabulary Curation</h1>
        <p class="subtitle">Manually enrich vocabulary with mnemonics, etymology, and cultural notes</p>
      </div>

      <div class="header-stats">
        {#if items.length > 0}
          {@const s = stats}
          <div class="stat-card">
            <span class="stat-value">{s.enriched}/{s.total}</span>
            <span class="stat-label">Items Enriched</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{s.percent}%</span>
            <span class="stat-label">Coverage</span>
          </div>
        {/if}
        {#if saveStatus === 'saving'}
          <Badge variant="secondary">💾 Saving...</Badge>
        {:else if saveStatus === 'saved'}
          <Badge class="bg-green-100 text-green-700">✓ Saved</Badge>
        {:else if saveStatus === 'error'}
          <Badge variant="destructive">❌ Error</Badge>
        {/if}
      </div>
    </div>

    {#if errorMessage}
      <div class="error-banner" role="alert">
        <span class="error-icon">⚠️</span>
        <span>{errorMessage}</span>
        <Button variant="ghost" size="sm" onclick={() => errorMessage = ''}>✕</Button>
      </div>
    {/if}
  </header>

  <main class="page-content">
    {#if isLoading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading vocabulary data...</p>
      </div>
    {:else if items.length === 0}
      <div class="empty-state">
        <span class="empty-icon">📚</span>
        <h2>No vocabulary items found</h2>
        <p>There are no vocabulary items to curate.</p>
        <Button onclick={loadVocabulary}>Retry</Button>
      </div>
    {:else}
      <div class="curation-layout">
        <aside class="queue-sidebar">
          <ReviewQueue
            {items}
            currentItemId={currentItem?.id}
            onSelect={handleSelect}
          />
        </aside>

        <section class="curation-main">
          <CurationPanel
            item={currentItem}
            onSave={handleSave}
            onSkip={handleSkip}
          />
        </section>
      </div>
    {/if}
  </main>
</div>

<style>
  .curation-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: var(--color-bg-secondary, #f9fafb);
  }

  .page-header {
    background-color: white;
    border-bottom: 1px solid var(--color-border, #e5e7eb);
    padding: var(--spacing-4, 1rem) var(--spacing-6, 1.5rem);
    flex-shrink: 0;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--spacing-4, 1rem);
  }

  .header-titles h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text-primary, #111827);
  }

  .subtitle {
    margin: var(--spacing-1, 0.25rem) 0 0 0;
    font-size: 0.875rem;
    color: var(--color-text-secondary, #6b7280);
  }

  .header-stats {
    display: flex;
    align-items: center;
    gap: var(--spacing-4, 1rem);
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--spacing-2, 0.5rem) var(--spacing-4, 1rem);
    background-color: var(--color-bg-tertiary, #f3f4f6);
    border-radius: var(--radius-md, 0.375rem);
  }

  .stat-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text-primary, #111827);
  }

  .stat-label {
    font-size: 0.75rem;
    color: var(--color-text-secondary, #6b7280);
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .error-banner {
    display: flex;
    align-items: center;
    gap: var(--spacing-2, 0.5rem);
    margin-top: var(--spacing-3, 0.75rem);
    padding: var(--spacing-3, 0.75rem);
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: var(--radius-md, 0.375rem);
    color: #dc2626;
    font-size: 0.875rem;
  }

  .error-icon {
    font-size: 1rem;
  }

  .page-content {
    flex: 1;
    overflow: hidden;
    padding: var(--spacing-4, 1rem);
  }

  .curation-layout {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: var(--spacing-4, 1rem);
    height: 100%;
  }

  .queue-sidebar {
    height: 100%;
    overflow: hidden;
  }

  .curation-main {
    height: 100%;
    overflow: hidden;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: var(--spacing-4, 1rem);
    color: var(--color-text-secondary, #6b7280);
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--color-border, #e5e7eb);
    border-top-color: var(--color-primary, #3b82f6);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: var(--spacing-4, 1rem);
    text-align: center;
    color: var(--color-text-secondary, #6b7280);
  }

  .empty-icon {
    font-size: 4rem;
    opacity: 0.5;
  }

  .empty-state h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text-primary, #111827);
  }

  .empty-state p {
    margin: 0;
    font-size: 0.875rem;
  }

  @media (max-width: 1024px) {
    .curation-layout {
      grid-template-columns: 300px 1fr;
    }
  }

  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      align-items: flex-start;
    }

    .curation-layout {
      grid-template-columns: 1fr;
      grid-template-rows: 200px 1fr;
    }

    .queue-sidebar {
      order: 2;
    }

    .curation-main {
      order: 1;
    }
  }
</style>
