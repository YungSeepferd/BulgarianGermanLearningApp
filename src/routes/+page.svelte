<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { vocabularyDb } from '$lib/data/db.svelte';
  import { appState } from '$lib/state/app-state';
  import { dailyVocabularyService } from '$lib/services/daily-vocabulary.svelte';
  import { DailyCarousel } from '$lib/components/dashboard';
  import VocabularyDetailPanel from '$lib/components/dashboard/VocabularyDetailPanel.svelte';
  import type { VocabularyItem } from '$lib/types/vocabulary';

  // View mode: 'cards' (swipe practice) or 'stats' (overview)
  let viewMode = $state<'cards' | 'stats'>('cards');
  
  // Selected vocabulary for detail panel
  let selectedVocabulary = $state<VocabularyItem | null>(null);
  
  // Dashboard stats (loaded async)
  let totalVocabulary = $state(0);
  let totalLearned = $state(0);
  let totalPracticed = $state(0);
  let statsLoading = $state(true);

  // Daily progress derived state
  const dailyProgress = $derived(dailyVocabularyService.progress);
  
  // Get current vocabulary item
  const currentItem = $derived.by(() => {
    if (!dailyVocabularyService.dailyItems.length) return null;
    return dailyVocabularyService.dailyItems[dailyProgress.currentIndex] || null;
  });
  
  // Auto-update detail panel with current vocabulary
  $effect(() => {
    if (currentItem) {
      selectedVocabulary = currentItem;
    }
  });

  // Load dashboard data
  onMount(() => {
    if (!browser) return;

    let mounted = true;

    async function loadData() {
      try {
        // Initialize vocabulary database first (fixes the 0 vocabulary bug)
        await vocabularyDb.initialize();

        // Initialize daily vocabulary service
        await dailyVocabularyService.initialize();

        if (!mounted) return;

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
        if (mounted) {
          statsLoading = false;
        }
      }
    }

    loadData();

    // Cleanup function
    return () => {
      mounted = false;
    };
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

  function handleDailyComplete() {
    // Could trigger confetti or celebration animation here
    console.log('Daily vocabulary practice complete!');
  }

  function toggleView() {
    viewMode = viewMode === 'cards' ? 'stats' : 'cards';
  }
</script>

<svelte:head>
  <title>Daily Practice | Bulgarian-German Learning</title>
  <meta name="description" content="Learn 10 new Bulgarian-German vocabulary words every day" />
</svelte:head>

<div class="dashboard-container">
  <!-- View Toggle Header -->
  <header class="dashboard-header">
    <div class="header-left">
      <h1>{viewMode === 'cards' ? '🎯 Daily 10' : '📊 Dashboard'}</h1>
    </div>
    <button class="view-toggle" onclick={toggleView} aria-label="Toggle view">
      {#if viewMode === 'cards'}
        <span class="toggle-icon">📊</span>
        <span class="toggle-text">Stats</span>
      {:else}
        <span class="toggle-icon">🎯</span>
        <span class="toggle-text">Practice</span>
      {/if}
    </button>
  </header>

  {#if viewMode === 'cards'}
    <!-- Daily Vocabulary Practice Mode (Default) -->
    <div class="practice-layout">
      <div class="daily-practice-area" aria-label="Daily vocabulary practice">
        <DailyCarousel onComplete={handleDailyComplete} />
      </div>
      
      <!-- Vocabulary Detail Panel -->
      <VocabularyDetailPanel 
        item={selectedVocabulary}
        onClose={() => selectedVocabulary = null}
      />
    </div>

    <!-- Quick Navigation (Compact on mobile) -->
    <nav class="quick-nav">
      <button class="nav-pill" onclick={navigateToVocabulary}>
        <span>📖</span>
        <span>Browse All</span>
      </button>
      <button class="nav-pill" onclick={navigateToPractice}>
        <span>✍️</span>
        <span>Full Practice</span>
      </button>
      <button class="nav-pill" onclick={navigateToLearn}>
        <span>🎓</span>
        <span>Learning Paths</span>
      </button>
    </nav>
  {:else}
    <!-- Stats Overview Mode -->
    {#if statsLoading}
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading stats...</p>
      </div>
    {:else}
      <!-- Today's Summary -->
      <section class="daily-summary">
        <h2>Today's Progress</h2>
        <div class="daily-stats">
          <div class="daily-stat">
            <span class="daily-stat-value">{dailyProgress.swipedRight.length}</span>
            <span class="daily-stat-label">Words Known</span>
          </div>
          <div class="daily-stat">
            <span class="daily-stat-value">{dailyProgress.swipedLeft.length}</span>
            <span class="daily-stat-label">Need Practice</span>
          </div>
          <div class="daily-stat">
            <span class="daily-stat-value">{10 - dailyVocabularyService.completedCount}</span>
            <span class="daily-stat-label">Remaining</span>
          </div>
        </div>
      </section>

      <!-- Stats Grid -->
      <section class="stats-section">
        <h2>Overall Progress</h2>
        <div class="stats-grid">
          <div class="stat-card vocab">
            <div class="stat-icon">📚</div>
            <div class="stat-content">
              <div class="stat-value">{totalVocabulary}</div>
              <div class="stat-label">Total Words</div>
            </div>
          </div>

          <div class="stat-card learned">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-value">{totalLearned}</div>
              <div class="stat-label">Words Learned</div>
            </div>
          </div>

          <div class="stat-card practiced">
            <div class="stat-icon">🎯</div>
            <div class="stat-content">
              <div class="stat-value">{totalPracticed}</div>
              <div class="stat-label">Practice Sessions</div>
            </div>
          </div>

          <div class="stat-card favorites">
            <div class="stat-icon">❤️</div>
            <div class="stat-content">
              <div class="stat-value">{appState.favorites?.length || 0}</div>
              <div class="stat-label">Favorites</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Progress Bar -->
      <section class="progress-section">
        <div class="progress-card">
          <div class="progress-info">
            <span class="progress-label">Mastery Progress</span>
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
            {totalLearned} of {totalVocabulary} words mastered
          </p>
        </div>
      </section>

      <!-- Quick Actions -->
      <section class="actions-section">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <button class="action-card" onclick={navigateToVocabulary}>
            <div class="action-icon">📖</div>
            <div class="action-title">Vocabulary</div>
            <div class="action-desc">Browse all words</div>
          </button>

          <button class="action-card" onclick={navigateToPractice}>
            <div class="action-icon">✍️</div>
            <div class="action-title">Practice</div>
            <div class="action-desc">Train your knowledge</div>
          </button>

          <button class="action-card" onclick={navigateToLearn}>
            <div class="action-icon">🎓</div>
            <div class="action-title">Learn</div>
            <div class="action-desc">Structured paths</div>
          </button>
        </div>
      </section>
    {/if}
  {/if}
</div>

<style>
  .dashboard-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    max-width: 1400px; /* Wider to accommodate detail panel */
    margin: 0 auto;
    padding: 0;
    background: #f8fafc;
  }

  :global(.dark) .dashboard-container {
    background: #0f172a;
  }

  /* Header */
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    background: white;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  :global(.dark) .dashboard-header {
    background: #1e293b;
    border-color: #334155;
  }

  .dashboard-header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }

  :global(.dark) .dashboard-header h1 {
    color: #f1f5f9;
  }

  .view-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #f1f5f9;
    border: none;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
    color: #475569;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  :global(.dark) .view-toggle {
    background: #334155;
    color: #cbd5e1;
  }

  .view-toggle:hover {
    background: #e2e8f0;
  }

  :global(.dark) .view-toggle:hover {
    background: #475569;
  }

  .toggle-icon {
    font-size: 1.125rem;
  }

  /* Practice Layout - Grid with sidebar for detail panel */
  .practice-layout {
    flex: 1;
    display: grid;
    grid-template-columns: minmax(400px, 1fr) 400px;
    gap: 1.5rem;
    padding: 1rem;
    align-items: start;
    max-height: calc(100vh - 180px);
  }
  
  /* Daily Practice Area */
  .daily-practice-area {
    display: flex;
    flex-direction: column;
    min-width: 0; /* Prevent grid overflow */
    height: 100%;
  }

  /* Tablet: Reduce detail panel width */
  @media (max-width: 1200px) {
    .dashboard-container {
      max-width: 900px;
    }
    
    .practice-layout {
      grid-template-columns: 1fr 350px;
      gap: 1rem;
    }
  }

  /* Mobile: Stack detail panel below */
  @media (max-width: 768px) {
    .dashboard-container {
      max-width: 600px;
    }
    
    .practice-layout {
      grid-template-columns: 1fr;
      grid-template-rows: auto;
      max-height: none;
      padding: 0;
    }
    
    .daily-practice-area {
      min-height: calc(100vh - 180px);
    }
  }

  /* Quick Navigation Pills */
  .quick-nav {
    display: flex;
    gap: 0.5rem;
    padding: 1rem;
    background: white;
    border-top: 1px solid #e2e8f0;
    justify-content: center;
    flex-shrink: 0;
  }

  :global(.dark) .quick-nav {
    background: #1e293b;
    border-color: #334155;
  }

  .nav-pill {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    background: #f1f5f9;
    border: none;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
    color: #475569;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  :global(.dark) .nav-pill {
    background: #334155;
    color: #cbd5e1;
  }

  .nav-pill:hover {
    background: #3b82f6;
    color: white;
  }

  /* Loading State */
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    gap: 1rem;
  }

  .spinner {
    width: 2.5rem;
    height: 2.5rem;
    border: 3px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Stats View Styles */
  .daily-summary,
  .stats-section,
  .progress-section,
  .actions-section {
    padding: 1.5rem 1.25rem;
  }

  .daily-summary h2,
  .stats-section h2,
  .actions-section h2 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #0f172a;
    margin: 0 0 1rem 0;
  }

  :global(.dark) .daily-summary h2,
  :global(.dark) .stats-section h2,
  :global(.dark) .actions-section h2 {
    color: #f1f5f9;
  }

  /* Daily Summary */
  .daily-stats {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .daily-stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    background: white;
    border-radius: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  :global(.dark) .daily-stat {
    background: #1e293b;
  }

  .daily-stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #3b82f6;
  }

  .daily-stat-label {
    font-size: 0.75rem;
    color: #64748b;
    text-align: center;
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .stat-card {
    background: white;
    border-radius: 1rem;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: transform 0.2s;
  }

  :global(.dark) .stat-card {
    background: #1e293b;
  }

  .stat-card:active {
    transform: scale(0.98);
  }

  .stat-card.vocab {
    border-left: 4px solid #3b82f6;
  }

  .stat-card.learned {
    border-left: 4px solid #22c55e;
  }

  .stat-card.practiced {
    border-left: 4px solid #f59e0b;
  }

  .stat-card.favorites {
    border-left: 4px solid #ef4444;
  }

  .stat-icon {
    font-size: 1.75rem;
  }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #0f172a;
  }

  :global(.dark) .stat-value {
    color: #f1f5f9;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #64748b;
  }

  /* Progress Card */
  .progress-card {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  :global(.dark) .progress-card {
    background: #1e293b;
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .progress-label {
    font-size: 0.875rem;
    color: #64748b;
  }

  .progress-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: #3b82f6;
  }

  .progress-bar {
    height: 0.75rem;
    background: #e2e8f0;
    border-radius: 9999px;
    overflow: hidden;
    margin-bottom: 0.75rem;
  }

  :global(.dark) .progress-bar {
    background: #334155;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 9999px;
    transition: width 0.5s ease;
  }

  .progress-text {
    font-size: 0.875rem;
    color: #64748b;
    text-align: center;
    margin: 0;
  }

  /* Actions Grid */
  .actions-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .action-card {
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 1rem;
    padding: 1rem 0.5rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
  }

  :global(.dark) .action-card {
    background: #1e293b;
    border-color: #334155;
  }

  .action-card:hover {
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }

  .action-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .action-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 0.25rem;
  }

  :global(.dark) .action-title {
    color: #f1f5f9;
  }

  .action-desc {
    font-size: 0.675rem;
    color: #64748b;
  }

  /* Desktop responsiveness */
  @media (min-width: 768px) {
    .dashboard-container {
      max-width: 480px;
      margin-top: 1rem;
      border-radius: 1.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      min-height: auto;
      height: calc(100vh - 2rem);
      overflow: hidden;
    }

    .daily-practice-area {
      min-height: 500px;
    }
  }
</style>