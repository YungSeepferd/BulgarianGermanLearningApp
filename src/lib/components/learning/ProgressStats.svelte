<script lang="ts">
  import type { VocabularyProgress } from '$lib/types/progress';

  interface Props {
    progress: VocabularyProgress;
  }

  let { progress }: Props = $props();

  // Calculate mastery percentage
  const masteryPercentage = $derived(Math.round(progress.mastery * 100));

  // Format next review date
  const nextReviewFormatted = $derived.by(() => {
    if (!progress.nextReview) return 'Not scheduled';
    
    const date = new Date(progress.nextReview);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Due now';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  });

  // SVG circle calculations for progress ring
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = $derived(
    circumference - (masteryPercentage / 100) * circumference
  );

  // Get mastery level color
  const masteryColor = $derived.by(() => {
    if (masteryPercentage >= 80) return '#10b981'; // green
    if (masteryPercentage >= 50) return '#f59e0b'; // orange
    return '#ef4444'; // red
  });
</script>

<div class="progress-stats">
  <div class="stats-header">
    <h3>Your Progress</h3>
  </div>

  <!-- Circular Progress -->
  <div class="circular-progress">
    <svg viewBox="0 0 100 100" class="progress-ring">
      <!-- Background circle -->
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        stroke-width="8"
      />
      <!-- Progress circle -->
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke={masteryColor}
        stroke-width="8"
        stroke-dasharray={circumference}
        stroke-dashoffset={progressOffset}
        stroke-linecap="round"
        transform="rotate(-90 50 50)"
        class="progress-circle"
      />
    </svg>
    <div class="progress-text">
      <span class="percentage">{masteryPercentage}%</span>
      <span class="label">Mastery</span>
    </div>
  </div>

  <!-- Stats Grid -->
  <div class="stats-grid">
    <div class="stat-item">
      <div class="stat-value">{progress.attempts}</div>
      <div class="stat-label">Attempts</div>
    </div>
    <div class="stat-item">
      <div class="stat-value correct">{progress.correct}</div>
      <div class="stat-label">Correct</div>
    </div>
    <div class="stat-item">
      <div class="stat-value incorrect">{progress.attempts - progress.correct}</div>
      <div class="stat-label">Incorrect</div>
    </div>
  </div>

  <!-- Next Review -->
  <div class="next-review">
    <span class="review-icon">📅</span>
    <div class="review-info">
      <div class="review-label">Next Review</div>
      <div class="review-date">{nextReviewFormatted}</div>
    </div>
  </div>

  <!-- User Stats removed - will add in Phase 2 with full gamification -->
</div>

<style>
  .progress-stats {
    padding: var(--spacing-6, 1.5rem);
    background-color: var(--color-bg-primary, #ffffff);
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: var(--radius-lg, 0.5rem);
    box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
    min-width: 280px;
  }

  .stats-header h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-text-primary, #111827);
    margin: 0 0 var(--spacing-4, 1rem) 0;
  }

  /* Circular Progress */
  .circular-progress {
    position: relative;
    width: 120px;
    height: 120px;
    margin: 0 auto var(--spacing-6, 1.5rem) auto;
  }

  .progress-ring {
    width: 100%;
    height: 100%;
    transform: rotate(0deg);
  }

  .progress-circle {
    transition: stroke-dashoffset 0.5s ease-in-out;
  }

  .progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }

  .percentage {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text-primary, #111827);
    line-height: 1;
  }

  .label {
    display: block;
    font-size: 0.75rem;
    color: var(--color-text-secondary, #6b7280);
    margin-top: var(--spacing-1, 0.25rem);
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-3, 0.75rem);
    margin-bottom: var(--spacing-4, 1rem);
    padding-bottom: var(--spacing-4, 1rem);
    border-bottom: 1px solid var(--color-border, #e5e7eb);
  }

  .stat-item {
    text-align: center;
  }

  .stat-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text-primary, #111827);
    margin-bottom: var(--spacing-1, 0.25rem);
  }

  .stat-value.correct {
    color: #10b981;
  }

  .stat-value.incorrect {
    color: #ef4444;
  }

  .stat-label {
    font-size: 0.75rem;
    color: var(--color-text-secondary, #6b7280);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Next Review */
  .next-review {
    display: flex;
    align-items: center;
    gap: var(--spacing-3, 0.75rem);
    padding: var(--spacing-3, 0.75rem);
    background-color: var(--color-bg-tertiary, #eff6ff);
    border-radius: var(--radius-md, 0.375rem);
    margin-bottom: var(--spacing-4, 1rem);
  }

  .review-icon {
    font-size: 1.5rem;
  }

  .review-info {
    flex: 1;
  }

  .review-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-secondary, #6b7280);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .review-date {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-primary, #111827);
    margin-top: var(--spacing-1, 0.25rem);
  }

  /* User Stats */
  .user-stats {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2, 0.5rem);
  }

  .stat-row {
    display: flex;
    align-items: center;
    gap: var(--spacing-2, 0.5rem);
    padding: var(--spacing-2, 0.5rem);
    background-color: var(--color-bg-secondary, #f9fafb);
    border-radius: var(--radius-md, 0.375rem);
  }

  .stat-icon {
    font-size: 1rem;
  }

  .stat-text {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-primary, #111827);
  }

  @media (max-width: 640px) {
    .progress-stats {
      min-width: auto;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-2, 0.5rem);
      background-color: var(--color-bg-secondary, #f9fafb);
      border-radius: var(--radius-md, 0.375rem);
    }

    .stat-label {
      font-size: 0.875rem;
    }
  }
</style>
