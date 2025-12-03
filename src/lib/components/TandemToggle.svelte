<script lang="ts">
  import { fade } from 'svelte/transition';

  let { direction = 'DE->BG', mode = 'practice', onDirectionChange, onModeChange } = $props<{
    direction?: 'DE->BG' | 'BG->DE';
    mode?: 'practice' | 'search';
    onDirectionChange?: (direction: 'DE->BG' | 'BG->DE') => void;
    onModeChange?: (mode: 'practice' | 'search') => void;
  }>();

  let showTooltip = $state(false);

  // Toggle functions with animations
  function toggleDirection() {
    const newDirection = direction === 'DE->BG' ? 'BG->DE' : 'DE->BG';
    // Since we're using props, we should call the callback.
    // In Svelte 5, if 'direction' is a bound prop, it would update,
    // but here we treat it as controlled or uncontrolled.
    // Ideally, the parent updates the prop, but for local toggle feel we might want local state if not controlled.
    // However, the original code had local state AND props.
    // Assuming this component is controlled by parent state (based on app.svelte.ts),
    // we should just emit the change. But to maintain the 'toggle' feel locally if not updated immediately:
    if (onDirectionChange) onDirectionChange(newDirection);
  }

  function toggleMode() {
    const newMode = mode === 'practice' ? 'search' : 'practice';
    if (onModeChange) onModeChange(newMode);
  }

  // Tooltip functions
  function handleMouseEnter() {
    showTooltip = true;
  }

  function handleMouseLeave() {
    showTooltip = false;
  }

  // Accessibility functions
  function getDirectionAriaLabel() {
    return direction === 'DE->BG'
      ? 'Current direction: German to Bulgarian. Click to switch to Bulgarian to German.'
      : 'Current direction: Bulgarian to German. Click to switch to German to Bulgarian.';
  }

  function getModeAriaLabel(currentMode: 'practice' | 'search') {
    return currentMode === 'practice'
      ? 'Practice mode. Click to switch to search mode.'
      : 'Search mode. Click to switch to practice mode.';
  }
</script>

<div class="tandem-toggle" class:ci-mode={typeof process !== 'undefined' && process.env['PLAYWRIGHT_TEST_MODE'] === 'ci'}>
  <div class="toggle-group">
    <div class="direction-toggle">
      <button
        class="toggle-btn"
        onclick={toggleDirection}
        onmouseenter={handleMouseEnter}
        onmouseleave={handleMouseLeave}
        aria-label={getDirectionAriaLabel()}
        aria-live="polite"
      >
        <div class="direction-display">
          <span class="flag">{direction === 'DE->BG' ? '🇩🇪' : '🇧🇬'}</span>
          <span class="arrow">↔️</span>
          <span class="flag">{direction === 'DE->BG' ? '🇧🇬' : '🇩🇪'}</span>
        </div>
        <span class="direction-text">
          {direction === 'DE->BG' ? 'German → Bulgarian' : 'Bulgarian → German'}
        </span>
      </button>
    </div>
    
    <div class="mode-toggle">
      <button
        class="mode-btn"
        class:active={mode === 'practice'}
        onclick={toggleMode}
        onmouseenter={handleMouseEnter}
        onmouseleave={handleMouseLeave}
        aria-label={getModeAriaLabel('practice')}
        aria-live="polite"
      >
        <span class="mode-icon">📝</span>
        <span class="mode-text">Practice</span>
      </button>
      
      <button
        class="mode-btn"
        class:active={mode === 'search'}
        onclick={toggleMode}
        onmouseenter={handleMouseEnter}
        onmouseleave={handleMouseLeave}
        aria-label={getModeAriaLabel('search')}
        aria-live="polite"
      >
        <span class="mode-icon">🔍</span>
        <span class="mode-text">Search</span>
      </button>
    </div>
  </div>
  
  {#if showTooltip}
    <div class="tooltip" transition:fade>
      <div class="tooltip-content">
        <p><strong>Tandem Learning:</strong> Instantly switch between translation directions</p>
        <p><strong>Practice Mode:</strong> Learn vocabulary with instant feedback</p>
        <p><strong>Search Mode:</strong> Find specific words and practice them</p>
        {#if mode === 'practice'}
          <p><strong>Tip:</strong> Use the practice mode to test your knowledge with flashcards</p>
        {:else}
          <p><strong>Tip:</strong> Use the search mode to find specific vocabulary items</p>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .tandem-toggle {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-end;
    position: relative;
  }

  /* Animation classes */
  .direction-toggle {
    animation: direction-pulse 2s infinite;
  }

  .mode-toggle {
    animation: mode-pulse 2s infinite;
  }

  @keyframes direction-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes mode-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }

  /* Tooltip styles */
  .tooltip {
    position: absolute;
    right: 0;
    top: 100%;
    margin-top: 0.5rem;
    z-index: 1000;
    width: max-content;
  }

  .tooltip-content {
    background: #2c3e50;
    color: white;
    padding: 1rem;
    border-radius: 6px;
    font-size: 0.8rem;
    line-height: 1.4;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    max-width: 300px;
  }

  .tooltip-content::before {
    content: '';
    position: absolute;
    top: -4px;
    right: 1rem;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid #2c3e50;
  }

  /* Accessibility focus styles */
  .toggle-btn:focus, .mode-btn:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }
  
  .toggle-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .direction-toggle {
    display: flex;
    justify-content: flex-end;
  }
  
  .toggle-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: white;
    border: 2px solid #dee2e6;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
  }
  
  .toggle-btn:hover {
    border-color: #007bff;
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
    transform: translateY(-1px);
  }
  
  .toggle-btn:active {
    transform: translateY(0);
  }
  
  .direction-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .flag {
    font-size: 1.2rem;
  }
  
  .arrow {
    font-size: 1rem;
    opacity: 0.7;
  }
  
  .direction-text {
    font-weight: 500;
    color: #495057;
  }
  
  .mode-toggle {
    display: flex;
    background: #f8f9fa;
    border-radius: 6px;
    padding: 0.25rem;
    gap: 0.25rem;
  }
  
  .mode-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: transparent;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.85rem;
    color: #6c757d;
  }
  
  .mode-btn:hover {
    background: rgba(0, 123, 255, 0.1);
    color: #007bff;
  }
  
  .mode-btn.active {
    background: white;
    color: #007bff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .mode-icon {
    font-size: 1rem;
  }
  
  .mode-text {
    font-weight: 500;
  }
  
  .tooltip {
    position: relative;
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
  }
  
  .tandem-toggle:hover .tooltip {
    opacity: 1;
  }
  
  .tooltip-content {
    position: absolute;
    right: 0;
    top: 100%;
    margin-top: 0.5rem;
    background: #2c3e50;
    color: white;
    padding: 1rem;
    border-radius: 6px;
    font-size: 0.8rem;
    line-height: 1.4;
    min-width: 250px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
  }
  
  .tooltip-content::before {
    content: '';
    position: absolute;
    top: -4px;
    right: 1rem;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid #2c3e50;
  }
  
  .tooltip-content p {
    margin: 0.25rem 0;
  }
  
  .tooltip-content p:first-child {
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  @media (max-width: 768px) {
    .tandem-toggle {
      align-items: center;
    }
    
    .toggle-group {
      align-items: center;
    }
    
    .direction-toggle {
      justify-content: center;
    }
    
    .toggle-btn {
      font-size: 0.8rem;
      padding: 0.6rem 0.8rem;
    }
    
    .direction-text {
      display: none;
    }
    
    .mode-btn {
      font-size: 0.75rem;
      padding: 0.4rem 0.6rem;
    }
    
    .mode-text {
      display: none;
    }
    
    .tooltip-content {
      right: auto;
      left: 50%;
      transform: translateX(-50%);
      min-width: 200px;
    }
    
    .tooltip-content::before {
      right: auto;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  /* CI mode - disable animations for stable E2E testing */
  .tandem-toggle.ci-mode * {
    animation: none !important;
    transition: none !important;
  }

  .tandem-toggle.ci-mode .direction-toggle,
  .tandem-toggle.ci-mode .mode-toggle {
    animation: none !important;
  }

  .tandem-toggle.ci-mode .toggle-btn:hover,
  .tandem-toggle.ci-mode .mode-btn:hover {
    transform: none !important;
    box-shadow: none !important;
  }
</style>