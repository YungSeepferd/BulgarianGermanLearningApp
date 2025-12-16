<script lang="ts">
  import { appState } from '$lib/state/app-state';

  type TabId = 'overview' | 'grammar' | 'family' | 'examples' | 'analysis' | 'notes' | 'resources';

  let {
    activeTab = $bindable('overview')
  }: {
    activeTab?: TabId;
  } = $props();

  const tabs = $derived.by(() => {
    const isDE = appState.languageMode === 'DE_BG';
    return [
      { id: 'overview' as TabId, label: isDE ? 'Übersicht' : 'Преглед', icon: '📚' },
      { id: 'grammar' as TabId, label: isDE ? 'Grammatik' : 'Граматика', icon: '📖' },
      { id: 'family' as TabId, label: isDE ? 'Wortfamilie' : 'Семейство думи', icon: '🌳' },
      { id: 'examples' as TabId, label: isDE ? 'Beispiele' : 'Примери', icon: '💡' },
      { id: 'analysis' as TabId, label: isDE ? 'Analyse' : 'Анализ', icon: '🔍' },
      { id: 'notes' as TabId, label: isDE ? 'Notizen' : 'Бележки', icon: '📝' },
      { id: 'resources' as TabId, label: isDE ? 'Quellen' : 'Източници', icon: '🔗' }
    ];
  });

  function handleKeyDown(event: KeyboardEvent, tabId: TabId) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activeTab = tabId;
    }
  }
</script>

<div class="dashboard-tabs" role="tablist" aria-label={appState.languageMode === 'DE_BG' ? 'Dashboard-Navigation' : 'Навигация на таблото'}>
  {#each tabs as tab}
    <button
      class="tab"
      class:active={activeTab === tab.id}
      role="tab"
      aria-selected={activeTab === tab.id}
      aria-controls="{tab.id}-panel"
      tabindex={activeTab === tab.id ? 0 : -1}
      onclick={() => activeTab = tab.id}
      onkeydown={(e) => handleKeyDown(e, tab.id)}
    >
      <span class="tab-icon" aria-hidden="true">{tab.icon}</span>
      <span class="tab-label">{tab.label}</span>
    </button>
  {/each}
</div>

<style>
  .dashboard-tabs {
    display: flex;
    gap: var(--space-2);
    overflow-x: auto;
    border-bottom: 2px solid var(--color-neutral-border);
    padding-bottom: var(--space-1);
    margin-bottom: var(--space-5);
    scrollbar-width: thin;
  }

  .dashboard-tabs::-webkit-scrollbar {
    height: 6px;
  }

  .dashboard-tabs::-webkit-scrollbar-track {
    background: var(--color-neutral-light);
  }

  .dashboard-tabs::-webkit-scrollbar-thumb {
    background: var(--color-neutral-border);
    border-radius: 3px;
  }

  .tab {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
    transition: all 0.2s ease;
    white-space: nowrap;
    color: var(--color-neutral-dark);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
  }

  .tab:hover {
    background: var(--color-primary-light);
  }

  .tab.active {
    background: var(--color-primary);
    color: white;
    font-weight: var(--font-semibold);
  }

  .tab:focus-visible {
    outline: 3px solid var(--color-focus-ring, #0d6efd);
    outline-offset: 2px;
    z-index: 1;
  }

  .tab-icon {
    font-size: var(--text-lg);
  }

  @media (max-width: 768px) {
    .tab-label {
      display: none;
    }

    .tab-icon {
      font-size: var(--text-xl);
    }

    .tab {
      padding: var(--space-2);
    }
  }
</style>
