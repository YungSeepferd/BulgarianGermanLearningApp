<script lang="ts">
  /**
   * SkeletonDashboard - Loading placeholder for Daily 10 Dashboard
   *
   * Shows a skeleton layout that mimics the swipeable card interface
   */

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();
</script>

<div class="skeleton-dashboard {className}" role="status" aria-label="Loading daily vocabulary">
  <!-- Header -->
  <div class="skeleton-header">
    <div class="skeleton-title"></div>
    <div class="skeleton-subtitle"></div>
  </div>

  <!-- Progress dots -->
  <div class="skeleton-progress">
    {#each Array(10) as _, i (i)}
      <div class="skeleton-dot"></div>
    {/each}
  </div>

  <!-- Card stack area -->
  <div class="skeleton-card-stack">
    <!-- Background cards (stacked) -->
    <div class="skeleton-card-bg skeleton-card-bg-2"></div>
    <div class="skeleton-card-bg skeleton-card-bg-1"></div>

    <!-- Main card -->
    <div class="skeleton-card-main">
      <div class="skeleton-card-content">
        <div class="skeleton-emoji-large"></div>
        <div class="skeleton-word-main"></div>
        <div class="skeleton-word-sub"></div>
        <div class="skeleton-hint"></div>
      </div>

      <!-- Swipe indicators -->
      <div class="skeleton-swipe-hint skeleton-swipe-left">
        <div class="skeleton-swipe-icon"></div>
      </div>
      <div class="skeleton-swipe-hint skeleton-swipe-right">
        <div class="skeleton-swipe-icon"></div>
      </div>
    </div>
  </div>

  <!-- Action buttons -->
  <div class="skeleton-actions">
    <div class="skeleton-action-btn"></div>
    <div class="skeleton-action-btn skeleton-action-btn-primary"></div>
  </div>
</div>

<style>
  .skeleton-dashboard {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--spacing-4, 1rem);
    gap: var(--spacing-6, 1.5rem);
    min-height: 600px;
  }

  .skeleton-header {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2, 0.5rem);
  }

  .skeleton-title {
    width: 200px;
    height: 2rem;
    border-radius: var(--radius-md, 0.375rem);
    background: linear-gradient(
      90deg,
      var(--color-bg-tertiary, #f3f4f6) 25%,
      var(--color-bg-secondary, #f9fafb) 50%,
      var(--color-bg-tertiary, #f3f4f6) 75%
    );
    background-size: 200% 100%;
    animation: pulse 1.5s ease-in-out infinite;
    margin: 0 auto;
  }

  .skeleton-subtitle {
    width: 280px;
    height: 1rem;
    border-radius: var(--radius-sm, 0.25rem);
    background: linear-gradient(
      90deg,
      var(--color-bg-tertiary, #f3f4f6) 25%,
      var(--color-bg-secondary, #f9fafb) 50%,
      var(--color-bg-tertiary, #f3f4f6) 75%
    );
    background-size: 200% 100%;
    animation: pulse 1.5s ease-in-out infinite;
    margin: 0 auto;
  }

  .skeleton-progress {
    display: flex;
    gap: var(--spacing-2, 0.5rem);
    justify-content: center;
  }

  .skeleton-dot {
    width: 8px;
    height: 8px;
    border-radius: var(--radius-full, 9999px);
    background: linear-gradient(
      90deg,
      var(--color-bg-tertiary, #f3f4f6) 25%,
      var(--color-bg-secondary, #f9fafb) 50%,
      var(--color-bg-tertiary, #f3f4f6) 75%
    );
    background-size: 200% 100%;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-card-stack {
    position: relative;
    width: 100%;
    max-width: 400px;
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .skeleton-card-bg {
    position: absolute;
    width: 90%;
    height: 90%;
    border-radius: var(--radius-xl, 1rem);
    background: var(--color-bg-tertiary, #f3f4f6);
    opacity: 0.5;
  }

  .skeleton-card-bg-1 {
    transform: translateY(-8px) scale(0.95);
  }

  .skeleton-card-bg-2 {
    transform: translateY(-16px) scale(0.9);
  }

  .skeleton-card-main {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: var(--radius-xl, 1rem);
    background: var(--color-bg-primary, white);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .skeleton-card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-4, 1rem);
    padding: var(--spacing-6, 1.5rem);
  }

  .skeleton-emoji-large {
    width: 80px;
    height: 80px;
    border-radius: var(--radius-lg, 0.5rem);
    background: linear-gradient(
      90deg,
      var(--color-bg-tertiary, #f3f4f6) 25%,
      var(--color-bg-secondary, #f9fafb) 50%,
      var(--color-bg-tertiary, #f3f4f6) 75%
    );
    background-size: 200% 100%;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-word-main {
    width: 200px;
    height: 2rem;
    border-radius: var(--radius-md, 0.375rem);
    background: linear-gradient(
      90deg,
      var(--color-bg-tertiary, #f3f4f6) 25%,
      var(--color-bg-secondary, #f9fafb) 50%,
      var(--color-bg-tertiary, #f3f4f6) 75%
    );
    background-size: 200% 100%;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-word-sub {
    width: 160px;
    height: 1.5rem;
    border-radius: var(--radius-md, 0.375rem);
    background: linear-gradient(
      90deg,
      var(--color-bg-tertiary, #f3f4f6) 25%,
      var(--color-bg-secondary, #f9fafb) 50%,
      var(--color-bg-tertiary, #f3f4f6) 75%
    );
    background-size: 200% 100%;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-hint {
    width: 120px;
    height: 0.875rem;
    border-radius: var(--radius-sm, 0.25rem);
    background: linear-gradient(
      90deg,
      var(--color-bg-tertiary, #f3f4f6) 25%,
      var(--color-bg-secondary, #f9fafb) 50%,
      var(--color-bg-tertiary, #f3f4f6) 75%
    );
    background-size: 200% 100%;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-swipe-hint {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.3;
  }

  .skeleton-swipe-left {
    left: 0;
    background: linear-gradient(to right, rgba(245, 158, 11, 0.2), transparent);
  }

  .skeleton-swipe-right {
    right: 0;
    background: linear-gradient(to left, rgba(34, 197, 94, 0.2), transparent);
  }

  .skeleton-swipe-icon {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-full, 9999px);
    background: var(--color-bg-tertiary, #f3f4f6);
  }

  .skeleton-actions {
    display: flex;
    gap: var(--spacing-4, 1rem);
    width: 100%;
    max-width: 400px;
    justify-content: center;
  }

  .skeleton-action-btn {
    flex: 1;
    height: 48px;
    border-radius: var(--radius-lg, 0.5rem);
    background: linear-gradient(
      90deg,
      var(--color-bg-tertiary, #f3f4f6) 25%,
      var(--color-bg-secondary, #f9fafb) 50%,
      var(--color-bg-tertiary, #f3f4f6) 75%
    );
    background-size: 200% 100%;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-action-btn-primary {
    background: linear-gradient(
      90deg,
      rgba(34, 197, 94, 0.2) 25%,
      rgba(34, 197, 94, 0.3) 50%,
      rgba(34, 197, 94, 0.2) 75%
    );
    background-size: 200% 100%;
  }

  @keyframes pulse {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .skeleton-title,
    .skeleton-subtitle,
    .skeleton-dot,
    .skeleton-emoji-large,
    .skeleton-word-main,
    .skeleton-word-sub,
    .skeleton-hint,
    .skeleton-action-btn {
      animation: none;
      background: var(--color-bg-tertiary, #f3f4f6);
    }
  }

  /* Mobile adjustments */
  @media (max-width: 640px) {
    .skeleton-card-stack {
      height: 350px;
    }

    .skeleton-emoji-large {
      width: 64px;
      height: 64px;
    }

    .skeleton-word-main {
      width: 160px;
    }

    .skeleton-word-sub {
      width: 120px;
    }
  }
</style>
