<script lang="ts">
  import { appState } from '$lib/state/app-state';

  type GrammarRule = {
    rule: string;
    example: string;
    description_de: string;
    description_bg: string;
    area: 'Verb Forms' | 'Cases' | 'Particles' | 'Word Order';
  };

  const baseRules: GrammarRule[] = [
    { rule: 'Сегашно време / Präsens', example: 'Аз казвам / Ich sage', description_de: 'Präsens - ausgedrückt durch das Präsenspartikel „ще" + Präsensstamm', description_bg: 'Сегашно време на свършени и несвършени глаголи', area: 'Verb Forms' },
    { rule: 'Минало свършено / Perfekt', example: 'Аз казах / Ich habe gesagt', description_de: 'Perfekt - abgeschlossene Handlung in der Vergangenheit', description_bg: 'Завършено действие в миналото', area: 'Verb Forms' },
    { rule: 'Минало несвършено / Imperfekt', example: 'Аз казвах / Ich sagte', description_de: 'Imperfekt - wiederholte oder andauernde Handlung in der Vergangenheit', description_bg: 'Повтарящо се или продължително действие в миналото', area: 'Verb Forms' },
    { rule: 'Бъдеще време / Futur', example: 'Ще кажа / Ich werde sagen', description_de: 'Futur - zukünftige Handlung, ausgedrückt durch „ще" + Präsens', description_bg: "'Ще' + сегашно време", area: 'Verb Forms' },
    { rule: 'Условно наклонение / Konditional', example: 'Бих казал / Ich würde sagen', description_de: 'Konditional - hypothetische Handlungen, ausgedrückt durch „бих" + Partizip', description_bg: 'Бих + причастие за хипотетични действия', area: 'Verb Forms' },
    { rule: 'Повелително наклонение / Imperativ', example: 'Казвай! / Sag!', description_de: 'Imperativ - Befehle und Anweisungen', description_bg: 'Заповеди и инструкции', area: 'Verb Forms' },
    { rule: 'Винителен падеж / Akkusativ', example: 'Виждам го / Ich sehe ihn', description_de: 'Akkusativ - direktes Objekt; auch nach bestimmten Präpositionen', description_bg: 'Обектна форма на личните местоимения', area: 'Cases' },
    { rule: 'Дателен падеж / Dativ', example: 'Дадох му / Ich gebe ihm', description_de: 'Dativ - indirektes Objekt; nach Präpositionen wie „zu", „mit"', description_bg: 'Косвен обект с дателни местоимения', area: 'Cases' },
    { rule: 'Частица „се" / Reflexivpronomen „sich"', example: 'Смея се / Ich fürchte mich', description_de: 'Reflexive Verben - zeigen Handlung, die sich auf das Subjekt bezieht', description_bg: 'Възвратни глаголи и безлични конструкции', area: 'Particles' },
    { rule: 'Подчинено с „че" / Konjunktion „dass"', example: 'Знам, че идва / Ich weiß, dass er kommt', description_de: 'Nebensätze mit „dass" - auch nach Verben wie „sagen", „denken", „wissen"', description_bg: 'Подчинено изречение с „че"', area: 'Particles' },
    { rule: 'Позиция на прилагателното / Adjektivstellung', example: 'Синя къща / Blaues Haus', description_de: 'Adjektive vor dem Substantiv; Kongruenz mit Geschlecht und Kasus', description_bg: 'Прилагателното пред съществителното', area: 'Word Order' },
    { rule: 'Отрицание „не" / Negation „nicht"', example: 'Не идвам / Ich komme nicht', description_de: 'Negation „nicht" vor dem Verb; oder am Ende des Satzes bei Hervorhebung', description_bg: 'Отрицанието стои пред глагола', area: 'Word Order' }
  ];

  let grammarRules = $state<GrammarRule[]>(baseRules);
  let searchTerm = $state('');
  let showExamples = $state(true);

  const areas = ['Verb Forms', 'Cases', 'Particles', 'Word Order'] as const;

  const areaLabels = {
    de: {
      'Verb Forms': 'Verbformen',
      'Cases': 'Fälle',
      'Particles': 'Partikeln',
      'Word Order': 'Wortstellung'
    },
    bg: {
      'Verb Forms': 'Глаголни форми',
      'Cases': 'Падежни форми',
      'Particles': 'Частици',
      'Word Order': 'Словоред'
    }
  } as const;

  function getAreaLabel(area: GrammarRule['area']) {
    return (appState.languageMode === 'DE_BG' ? areaLabels.de[area] : areaLabels.bg[area]) ?? area;
  }

  let filteredRules = $derived(
    grammarRules.filter((rule) => {
      if (!searchTerm) return true;
      const query = searchTerm.toLowerCase();
      return (
        rule.rule.toLowerCase().includes(query) ||
        rule.example.toLowerCase().includes(query) ||
        rule.description_de.toLowerCase().includes(query) ||
        rule.description_bg.toLowerCase().includes(query)
      );
    })
  );

  function toggleExamples() {
    showExamples = !showExamples;
  }

  const ui = $derived(appState.languageMode === 'DE_BG'
    ? {
        eyebrow: 'Grammatik • Bulgarian Grammar',
        title: 'Klare Regeln für sicheren Gebrauch',
        lede: 'Schneller Überblick über die wichtigsten Zeiten, Fälle und Partikeln. Suche, filtere und lese Beispiele ohne Scrollen.',
        searchPlaceholder: 'Nach Regel, Beispiel oder Beschreibung suchen...',
        examplesLabel: 'Beispiele',
        examplesState: (s: boolean) => (s ? 'Anzeigen' : 'Ausblenden'),
        areasLabel: 'Bereiche',
        areaCount: (n: number) => `${n} Regeln`,
        tableTitle: 'Kernkonstruktionen',
        empty: 'Keine Treffer. Anderes Wort probieren.'
      }
    : {
        eyebrow: 'Граматика • Bulgarian Grammar',
        title: 'Ясни правила за уверена употреба',
        lede: 'Бърза справка за най-важните времена, падежни форми и частици. Търсете, филтрирайте и преглеждайте примери без скролване.',
        searchPlaceholder: 'Намерете време, пример или описание...',
        examplesLabel: 'Примери',
        examplesState: (s: boolean) => (s ? 'Показани' : 'Скриване'),
        areasLabel: 'Области',
        areaCount: (n: number) => `${n} правила`,
        tableTitle: 'Основни конструкции',
        colRule: 'Правило',
        colExample: 'Пример',
        colDescription: 'Описание',
        colArea: 'Област',
        empty: 'Няма съвпадения. Опитайте друга дума.'
      });
</script>

<svelte:head>
  <title>{ui.title} | Bulgarian-German Learning</title>
  <meta name="description" content={ui.lede} />
</svelte:head>

<div class="page" role="region" aria-label={appState.languageMode === 'DE_BG' ? 'Grammatikregeln' : 'Граматични правила'}>
  <!-- Hero -->
  <header class="hero">
    <p class="eyebrow">{ui.eyebrow}</p>
    <h1 class="hero-title">{ui.title}</h1>
    <p class="hero-lede">{ui.lede}</p>
  </header>

  <!-- Controls -->
  <div class="controls">
    <div class="search-wrapper">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        type="search"
        placeholder={ui.searchPlaceholder}
        bind:value={searchTerm}
        class="search-input"
        aria-label={ui.searchPlaceholder}
      />
    </div>

    <div class="controls-row">
      <div class="area-pills" role="list" aria-label={ui.areasLabel}>
        {#each areas as area}
          <span
            class="area-pill"
            class:pill-verb={area === 'Verb Forms'}
            class:pill-case={area === 'Cases'}
            class:pill-particle={area === 'Particles'}
            class:pill-order={area === 'Word Order'}
            role="listitem"
          >
            {getAreaLabel(area)}
          </span>
        {/each}
      </div>

      <div class="toggle-wrapper">
        <span class="toggle-label">{ui.examplesLabel}</span>
        <label class="toggle-switch">
          <input
            type="checkbox"
            checked={showExamples}
            onchange={toggleExamples}
            aria-label={appState.languageMode === 'DE_BG' ? 'Beispiele anzeigen' : 'Покажи примерите'}
          />
          <span class="toggle-track"></span>
        </label>
      </div>
    </div>
  </div>

  <!-- Rule Cards -->
  <section class="rules-section" aria-label="Списък с правила">
    <div class="rules-header">
      <h2 class="rules-title">{ui.tableTitle}</h2>
      <span class="rules-count">{filteredRules.length}</span>
    </div>

    {#if filteredRules.length > 0}
      <div class="rules-grid" role="list">
        {#each filteredRules as rule (rule.rule)}
          <article
            class="rule-card"
            class:card-verb={rule.area === 'Verb Forms'}
            class:card-case={rule.area === 'Cases'}
            class:card-particle={rule.area === 'Particles'}
            class:card-order={rule.area === 'Word Order'}
            role="listitem"
          >
            <div class="card-header">
              <h3 class="card-title">{rule.rule}</h3>
              <span
                class="card-area-tag"
                class:tag-verb={rule.area === 'Verb Forms'}
                class:tag-case={rule.area === 'Cases'}
                class:tag-particle={rule.area === 'Particles'}
                class:tag-order={rule.area === 'Word Order'}
              >
                {getAreaLabel(rule.area)}
              </span>
            </div>

            {#if showExamples}
              <div class="card-example">
                <span class="example-text">{rule.example}</span>
              </div>
            {/if}

            <p class="card-description">
              {appState.languageMode === 'DE_BG' ? rule.description_de : rule.description_bg}
            </p>
          </article>
        {/each}
      </div>
    {:else}
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
          <path d="M8 11h6"/>
        </svg>
        <p>{ui.empty}</p>
      </div>
    {/if}
  </section>
</div>

<style>
  .page {
    --page-bg: var(--bg-base);
    --page-text: var(--text-primary);
    --page-text-muted: var(--text-secondary);

    max-width: var(--container-max, 1280px);
    margin: 0 auto;
    padding: var(--space-8) var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
    background: var(--page-bg);
    color: var(--page-text);
    min-height: 100vh;
  }

  /* Hero */
  .hero {
    text-align: center;
    padding: var(--space-12) 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
  }

  .hero-title {
    font-family: var(--font-display);
    font-size: var(--text-4xl);
    font-weight: 700;
    color: var(--page-text);
    margin: 0;
    line-height: var(--leading-tight);
    letter-spacing: -0.02em;
  }

  .hero-lede {
    font-family: var(--font-body);
    font-size: var(--text-lg);
    color: var(--page-text-muted);
    margin: 0;
    max-width: 640px;
    line-height: var(--leading-loose);
  }

  .eyebrow {
    font-family: var(--font-body);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: var(--text-sm);
    color: var(--accent);
    margin: 0;
    font-weight: 500;
  }

  /* Controls */
  .controls {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
  }

  .search-wrapper {
    position: relative;
    width: 100%;
  }

  .search-icon {
    position: absolute;
    left: var(--space-5);
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    color: var(--text-tertiary);
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    padding: var(--space-4) var(--space-5) var(--space-4) calc(var(--space-5) + 28px);
    border-radius: var(--radius-full);
    border: 1px solid var(--border-default);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: var(--font-body);
    font-size: var(--text-base);
    transition: border-color var(--duration-200) var(--ease-out),
                box-shadow var(--duration-200) var(--ease-out),
                background var(--duration-200) var(--ease-out);
  }

  .search-input::placeholder {
    color: var(--text-tertiary);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--accent);
    background: var(--bg-surface-hover);
    box-shadow: 0 0 0 3px var(--accent-glow);
  }

  .controls-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-4);
  }

  /* Area Pills */
  .area-pills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .area-pill {
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-full);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: 500;
    border: 1px solid transparent;
  }

  .pill-verb {
    background: rgba(45, 212, 191, 0.12);
    color: var(--accent);
    border-color: rgba(45, 212, 191, 0.25);
  }

  .pill-case {
    background: rgba(251, 191, 36, 0.12);
    color: var(--warning);
    border-color: rgba(251, 191, 36, 0.25);
  }

  .pill-particle {
    background: rgba(167, 139, 250, 0.12);
    color: #a78bfa;
    border-color: rgba(167, 139, 250, 0.25);
  }

  .pill-order {
    background: rgba(244, 114, 182, 0.12);
    color: #f472b6;
    border-color: rgba(244, 114, 182, 0.25);
  }

  /* Toggle Switch */
  .toggle-wrapper {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .toggle-label {
    font-family: var(--font-body);
    font-size: var(--text-sm);
    color: var(--page-text-muted);
    font-weight: 500;
  }

  .toggle-switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
  }

  .toggle-switch input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-track {
    position: relative;
    width: 44px;
    height: 24px;
    background: var(--bg-surface);
    border-radius: var(--radius-full);
    border: 1px solid var(--border-default);
    transition: background var(--duration-200) var(--ease-out),
                border-color var(--duration-200) var(--ease-out);
  }

  .toggle-track::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 16px;
    height: 16px;
    background: var(--text-secondary);
    border-radius: 50%;
    transition: transform var(--duration-200) var(--ease-spring),
                background var(--duration-200) var(--ease-out);
  }

  .toggle-switch input:checked + .toggle-track {
    background: var(--accent-dim);
    border-color: var(--accent);
  }

  .toggle-switch input:checked + .toggle-track::after {
    transform: translateX(20px);
    background: var(--accent);
  }

  .toggle-switch input:focus-visible + .toggle-track {
    box-shadow: 0 0 0 3px var(--accent-glow);
  }

  /* Rules Section */
  .rules-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .rules-header {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .rules-title {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--page-text);
    margin: 0;
  }

  .rules-count {
    background: var(--accent-dim);
    color: var(--accent);
    border-radius: var(--radius-full);
    padding: var(--space-1) var(--space-4);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: 600;
    min-width: 2.5rem;
    text-align: center;
  }

  /* Rules Grid */
  .rules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: var(--space-5);
  }

  /* Rule Card */
  .rule-card {
    --card-accent: var(--accent);

    background: var(--bg-card);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    box-shadow: var(--shadow-md);
    border-left: 3px solid var(--card-accent);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    transition: transform var(--duration-200) var(--ease-out),
                box-shadow var(--duration-200) var(--ease-out);
  }

  .rule-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .card-verb { --card-accent: var(--accent); }
  .card-case { --card-accent: var(--warning); }
  .card-particle { --card-accent: #a78bfa; }
  .card-order { --card-accent: #f472b6; }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .card-title {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--page-text);
    margin: 0;
    line-height: var(--leading-tight);
  }

  .card-area-tag {
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-full);
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: 500;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .tag-verb {
    background: rgba(45, 212, 191, 0.15);
    color: var(--accent);
  }

  .tag-case {
    background: rgba(251, 191, 36, 0.15);
    color: var(--warning);
  }

  .tag-particle {
    background: rgba(167, 139, 250, 0.15);
    color: #a78bfa;
  }

  .tag-order {
    background: rgba(244, 114, 182, 0.15);
    color: #f472b6;
  }

  .card-example {
    background: var(--accent-dim);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    border: 1px solid rgba(45, 212, 191, 0.08);
  }

  .example-text {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 500;
    color: var(--page-text);
    letter-spacing: 0.01em;
  }

  .card-description {
    font-family: var(--font-body);
    font-size: var(--text-base);
    color: var(--page-text-muted);
    margin: 0;
    line-height: var(--leading-normal);
  }

  /* Empty State */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-16) var(--space-8);
    text-align: center;
    color: var(--page-text-muted);
  }

  .empty-state svg {
    width: 48px;
    height: 48px;
    opacity: 0.4;
  }

  .empty-state p {
    font-family: var(--font-body);
    font-size: var(--text-lg);
    margin: 0;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .page {
      padding: var(--space-6) var(--space-4);
      gap: var(--space-6);
    }

    .hero {
      padding: var(--space-8) 0;
    }

    .hero-title {
      font-size: var(--text-3xl);
    }

    .hero-lede {
      font-size: var(--text-base);
    }

    .controls-row {
      flex-direction: column;
      align-items: stretch;
    }

    .area-pills {
      justify-content: center;
    }

    .rules-grid {
      grid-template-columns: 1fr;
    }

    .card-header {
      flex-direction: column;
      gap: var(--space-2);
    }

    .card-title {
      font-size: var(--text-lg);
    }
  }

  @media (max-width: 480px) {
    .hero-title {
      font-size: var(--text-2xl);
    }

    .rules-title {
      font-size: var(--text-xl);
    }
  }
</style>