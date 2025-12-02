<!--
  LoadingSpinner.svelte - Loading spinner component with various states and animations
  @description Provides visual feedback during loading operations with customizable appearance
  @version 1.0.0
  @updated November 2025
-->

<script lang="ts">
  import { onMount } from 'svelte';

  // Props
  let {
    size = 'medium',
    variant = 'spinner',
    color = 'primary',
    text = '',
    showText = true,
    centered = true,
    overlay = false,
    fullscreen = false,
    delay = 0,
    timeout = 30000
  } = $props<{
    size?: 'small' | 'medium' | 'large';
    variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    text?: string;
    showText?: boolean;
    centered?: boolean;
    overlay?: boolean;
    fullscreen?: boolean;
    delay?: number;
    timeout?: number;
  }>();

  // Local state
  let visible = $state(false);
  let timeoutTimer = $state<NodeJS.Timeout | null>(null);
  let delayTimer = $state<NodeJS.Timeout | null>(null);

  // Size classes
  const sizeClasses = {
    small: {
      spinner: 'w-4 h-4',
      dots: 'w-8 h-4',
      pulse: 'w-4 h-4',
      bars: 'w-8 h-4'
    },
    medium: {
      spinner: 'w-8 h-8',
      dots: 'w-12 h-6',
      pulse: 'w-8 h-8',
      bars: 'w-12 h-6'
    },
    large: {
      spinner: 'w-12 h-12',
      dots: 'w-16 h-8',
      pulse: 'w-12 h-12',
      bars: 'w-16 h-8'
    }
  };

  // Color classes
  const colorClasses = {
    primary: {
      spinner: 'border-blue-600 border-t-transparent',
      dots: 'bg-blue-600',
      pulse: 'bg-blue-600',
      bars: 'bg-blue-600'
    },
    secondary: {
      spinner: 'border-gray-600 border-t-transparent',
      dots: 'bg-gray-600',
      pulse: 'bg-gray-600',
      bars: 'bg-gray-600'
    },
    success: {
      spinner: 'border-green-600 border-t-transparent',
      dots: 'bg-green-600',
      pulse: 'bg-green-600',
      bars: 'bg-green-600'
    },
    warning: {
      spinner: 'border-yellow-600 border-t-transparent',
      dots: 'bg-yellow-600',
      pulse: 'bg-yellow-600',
      bars: 'bg-yellow-600'
    },
    error: {
      spinner: 'border-red-600 border-t-transparent',
      dots: 'bg-red-600',
      pulse: 'bg-red-600',
      bars: 'bg-red-600'
    }
  };

  // Text size classes
  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  // Get CSS classes
  let spinnerSize = $derived(sizeClasses[size][variant]);
  let spinnerColor = $derived(colorClasses[color][variant]);
  let textSize = $derived(textSizeClasses[size]);

  // Show loading with delay
  function showLoading(): void {
    if (delay > 0) {
      delayTimer = setTimeout(() => {
        visible = true;
        startTimeout();
      }, delay);
    } else {
      visible = true;
      startTimeout();
    }
  }

  // Start timeout timer
  function startTimeout(): void {
    if (timeout > 0) {
      timeoutTimer = setTimeout(() => {
        visible = false;
      }, timeout);
    }
  }

  // Hide loading
  function hideLoading(): void {
    visible = false;
    clearTimers();
  }

  // Clear all timers
  function clearTimers(): void {
    if (delayTimer) {
      clearTimeout(delayTimer);
      delayTimer = null;
    }
    if (timeoutTimer) {
      clearTimeout(timeoutTimer);
      timeoutTimer = null;
    }
  }

  // Lifecycle
  onMount(() => {
    showLoading();
    
    return () => {
      clearTimers();
    };
  });

  // Handle prop changes
  $effect(() => {
    if (text || delay > 0) {
      showLoading();
    }
  });

  // Expose methods
  export function show(): void {
    showLoading();
  }

  export function hide(): void {
    hideLoading();
  }

  export function isVisible(): boolean {
    return visible;
  }
</script>

{#if visible}
  <!-- Loading Container -->
  <div 
    class="loading-container {centered ? 'centered' : ''} {overlay ? 'overlay' : ''} {fullscreen ? 'fullscreen' : ''}"
    role="status"
    aria-label={text || 'Loading'}
    aria-busy="true"
  >
    <!-- Loading Content -->
    <div class="loading-content">
      <!-- Spinner Variant -->
      {#if variant === 'spinner'}
        <div 
          class="spinner {spinnerSize} {spinnerColor}"
          aria-hidden="true"
        ></div>
      {/if}

      <!-- Dots Variant -->
      {#if variant === 'dots'}
        <div class="dots-container" aria-hidden="true">
          <div class="dot {spinnerColor}"></div>
          <div class="dot {spinnerColor}" style="animation-delay: 0.2s"></div>
          <div class="dot {spinnerColor}" style="animation-delay: 0.4s"></div>
        </div>
      {/if}

      <!-- Pulse Variant -->
      {#if variant === 'pulse'}
        <div class="pulse-container" aria-hidden="true">
          <div class="pulse-dot {spinnerColor} {spinnerSize}"></div>
        </div>
      {/if}

      <!-- Bars Variant -->
      {#if variant === 'bars'}
        <div class="bars-container" aria-hidden="true">
          <div class="bar {spinnerColor}" style="animation-delay: 0s"></div>
          <div class="bar {spinnerColor}" style="animation-delay: 0.2s"></div>
          <div class="bar {spinnerColor}" style="animation-delay: 0.4s"></div>
          <div class="bar {spinnerColor}" style="animation-delay: 0.6s"></div>
        </div>
      {/if}

      <!-- Loading Text -->
      {#if showText && text}
        <div class="loading-text {textSize}">
          {text}
        </div>
      {/if}
    </div>

    <!-- Screen reader only text -->
    <div class="sr-only">
      {text || 'Loading content, please wait'}
    </div>
  </div>
{/if}

<!-- Styles -->
<style>
  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loading-container.centered {
    margin: 0 auto;
  }

  .loading-container.overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(2px);
    z-index: 50;
  }

  .loading-container.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(4px);
    z-index: 9999;
  }

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  /* Spinner Animation */
  .spinner {
    border: 2px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Dots Animation */
  .dots-container {
    display: flex;
    gap: 0.25rem;
    align-items: center;
  }

  .dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    animation: dot-pulse 1.4s ease-in-out infinite both;
  }

  @keyframes dot-pulse {
    0%, 80%, 100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* Pulse Animation */
  .pulse-container {
    position: relative;
  }

  .pulse-dot {
    border-radius: 50%;
    animation: pulse-scale 1.5s ease-in-out infinite;
  }

  @keyframes pulse-scale {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.7;
    }
  }

  /* Bars Animation */
  .bars-container {
    display: flex;
    gap: 0.125rem;
    align-items: flex-end;
  }

  .bar {
    width: 0.25rem;
    height: 1rem;
    border-radius: 0.125rem;
    animation: bar-scale 1.2s ease-in-out infinite;
  }

  @keyframes bar-scale {
    0%, 40%, 100% {
      transform: scaleY(0.4);
    }
    20% {
      transform: scaleY(1);
    }
  }

  /* Loading Text */
  .loading-text {
    font-weight: 500;
    color: #374151;
    text-align: center;
    max-width: 200px;
  }

  .text-sm {
    font-size: 0.875rem;
  }

  .text-base {
    font-size: 1rem;
  }

  .text-lg {
    font-size: 1.125rem;
  }

  /* Screen reader only */
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

  /* Size variations */
  .w-4 { width: 1rem; }
  .w-8 { width: 2rem; }
  .w-12 { width: 3rem; }
  .w-16 { width: 4rem; }
  .h-4 { height: 1rem; }
  .h-6 { height: 1.5rem; }
  .h-8 { height: 2rem; }
  .h-12 { height: 3rem; }

  /* Color variations */
  .border-blue-600 { border-color: #2563eb; }
  .border-gray-600 { border-color: #4b5563; }
  .border-green-600 { border-color: #059669; }
  .border-yellow-600 { border-color: #d97706; }
  .border-red-600 { border-color: #dc2626; }

  .border-t-transparent { border-top-color: transparent; }

  .bg-blue-600 { background-color: #2563eb; }
  .bg-gray-600 { background-color: #4b5563; }
  .bg-green-600 { background-color: #059669; }
  .bg-yellow-600 { background-color: #d97706; }
  .bg-red-600 { background-color: #dc2626; }

  /* Mobile responsive */
  @media (max-width: 640px) {
    .loading-content {
      gap: 0.75rem;
    }

    .loading-text {
      max-width: 150px;
      font-size: 0.875rem;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .loading-container.overlay,
    .loading-container.fullscreen {
      background: rgba(255, 255, 255, 0.98);
    }

    .spinner {
      border-width: 3px;
    }

    .dot,
    .bar {
      border: 1px solid #000;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .spinner,
    .dot,
    .pulse-dot,
    .bar {
      animation: none;
    }

    .dot {
      opacity: 1;
      transform: scale(1);
    }

    .pulse-dot {
      transform: scale(1);
      opacity: 1;
    }

    .bar {
      transform: scaleY(1);
    }
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .loading-container.overlay,
    .loading-container.fullscreen {
      background: rgba(0, 0, 0, 0.9);
    }

    .loading-text {
      color: #f9fafb;
    }
  }
</style>