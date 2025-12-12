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
        colRule: 'Regel',
        colExample: 'Beispiel',
        colDescription: 'Beschreibung',
        colArea: 'Bereich',
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

<div class="page">
  <header class="page-header">
    <div>
      <p class="eyebrow">{ui.eyebrow}</p>
      <h1>{ui.title}</h1>
      <p class="lede">{ui.lede}</p>
    </div>
  </header>

  <div class="grid">
    <section class="sidebar" aria-label="Настройки на изгледа">
      <div class="panel">
        <label class="label" for="search">{appState.languageMode === 'DE_BG' ? 'Suche in Regeln' : 'Търсене в правилата'}</label>
        <input
          id="search"
          type="search"
          placeholder={ui.searchPlaceholder}
          bind:value={searchTerm}
          class="input"
        />

        <div class="toggle">
          <label class="label" for="examples-toggle">{ui.examplesLabel}</label>
          <label class="switch">
            <input
              id="examples-toggle"
              type="checkbox"
              checked={showExamples}
              onchange={toggleExamples}
              aria-label="Покажи примерите"
            />
            <span>{ui.examplesState(showExamples)}</span>
          </label>
        </div>
      </div>

      <div class="panel">
        <p class="label">{ui.areasLabel}</p>
        <div class="chips" role="list">
          {#each areas as area}
            <div class="chip" role="listitem">{getAreaLabel(area)}</div>
          {/each}
        </div>
        <p class="meta">{ui.areaCount(filteredRules.length)}</p>
      </div>
    </section>

    <section class="content" aria-label="Списък с правила">
      <div class="table-card">
        <div class="table-header">
          <div>
            <p class="eyebrow">{appState.languageMode === 'DE_BG' ? 'Regeln' : 'Правила'}</p>
            <h2>{ui.tableTitle}</h2>
          </div>
          <span class="count">{filteredRules.length}</span>
        </div>

        {#if filteredRules.length > 0}
          <div class="table-wrapper" role="region" aria-label="Таблица с граматични правила">
            <table>
              <thead>
                <tr>
                  <th scope="col">{ui.colRule}</th>
                  {#if showExamples}
                    <th scope="col">{ui.colExample}</th>
                  {/if}
                  <th scope="col">{ui.colDescription}</th>
                  <th scope="col">{ui.colArea}</th>
                </tr>
              </thead>
              <tbody>
                {#each filteredRules as rule}
                  <tr>
                    <td>{rule.rule}</td>
                    {#if showExamples}
                      <td>{rule.example}</td>
                    {/if}
                    <td>{appState.languageMode === 'DE_BG' ? rule.description_de : rule.description_bg}</td>
                    <td>{getAreaLabel(rule.area)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <div class="empty">{ui.empty}</div>
        {/if}
      </div>
    </section>
  </div>
</div>

<style>
  .page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .page-header h1 {
    margin: 0.25rem 0 0.5rem;
    font-size: 2.25rem;
    color: #0f172a;
  }

  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.8rem;
    color: #475569;
    margin: 0;
  }

  .lede {
    margin: 0;
    color: #475569;
    max-width: 820px;
    line-height: 1.6;
  }

  .grid {
    display: grid;
    grid-template-columns: minmax(320px, 380px) 1fr;
    gap: 1.5rem;
    align-items: start;
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .panel {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1rem;
    display: grid;
    gap: 0.75rem;
  }

  .label {
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  .input {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    border: 1px solid #cbd5e1;
    font-size: 1rem;
    background: white;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .input:focus {
    outline: none;
    border-color: #0ea5e9;
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
  }

  .toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .switch {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .chip {
    padding: 0.35rem 0.75rem;
    background: #e2e8f0;
    border-radius: 999px;
    font-size: 0.9rem;
    color: #0f172a;
  }

  .meta {
    margin: 0;
    color: #475569;
    font-size: 0.9rem;
  }

  .content {
    width: 100%;
  }

  .table-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .table-header h2 {
    margin: 0.15rem 0 0;
    color: #0f172a;
  }

  .count {
    background: #0ea5e9;
    color: white;
    border-radius: 999px;
    padding: 0.35rem 0.75rem;
    font-weight: 700;
    min-width: 2.25rem;
    text-align: center;
  }

  .table-wrapper {
    overflow: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 680px;
  }

  th, td {
    text-align: left;
    padding: 0.75rem;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: top;
  }

  th {
    background: #f8fafc;
    font-weight: 700;
    color: #0f172a;
    position: sticky;
    top: 0;
  }

  tr:hover td {
    background: #f1f5f9;
  }

  .empty {
    padding: 1rem;
    text-align: center;
    color: #475569;
  }

  @media (max-width: 960px) {
    .grid {
      grid-template-columns: 1fr;
    }

    table {
      min-width: unset;
    }
  }

  @media (max-width: 640px) {
    .page-header h1 {
      font-size: 1.75rem;
    }

    .table-header h2 {
      font-size: 1.25rem;
    }
  }
</style>