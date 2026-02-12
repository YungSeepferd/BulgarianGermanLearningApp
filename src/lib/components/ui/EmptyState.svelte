<script lang="ts">
  /**
   * EmptyState - Consistent empty state component
   *
   * Used when no data is available, search returns no results,
   * or a feature hasn't been used yet.
   *
   * Features:
   * - Entrance animation with svelte-motion
   * - Reduced motion support for accessibility
   * - Icon animation on mount
   */

  import { buttonVariants } from '$lib/components/ui/button';
  import { Motion } from 'svelte-motion';

  interface Props {
    icon?: string;
    title: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
    variant?: 'default' | 'search' | 'error' | 'success';
    animated?: boolean;
  }

  let {
    icon = '📭',
    title,
    description = undefined,
    actionLabel = undefined,
    actionHref = undefined,
    onAction = undefined,
    variant = 'default',
    animated = true
  }: Props = $props();

  const variantIcons: Record<typeof variant, string> = {
    default: '📭',
    search: '🔍',
    error: '⚠️',
    success: '✅'
  };

  const displayIcon = $derived(variantIcons[variant] || icon);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15,
        delay: 0.1
      }
    }
  };

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // Use $derived to react to animated prop changes
  const shouldAnimate = $derived(animated && !prefersReducedMotion);
</script>

{#if shouldAnimate}
  <Motion
    initial="hidden"
    animate="visible"
    variants={containerVariants}
    let:motion
  >
    <div
      use:motion
      class="empty-state {variant}"
      role="status"
      aria-live="polite"
    >
      <Motion variants={iconVariants} let:motion>
        <div use:motion class="empty-state-icon" aria-hidden="true">
          {displayIcon}
        </div>
      </Motion>

      <Motion variants={itemVariants} let:motion>
        <h3 use:motion class="empty-state-title">{title}</h3>
      </Motion>

      {#if description}
        <Motion variants={itemVariants} let:motion>
          <p use:motion class="empty-state-description">{description}</p>
        </Motion>
      {/if}

      {#if actionLabel && (actionHref || onAction)}
        <Motion variants={itemVariants} let:motion>
          <div use:motion class="empty-state-action">
            {#if actionHref}
              <a href={actionHref} class={buttonVariants({ variant: 'default' })}>
                {actionLabel}
              </a>
            {:else if onAction}
              <button type="button" onclick={onAction} class={buttonVariants({ variant: 'default' })}>
                {actionLabel}
              </button>
            {/if}
          </div>
        </Motion>
      {/if}
    </div>
  </Motion>
{:else}
  <!-- Non-animated version for accessibility -->
  <div class="empty-state {variant}" role="status" aria-live="polite">
    <div class="empty-state-icon" aria-hidden="true">
      {displayIcon}
    </div>
    <h3 class="empty-state-title">{title}</h3>
    {#if description}
      <p class="empty-state-description">{description}</p>
    {/if}
    {#if actionLabel && (actionHref || onAction)}
      <div class="empty-state-action">
        {#if actionHref}
          <a href={actionHref} class={buttonVariants({ variant: 'default' })}>
            {actionLabel}
          </a>
        {:else if onAction}
          <button type="button" onclick={onAction} class={buttonVariants({ variant: 'default' })}>
            {actionLabel}
          </button>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: var(--spacing-8, 2rem);
    min-height: 300px;
    background: linear-gradient(135deg, var(--color-bg-primary, white) 0%, var(--color-bg-secondary, #f9fafb) 100%);
    border-radius: var(--radius-xl, 1rem);
    border: 2px dashed var(--color-border, #e5e7eb);
  }

  .empty-state-icon {
    font-size: 4rem;
    margin-bottom: var(--spacing-4, 1rem);
    line-height: 1;
  }

  .empty-state-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text-primary, #111827);
    margin: 0 0 var(--spacing-2, 0.5rem) 0;
  }

  .empty-state-description {
    font-size: 1rem;
    color: var(--color-text-secondary, #6b7280);
    margin: 0 0 var(--spacing-6, 1.5rem) 0;
    max-width: 400px;
    line-height: 1.5;
  }

  .empty-state-action {
    margin-top: var(--spacing-2, 0.5rem);
  }

  /* Variant styles */
  .empty-state.search {
    border-color: var(--color-info, #3b82f6);
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%);
  }

  .empty-state.error {
    border-color: var(--color-error, #ef4444);
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%);
  }

  .empty-state.success {
    border-color: var(--color-success, #22c55e);
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(34, 197, 94, 0.02) 100%);
  }

  /* Mobile adjustments */
  @media (max-width: 640px) {
    .empty-state {
      min-height: 250px;
      padding: var(--spacing-6, 1.5rem);
    }

    .empty-state-icon {
      font-size: 3rem;
    }

    .empty-state-title {
      font-size: 1.125rem;
    }

    .empty-state-description {
      font-size: 0.875rem;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .empty-state {
      transition: none;
    }
  }
</style>
