<script lang="ts">
  import { fade } from 'svelte/transition';
  import { fireConfetti } from '$lib/utils/confetti.js';

  let { currentLevel, onClose } = $props();
  let isVisible = $state(true);

  function handleClose() {
    isVisible = false;
    // Small delay to allow fade-out animation
    setTimeout(() => {
      onClose();
    }, 300);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleClose();
    }
  }

  // Trigger confetti when component mounts
  $effect(() => {
    if (isVisible) {
      fireConfetti();
    }
  });
</script>

{#if isVisible}
  <div
    class="modal-overlay"
    onclick={handleClose}
    onkeydown={handleKeyDown}
    tabindex="-1"
    aria-labelledby="level-up-title"
    aria-modal="true"
    role="dialog"
    in:fade={{ duration: 300 }}
  >
    <div
      class="modal-content"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => { if (e.key === 'Escape') handleClose(); }}
      role="button"
      tabindex="0"
    >
      <div class="modal-header">
        <h2 id="level-up-title" class="modal-title">Level Up!</h2>
        <button
          class="close-button"
          onclick={handleClose}
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>

      <div class="level-display">
        <div class="level-number">{currentLevel}</div>
      </div>

      <div class="modal-body">
        <p class="congrats-text">You've reached Level {currentLevel}!</p>
        <p class="reward-text">Keep up the great work!</p>
      </div>

      <div class="modal-footer">
        <button
          class="continue-button"
          onclick={handleClose}
        >
          Continue Learning
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-content {
    background: white;
    border-radius: 1.5rem;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    transform: scale(0.95);
    animation: modalScale 0.3s forwards;
  }

  @keyframes modalScale {
    to { transform: scale(1); }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 1.5rem 0 1.5rem;
  }

  .modal-title {
    font-size: 1.5rem;
    font-weight: 800;
    color: #2c3e50;
    margin: 0;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6c757d;
    transition: color 0.2s;
  }

  .close-button:hover {
    color: #495057;
  }

  .level-display {
    display: flex;
    justify-content: center;
    margin: 1.5rem 0;
  }

  .level-number {
    font-size: 4rem;
    font-weight: 800;
    color: #3b82f6;
    text-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
    background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%);
    width: 120px;
    height: 120px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .modal-body {
    padding: 0 1.5rem 2rem 1.5rem;
    text-align: center;
  }

  .congrats-text {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  .reward-text {
    color: #6c757d;
    margin-bottom: 0;
  }

  .modal-footer {
    padding: 0 1.5rem 1.5rem 1.5rem;
    display: flex;
    justify-content: center;
  }

  .continue-button {
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.75rem;
    padding: 0.75rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, background-color 0.2s;
  }

  .continue-button:hover {
    background: #2563eb;
    transform: translateY(-2px);
  }

  .continue-button:active {
    transform: translateY(0);
  }
</style>