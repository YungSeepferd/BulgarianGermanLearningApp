/**
 * UI Components Index
 *
 * Centralized exports for all reusable UI components.
 */

// Button components
export { default as Button } from './button/button.svelte';
export { buttonVariants } from './button/index.js';

// Dialog components
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './dialog/index.js';

// Badge component
export { default as Badge } from './badge/badge.svelte';
export { badgeVariants } from './badge/index.js';

// Toast components
export { default as Toast } from './Toast.svelte';
export { default as Toaster } from './Toaster.svelte';

// Skeleton components
export { default as SkeletonCard } from './skeleton/SkeletonCard.svelte';
export { default as SkeletonDashboard } from './skeleton/SkeletonDashboard.svelte';
export { default as SkeletonList } from './skeleton/SkeletonList.svelte';

// Empty state
export { default as EmptyState } from './EmptyState.svelte';

// Other UI components
export { default as MasteryGauge } from './MasteryGauge.svelte';
export { default as ActionButton } from './ActionButton.svelte';
export { default as VocabularyCard } from './VocabularyCard.svelte';
