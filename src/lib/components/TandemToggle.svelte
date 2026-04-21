<script lang="ts">
  import { appState } from '$lib/state/app-state';

  let { mode = 'practice', onDirectionChange, onModeChange } = $props<{
    direction?: never; // Removed legacy direction prop
    mode?: 'practice' | 'search';
    onDirectionChange?: (direction: 'DE_BG' | 'BG_DE') => void;
    onModeChange?: (mode: 'practice' | 'search') => void;
  }>();

  const ui = $derived(appState.languageMode === 'DE_BG'
    ? {
        directionLabel: 'Deutsch → Bulgarisch',
        practice: 'Üben',
        search: 'Suchen'
      }
    : {
        directionLabel: 'Български → Немски',
        practice: 'Упражнение',
        search: 'Търсене'
      });

  // Toggle functions with animations
  function toggleDirection() {
    // Update global state
    appState.toggleDirection();

    // Call the callback with the new language mode
    if (onDirectionChange) onDirectionChange(appState.languageMode);
  }

  function toggleMode() {
    const newMode = mode === 'practice' ? 'search' : 'practice';
    if (onModeChange) onModeChange(newMode);
  }
  // Accessibility functions
  function getDirectionAriaLabel() {
    return appState.languageMode === 'DE_BG'
      ? 'Aktuelle Richtung: Deutsch zu Bulgarisch. Klicken, um zu Bulgarisch zu Deutsch zu wechseln.'
      : 'Текуща посока: Български към Немски. Натиснете, за да смените на Немски към Български.';
  }

  function getModeAriaLabel(currentMode: 'practice' | 'search') {
    if (currentMode === 'practice') {
      return appState.languageMode === 'DE_BG'
        ? 'Übungsmodus. Klicken, um zum Suchmodus zu wechseln.'
        : 'Режим упражнение. Натиснете, за да смените на търсене.';
    }
    return appState.languageMode === 'DE_BG'
      ? 'Suchmodus. Klicken, um zum Übungsmodus zu wechseln.'
      : 'Режим търсене. Натиснете, за да смените на упражнение.';
  }
</script>

<div class="tandem-toggle" class:ci-mode={typeof process !== 'undefined' && process.env['PLAYWRIGHT_TEST_MODE'] === 'ci'}>
  <div class="toggle-group">
    <div class="direction-toggle">
      <button
        class="toggle-btn"
        onclick={toggleDirection}
        aria-label={getDirectionAriaLabel()}
        aria-live="polite"
      >
        <div class="direction-display">
          <span class="flag">{appState.languageMode === 'DE_BG' ? '🇩🇪' : '🇧🇬'}</span>
          <span class="arrow">↔️</span>
          <span class="flag">{appState.languageMode === 'DE_BG' ? '🇧🇬' : '🇩🇪'}</span>
        </div>
        <span class="direction-text">
          {ui.directionLabel}
        </span>
      </button>
    </div>
    
    <div class="mode-toggle">
      <button
        class="mode-btn"
        class:active={mode === 'practice'}
        onclick={toggleMode}
        aria-label={getModeAriaLabel('practice')}
        aria-live="polite"
      >
        <span class="mode-icon">📝</span>
        <span class="mode-text">{ui.practice}</span>
      </button>
      
      <button
        class="mode-btn"
        class:active={mode === 'search'}
        onclick={toggleMode}
        aria-label={getModeAriaLabel('search')}
        aria-live="polite"
      >
        <span class="mode-icon">🔍</span>
        <span class="mode-text">{ui.search}</span>
      </button>
    </div>
  </div>
</div>

<style>
  .tandem-toggle {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-end;
    position: relative;
  }

  /* Accessibility focus styles */
  .toggle-btn:focus, .mode-btn:focus {
    outline: 2px solid var(--accent);
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
    background: var(--bg-card);
    border: 2px solid var(--border-default);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
  }
  
  .toggle-btn:hover {
    border-color: var(--accent);
    box-shadow: 0 2px 8px var(--accent-dim);
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
    color: var(--text-primary);
  }
  
  .mode-toggle {
    display: flex;
    background: var(--bg-surface);
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
    color: var(--text-secondary);
  }
  
  .mode-btn:hover {
    background: var(--accent-dim);
    color: var(--accent);
  }
  
  .mode-btn.active {
    background: var(--bg-card);
    color: var(--accent);
    box-shadow: var(--shadow-sm);
  }
  
  .mode-icon {
    font-size: 1rem;
  }
  
  .mode-text {
    font-weight: 500;
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