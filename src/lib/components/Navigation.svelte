<script lang="ts">
  /**
   * Navigation Component
   *
   * Provides navigation links for the language learning application.
   */

  import { page } from '$app/stores';

  // Navigation items
  let { navItems = [
    { name: 'Dashboard', path: '/', icon: '🏠' },
    { name: 'Vocabulary', path: '/vocabulary', icon: '📚' },
    { name: 'Grammar', path: '/grammar', icon: '📖' },
    { name: 'Practice', path: '/practice', icon: '🎯' },
    { name: 'Learn', path: '/learn', icon: '🧠' }
  ] } = $props();

  // Current route
  let currentPath = $derived.by(() => $page.url.pathname);
</script>

<nav class="navigation" aria-label="Main navigation">
  <div class="navigation-container">
    <div class="logo">
      <a href="/" aria-label="Home">
        <span class="logo-icon">🇧🇬🇩🇪</span>
        <span class="logo-text">Bulgarian-German</span>
      </a>
    </div>

    <ul class="nav-list">
      {#each navItems as item}
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
      <button class="nav-action" aria-label="User settings">
        👤
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
  }

  .nav-action {
    background: none;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #64748b;
    transition: all 0.2s ease;
  }

  .nav-action:hover {
    background: #f1f5f9;
    color: #3b82f6;
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
  }
</style>