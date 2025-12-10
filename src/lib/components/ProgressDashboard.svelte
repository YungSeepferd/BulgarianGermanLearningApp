<script lang="ts">
  /**
   * Progress Dashboard Component
   *
   * Displays comprehensive user progress information including:
   * - Level and XP progress
   * - Daily goal progress
   * - Vocabulary mastery
   * - Lesson completion
   * - Streak information
   * - Recent activity
   */

  import { ProgressService } from '$lib/services/progress.js';
  import { EventBus } from '$lib/services/event-bus.js';
  import { Debug } from '$lib/utils.js';
  import { t as translate } from '$lib/services/localization.js';

  // Create a new ProgressService instance directly to avoid DI container issues
  let progressService: any;

  // Initialize progress service
  const initializeProgressService = () => {
    try {
      // Create a new event bus
      const eventBus = new EventBus();

      // Create a new ProgressService instance directly
      const newProgressService = new ProgressService(eventBus);
      console.log('New ProgressService instance created:', newProgressService);

      // Verify the service has the expected methods by checking the prototype
      const isValid = newProgressService &&
                     typeof newProgressService.isProgressDataValid === 'function' &&
                     typeof newProgressService.validateAndRepairProgressData === 'function' &&
                     typeof newProgressService.getProgressSummary === 'function';

      if (isValid) {
        progressService = newProgressService;
        console.log('ProgressService is valid, using it');
      } else {
        console.error('ProgressService is corrupted, using fallback');
        progressService = getFallbackProgressService();
      }

    } catch (error) {
      console.error('Failed to create progressService:', error);
      progressService = getFallbackProgressService();
    }
  };

  // Fallback to a mock service if ProgressService creation fails
  const getFallbackProgressService = () => {
    console.log('Using fallback progress service');
    return {
      isProgressDataValid: () => true,
      validateAndRepairProgressData: async () => {},
      getProgressSummary: () => ({
        totalXP: 0,
        currentLevel: 1,
        levelProgress: 0,
        wordsPracticed: 0,
        lessonsCompleted: 0,
        quizzesTaken: 0,
        currentStreak: 0,
        longestStreak: 0,
        dailyGoalProgress: 0,
        dailyXP: 0
      }),
      getLevelInfo: () => ({
        level: 1,
        currentXP: 0,
        nextLevelXP: 100,
        progressPercentage: 0
      }),
      getVocabularyMasteryStats: () => ({
        totalItems: 0,
        masteredItems: 0,
        masteryPercentage: 0,
        averageMasteryLevel: 0
      }),
      getLessonCompletionStats: () => ({
        totalLessons: 0,
        completedLessons: 0,
        completionPercentage: 0
      }),
      getRecentDailyProgress: () => []
    };
  };
  import { learningSession } from '$lib/state/session.svelte';
  import LevelUpModal from './gamification/LevelUpModal.svelte';
  import { fireConfetti as confetti } from '$lib/utils/confetti.js';

  // State
  let showLevelUpModal = $state(false);
  let isLoading = $state(true);
  let isRefreshing = $state(false);
  let lastError = $state<string | null>(null);
  const loadData = async () => {
    try {
      isLoading = true;
      lastError = null;

      // Initialize progress service if not already done
      if (!progressService) {
        initializeProgressService();
      }

      // Use fallback if service is still not available
      const service = progressService || getFallbackProgressService();

      // Check if progress data is valid and repair if needed
      console.log('ProgressService before check:', service);
      console.log('isProgressDataValid method:', service?.isProgressDataValid);
      if (service && typeof service.isProgressDataValid === 'function' && !service.isProgressDataValid()) {
        console.log('Progress data is invalid, repairing...');
        await service.validateAndRepairProgressData();
      } else {
        console.log('Progress data is valid or service is not available');
      }

    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Failed to load progress data';
      console.error('Error loading progress data:', error);
    } finally {
      isLoading = false;
    }
  };

  // Refresh data
  const refreshData = async () => {
    try {
      isRefreshing = true;
      lastError = null;
      await loadData();
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Failed to refresh progress data';
      console.error('Error refreshing progress data:', error);
    } finally {
      isRefreshing = false;
    }
  };

  // Initial data load with cleanup
  $effect(() => {
    loadData();

    // Return cleanup function
    return () => {
      // Cleanup any resources if needed
    };
  });

  // Derived state with memoization to prevent unnecessary recalculations
  let progressSummary = $derived.by(() => {
    const service = progressService || getFallbackProgressService();
    return service.getProgressSummary();
  });

  let levelInfo = $derived.by(() => {
    const service = progressService || getFallbackProgressService();
    return service.getLevelInfo();
  });

  let vocabularyStats = $derived.by(() => {
    const service = progressService || getFallbackProgressService();
    return service.getVocabularyMasteryStats();
  });

  let lessonStats = $derived.by(() => {
    const service = progressService || getFallbackProgressService();
    return service.getLessonCompletionStats();
  });

  let recentProgress = $derived.by(() => {
    const service = progressService || getFallbackProgressService();
    return service.getRecentDailyProgress(7);
  });

  // Check for level up
  $effect(() => {
    if (levelInfo.level > progressSummary.currentLevel) {
      showLevelUpModal = true;
      confetti();
    }
  });

  // Format time spent
  const formatTimeSpent = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    } as Intl.DateTimeFormatOptions);
  };
</script>

<div class="progress-dashboard" aria-label="Progress dashboard" aria-busy={isLoading || isRefreshing}>
  <!-- Loading State -->
  {#if isLoading}
    <div class="loading-state">
      <div class="loading-spinner">🌀</div>
      <p>Loading your progress...</p>
    </div>
  {:else if lastError}
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{lastError || translate('common.retry')}</p>
      <button onclick={loadData} class="retry-button">Retry</button>
    </div>
  {:else}
    <!-- Level Up Modal -->
    {#if showLevelUpModal}
      <LevelUpModal
        currentLevel={levelInfo.level}
        onClose={() => showLevelUpModal = false}
      />
    {/if}

    <div class="dashboard-header">
      <h1>{translate('progress.dashboard_title')}</h1>
      <button
        onclick={refreshData}
        class="refresh-button"
        disabled={isRefreshing}
        aria-label="Refresh progress data"
      >
        {isRefreshing ? translate('common.refreshing') : '🔄 ' + translate('common.refresh')}
      </button>
    </div>

    <div class="dashboard-grid">
      <!-- Level and XP Card -->
      <div class="dashboard-card level-card">
        <h2 class="card-title">{translate('progress.level')} {levelInfo.level}</h2>
        <div class="level-progress">
          <div class="progress-bar-container">
            <div
              class="progress-bar"
              role="progressbar"
              aria-valuenow={levelInfo.progressPercentage}
              aria-valuemin="0"
              aria-valuemax="100"
              style={`--progress: ${levelInfo.progressPercentage}%`}
            ></div>
          </div>
          <div class="progress-labels">
            <span>{levelInfo.currentXP} / {levelInfo.nextLevelXP} XP</span>
            <span>{Math.round(levelInfo.progressPercentage)}%</span>
          </div>
        </div>
        <p class="level-description">
          {#if levelInfo.level === 1}
            {translate('progress.level_beginner')}
          {:else if levelInfo.level < 5}
            {translate('progress.level_intermediate')}
          {:else if levelInfo.level < 10}
            {translate('progress.level_advanced')}
          {:else}
            {translate('progress.level_expert')}
          {/if}
        </p>
      </div>

      <!-- Daily Goal Card -->
      <div class="dashboard-card daily-goal-card">
        <h2 class="card-title">{translate('progress.daily_goal')}</h2>
        <div class="daily-progress">
          <div class="progress-circle-container">
            <svg class="progress-circle" viewBox="0 0 100 100" aria-hidden="true">
              <circle
                class="progress-circle-bg"
                cx="50"
                cy="50"
                r="45"
              />
              <circle
                class="progress-circle-bar"
                cx="50"
                cy="50"
                r="45"
                style={`--progress: ${progressSummary.dailyGoalProgress}`}
              />
            </svg>
            <div class="progress-circle-text">
              {Math.round(progressSummary.dailyGoalProgress)}%
            </div>
          </div>
        </div>
        <p class="daily-goal-description">
          {#if progressSummary.dailyGoalProgress >= 100}
            🎉 {translate('progress.daily_goal_completed')}
          {:else if learningSession.dailyTarget}
            {Math.max(0, learningSession.dailyTarget - progressSummary.dailyXP)} XP bis zum Tagesziel
          {:else}
            {translate('progress.keep_practicing')}
          {/if}
        </p>
      </div>

      <!-- Streak Card -->
      <div class="dashboard-card streak-card">
        <h2 class="card-title">{translate('progress.streak')}</h2>
        <div class="streak-display">
          <div class="streak-icon">🔥</div>
          <div class="streak-value">{progressSummary.currentStreak}</div>
          <div class="streak-label">{translate('progress.day_streak')}</div>
        </div>
        <div class="streak-details">
          <div class="streak-info">
            <span class="streak-label">{translate('progress.longest_streak')}:</span>
            <span class="streak-value">{progressSummary.longestStreak} days</span>
          </div>
        </div>
      </div>

      <!-- Vocabulary Mastery Card -->
      <div class="dashboard-card vocabulary-card">
        <h2 class="card-title">{translate('progress.vocabulary')}</h2>
        <div class="vocabulary-stats">
          <div class="stat-item">
            <div class="stat-value">{vocabularyStats.masteredItems}</div>
            <div class="stat-label">{translate('progress.mastered')}</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{Math.round(vocabularyStats.masteryPercentage)}%</div>
            <div class="stat-label">{translate('progress.mastery')}</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{vocabularyStats.totalItems}</div>
            <div class="stat-label">{translate('progress.total')}</div>
          </div>
        </div>
        <div class="vocabulary-progress">
          <div class="progress-bar-container">
            <div
              class="progress-bar"
              role="progressbar"
              aria-valuenow={vocabularyStats.masteryPercentage}
              aria-valuemin="0"
              aria-valuemax="100"
              style={`--progress: ${vocabularyStats.masteryPercentage}%`}
            ></div>
          </div>
        </div>
      </div>

      <!-- Lessons Card -->
      <div class="dashboard-card lessons-card">
        <h2 class="card-title">{translate('progress.lessons')}</h2>
        <div class="lesson-stats">
          <div class="stat-item">
            <div class="stat-value">{lessonStats.completedLessons}</div>
            <div class="stat-label">{translate('progress.completed')}</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{Math.round(lessonStats.completionPercentage)}%</div>
            <div class="stat-label">{translate('progress.completion')}</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{lessonStats.totalLessons}</div>
            <div class="stat-label">{translate('progress.total')}</div>
          </div>
        </div>
        <div class="lesson-progress">
          <div class="progress-bar-container">
            <div
              class="progress-bar"
              role="progressbar"
              aria-valuenow={lessonStats.completionPercentage}
              aria-valuemin="0"
              aria-valuemax="100"
              style={`--progress: ${lessonStats.completionPercentage}%`}
            ></div>
          </div>
        </div>
      </div>

      <!-- Recent Activity Card -->
      <div class="dashboard-card recent-activity-card">
        <h2 class="card-title">{translate('progress.recent_activity')}</h2>
        <div class="activity-list">
          {#if recentProgress.length > 0}
            {#each recentProgress as day, index}
              <div class="activity-item {index === 0 ? 'today' : ''}">
                <div class="activity-date">
                  {index === 0 ? translate('progress.today') : formatDate(day.date)}
                </div>
                <div class="activity-details">
                  <div class="activity-xp">
                    <span class="xp-icon">⚡</span>
                    <span class="xp-value">{day.xpEarned} XP</span>
                  </div>
                  <div class="activity-words">
                    <span class="words-icon">📚</span>
                    <span class="words-value">{day.wordsPracticed} words</span>
                  </div>
                  <div class="activity-time">
                    <span class="time-icon">⏱️</span>
                    <span class="time-value">{formatTimeSpent(day.timeSpent)}</span>
                  </div>
                </div>
              </div>
            {/each}
          {:else}
            <div class="no-activity">
              {translate('progress.no_recent_activity')}
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .progress-dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
  }

  .dashboard-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .dashboard-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }

  .card-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: #1f2937;
  }

  /* Level Card Styles */
  .level-card {
    grid-column: span 2;
  }

  .level-progress {
    margin: 1rem 0;
  }

  .progress-bar-container {
    width: 100%;
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    margin: 0.5rem 0;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    border-radius: 4px;
    width: var(--progress, 0);
    transition: width 0.3s ease;
  }

  .progress-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .level-description {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: #6b7280;
    text-align: center;
  }

  /* Daily Goal Card Styles */
  .daily-goal-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .progress-circle-container {
    position: relative;
    width: 120px;
    height: 120px;
    margin: 1rem 0;
  }

  .progress-circle {
    transform: rotate(-90deg);
    width: 100%;
    height: 100%;
  }

  .progress-circle-bg {
    fill: none;
    stroke: #e5e7eb;
    stroke-width: 8;
  }

  .progress-circle-bar {
    fill: none;
    stroke: #3b82f6;
    stroke-width: 8;
    stroke-dasharray: 283;
    stroke-dashoffset: calc(283 - (283 * var(--progress, 0)) / 100);
    stroke-linecap: round;
    transition: stroke-dashoffset 0.5s ease;
  }

  .progress-circle-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
  }

  .daily-goal-description {
    font-size: 0.9rem;
    color: #6b7280;
    margin-top: 0.5rem;
  }

  /* Streak Card Styles */
  .streak-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .streak-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .streak-icon {
    font-size: 2rem;
  }

  .streak-value {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
  }

  .streak-label {
    font-size: 0.9rem;
    color: #6b7280;
  }

  .streak-details {
    margin-top: 1rem;
    width: 100%;
  }

  .streak-info {
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem;
  }

  /* Vocabulary and Lessons Card Styles */
  .vocabulary-card,
  .lessons-card {
    display: flex;
    flex-direction: column;
  }

  .vocabulary-stats,
  .lesson-stats {
    display: flex;
    justify-content: space-between;
    margin: 1rem 0;
  }

  .stat-item {
    text-align: center;
    flex: 1;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
  }

  .stat-label {
    font-size: 0.8rem;
    color: #6b7280;
    margin-top: 0.25rem;
  }

  .vocabulary-progress,
  .lesson-progress {
    margin-top: 0.5rem;
  }

  /* Recent Activity Card Styles */
  .recent-activity-card {
    grid-column: span 2;
  }

  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .activity-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 8px;
    transition: background 0.2s ease;
  }

  .activity-item:hover {
    background: #f3f4f6;
  }

  .activity-item.today {
    background: #eff6ff;
    border-left: 3px solid #3b82f6;
  }

  .activity-date {
    font-weight: 500;
    color: #1f2937;
    min-width: 80px;
  }

  .activity-details {
    display: flex;
    gap: 1rem;
    flex: 1;
    justify-content: flex-end;
  }

  .activity-xp,
  .activity-words,
  .activity-time {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.9rem;
  }

  .xp-icon,
  .words-icon,
  .time-icon {
    color: #6b7280;
  }

  .xp-value,
  .words-value,
  .time-value {
    color: #1f2937;
  }

  .no-activity {
    text-align: center;
    padding: 1rem;
    color: #6b7280;
    font-style: italic;
  }

  /* Loading and Error States */
  .loading-state,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
  }

  .loading-spinner {
    font-size: 2rem;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  .error-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .retry-button {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 1rem;
    transition: background 0.2s ease;
  }

  .retry-button:hover {
    background: #2563eb;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .dashboard-header h1 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
  }

  .refresh-button {
    background: #f3f4f6;
    color: #374151;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: background 0.2s ease;
  }

  .refresh-button:hover:not(:disabled) {
    background: #e5e7eb;
  }

  .refresh-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* Responsive Styles */
  @media (max-width: 768px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }

    .level-card,
    .recent-activity-card {
      grid-column: span 1;
    }

    .vocabulary-stats,
    .lesson-stats {
      flex-direction: column;
      gap: 0.5rem;
    }

    .activity-details {
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
    }

    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
  }

  @media (min-width: 1200px) {
    .dashboard-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .level-card,
    .recent-activity-card {
      grid-column: span 3;
    }
  }
</style>