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

  import { progressService } from '$lib/services/progress';
  import LevelUpModal from './gamification/LevelUpModal.svelte';
  import { fireConfetti as confetti } from '$lib/utils/confetti';

  // State
  let showLevelUpModal = $state(false);
  let levelUpMessage = $state('');

  // Derived state
  let progressSummary = $derived(progressService.getProgressSummary());
  let levelInfo = $derived(progressService.getLevelInfo());
  let vocabularyStats = $derived(progressService.getVocabularyMasteryStats());
  let lessonStats = $derived(progressService.getLessonCompletionStats());
  let recentProgress = $derived(progressService.getRecentDailyProgress(7));

  // Check for level up
  $effect(() => {
    const newLevel = levelInfo.level;
    if (newLevel > (progressSummary.currentLevel || 1)) {
      levelUpMessage = `Level Up! You've reached level ${newLevel}!`;
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
    });
  };
</script>

<div class="progress-dashboard" aria-label="Progress dashboard">
  <!-- Level Up Modal -->
  {#if showLevelUpModal}
    <LevelUpModal
      level={levelInfo.level}
      onClose={() => showLevelUpModal = false}
    />
  {/if}

  <div class="dashboard-grid">
    <!-- Level and XP Card -->
    <div class="dashboard-card level-card">
      <h2 class="card-title">Level {levelInfo.level}</h2>
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
          Beginner - Just getting started
        {:else if levelInfo.level < 5}
          Intermediate - Building skills
        {:else if levelInfo.level < 10}
          Advanced - Mastering the language
        {:else}
          Expert - Fluent in Bulgarian!
        {/if}
      </p>
    </div>

    <!-- Daily Goal Card -->
    <div class="dashboard-card daily-goal-card">
      <h2 class="card-title">Daily Goal</h2>
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
          🎉 Daily goal completed! Come back tomorrow for more XP.
        {:else}
          {learningSession.dailyTarget - Math.round(progressSummary.totalXP % learningSession.dailyTarget)} XP to reach your daily goal
        {/if}
      </p>
    </div>

    <!-- Streak Card -->
    <div class="dashboard-card streak-card">
      <h2 class="card-title">Streak</h2>
      <div class="streak-display">
        <div class="streak-icon">🔥</div>
        <div class="streak-value">{progressSummary.currentStreak}</div>
        <div class="streak-label">day streak</div>
      </div>
      <div class="streak-details">
        <div class="streak-info">
          <span class="streak-label">Longest streak:</span>
          <span class="streak-value">{progressSummary.longestStreak} days</span>
        </div>
      </div>
    </div>

    <!-- Vocabulary Mastery Card -->
    <div class="dashboard-card vocabulary-card">
      <h2 class="card-title">Vocabulary</h2>
      <div class="vocabulary-stats">
        <div class="stat-item">
          <div class="stat-value">{vocabularyStats.masteredItems}</div>
          <div class="stat-label">Mastered</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{Math.round(vocabularyStats.masteryPercentage)}%</div>
          <div class="stat-label">Mastery</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{vocabularyStats.totalItems}</div>
          <div class="stat-label">Total</div>
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
      <h2 class="card-title">Lessons</h2>
      <div class="lesson-stats">
        <div class="stat-item">
          <div class="stat-value">{lessonStats.completedLessons}</div>
          <div class="stat-label">Completed</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{Math.round(lessonStats.completionPercentage)}%</div>
          <div class="stat-label">Completion</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{lessonStats.totalLessons}</div>
          <div class="stat-label">Total</div>
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
      <h2 class="card-title">Recent Activity</h2>
      <div class="activity-list">
        {#if recentProgress.length > 0}
          {#each recentProgress as day, index}
            <div class="activity-item {index === 0 ? 'today' : ''}">
              <div class="activity-date">
                {index === 0 ? 'Today' : formatDate(day.date)}
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
            No recent activity. Start practicing to see your progress!
          </div>
        {/if}
      </div>
    </div>
  </div>
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