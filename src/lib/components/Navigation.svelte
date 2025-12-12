<script lang="ts">
  /**
   * Navigation Component
   *
   * Provides navigation links for the language learning application.
   */

  import { page } from '$app/stores';
  import { appState } from '$lib/state/app-state';
  import { t, getCurrentLanguage, isTranslationsLoading, onTranslationsChange, offTranslationsChange } from '$lib/services/localization';
  import { onMount } from 'svelte';

  // Default navigation items
  const defaultNavItems = [
    { translationKey: 'navigation.dashboard', path: '/', icon: '🏠' },
    { translationKey: 'navigation.vocabulary', path: '/vocabulary', icon: '📚' },
    { translationKey: 'navigation.grammar', path: '/grammar', icon: '📖' },
    { translationKey: 'navigation.practice', path: '/practice', icon: '🎯' },
    { translationKey: 'navigation.learn', path: '/learn', icon: '🧠' }
  ];

  // Navigation items with reactive translations
  let { navItems = [] } = $props();

  // Reactive variables
  let currentPath = $derived.by(() => $page.url.pathname);
  let userSettingsLabel = $state('');
  let homeLabel = $state('');
  let appNameLabel = $state('');
  let translatedNavItems = $state([]);
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

    userSettingsLabel = loading ? 'Loading…' : (t('navigation.user_settings') || 'User Settings');
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
      <a href="/" aria-label={homeLabel}>
        <span class="logo-icon">🇧🇬🇩🇪</span>
        <span class="logo-text">{appNameLabel}</span>
      </a>
    </div>

    <ul class="nav-list">
      {#each translatedNavItems as item}
        <li class="nav-item">
          <a
            href={item.path}
            class="nav-link {currentPath === item.path ? 'active' : ''}"
            aria-current={currentPath === item.path ? 'page' : undefined}
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
    background: white;
    border-bottom: 1px solid #e5e7eb;
    padding: 0 1rem;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .navigation-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .logo a {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: #1e293b;
  }

  .logo-icon {
    font-size: 1.25rem;
  }

  .logo-text {
    font-weight: 600;
    font-size: 1rem;
  }

  .nav-list {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 1rem;
  }

  .nav-item {
    height: 100%;
  }

  .nav-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 1rem;
    height: 100%;
    text-decoration: none;
    color: #64748b;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
    border-bottom: 2px solid transparent;
  }

  .nav-link:hover {
    color: #3b82f6;
  }

  .nav-link.active {
    color: #3b82f6;
    border-bottom-color: #3b82f6;
  }

  .nav-icon {
    font-size: 1.125rem;
    margin-bottom: 0.25rem;
  }

  .nav-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .language-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 999px;
    background: #f8fafc;
    color: #0f172a;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.85rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  }

  .language-toggle:hover {
    background: #e2e8f0;
    border-color: #cbd5e1;
  }

  .language-toggle:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  .lang-code {
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .lang-direction {
    color: #475569;
    font-size: 0.8rem;
    white-space: nowrap;
  }

  @media (max-width: 1024px) {
    .nav-list {
      gap: 0.5rem;
    }

    .nav-link {
      padding: 0 0.75rem;
    }
  }

  @media (max-width: 768px) {
    .navigation-container {
      height: 50px;
    }

    .logo-text {
      display: none;
    }

    .nav-link {
      padding: 0 0.5rem;
    }

    .nav-text {
      display: none;
    }

    .nav-icon {
      margin-bottom: 0;
    }
  }
</style>