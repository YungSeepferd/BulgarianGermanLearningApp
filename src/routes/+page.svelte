<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { vocabularyDb } from '$lib/data/db.svelte';
  import { appState } from '$lib/state/app-state';
  // localization and ActionButton not used here

  // Dashboard stats
  let totalVocabulary = $state(0);
  let totalLearned = $state(0);
  let totalPracticed = $state(0);
  let loading = $state(true);

  // Load dashboard data
  onMount(() => {
    if (!browser) return;

    try {
      // Get vocabulary stats
      const allItems = vocabularyDb.getVocabulary();
      totalVocabulary = allItems.length;

      // Get user stats from app state
      const stats = appState.practiceStats;
      if (stats) {
        totalLearned = Array.from(stats.entries()).filter(([_, s]) => s && s.correct > 0).length;
        totalPracticed = Array.from(stats.values()).reduce((sum, s) => sum + (s?.correct + s?.incorrect || 0), 0);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      loading = false;
    }
  });

  function navigateToVocabulary() {
    goto(`${base}/vocabulary`);
  }

  function navigateToPractice() {
    goto(`${base}/practice`);
  }

  function navigateToLearn() {
    goto(`${base}/learn`);
  }
</script>

<svelte:head>
  <title>Dashboard | Bulgarian-German Learning</title>
</svelte:head>

<div class="dashboard-container">
  <header class="dashboard-header">
    <h1>Dashboard</h1>
    <p class="subtitle">Dein Lernfortschritt auf einen Blick</p>
  </header>

  {#if loading}
    <div class="loading">
      <p>Lade Dashboard...</p>
    </div>
  {:else}
    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card vocab">
        <div class="stat-icon">📚</div>
        <div class="stat-content">
          <div class="stat-value">{totalVocabulary}</div>
          <div class="stat-label">Wörter insgesamt</div>
        </div>
      </div>

      <div class="stat-card learned">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-value">{totalLearned}</div>
          <div class="stat-label">Gelernte Wörter</div>
        </div>
      </div>

      <div class="stat-card practiced">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <div class="stat-value">{totalPracticed}</div>
          <div class="stat-label">Übungen absolviert</div>
        </div>
      </div>

      <div class="stat-card favorites">
        <div class="stat-icon">❤️</div>
        <div class="stat-content">
          <div class="stat-value">{appState.favorites?.length || 0}</div>
          <div class="stat-label">Favoriten</div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <section class="quick-actions">
      <h2>Schnellzugriff</h2>
      <div class="actions-grid">
        <button class="action-card" onclick={navigateToVocabulary}>
          <div class="action-icon">📖</div>
          <div class="action-title">Vokabular</div>
          <div class="action-desc">Durchsuche alle Wörter</div>
        </button>

        <button class="action-card" onclick={navigateToPractice}>
          <div class="action-icon">✍️</div>
          <div class="action-title">Üben</div>
          <div class="action-desc">Trainiere dein Wissen</div>
        </button>

        <button class="action-card" onclick={navigateToLearn}>
          <div class="action-icon">🎓</div>
          <div class="action-title">Lernen</div>
          <div class="action-desc">Strukturierte Lernpfade</div>
        </button>
      </div>
    </section>

    <!-- Progress Overview -->
    <section class="progress-overview">
      <h2>Lernfortschritt</h2>
      <div class="progress-card">
        <div class="progress-info">
          <span class="progress-label">Gesamtfortschritt</span>
          <span class="progress-value">
            {totalVocabulary > 0 ? Math.round((totalLearned / totalVocabulary) * 100) : 0}%
          </span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            style="width: {totalVocabulary > 0 ? (totalLearned / totalVocabulary) * 100 : 0}%"
          ></div>
        </div>
        <p class="progress-text">
          Du hast {totalLearned} von {totalVocabulary} Wörtern gelernt
        </p>
      </div>
    </section>
  {/if}
</div>

<style>
  .dashboard-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
    min-height: 100vh;
  }

  .dashboard-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .dashboard-header h1 {
    font-size: 2.5rem;
    color: #1f2937;
    margin: 0 0 0.5rem 0;
  }

  .subtitle {
    font-size: 1.125rem;
    color: #6b7280;
    margin: 0;
  }

  .loading {
    text-align: center;
    padding: 3rem;
    color: #6b7280;
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .stat-card {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .stat-card.vocab {
    border-left: 4px solid #3b82f6;
  }

  .stat-card.learned {
    border-left: 4px solid #10b981;
  }

  .stat-card.practiced {
    border-left: 4px solid #f59e0b;
  }

  .stat-card.favorites {
    border-left: 4px solid #ef4444;
  }

  .stat-icon {
    font-size: 2.5rem;
  }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #6b7280;
    margin-top: 0.25rem;
  }

  /* Quick Actions */
  .quick-actions {
    margin-bottom: 3rem;
  }

  .quick-actions h2 {
    font-size: 1.5rem;
    color: #1f2937;
    margin: 0 0 1.5rem 0;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .action-card {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 1rem;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-card:hover {
    border-color: #667eea;
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.2);
  }

  .action-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .action-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }

  .action-desc {
    font-size: 0.875rem;
    color: #6b7280;
  }

  /* Progress Overview */
  .progress-overview h2 {
    font-size: 1.5rem;
    color: #1f2937;
    margin: 0 0 1.5rem 0;
  }

  .progress-card {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .progress-label {
    font-size: 1rem;
    color: #6b7280;
  }

  .progress-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #667eea;
  }

  .progress-bar {
    height: 1rem;
    background: #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
    margin-bottom: 1rem;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    transition: width 0.5s ease;
  }

  .progress-text {
    font-size: 0.875rem;
    color: #6b7280;
    text-align: center;
    margin: 0;
  }

  @media (max-width: 768px) {
    .dashboard-container {
      padding: 1rem;
    }

    .dashboard-header h1 {
      font-size: 2rem;
    }

    .stats-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .actions-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }
</style>