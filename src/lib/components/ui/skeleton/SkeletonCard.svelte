<script lang="ts">
  /**
   * SkeletonCard - Loading placeholder for vocabulary cards
   *
   * Shows a pulsing skeleton layout that mimics the VocabularyCard structure
   */

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();
</script>

<div class="skeleton-card {className}" role="status" aria-label="Loading vocabulary card">
  <!-- Emoji placeholder -->
  <div class="skeleton-emoji"></div>

  <!-- Content area -->
  <div class="skeleton-content">
    <!-- German word -->
    <div class="skeleton-line skeleton-line-short"></div>

    <!-- Bulgarian word -->
    <div class="skeleton-line skeleton-line-medium"></div>

    <!-- Part of speech tags -->
    <div class="skeleton-tags">
      <div class="skeleton-tag"></div>
      <div class="skeleton-tag"></div>
    </div>
  </div>

  <!-- Action buttons placeholder -->
  <div class="skeleton-actions">
    <div class="skeleton-button"></div>
    <div class="skeleton-button"></div>
  </div>
</div>

<style>
  .skeleton-card {
    display: flex;
    align-items: center;
    gap: var(--spacing-4, 1rem);
    padding: var(--spacing-4, 1rem);
    background-color: var(--color-bg-primary, white);
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: var(--radius-lg, 0.5rem);
    min-height: 100px;
  }

  .skeleton-emoji {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md, 0.375rem);
    background: linear-gradient(
      90deg,
      var(--color-bg-tertiary, #f3f4f6) 25%,
      var(--color-bg-secondary, #f9fafb) 50%,
      var(--color-bg-tertiary, #f3f4f6) 75%
    );
    background-size: 200% 100%;
    animation: pulse 1.5s ease-in-out infinite;
    flex-shrink: 0;
  }

  .skeleton-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2, 0.5rem);
  }

  .skeleton-line {
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
  }

  .skeleton-line-short {
    width: 60%;
  }

  .skeleton-line-medium {
    width: 80%;
  }

  .skeleton-tags {
    display: flex;
    gap: var(--spacing-2, 0.5rem);
    margin-top: var(--spacing-1, 0.25rem);
  }

  .skeleton-tag {
    width: 60px;
    height: 1.25rem;
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

  .skeleton-actions {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2, 0.5rem);
    flex-shrink: 0;
  }

  .skeleton-button {
    width: 40px;
    height: 40px;
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
    .skeleton-emoji,
    .skeleton-line,
    .skeleton-tag,
    .skeleton-button {
      animation: none;
      background: var(--color-bg-tertiary, #f3f4f6);
    }
  }

  /* Mobile adjustments */
  @media (max-width: 640px) {
    .skeleton-card {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-3, 0.75rem);
    }

    .skeleton-actions {
      flex-direction: row;
      width: 100%;
      justify-content: flex-end;
    }

    .skeleton-emoji {
      width: 40px;
      height: 40px;
    }
  }
</style>
