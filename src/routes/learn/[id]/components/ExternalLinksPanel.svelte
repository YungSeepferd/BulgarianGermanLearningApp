<script lang="ts">
  import { appState } from '$lib/state/app-state';
  import type { VocabularyItem } from '$lib/types/vocabulary';

  let { item }: { item: VocabularyItem } = $props();

  // Langenscheidt URL builder
  const langenscheidtUrl = $derived.by(() => {
    const bulgarian = item.bulgarian;
    const normalized = bulgarian
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-zа-я0-9-]/g, '');
    return `https://bg.langenscheidt.com/bulgarisch-deutsch/${normalized}`;
  });

  // Type-safe derived values with proper guards
  const externalLinks = $derived(item.metadata?.links || (item as any).links || []);
  const hasLinks = $derived(externalLinks.length > 0);

  // Predefined external resources
  const germanResources = [
    {
      name: 'DWDS',
      url: `https://www.dwds.de/wb/${encodeURIComponent(item.german)}`,
      icon: '📖',
      description: appState.languageMode === 'DE_BG' 
        ? 'Digitales Wörterbuch der deutschen Sprache' 
        : 'Дигитален речник на немския език'
    },
    {
      name: 'Duden',
      url: `https://www.duden.de/suchen/dudenonline/${encodeURIComponent(item.german)}`,
      icon: '📚',
      description: appState.languageMode === 'DE_BG' 
        ? 'Standardwerk der deutschen Rechtschreibung' 
        : 'Стандартна работа по немска граматика'
    }
  ];

  const bulgarianResources = [
    {
      name: 'Речник на БАН',
      url: `https://ibl.bas.bg/rbe/lang/bg/${encodeURIComponent(item.bulgarian)}`,
      icon: '🇧🇬',
      description: appState.languageMode === 'DE_BG' 
        ? 'Bulgarische Akademie der Wissenschaften' 
        : 'Българска академия на науките'
    }
  ];
</script>

<div class="links-panel" role="region" aria-label={appState.languageMode === 'DE_BG' ? 'Externe Ressourcen' : 'Външни ресурси'}>
  <!-- Langenscheidt (Primary Resource) -->
  <section class="primary-link-section">
    <h4 class="section-title">
      <span class="section-icon" aria-hidden="true">⭐</span>
      {appState.languageMode === 'DE_BG' ? 'Empfohlene Quelle' : 'Препоръчан източник'}
    </h4>
    <a 
      href={langenscheidtUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      class="primary-link"
      aria-label={appState.languageMode === 'DE_BG' 
        ? `Öffne ${item.bulgarian} in Langenscheidt` 
        : `Отвори ${item.bulgarian} в Langenscheidt`}
    >
      <div class="link-icon">🔗</div>
      <div class="link-content">
        <div class="link-name">Langenscheidt Bulgarisch-Deutsch</div>
        <div class="link-url">{item.bulgarian}</div>
        <div class="link-desc">
          {appState.languageMode === 'DE_BG' 
            ? 'Vollständiges Wörterbuch mit Beispielen und Audio' 
            : 'Пълен речник с примери и аудио'}
        </div>
      </div>
      <div class="link-arrow" aria-hidden="true">→</div>
    </a>
  </section>

  <!-- German Resources -->
  <section class="resource-section">
    <h4 class="section-title">
      <span class="section-icon" aria-hidden="true">🇩🇪</span>
      {appState.languageMode === 'DE_BG' ? 'Deutsche Wörterbücher' : 'Немски речници'}
    </h4>
    <div class="resource-grid">
      {#each germanResources as resource}
        <a 
          href={resource.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          class="resource-card"
          aria-label={`${resource.name} - ${resource.description}`}
        >
          <div class="resource-icon">{resource.icon}</div>
          <div class="resource-info">
            <div class="resource-name">{resource.name}</div>
            <div class="resource-desc">{resource.description}</div>
          </div>
          <div class="resource-external" aria-hidden="true">↗</div>
        </a>
      {/each}
    </div>
  </section>

  <!-- Bulgarian Resources -->
  <section class="resource-section">
    <h4 class="section-title">
      <span class="section-icon" aria-hidden="true">🇧🇬</span>
      {appState.languageMode === 'DE_BG' ? 'Bulgarische Wörterbücher' : 'Български речници'}
    </h4>
    <div class="resource-grid">
      {#each bulgarianResources as resource}
        <a 
          href={resource.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          class="resource-card"
          aria-label={`${resource.name} - ${resource.description}`}
        >
          <div class="resource-icon">{resource.icon}</div>
          <div class="resource-info">
            <div class="resource-name">{resource.name}</div>
            <div class="resource-desc">{resource.description}</div>
          </div>
          <div class="resource-external" aria-hidden="true">↗</div>
        </a>
      {/each}
    </div>
  </section>

  <!-- Custom Links (if any) -->
  {#if hasLinks}
    <section class="resource-section">
      <h4 class="section-title">
        <span class="section-icon" aria-hidden="true">🔗</span>
        {appState.languageMode === 'DE_BG' ? 'Weitere Ressourcen' : 'Допълнителни ресурси'}
      </h4>
      <div class="resource-grid">
        {#each externalLinks as link}
          <a 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            class="resource-card"
            aria-label={link.title || link.url}
          >
            <div class="resource-icon">🌐</div>
            <div class="resource-info">
              <div class="resource-name">{link.title || link.url}</div>
              {#if link.description}
                <div class="resource-desc">{link.description}</div>
              {/if}
            </div>
            <div class="resource-external" aria-hidden="true">↗</div>
          </a>
        {/each}
      </div>
    </section>
  {/if}
</div>

<style>
  .links-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .primary-link-section,
  .resource-section {
    background: var(--color-neutral-light);
    border: 1px solid var(--color-neutral-border);
    border-radius: var(--border-radius-lg);
    padding: var(--space-4);
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin: 0 0 var(--space-3) 0;
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--color-neutral-dark);
  }

  .section-icon {
    font-size: var(--text-xl);
  }

  .primary-link {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-4);
    background: linear-gradient(135deg, #f0f9ff 0%, white 100%);
    border: 2px solid var(--color-primary);
    border-radius: var(--border-radius-lg);
    text-decoration: none;
    transition: all 0.3s ease;
    box-shadow: var(--shadow-sm);
  }

  .primary-link:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
    border-color: var(--color-primary-darker);
  }

  .link-icon {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-primary);
    color: white;
    border-radius: 50%;
    font-size: var(--text-2xl);
  }

  .link-content {
    flex: 1;
  }

  .link-name {
    font-size: var(--text-lg);
    font-weight: var(--font-bold);
    color: var(--color-primary-darker);
    margin-bottom: var(--space-1);
  }

  .link-url {
    font-size: var(--text-md);
    font-weight: var(--font-medium);
    color: var(--color-neutral-dark);
    margin-bottom: var(--space-1);
  }

  .link-desc {
    font-size: var(--text-sm);
    color: var(--color-neutral-text);
  }

  .link-arrow {
    flex-shrink: 0;
    font-size: var(--text-2xl);
    color: var(--color-primary);
    transition: transform 0.3s ease;
  }

  .primary-link:hover .link-arrow {
    transform: translateX(4px);
  }

  .resource-grid {
    display: grid;
    gap: var(--space-3);
  }

  .resource-card {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    background: white;
    border: 1px solid var(--color-neutral-border);
    border-radius: var(--border-radius-md);
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .resource-card:hover {
    box-shadow: var(--shadow-card);
    border-color: var(--color-primary);
    transform: translateY(-1px);
  }

  .resource-icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-neutral-light);
    border-radius: var(--border-radius-md);
    font-size: var(--text-xl);
  }

  .resource-info {
    flex: 1;
  }

  .resource-name {
    font-size: var(--text-md);
    font-weight: var(--font-semibold);
    color: var(--color-neutral-dark);
    margin-bottom: var(--space-1);
  }

  .resource-desc {
    font-size: var(--text-sm);
    color: var(--color-neutral-text);
    line-height: 1.4;
  }

  .resource-external {
    flex-shrink: 0;
    font-size: var(--text-lg);
    color: var(--color-neutral-text);
    transition: transform 0.2s ease;
  }

  .resource-card:hover .resource-external {
    transform: translate(2px, -2px);
  }

  @media (max-width: 768px) {
    .primary-link {
      flex-direction: column;
      text-align: center;
    }

    .link-arrow {
      transform: rotate(90deg);
    }

    .primary-link:hover .link-arrow {
      transform: rotate(90deg) translateX(4px);
    }
  }
</style>
