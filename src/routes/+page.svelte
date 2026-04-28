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
  import { logger } from '$lib/services/logger';

  // View mode: 'cards' (swipe practice) or 'stats' (overview)
  let viewMode = $state<'cards' | 'stats'>('cards');
  
  // Selected vocabulary for detail panel
  let selectedVocabulary = $state<VocabularyItem | null>(null);
  let wasManuallyClosed = $state(false);
  
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
  
  // Track previous item to detect actual changes
  let prevItem = $state<VocabularyItem | null>(null);

  // Auto-update detail panel with current vocabulary
  $effect(() => {
    // Only reset the guard when currentItem actually changes (not on close)
    if (currentItem !== prevItem) {
      prevItem = currentItem;
      wasManuallyClosed = false;
    }
    if (currentItem && !wasManuallyClosed) {
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
        logger.error('Dashboard', 'Failed to load dashboard data', error instanceof Error ? error : new Error(String(error)));
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
    logger.info('Dashboard', 'Daily vocabulary practice complete');
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
  <!-- Hero Section -->
  <section class="hero-section">
    <h1 class="hero-title">Daily Practice</h1>
    <p class="hero-subtitle">Master Bulgarian-German, one word at a time.</p>
  </section>

  <!-- Stats Bar -->
  <section class="stats-bar" aria-label="Vocabulary statistics">
    <div class="stat-item">
      <span class="stat-number">{totalVocabulary}</span>
      <span class="stat-label">Total Words</span>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item">
      <span class="stat-number">{totalLearned}</span>
      <span class="stat-label">Learned</span>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item">
      <span class="stat-number">{totalPracticed}</span>
      <span class="stat-label">Practiced</span>
    </div>
  </section>

  <!-- View Toggle Header -->
  <header class="dashboard-header">
    <div class="header-left">
      <h2>{viewMode === 'cards' ? '🎯 Daily 10' : '📊 Dashboard'}</h2>
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
      <!-- Daily Carousel Container -->
      <div class="carousel-container" aria-label="Daily vocabulary practice">
        <DailyCarousel onComplete={handleDailyComplete} />
      </div>
      
      <!-- Vocabulary Detail Panel -->
      <div class="detail-panel-container">
        <VocabularyDetailPanel 
          item={selectedVocabulary}
          onClose={() => { wasManuallyClosed = true; selectedVocabulary = null; }}
        />
      </div>
    </div>

    <!-- Quick Navigation (Compact on mobile) -->
    <nav class="quick-nav">
      <button class="nav-pill" onclick={navigateToVocabulary}>
        <span>📖</span>
        <span>Browse All</span>
      </button>
      <button class="nav-pill nav-pill-accent" onclick={navigateToPractice}>
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
        <h3>Today's Progress</h3>
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
        <h3>Overall Progress</h3>
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
        <h3>Quick Actions</h3>
        <div class="actions-grid">
          <button class="action-card" onclick={navigateToVocabulary}>
            <div class="action-icon">📖</div>
            <div class="action-title">Vocabulary</div>
            <div class="action-desc">Browse all words</div>
          </button>

          <button class="action-card action-card-accent" onclick={navigateToPractice}>
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
  /* ===== CSS Custom Properties ===== */
  :root {
    --bg-base: #0b0d10;
    --bg-elevated: #11131a;
    --bg-surface: #181b24;
    --bg-card: #1e2230;
    --text-primary: #f0f2f5;
    --text-secondary: #9aa3b2;
    --text-tertiary: #5e6879;
    --accent: #2dd4bf;
    --accent-dim: rgba(45, 212, 191, 0.12);
    --accent-glow: rgba(45, 212, 191, 0.35);
    --font-display: 'Playfair Display', Georgia, serif;
    --font-body: 'Space Grotesk', system-ui, sans-serif;
    --radius-lg: 16px;
    --radius-xl: 24px;
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.4);
    --shadow-glow: 0 0 20px var(--accent-glow);
    --success: #34d399;
    --border-subtle: rgba(255, 255, 255, 0.06);
  }

  /* ===== Base Styles ===== */
  .dashboard-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0;
    background: var(--bg-base);
    color: var(--text-primary);
    font-family: var(--font-body);
  }

  /* ===== Hero Section ===== */
  .hero-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-12) var(--space-6);
    text-align: center;
    background: linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg-base) 100%);
    border-bottom: 1px solid var(--border-subtle);
  }

  .hero-title {
    font-family: var(--font-display);
    font-size: var(--text-4xl, 2.5rem);
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 var(--space-3) 0;
    letter-spacing: -0.02em;
  }

  .hero-subtitle {
    font-size: var(--text-lg, 1.125rem);
    color: var(--text-secondary);
    margin: 0;
    max-width: 400px;
  }

  /* ===== Stats Bar ===== */
  .stats-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-6);
    padding: var(--space-6) var(--space-4);
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border-subtle);
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-4) var(--space-6);
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    min-width: 100px;
  }

  .stat-number {
    font-family: var(--font-display);
    font-size: var(--text-3xl, 1.875rem);
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1;
  }

  .stat-label {
    font-size: var(--text-xs, 0.75rem);
    font-weight: 500;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .stat-divider {
    width: 1px;
    height: 40px;
    background: var(--border-subtle);
  }

  /* ===== Header ===== */
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-4) var(--space-6);
    background: var(--bg-elevated);
    border-bottom: 1px solid var(--border-subtle);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .dashboard-header h2 {
    font-family: var(--font-body);
    font-size: var(--text-lg, 1.125rem);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .view-toggle {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    font-family: var(--font-body);
    font-size: var(--text-sm, 0.875rem);
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .view-toggle:hover {
    background: var(--accent-dim);
    border-color: var(--accent);
    color: var(--accent);
  }

  .toggle-icon {
    font-size: 1.125rem;
  }

  /* ===== Practice Layout ===== */
  .practice-layout {
    flex: 1;
    display: grid;
    grid-template-columns: minmax(400px, 1fr) 400px;
    gap: var(--space-6);
    padding: var(--space-6);
    align-items: start;
    max-height: calc(100vh - 280px);
  }

  /* ===== Carousel Container ===== */
  .carousel-container {
    display: flex;
    flex-direction: column;
    min-width: 0;
    height: 100%;
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
  }

  /* ===== Detail Panel Container ===== */
  .detail-panel-container {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
  }

  /* ===== Quick Navigation ===== */
  .quick-nav {
    display: flex;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-6);
    background: var(--bg-elevated);
    border-top: 1px solid var(--border-subtle);
    justify-content: center;
    flex-shrink: 0;
  }

  .nav-pill {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-5);
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    font-family: var(--font-body);
    font-size: var(--text-sm, 0.875rem);
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.25s ease;
  }

  .nav-pill:hover {
    background: var(--accent-dim);
    border-color: var(--accent);
    color: var(--accent);
    transform: translateY(-1px);
  }

  .nav-pill-accent {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--bg-base);
  }

  .nav-pill-accent:hover {
    background: var(--accent);
    box-shadow: var(--shadow-glow);
    color: var(--bg-base);
  }

  /* ===== Loading State ===== */
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-12) var(--space-8);
    gap: var(--space-4);
  }

  .spinner {
    width: 2.5rem;
    height: 2.5rem;
    border: 3px solid var(--bg-surface);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading p {
    color: var(--text-secondary);
    font-size: var(--text-sm, 0.875rem);
    margin: 0;
  }

  /* ===== Stats View Styles ===== */
  .daily-summary,
  .stats-section,
  .progress-section,
  .actions-section {
    padding: var(--space-6);
  }

  .daily-summary h3,
  .stats-section h3,
  .actions-section h3 {
    font-family: var(--font-display);
    font-size: var(--text-xl, 1.25rem);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--space-4) 0;
  }

  /* ===== Daily Summary ===== */
  .daily-stats {
    display: flex;
    gap: var(--space-4);
    justify-content: center;
  }

  .daily-stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-5);
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
  }

  .daily-stat-value {
    font-family: var(--font-display);
    font-size: var(--text-3xl, 1.875rem);
    font-weight: 700;
    color: var(--accent);
  }

  .daily-stat-label {
    font-size: var(--text-xs, 0.75rem);
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    text-align: center;
  }

  /* ===== Stats Grid ===== */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }

  .stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    box-shadow: var(--shadow-md);
    display: flex;
    align-items: center;
    gap: var(--space-4);
    transition: all 0.2s ease;
  }

  .stat-card:active {
    transform: scale(0.98);
  }

  .stat-card.vocab {
    border-left: 4px solid var(--accent);
  }

  .stat-card.learned {
    border-left: 4px solid var(--success);
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
    font-family: var(--font-display);
    font-size: var(--text-2xl, 1.5rem);
    font-weight: 700;
    color: var(--text-primary);
  }

  .stat-label {
    font-size: var(--text-xs, 0.75rem);
    color: var(--text-tertiary);
  }

  /* ===== Progress Card ===== */
  .progress-card {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    box-shadow: var(--shadow-md);
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-4);
  }

  .progress-label {
    font-size: var(--text-sm, 0.875rem);
    color: var(--text-secondary);
  }

  .progress-value {
    font-family: var(--font-display);
    font-size: var(--text-xl, 1.25rem);
    font-weight: 700;
    color: var(--accent);
  }

  .progress-bar {
    height: var(--space-2);
    background: var(--bg-surface);
    border-radius: 9999px;
    overflow: hidden;
    margin-bottom: var(--space-3);
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(135deg, var(--accent) 0%, #14b8a6 100%);
    border-radius: 9999px;
    transition: width 0.5s ease;
  }

  .progress-text {
    font-size: var(--text-sm, 0.875rem);
    color: var(--text-tertiary);
    text-align: center;
    margin: 0;
  }

  /* ===== Actions Grid ===== */
  .actions-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-4);
  }

  .action-card {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: var(--space-5) var(--space-3);
    text-align: center;
    cursor: pointer;
    transition: all 0.25s ease;
  }

  .action-card:hover {
    border-color: var(--accent);
    transform: translateY(-2px);
    box-shadow: var(--shadow-glow);
  }

  .action-card-accent {
    background: var(--accent-dim);
    border-color: var(--accent);
  }

  .action-card-accent:hover {
    background: var(--accent);
    color: var(--bg-base);
  }

  .action-icon {
    font-size: 2rem;
    margin-bottom: var(--space-2);
  }

  .action-title {
    font-family: var(--font-body);
    font-size: var(--text-sm, 0.875rem);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--space-1);
  }

  .action-desc {
    font-size: var(--text-xs, 0.75rem);
    color: var(--text-tertiary);
  }

  /* ===== Responsive Design ===== */
  @media (max-width: 1200px) {
    .dashboard-container {
      max-width: 900px;
    }
    
    .practice-layout {
      grid-template-columns: 1fr 350px;
      gap: var(--space-4);
    }
  }

  @media (max-width: 768px) {
    .dashboard-container {
      max-width: 600px;
    }
    
    .practice-layout {
      grid-template-columns: 1fr;
      grid-template-rows: auto;
      max-height: none;
      padding: var(--space-4);
    }

    .hero-section {
      padding: var(--space-8) var(--space-4);
    }

    .hero-title {
      font-size: var(--text-3xl, 1.875rem);
    }

    .stats-bar {
      gap: var(--space-3);
      padding: var(--space-4);
    }

    .stat-item {
      min-width: 80px;
      padding: var(--space-3) var(--space-4);
    }

    .stat-number {
      font-size: var(--text-2xl, 1.5rem);
    }

    .daily-practice-area {
      min-height: calc(100vh - 180px);
    }

    .actions-grid {
      gap: var(--space-3);
    }
  }

  /* Desktop responsiveness */
  @media (min-width: 768px) {
    .dashboard-container {
      max-width: 480px;
      margin-top: var(--space-4);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      min-height: auto;
      height: calc(100vh - 2rem);
      overflow: hidden;
    }

    .daily-practice-area {
      min-height: 500px;
    }
  }
</style>