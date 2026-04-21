<script lang="ts">
  /**
   * Navigation Component
   *
   * Provides navigation links for the language learning application.
   */

  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import { appState } from '$lib/state/app-state';
  import { APP_ICONS } from '$lib/constants/icons';
  import { t, getCurrentLanguage, isTranslationsLoading, onTranslationsChange, offTranslationsChange } from '$lib/services/localization';
  import { onMount } from 'svelte';

  // Default navigation items with base path support for GitHub Pages deployment
  const defaultNavItems = [
    { translationKey: 'navigation.dashboard', path: '/', icon: APP_ICONS.DASHBOARD },
    { translationKey: 'navigation.vocabulary', path: '/vocabulary', icon: APP_ICONS.VOCABULARY },
    { translationKey: 'navigation.grammar', path: '/grammar', icon: APP_ICONS.GRAMMAR },
    { translationKey: 'navigation.practice', path: '/practice', icon: APP_ICONS.PRACTICE },
    { translationKey: 'navigation.learn', path: '/learn', icon: APP_ICONS.LEARN }
  ];

  // Helper function to apply base path to navigation paths
  function getNavPath(path: string): string {
    if (path === '/') return base || '/';
    return `${base}${path}`;
  }

  // Navigation items with reactive translations
  let { navItems = [] } = $props();

  // Reactive variables
  let currentPath = $derived.by(() => $page.url.pathname);
  let homeLabel = $state('');
  let appNameLabel = $state('');
  let translatedNavItems = $state<Array<{ name: string; path: string; translationKey?: string; icon?: string }>>([]);
  let directionLabel = $state('');
  let languageCode = $state<'de' | 'bg'>(getCurrentLanguage());
  let languageToggleAria = $state('Switch language direction');

  function getDirectionFallback(): string {
    return appState.languageMode === 'DE_BG' ? 'German → Bulgarian' : 'Bulgarian → German';
  }

  function buildDirectionLabel(isLoading: boolean): string {
    if (isLoading) return getDirectionFallback();
    return appState.languageMode === 'DE_BG'
      ? t('directions.de_to_bg') || 'German → Bulgarian'
      : t('directions.bg_to_de') || 'Bulgarian → German';
  }

  function buildLanguageToggleAria(isLoading: boolean): string {
    if (isLoading) return 'Switch language direction';
    return appState.languageMode === 'DE_BG'
      ? 'Current language direction: German to Bulgarian. Click to switch to Bulgarian to German.'
      : 'Current language direction: Bulgarian to German. Click to switch to German to Bulgarian.';
  }

  // Update translations reactively
  function updateTranslations() {
    const loading = isTranslationsLoading();

    homeLabel = loading ? 'Loading…' : (t('navigation.home') || 'Home');
    appNameLabel = loading ? 'BulgarianApp' : (t('navigation.app_name') || 'BulgarianApp');
    directionLabel = buildDirectionLabel(loading);
    languageCode = getCurrentLanguage();
    languageToggleAria = buildLanguageToggleAria(loading);

    translatedNavItems = navItems.length > 0
      ? navItems
      : defaultNavItems.map(item => ({
          ...item,
          name: loading
            ? 'Loading…'
            : (t(item.translationKey) || item.translationKey.split('.').pop())
        }));
  }

  // Set up reactive translation updates
  onMount(() => {
    updateTranslations(); // Initial update
    onTranslationsChange(updateTranslations);

    return () => {
      offTranslationsChange(updateTranslations);
    };
  });

  function handleToggleLanguage() {
    appState.toggleDirection();
    // Immediate optimistic UI update while translations reload
    directionLabel = buildDirectionLabel(isTranslationsLoading());
    languageCode = getCurrentLanguage();
    languageToggleAria = buildLanguageToggleAria(isTranslationsLoading());
  }
</script>

<nav class="navigation" aria-label="Main navigation">
  <div class="navigation-container">
    <div class="logo">
      <a href={getNavPath('/')} aria-label={homeLabel}>
        <span class="logo-icon">🇧🇬🇩🇪</span>
        <span class="logo-text">{appNameLabel}</span>
      </a>
    </div>

    <ul class="nav-list">
      {#each translatedNavItems as item}
        <li class="nav-item">
          <a
            href={getNavPath(item.path)}
            class="nav-link {currentPath === item.path ? 'active' : ''}"
            aria-current={currentPath === item.path ? 'page' : undefined}
            aria-label={item.name}
          >
            <span class="nav-icon" aria-hidden="true">{item.icon}</span>
            <span class="nav-text">{item.name}</span>
          </a>
        </li>
      {/each}
    </ul>

    <div class="nav-actions">
      <button
        class="language-toggle"
        onclick={handleToggleLanguage}
        aria-label={languageToggleAria}
        aria-live="polite"
      >
        <span class="lang-code">{languageCode.toUpperCase()}</span>
        <span class="lang-direction">{directionLabel}</span>
      </button>
    </div>
  </div>
</nav>

<style>
  .navigation {
    background: var(--bg-frosted);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border-bottom: 1px solid var(--border-subtle);
    padding: 0 var(--space-4);
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .navigation-container {
    max-width: var(--container-max);
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--nav-height);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .logo a {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    text-decoration: none;
    color: var(--text-primary);
    transition: opacity var(--duration-200) var(--ease-out);
  }

  .logo a:hover {
    opacity: 0.8;
  }

  .logo-icon {
    font-size: var(--text-xl);
    line-height: 1;
  }

  .logo-text {
    font-family: var(--font-display);
    font-weight: var(--weight-semibold);
    font-size: var(--text-lg);
    letter-spacing: -0.02em;
    color: var(--text-primary);
  }

  .nav-list {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: var(--space-1);
  }

  .nav-item {
    height: 100%;
  }

  .nav-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 var(--space-3);
    height: 100%;
    text-decoration: none;
    color: var(--text-secondary);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    transition: all var(--duration-200) var(--ease-out);
    border-bottom: 2px solid transparent;
    position: relative;
  }

  .nav-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: var(--accent);
    transition: all var(--duration-300) var(--ease-out);
    transform: translateX(-50%);
  }

  .nav-link:hover {
    color: var(--text-primary);
  }

  .nav-link:hover::after {
    width: 60%;
  }

  .nav-link.active {
    color: var(--accent);
  }

  .nav-link.active::after {
    width: 80%;
    background: var(--accent);
  }

  .nav-icon {
    font-size: var(--text-lg);
    margin-bottom: var(--space-1);
    line-height: 1;
  }

  .nav-actions {
    display: flex;
    gap: var(--space-2);
    align-items: center;
  }

  .language-toggle {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-full);
    background: var(--bg-surface);
    color: var(--text-primary);
    cursor: pointer;
    transition: all var(--duration-200) var(--ease-out);
    font-size: var(--text-sm);
    font-family: var(--font-body);
  }

  .language-toggle:hover {
    background: var(--bg-surface-hover);
    border-color: var(--accent);
    box-shadow: 0 0 12px var(--accent-glow);
  }

  .language-toggle:focus {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .lang-code {
    font-weight: var(--weight-bold);
    font-size: var(--text-xs);
    letter-spacing: 0.05em;
    color: var(--accent);
    background: var(--accent-dim);
    padding: 2px 6px;
    border-radius: var(--radius-sm);
  }

  .lang-direction {
    color: var(--text-secondary);
    font-size: var(--text-xs);
    white-space: nowrap;
    font-weight: var(--weight-medium);
  }

  @media (max-width: 1024px) {
    .nav-list {
      gap: 0;
    }

    .nav-link {
      padding: 0 var(--space-2);
    }
  }

  @media (max-width: 768px) {
    .navigation-container {
      height: 56px;
    }

    .logo-text {
      display: none;
    }

    .nav-link {
      padding: 0 var(--space-2);
    }

    .nav-text {
      display: none;
    }

    .nav-icon {
      margin-bottom: 0;
    }

    .lang-direction {
      display: none;
    }
  }
</style>