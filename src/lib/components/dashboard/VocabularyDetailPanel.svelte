<script lang="ts">
  import type { VocabularyItem } from '$lib/types/vocabulary';
  import { appState } from '$lib/state/app-state';
  
  let { item, onClose } = $props<{
    item: VocabularyItem | null;
    onClose: () => void;
  }>();

  const isDE_BG = $derived(appState.languageMode === 'DE_BG');

  function getCEFRLabel(item: VocabularyItem): string {
    return item.cefrLevel || 'A1';
  }

  function getDifficultyStars(difficulty: number): string {
    return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  }

  function formatPartOfSpeech(pos: string): string {
    const labels = {
      noun: isDE_BG ? 'Substantiv' : 'Съществително',
      verb: isDE_BG ? 'Verb' : 'Глагол',
      adjective: isDE_BG ? 'Adjektiv' : 'Прилагателно',
      adverb: isDE_BG ? 'Adverb' : 'Наречие',
      pronoun: isDE_BG ? 'Pronomen' : 'Местоимение',
      preposition: isDE_BG ? 'Präposition' : 'Предлог',
      conjunction: isDE_BG ? 'Konjunktion' : 'Съюз',
      interjection: isDE_BG ? 'Interjektion' : 'Междуметие',
      article: isDE_BG ? 'Artikel' : 'Член',
      number: isDE_BG ? 'Zahl' : 'Число',
      phrase: isDE_BG ? 'Phrase' : 'Фраза',
      expression: isDE_BG ? 'Ausdruck' : 'Израз'
    };
    return labels[pos as keyof typeof labels] || pos;
  }

  function formatCategories(categories: string[]): string {
    if (!categories || categories.length === 0) return '';
    
    const categoryLabels = {
      greetings: isDE_BG ? 'Begrüßungen' : 'Поздрави',
      numbers: isDE_BG ? 'Zahlen' : 'Числа',
      family: isDE_BG ? 'Familie' : 'Семейство',
      food: isDE_BG ? 'Essen' : 'Храна',
      colors: isDE_BG ? 'Farben' : 'Цветове',
      animals: isDE_BG ? 'Tiere' : 'Животни',
      'body-parts': isDE_BG ? 'Körperteile' : 'Части на тялото',
      clothing: isDE_BG ? 'Kleidung' : 'Облекло',
      home: isDE_BG ? 'Zuhause' : 'Дом',
      nature: isDE_BG ? 'Natur' : 'Природа',
      transport: isDE_BG ? 'Verkehr' : 'Транспорт',
      technology: isDE_BG ? 'Technologie' : 'Технологии',
      time: isDE_BG ? 'Zeit' : 'Време',
      weather: isDE_BG ? 'Wetter' : 'Времето',
      professions: isDE_BG ? 'Berufe' : 'Професии',
      places: isDE_BG ? 'Orte' : 'Места',
      grammar: isDE_BG ? 'Grammatik' : 'Граматика',
      culture: isDE_BG ? 'Kultur' : 'Култура',
      'everyday-phrases': isDE_BG ? 'Alltagsphrasen' : 'Често срещани изрази'
    };
    
    return categories
      .map(cat => categoryLabels[cat as keyof typeof categoryLabels] || cat)
      .join(', ');
  }
</script>

{#if item}
  <aside class="vocabulary-detail-panel" aria-label="Vocabulary Details">
    <!-- Close button -->
    <button class="close-button" onclick={onClose} aria-label={isDE_BG ? 'Schließen' : 'Затвори'}>
      ✕
    </button>

    <!-- Header with both languages (always show both for transparent learning) -->
    <header class="detail-header">
      <div class="word-pair">
        <div class="word german">
          <span class="lang-label">🇩🇪 DE</span>
          <h2>{item.german}</h2>
        </div>
        <div class="divider">↔</div>
        <div class="word bulgarian">
          <span class="lang-label">🇧🇬 BG</span>
          <h2>{item.bulgarian}</h2>
        </div>
      </div>
      
      <!-- CEFR Level Badge -->
      <div class="cefr-badge" data-level={getCEFRLabel(item)}>
        {getCEFRLabel(item)}
      </div>
    </header>

    <!-- Main details -->
    <section class="detail-content">
      <!-- Part of Speech & Difficulty -->
      <div class="meta-info">
        <div class="meta-item">
          <span class="meta-label">{isDE_BG ? 'Wortart' : 'Вид'}:</span>
          <span class="meta-value">{formatPartOfSpeech(item.partOfSpeech)}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">{isDE_BG ? 'Schwierigkeit' : 'Трудност'}:</span>
          <span class="meta-value difficulty-stars">{getDifficultyStars(item.difficulty)}</span>
        </div>
      </div>

      <!-- Categories -->
      {#if item.categories && item.categories.length > 0}
        <div class="detail-section">
          <h3>{isDE_BG ? 'Kategorien' : 'Категории'}</h3>
          <div class="categories-list">
            {formatCategories(item.categories)}
          </div>
        </div>
      {/if}

      <!-- Examples -->
      {#if item.examples && item.examples.length > 0}
        <div class="detail-section">
          <h3>{isDE_BG ? 'Beispiele' : 'Примери'}</h3>
          <ul class="examples-list">
            {#each item.examples as example}
              <li class="example-item">
                <div class="example-german">🇩🇪 {example.german}</div>
                <div class="example-bulgarian">🇧🇬 {example.bulgarian}</div>
                {#if example.context}
                  <div class="example-context">💬 {example.context}</div>
                {/if}
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      <!-- Grammar Details -->
      {#if item.grammar}
        <div class="detail-section">
          <h3>{isDE_BG ? 'Grammatik' : 'Граматика'}</h3>
          <div class="grammar-details">
            {#if item.grammar.gender}
              <div class="grammar-item">
                <span class="grammar-label">{isDE_BG ? 'Genus' : 'Род'}:</span>
                <span class="grammar-value">{item.grammar.gender}</span>
              </div>
            {/if}
            {#if item.grammar.pluralForm}
              <div class="grammar-item">
                <span class="grammar-label">{isDE_BG ? 'Plural' : 'Множествено'}:</span>
                <span class="grammar-value">{item.grammar.pluralForm}</span>
              </div>
            {/if}
            {#if item.grammar.verbAspect}
              <div class="grammar-item">
                <span class="grammar-label">{isDE_BG ? 'Aspekt' : 'Вид'}:</span>
                <span class="grammar-value">{item.grammar.verbAspect}</span>
              </div>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Cultural Notes -->
      {#if item.culturalNotes}
        <div class="detail-section">
          <h3>{isDE_BG ? 'Kultur-Hinweis' : 'Културна бележка'}</h3>
          <p class="cultural-note">{item.culturalNotes}</p>
        </div>
      {/if}

      <!-- Etymology -->
      {#if item.etymology}
        <div class="detail-section">
          <h3>{isDE_BG ? 'Etymologie' : 'Етимология'}</h3>
          <p class="etymology">{item.etymology}</p>
        </div>
      {/if}

      <!-- Mnemonic -->
      {#if item.mnemonic}
        <div class="detail-section mnemonic-section">
          <h3>🧠 {isDE_BG ? 'Merkhilfe' : 'Мнемоника'}</h3>
          <p class="mnemonic-text">{typeof item.mnemonic === 'string' ? item.mnemonic : item.mnemonic.text}</p>
        </div>
      {/if}
    </section>
  </aside>
{/if}

<style>
  .vocabulary-detail-panel {
    position: sticky;
    top: 0;
    right: 0;
    width: 100%;
    max-width: 400px;
    height: 100vh;
    overflow-y: auto;
    background: var(--card-bg, white);
    border-left: 1px solid var(--border-color, #e5e7eb);
    padding: 1.5rem;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 32px;
    height: 32px;
    border: none;
    background: var(--bg-secondary, #f3f4f6);
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
    z-index: 10;
  }

  .close-button:hover {
    background: var(--bg-tertiary, #e5e7eb);
  }

  .detail-header {
    margin-bottom: 1.5rem;
    padding-top: 2rem;
  }

  .word-pair {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .word {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .lang-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary, #6b7280);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .word h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary, #111827);
  }

  .word.german h2 {
    color: var(--primary-600, #2563eb);
  }

  .word.bulgarian h2 {
    color: var(--success-600, #16a34a);
  }

  .divider {
    font-size: 1.25rem;
    color: var(--text-secondary, #6b7280);
    text-align: center;
    margin: 0.25rem 0;
  }

  .cefr-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.375rem 0.875rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .cefr-badge[data-level="A1"] {
    background: #dbeafe;
    color: #1e40af;
  }

  .cefr-badge[data-level="A2"] {
    background: #ddd6fe;
    color: #6b21a8;
  }

  .cefr-badge[data-level="B1"] {
    background: #fef3c7;
    color: #92400e;
  }

  .cefr-badge[data-level="B2"] {
    background: #fed7aa;
    color: #9a3412;
  }

  .cefr-badge[data-level="C1"] {
    background: #fecaca;
    color: #991b1b;
  }

  .detail-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .meta-info {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    background: var(--bg-secondary, #f9fafb);
    border-radius: 0.5rem;
  }

  .meta-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .meta-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary, #6b7280);
  }

  .meta-value {
    font-size: 0.875rem;
    color: var(--text-primary, #111827);
  }

  .difficulty-stars {
    font-size: 1rem;
    color: var(--warning-500, #f59e0b);
  }

  .detail-section {
    border-top: 1px solid var(--border-color, #e5e7eb);
    padding-top: 1rem;
  }

  .detail-section h3 {
    margin: 0 0 0.75rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary, #111827);
  }

  .categories-list {
    font-size: 0.875rem;
    color: var(--text-secondary, #6b7280);
    line-height: 1.5;
  }

  .examples-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .example-item {
    padding: 0.75rem;
    background: var(--bg-secondary, #f9fafb);
    border-radius: 0.5rem;
    font-size: 0.875rem;
  }

  .example-german,
  .example-bulgarian {
    margin-bottom: 0.25rem;
    line-height: 1.5;
  }

  .example-german {
    color: var(--primary-600, #2563eb);
  }

  .example-bulgarian {
    color: var(--success-600, #16a34a);
  }

  .example-context {
    margin-top: 0.5rem;
    font-size: 0.75rem;
    font-style: italic;
    color: var(--text-tertiary, #9ca3af);
  }

  .grammar-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .grammar-item {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
  }

  .grammar-label {
    font-weight: 600;
    color: var(--text-secondary, #6b7280);
  }

  .grammar-value {
    color: var(--text-primary, #111827);
  }

  .cultural-note,
  .etymology {
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--text-secondary, #6b7280);
    margin: 0;
  }

  .mnemonic-section {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border-radius: 0.75rem;
    padding: 1rem;
    border: none;
  }

  .mnemonic-section h3 {
    margin-top: 0;
    color: #78350f;
  }

  .mnemonic-text {
    font-size: 0.875rem;
    line-height: 1.6;
    color: #78350f;
    margin: 0;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .vocabulary-detail-panel {
      max-width: 100%;
      height: auto;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      top: auto;
      max-height: 80vh;
      border-left: none;
      border-top: 1px solid var(--border-color, #e5e7eb);
      border-radius: 1rem 1rem 0 0;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
    }
  }
</style>
