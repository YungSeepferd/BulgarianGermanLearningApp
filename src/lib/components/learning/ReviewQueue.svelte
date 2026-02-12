<script lang="ts">
  /**
   * ReviewQueue - Vocabulary Enrichment Queue
   *
   * Shows items sorted by enrichment priority:
   * 1. Items with no enrichment at all
   * 2. Items missing specific fields
   * 3. Recently added items
   */

  import type { VocabularyItem } from '$lib/types/vocabulary';
  import { Badge } from '$lib/components/ui/badge';
  import { ScrollArea } from '$lib/components/ui/scroll-area';
  import { Progress } from '$lib/components/ui/progress';

  interface Props {
    items: VocabularyItem[];
    currentItemId?: string | undefined;
    onSelect?: (item: VocabularyItem) => void;
  }

  let { items, currentItemId, onSelect }: Props = $props();

  // Calculate enrichment score (0-5)
  function getEnrichmentScore(item: VocabularyItem): number {
    let score = 0;
    if (item.mnemonic?.text || item.metadata?.mnemonic) score++;
    if (item.etymology || item.metadata?.etymology) score++;
    if (item.culturalNotes || item.metadata?.culturalNote) score++;
    if (item.notes?.linguistic) score++;
    if (item.notes?.forBulgarianSpeakers || item.notes?.forGermanSpeakers) score++;
    return score;
  }

  // Priority: items with lower scores first
  const prioritizedItems = $derived(
    [...items].sort((a, b) => {
      const scoreA = getEnrichmentScore(a);
      const scoreB = getEnrichmentScore(b);
      return scoreA - scoreB;
    })
  );

  // Stats - reactive values
  const total = $derived(items.length);
  const enriched = $derived(items.filter(i => getEnrichmentScore(i) >= 3).length);
  const minimal = $derived(items.filter(i => getEnrichmentScore(i) === 0).length);
  const partial = $derived(items.filter(i => {
    const s = getEnrichmentScore(i);
    return s > 0 && s < 3;
  }).length);
  const percentComplete = $derived(total > 0 ? Math.round((enriched / total) * 100) : 0);

  function getScoreColor(score: number): string {
    if (score === 0) return 'bg-gray-200';
    if (score <= 2) return 'bg-yellow-400';
    return 'bg-green-500';
  }

  function getScoreLabel(score: number): string {
    if (score === 0) return 'Needs enrichment';
    if (score <= 2) return 'Partial';
    return 'Enriched';
  }
</script>

<div class="review-queue">
  <header class="queue-header">
    <h3 class="queue-title">Review Queue</h3>
    <div class="stats-summary">
      <Progress value={percentComplete} max={100} class="stats-progress" />
      <span class="stats-text">{enriched}/{total} enriched ({percentComplete}%)</span>
    </div>
  </header>

  <div class="stats-bar">
    <div class="stat-item">
      <Badge variant="outline" class="stat-badge minimal">{minimal}</Badge>
      <span class="stat-label">Needs work</span>
    </div>
    <div class="stat-item">
      <Badge variant="outline" class="stat-badge partial">{partial}</Badge>
      <span class="stat-label">Partial</span>
    </div>
    <div class="stat-item">
      <Badge variant="outline" class="stat-badge enriched">{enriched}</Badge>
      <span class="stat-label">Enriched</span>
    </div>
  </div>

  <ScrollArea class="queue-scroll">
    <div class="queue-list">
      {#each prioritizedItems as item (item.id)}
        {@const score = getEnrichmentScore(item)}
        <button
          class="queue-item"
          class:selected={item.id === currentItemId}
          onclick={() => onSelect?.(item)}
        >
          <div class="item-emoji">{item.emoji || '🔤'}</div>
          <div class="item-info">
            <div class="item-titles">
              <span class="german">{item.german}</span>
              <span class="bulgarian">{item.bulgarian}</span>
            </div>
            <div class="item-meta">
              <Badge variant="secondary" class="pos-badge">{item.partOfSpeech}</Badge>
              <span class="enrichment-status">{getScoreLabel(score)}</span>
            </div>
          </div>
          <div class="score-indicator">
            <div class="score-bars">
              {#each Array(5) as _, i}
                <div
                  class="score-bar"
                  class:filled={i < score}
                  style="background-color: {i < score ? getScoreColor(score) : '#e5e7eb'}"
                ></div>
              {/each}
            </div>
          </div>
        </button>
      {/each}
    </div>
  </ScrollArea>
</div>

<style>
  .review-queue {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: white;
    border-radius: var(--radius-lg, 0.5rem);
    border: 1px solid var(--color-border, #e5e7eb);
    overflow: hidden;
  }

  .queue-header {
    padding: var(--spacing-4, 1rem);
    border-bottom: 1px solid var(--color-border, #e5e7eb);
    background-color: var(--color-bg-secondary, #f9fafb);
  }

  .queue-title {
    margin: 0 0 var(--spacing-2, 0.5rem) 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary, #111827);
  }

  .stats-summary {
    display: flex;
    align-items: center;
    gap: var(--spacing-2, 0.5rem);
  }

  .stats-progress {
    flex: 1;
    height: 0.5rem;
  }

  .stats-text {
    font-size: 0.75rem;
    color: var(--color-text-secondary, #6b7280);
    white-space: nowrap;
  }

  .stats-bar {
    display: flex;
    justify-content: space-around;
    padding: var(--spacing-2, 0.5rem) var(--spacing-4, 1rem);
    border-bottom: 1px solid var(--color-border, #e5e7eb);
    background-color: var(--color-bg-tertiary, #f3f4f6);
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-1, 0.25rem);
  }

  .stat-badge {
    font-size: 0.75rem;
    font-weight: 600;
  }

  .stat-badge.minimal {
    background-color: #e5e7eb;
    color: #6b7280;
  }

  .stat-badge.partial {
    background-color: #fef3c7;
    color: #b45309;
  }

  .stat-badge.enriched {
    background-color: #dcfce7;
    color: #166534;
  }

  .stat-label {
    font-size: 0.625rem;
    color: var(--color-text-secondary, #6b7280);
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  :global(.queue-scroll) {
    flex: 1;
  }

  .queue-list {
    display: flex;
    flex-direction: column;
  }

  .queue-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-3, 0.75rem);
    padding: var(--spacing-3, 0.75rem) var(--spacing-4, 1rem);
    border-bottom: 1px solid var(--color-border, #f3f4f6);
    background: none;
    border-left: 3px solid transparent;
    cursor: pointer;
    text-align: left;
    width: 100%;
    transition: background-color 0.15s ease;
  }

  .queue-item:hover {
    background-color: var(--color-bg-secondary, #f9fafb);
  }

  .queue-item.selected {
    background-color: #dbeafe;
    border-left-color: #3b82f6;
  }

  .item-emoji {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .item-info {
    flex: 1;
    min-width: 0;
  }

  .item-titles {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-1, 0.25rem);
    margin-bottom: var(--spacing-1, 0.25rem);
  }

  .german {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-primary, #111827);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .bulgarian {
    font-size: 0.75rem;
    color: var(--color-text-secondary, #6b7280);
    font-family: 'Noto Sans', 'Segoe UI', sans-serif;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-meta {
    display: flex;
    align-items: center;
    gap: var(--spacing-2, 0.5rem);
  }

  :global(.pos-badge) {
    font-size: 0.625rem;
    padding: 0.125rem 0.375rem;
  }

  .enrichment-status {
    font-size: 0.625rem;
    color: var(--color-text-muted, #9ca3af);
  }

  .score-indicator {
    flex-shrink: 0;
  }

  .score-bars {
    display: flex;
    gap: 2px;
  }

  .score-bar {
    width: 4px;
    height: 16px;
    border-radius: 1px;
    transition: background-color 0.2s ease;
  }

  @media (max-width: 640px) {
    .stats-bar {
      padding: var(--spacing-2, 0.5rem);
    }

    .stat-label {
      font-size: 0.5rem;
    }

    .queue-item {
      padding: var(--spacing-2, 0.5rem);
    }

    .item-emoji {
      font-size: 1.25rem;
    }
  }
</style>
