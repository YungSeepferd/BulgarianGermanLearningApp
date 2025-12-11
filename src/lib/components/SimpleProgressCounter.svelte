<script lang="ts">
  import { appState } from '$lib/state/app-state';
  import { t, onTranslationsChange, offTranslationsChange } from '$lib/services/localization';
  import { onMount } from 'svelte';

  // Reactive translations
  let totalVocabLabel = $state('');
  let favoritedLabel = $state('');
  let recentSearchesLabel = $state('');

  let stats = $derived.by(() => {
    try {
      const vocabularyItems = appState.getAllVocabularyItems?.() ?? [];
      const favorites = appState.favorites ?? [];
      const recentSearches = appState.recentSearches ?? [];

      return {
        totalItems: vocabularyItems.length,
        favorites: favorites.length,
        recentSearches: recentSearches.length
      };
    } catch (error) {
      return { totalItems: 0, favorites: 0, recentSearches: 0 };
    }
  });

  // Update translations reactively
  function updateTranslations() {
    totalVocabLabel = t('dashboard.total_vocabulary') || 'Total Vocabulary';
    favoritedLabel = t('dashboard.favorited') || 'Favorited';
    recentSearchesLabel = t('dashboard.recent_searches') || 'Recent Searches';
  }

  // Set up reactive translation updates
  onMount(() => {
    updateTranslations(); // Initial update
    onTranslationsChange(updateTranslations);

    return () => {
      offTranslationsChange(updateTranslations);
    };
  });
</script>

<div class="stats-container">
  <div class="stat-card">
    <div class="stat-icon">📚</div>
    <div class="stat-label">{totalVocabLabel}</div>
    <div class="stat-value">{stats.totalItems}</div>
  </div>

  <div class="stat-card">
    <div class="stat-icon">❤️</div>
    <div class="stat-label">{favoritedLabel}</div>
    <div class="stat-value">{stats.favorites}</div>
  </div>

  <div class="stat-card">
    <div class="stat-icon">🔍</div>
    <div class="stat-label">{recentSearchesLabel}</div>
    <div class="stat-value">{stats.recentSearches}</div>
  </div>
</div>

<style>
  .stats-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1.5rem;
    padding: 2rem;
    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    border-radius: 0.75rem;
    margin: 2rem 0;
  }

  .stat-card {
    text-align: center;
    padding: 1.5rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .stat-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .stat-value {
    font-size: 1.875rem;
    font-weight: 700;
    color: #1f2937;
  }

  @media (max-width: 640px) {
    .stats-container {
      grid-template-columns: 1fr;
      gap: 1rem;
      padding: 1rem;
    }

    .stat-card {
      padding: 1rem;
    }

    .stat-icon {
      font-size: 1.5rem;
    }

    .stat-value {
      font-size: 1.5rem;
    }
  }
</style>