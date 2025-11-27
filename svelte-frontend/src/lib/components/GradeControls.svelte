<!--
  GradeControls.svelte - Grading interface component
  @description Interactive grading controls for flashcard review with SM-2 feedback
  @version 1.0.0
  @updated November 2025
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { ReviewState, GradeFeedback, ScreenReaderAnnouncement } from '$lib/types/index.js';
  import { 
    generateGradeFeedback, 
    getGradeFeedbackMessage, 
    getGradeColor, 
    isValidGrade,
    formatInterval
  } from '$lib/utils/spaced-repetition.js';

  // Props
  export let onGrade: ((grade: number, feedback: GradeFeedback) => void) | undefined = undefined;
  export let disabled: boolean = false;
  export let showFeedback: boolean = true;
  export let compact: boolean = false;
  export let reviewState: ReviewState | null = null;

  // Local state
  let selectedGrade: number | null = null;
  let isProcessing: boolean = false;
  let announcement: ScreenReaderAnnouncement | null = null;
  let lastFeedback: GradeFeedback | null = null;

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Grade options with descriptions
  const gradeOptions = [
    { 
      value: 0, 
      label: 'Again', 
      description: 'Complete blackout - need to review from scratch',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      hoverBg: 'hover:bg-red-100'
    },
    { 
      value: 1, 
      label: 'Hard', 
      description: 'Incorrect but with some familiarity',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      hoverBg: 'hover:bg-orange-100'
    },
    { 
      value: 2, 
      label: 'Good', 
      description: 'Correct but with significant effort',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      hoverBg: 'hover:bg-yellow-100'
    },
    { 
      value: 3, 
      label: 'Good', 
      description: 'Correct with moderate effort',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      hoverBg: 'hover:bg-green-100'
    },
    { 
      value: 4, 
      label: 'Easy', 
      description: 'Correct with minimal effort',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverBg: 'hover:bg-blue-100'
    },
    { 
      value: 5, 
      label: 'Easy', 
      description: 'Perfect recall - effortless',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      hoverBg: 'hover:bg-purple-100'
    }
  ];

  // Handle grade selection
  async function handleGrade(grade: number): Promise<void> {
    if (!isValidGrade(grade) || disabled || isProcessing) {
      return;
    }

    isProcessing = true;
    selectedGrade = grade;

    try {
      // Generate feedback (this would normally come from the parent component)
      const feedback = generateGradeFeedback(grade, reviewState || {
        itemId: 'temp',
        direction: 'bg-de',
        schemaVersion: 3,
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
        phase: 1,
        nextReview: Date.now() + 86400000,
        lastReview: null,
        totalReviews: 0,
        correctAnswers: 0,
        correctStreak: 0,
        created: Date.now(),
        updated: Date.now()
      }, undefined);

      lastFeedback = feedback;

      // Announce to screen readers
      const feedbackMessage = getGradeFeedbackMessage(grade, feedback);
      announcement = {
        message: `Graded ${grade}. ${feedbackMessage}`,
        priority: 'polite',
        timeout: 2000
      };

      // Call external handler if provided
      if (onGrade) {
        await onGrade(grade, feedback);
      }

      // Dispatch grade event
      dispatch('grade', { grade, feedback });

      console.log(`[GradeControls] Grade ${grade} selected: ${feedbackMessage}`);
    } catch (error) {
      console.error('[GradeControls] Error handling grade:', error);
      
      // Show error to user
      announcement = {
        message: 'Failed to process your grade. Please try again.',
        priority: 'assertive',
        timeout: 3000
      };
    } finally {
      isProcessing = false;
      
      // Reset selection after a delay
      setTimeout(() => {
        selectedGrade = null;
      }, 1000);
    }
  }

  // Handle keyboard input
  function handleKeyDown(event: KeyboardEvent): void {
    if (disabled || isProcessing) return;

    const key = event.key;
    if (key >= '0' && key <= '5') {
      const grade = parseInt(key);
      handleGrade(grade);
    }
  }

  // Get grade option by value
  function getGradeOption(grade: number) {
    return gradeOptions.find(option => option.value === grade);
  }

  // Clear announcement after timeout
  let announcementTimeout: NodeJS.Timeout | null = null;
  
  $: if (announcement) {
    // Clear any existing timeout
    if (announcementTimeout) {
      clearTimeout(announcementTimeout);
    }
    
    // Set new timeout
    announcementTimeout = setTimeout(() => {
      announcement = null;
      announcementTimeout = null;
    }, announcement.timeout);
  }
  
  onDestroy(() => {
    if (announcementTimeout) {
      clearTimeout(announcementTimeout);
    }
  });
</script>

<!-- Grade Controls Container -->
<div
  class="grade-controls {compact ? 'compact' : ''}"
  role="group"
  aria-label="Grade your answer"
  on:keydown={handleKeyDown}
>
  <!-- Instructions -->
  <div class="grade-instructions">
    <h3>How well did you know this?</h3>
    {#if !compact}
      <p class="grade-hint">Rate your recall to schedule the next review</p>
    {/if}
  </div>

  <!-- Grade Buttons -->
  <div class="grade-buttons" role="radiogroup" aria-label="Select grade">
    {#each gradeOptions as option}
      <button
        class="grade-button {option.color} {option.bgColor} {option.borderColor} {option.hoverBg} {selectedGrade === option.value ? 'selected' : ''} {disabled ? 'disabled' : ''} {isProcessing ? 'processing' : ''}"
        type="button"
        disabled={disabled || isProcessing}
        aria-label={`${option.label} - ${option.description}`}
        aria-pressed={selectedGrade === option.value}
        on:click={() => handleGrade(option.value)}
      >
        <div class="grade-content">
          <span class="grade-number">{option.value}</span>
          <span class="grade-label">{option.label}</span>
        </div>
        
        {#if !compact && selectedGrade === option.value}
          <div class="grade-checkmark">✓</div>
        {/if}
      </button>
    {/each}
  </div>

  <!-- Feedback Display -->
  {#if showFeedback && lastFeedback}
    <div class="grade-feedback" role="status" aria-live="polite">
      <div class="feedback-header">
        <span class="feedback-grade">Grade {lastFeedback.grade}</span>
        <span class="feedback-interval">Next review: {formatInterval(lastFeedback.interval)}</span>
      </div>
      
      {#if lastFeedback.phaseName}
        <div class="feedback-phase">
          Phase: {lastFeedback.phaseName}
        </div>
      {/if}
      
      <div class="feedback-details">
        <p>Review again in {lastFeedback.interval} day{lastFeedback.interval !== 1 ? 's' : ''}</p>
      </div>
    </div>
  {/if}

  <!-- Keyboard Hints -->
  {#if !compact}
    <div class="keyboard-hints">
      <p>💡 <strong>Tip:</strong> Press number keys 0-5 to grade quickly</p>
    </div>
  {/if}

  <!-- Processing Indicator -->
  {#if isProcessing}
    <div class="processing-indicator" role="status" aria-live="polite">
      <div class="spinner"></div>
      <span>Saving progress...</span>
    </div>
  {/if}

  <!-- Screen Reader Announcements -->
  {#if announcement}
    <div 
      class="sr-only" 
      role="status" 
      aria-live={announcement.priority}
      aria-atomic="true"
    >
      {announcement.message}
    </div>
  {/if}
</div>

<!-- Styles -->
<style>
  .grade-controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
  }

  .grade-controls.compact {
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .grade-instructions {
    text-align: center;
  }

  .grade-instructions h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #374151;
  }

  .grade-hint {
    margin: 0;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .grade-buttons {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .grade-button {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    border: 2px solid transparent;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 80px;
    min-height: 80px;
  }

  .grade-button:hover:not(.disabled):not(.processing) {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .grade-button:focus {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  .grade-button.selected {
    transform: scale(1.05);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .grade-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .grade-button.processing {
    cursor: wait;
  }

  .grade-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .grade-number {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1;
  }

  .grade-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-align: center;
    line-height: 1.2;
  }

  .grade-checkmark {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    font-size: 1rem;
    font-weight: 700;
  }

  .grade-feedback {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
  }

  .feedback-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  .feedback-grade {
    color: #374151;
  }

  .feedback-interval {
    color: #6b7280;
    font-size: 0.875rem;
  }

  .feedback-phase {
    color: #3b82f6;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  .feedback-details {
    color: #6b7280;
    font-size: 0.875rem;
  }

  .feedback-details p {
    margin: 0;
  }

  .keyboard-hints {
    text-align: center;
    font-size: 0.75rem;
    color: #9ca3af;
  }

  .keyboard-hints p {
    margin: 0;
  }

  .processing-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: #6b7280;
    font-size: 0.875rem;
  }

  .spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid #e5e7eb;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Compact mode styles */
  .grade-controls.compact .grade-buttons {
    gap: 0.25rem;
  }

  .grade-controls.compact .grade-button {
    padding: 0.75rem;
    min-width: 60px;
    min-height: 60px;
  }

  .grade-controls.compact .grade-number {
    font-size: 1.25rem;
  }

  .grade-controls.compact .grade-label {
    font-size: 0.625rem;
  }

  /* Mobile responsive */
  @media (max-width: 640px) {
    .grade-controls {
      padding: 0.75rem;
      gap: 0.75rem;
    }

    .grade-buttons {
      gap: 0.25rem;
    }

    .grade-button {
      padding: 0.75rem;
      min-width: 60px;
      min-height: 60px;
    }

    .grade-number {
      font-size: 1.25rem;
    }

    .grade-label {
      font-size: 0.625rem;
    }

    .feedback-header {
      flex-direction: column;
      gap: 0.25rem;
    }
  }

  /* Touch device optimizations */
  @media (hover: none) {
    .grade-button:hover:not(.disabled):not(.processing) {
      transform: none;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .grade-button {
      border-width: 3px;
    }

    .grade-button:focus {
      outline-width: 3px;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .grade-button,
    .spinner {
      transition: none;
      animation: none;
    }
  }

  /* Grade-specific colors */
  .text-red-600 { color: #dc2626; }
  .text-orange-600 { color: #ea580c; }
  .text-yellow-600 { color: #ca8a04; }
  .text-green-600 { color: #16a34a; }
  .text-blue-600 { color: #2563eb; }
  .text-purple-600 { color: #9333ea; }

  .bg-red-50 { background-color: #fef2f2; }
  .bg-orange-50 { background-color: #fff7ed; }
  .bg-yellow-50 { background-color: #fefce8; }
  .bg-green-50 { background-color: #f0fdf4; }
  .bg-blue-50 { background-color: #eff6ff; }
  .bg-purple-50 { background-color: #faf5ff; }

  .border-red-200 { border-color: #fecaca; }
  .border-orange-200 { border-color: #fed7aa; }
  .border-yellow-200 { border-color: #fef3c7; }
  .border-green-200 { border-color: #bbf7d0; }
  .border-blue-200 { border-color: #bfdbfe; }
  .border-purple-200 { border-color: #e9d5ff; }

  .hover\:bg-red-100:hover { background-color: #fee2e2; }
  .hover\:bg-orange-100:hover { background-color: #ffedd5; }
  .hover\:bg-yellow-100:hover { background-color: #fef9c3; }
  .hover\:bg-green-100:hover { background-color: #dcfce7; }
  .hover\:bg-blue-100:hover { background-color: #dbeafe; }
  .hover\:bg-purple-100:hover { background-color: #f3e8ff; }
</style>