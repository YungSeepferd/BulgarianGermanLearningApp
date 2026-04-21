<script lang="ts">
  import type { VocabularyItem } from '$lib/types/vocabulary';
  import type { Example } from '$lib/schemas/unified-vocabulary';
  import { appState } from '$lib/state/app-state';
  import { APP_ICONS } from '$lib/constants/icons';
  import EnrichmentBadge from '$lib/components/vocabulary/EnrichmentBadge.svelte';
  import DefinitionLink from '$lib/components/vocabulary/DefinitionLink.svelte';
  import GrammarTabs from '$lib/components/vocabulary/GrammarTabs.svelte';
  import ExampleCarousel from '$lib/components/vocabulary/ExampleCarousel.svelte';
  import AudioWidget from '$lib/components/vocabulary/AudioWidget.svelte';

  let { vocabularyItem } = $props<{ vocabularyItem: VocabularyItem }>();

  // State for card flip
  let flipped = $state(false);

  const ui = $derived(appState.languageMode === 'DE_BG'
    ? {
        flipHint: 'Zum Umdrehen tippen',
        showFront: 'Vorderseite anzeigen',
        showBack: 'Rückseite anzeigen',
        breakdown: 'Wortaufbau',
        composition: 'Zusammensetzung',
        context: 'Kontext',
        examples: 'Beispiele',
        cultural: 'Kulturelle oder sprachliche Notiz',
        mnemonic: 'Merksatz',
        usage: 'Nuance / Verwendung'
      }
    : {
        flipHint: 'Натисни, за да обърнеш',
        showFront: 'Покажи лицето',
        showBack: 'Покажи гърба',
        breakdown: 'Строеж на думата',
        composition: 'Състав',
        context: 'Контекст',
        examples: 'Примери',
        cultural: 'Културна или езикова бележка',
        mnemonic: 'Запомняща фраза',
        usage: 'Нюанс / Употреба'
      });

  const isBulgarianFront = $derived(appState.languageMode === 'DE_BG');



  import { formatGermanTerm as formatGermanUtil } from '$lib/utils/formatGerman';
  function formatGermanTerm(item: VocabularyItem): string {
    return formatGermanUtil(item);
  }

  const formattedGerman = $derived(formatGermanTerm(vocabularyItem));

  const frontTerm = $derived(isBulgarianFront ? vocabularyItem.bulgarian : formattedGerman);
  const backTerm = $derived(isBulgarianFront ? formattedGerman : vocabularyItem.bulgarian);

  function normalizeBreakdown(item: VocabularyItem) {
    const fromLiteral = item.literalBreakdown?.map((piece) => ({
      part: piece.segment,
      meaning: piece.literal,
      note: piece.grammarTag
    })) ?? [];

    const fromMetadata = item.metadata?.components?.map((piece) => ({
      part: piece.part,
      meaning: piece.meaning,
      note: undefined
    })) ?? [];

    return [...fromLiteral, ...fromMetadata];
  }

  const breakdown = $derived(normalizeBreakdown(vocabularyItem));
  
  const examples = $derived.by((): Example[] => {
    // Use standard schema field first
    if (vocabularyItem.examples && vocabularyItem.examples.length > 0) {
      // Check if the first item matches the expected schema to avoid runtime errors with legacy data
      const first = vocabularyItem.examples[0];
      if ('german' in first && 'bulgarian' in first) {
        return vocabularyItem.examples.map((ex: Example) => ({
          german: ex.german,
          bulgarian: ex.bulgarian,
          context: ex.context,
          source: ex.source
        }));
      }
    }
    
    // Legacy fallback for runtime data that might not match schema perfectly
    const legacyItem = vocabularyItem as unknown as { examples?: Array<any> };
    const legacy = legacyItem.examples;
    
    if (Array.isArray(legacy)) {
      return legacy.map((ex) => ({
        german: ex.sentence || ex.translation || ex.source || ex.german || '',
        bulgarian: ex.translation || ex.sentence || ex.target || ex.bulgarian || '',
        context: ex.context,
        source: 'legacy' as const
      })).filter(ex => ex.german && ex.bulgarian);
    }
    
    return [] as Example[];
  });

  const culturalNote = $derived(vocabularyItem.culturalNotes || vocabularyItem.metadata?.culturalNote || vocabularyItem.metadata?.notes);
  const mnemonic = $derived(vocabularyItem.mnemonic?.text || vocabularyItem.metadata?.mnemonic || vocabularyItem.mnemonics);
  const nuance = $derived(vocabularyItem.contextualNuance || vocabularyItem.metadata?.notes);
  const emoji = $derived(vocabularyItem.media?.emoji || vocabularyItem.emoji || APP_ICONS.VOCABULARY);
  const compositionSummary = $derived(
    breakdown.length > 1
      ? `${breakdown.map((b) => b.part).join(' + ')} → ${frontTerm}`
      : null
  );

  // Audio Logic
  const audioUrl = $derived(
    (vocabularyItem as any).audioUrl || 
    (vocabularyItem as any).audio_url || 
    (isBulgarianFront ? vocabularyItem.audio?.bulgarian : vocabularyItem.audio?.german)
  );

  // Toggle flip state
  function toggleFlip() {
    flipped = !flipped;
  }
</script>

<div class="flashcard-container" role="region" aria-label={appState.languageMode === 'DE_BG' ? 'Vokabelkarte' : 'Карта с думи'}>
  <div
    class="flashcard {flipped ? 'flipped' : ''}"
    onclick={toggleFlip}
    role="button"
    tabindex="0"
    aria-label={flipped 
      ? (appState.languageMode === 'DE_BG' ? `Vorderseite zeigen: ${frontTerm}` : `Покажи предната страна: ${frontTerm}`)
      : (appState.languageMode === 'DE_BG' ? `Rückseite zeigen: ${backTerm}` : `Покажи задната страна: ${backTerm}`)}
    aria-expanded={flipped}
    aria-describedby="flip-hint"
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFlip();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        flipped = false;
      }
    }}
  >
    <!-- Front of the card -->
    <div class="flashcard-front">
      {#if vocabularyItem.level}
        <div class="level-badge {vocabularyItem.level.toLowerCase()}">
          {vocabularyItem.level}
        </div>
      {/if}

      <div class="front-content">
        <div class="emoji-container">
          <span class="emoji">{emoji}</span>
        </div>
        
        {#if audioUrl}
          <div class="audio-container" onclick={(e) => e.stopPropagation()} role="none" onkeydown={(e) => e.stopPropagation()}>
            <AudioWidget {audioUrl} />
          </div>
        {/if}

        <p class="part-of-speech">{vocabularyItem.partOfSpeech}</p>
        <h2 class="front-term">{frontTerm}</h2>
        {#if vocabularyItem.pronunciation?.bulgarian && isBulgarianFront}
          <p class="pronunciation">{vocabularyItem.pronunciation.bulgarian}</p>
        {:else if vocabularyItem.pronunciation?.german && !isBulgarianFront}
          <p class="pronunciation">{vocabularyItem.pronunciation.german}</p>
        {/if}
        <div id="flip-hint" class="flip-hint">{ui.flipHint}</div>
      </div>
    </div>

    <!-- Back of the card -->
    <div class="flashcard-back">
      <div class="back-content">
        <div class="translation-block">
          <p class="translation-label">{isBulgarianFront ? 'Deutsch' : 'Български'}</p>
          <h2 class="translation-text">{backTerm}</h2>
        </div>

        <div onclick={(e) => e.stopPropagation()} role="none" onkeydown={(e) => e.stopPropagation()}>
          <GrammarTabs item={vocabularyItem} />
        </div>

        {#if nuance}
          <div class="nuance-box">
            <span class="icon">💡</span>
            <div>
              <p class="section-title">{ui.usage}</p>
              <p class="section-body">{nuance}</p>
            </div>
          </div>
        {/if}

        {#if breakdown.length > 0}
          <div class="phrase-breakdown">
            <h3 class="breakdown-title">{ui.breakdown}</h3>
            <div class="breakdown-container">
              {#each breakdown as item, index}
                <div class="breakdown-item">
                  <div class="breakdown-part">
                    <span>{item.part}</span>
                    {#if index < breakdown.length - 1}
                      <span class="connector">+</span>
                    {/if}
                  </div>
                  <div class="breakdown-meaning">{item.meaning}</div>
                  {#if item.note}
                    <div class="breakdown-note">{item.note}</div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/if}

        {#if compositionSummary}
          <div class="composition-summary">
            <p class="section-title">{ui.composition}</p>
            <p class="section-body">{compositionSummary}</p>
          </div>
        {/if}

        <div onclick={(e) => e.stopPropagation()} role="none" onkeydown={(e) => e.stopPropagation()}>
          <ExampleCarousel item={vocabularyItem} examples={examples} />
        </div>

        {#if culturalNote}
          <div class="note-block">
            <p class="section-title">{ui.cultural}</p>
            <p class="section-body">{culturalNote}</p>
          </div>
        {/if}

        {#if mnemonic}
          <div class="note-block mnemonic-highlight">
            <p class="section-title"><span class="icon">{APP_ICONS.MNEMONIC}</span> {ui.mnemonic}</p>
            <p class="section-body">{mnemonic}</p>
          </div>
        {/if}

        {#if vocabularyItem.enrichment?.sourceURL || (vocabularyItem.definitions && vocabularyItem.definitions.length > 0)}
          <div class="enrichment-block">
            <p class="section-title">{appState.languageMode === 'DE_BG' ? 'Wörterbuch' : 'Речник'}</p>
            <div class="enrichment-content">
              <EnrichmentBadge item={vocabularyItem} variant="inline" />
              <DefinitionLink item={vocabularyItem} showIcon={true} showLabel={true} compact={true} />
            </div>
          </div>
        {/if}

          {#if vocabularyItem.metadata?.declension}
            <div class="declension-block">
              <p class="section-title">{appState.languageMode === 'DE_BG' ? 'Deklination' : 'Склонение'}</p>
              <table class="declension-table">
                <tbody>
                  {#each Object.entries(vocabularyItem.metadata.declension) as [caseName, forms]}
                    {@const declensionForms = forms as { singular?: string; plural?: string }}
                    <tr>
                      <th class="declension-case">{caseName}</th>
                      <td class="declension-form">{declensionForms.singular ?? ''}</td>
                      <td class="declension-form">{declensionForms.plural ?? ''}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}

          {#if vocabularyItem.metadata?.links && vocabularyItem.metadata.links.length > 0}
            <div class="external-links">
              <p class="section-title">{appState.languageMode === 'DE_BG' ? 'Wörterbuch' : 'Речници'}</p>
              <div class="links-list">
                {#each vocabularyItem.metadata.links as link}
                  <a href={link.url} target="_blank" rel="noopener noreferrer" class="ext-link">{link.label || 'Link'}</a>
                {/each}
              </div>
            </div>
          {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .flashcard-container {
    perspective: 1000px;
    width: min(420px, 100%);
    height: clamp(320px, 65vw, 520px);
    max-height: 80vh;
    margin: 0 auto;
    pointer-events: auto;
  }

  .flashcard {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.6s;
    cursor: pointer;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    background: transparent;
    border: none;
    overflow: hidden;
  }

  .flashcard:focus-visible {
    outline: 3px solid var(--accent);
    outline-offset: 4px;
  }

  .level-badge {
    position: absolute;
    top: 16px;
    right: 16px;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    background: var(--bg-surface);
    color: var(--text-secondary);
  }

  .level-badge.a1 { background: var(--accent-dim); color: var(--accent); }
  .level-badge.a2 { background: rgba(168, 85, 247, 0.12); color: #c084fc; }
  .level-badge.b1 { background: rgba(251, 191, 36, 0.12); color: var(--warning); }
  .level-badge.b2 { background: rgba(249, 115, 22, 0.12); color: #fb923c; }
  .level-badge.c1 { background: rgba(168, 85, 247, 0.12); color: #c084fc; }
  .level-badge.c2 { background: rgba(168, 85, 247, 0.15); color: #a855f7; }

  .audio-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: var(--space-2);
    border-radius: 50%;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: var(--space-2);
  }

  .audio-button:hover {
    background-color: var(--color-neutral-lighter);
  }

  .audio-button:focus-visible {
    outline: 3px solid var(--accent);
    outline-offset: 2px;
  }

  .audio-button.playing {
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }

  .declension-block { margin-top: var(--space-3); }
  .declension-table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); }
  .declension-case { text-align: left; padding: var(--space-1) var(--space-2); color: var(--text-secondary); }
  .declension-form { padding: var(--space-1) var(--space-2); }
  .external-links { margin-top: var(--space-3); }
  .links-list { display: flex; gap: var(--space-2); flex-wrap: wrap; }
  .ext-link { color: var(--accent); text-decoration: underline; }
  .ext-link:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }

  .flashcard.flipped {
    transform: rotateY(180deg);
  }

  .flashcard-front,
  .flashcard-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: var(--border-radius-xl);
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: var(--bg-card);
    border: 1px solid var(--border-default);
  }

  .flashcard-back {
    transform: rotateY(180deg);
    overflow-y: auto;
  }

  @media (max-width: var(--breakpoint-sm)) {
    .flashcard-container {
      height: clamp(300px, 75vh, 480px);
    }
  }

  .front-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    height: 100%;
  }

  .emoji-container {
    font-size: 4rem;
    margin-bottom: var(--space-4);
  }

  .part-of-speech {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
    text-transform: capitalize;
  }

  .front-term {
    font-size: var(--text-3xl);
    font-weight: var(--font-extrabold);
    text-align: center;
    color: var(--text-primary);
    margin: var(--space-2) 0;
  }

  .pronunciation {
    font-family: monospace;
    color: var(--text-tertiary);
    margin: 0;
  }

  .flip-hint {
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    margin-top: auto;
  }

  .back-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    width: 100%;
    color: var(--text-primary);
  }

  .translation-block {
    text-align: center;
  }

  .translation-label {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .translation-text {
    margin: var(--space-1) 0 0 0;
    font-size: var(--text-2xl);
    font-weight: var(--font-extrabold);
  }

  .nuance-box,
  .note-block,
  .composition-summary,
  .examples,
  .phrase-breakdown {
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    border-radius: var(--border-radius-xl);
    padding: var(--space-4);
  }

  .enrichment-block {
    background: var(--accent-dim);
    border: 1px solid var(--accent);
    border-radius: var(--border-radius-xl);
    padding: var(--space-4);
  }

  .enrichment-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    margin-top: var(--space-3);
  }

  .nuance-box {
    display: flex;
    gap: var(--space-3);
  }

  .icon {
    font-size: var(--text-lg);
  }

  .section-title {
    margin: 0;
    font-size: var(--text-base);
    font-weight: var(--font-bold);
    color: var(--text-primary);
  }

  .section-body {
    margin: var(--space-1) 0 0 0;
    font-size: var(--text-base);
    color: var(--text-secondary);
    line-height: 1.45;
  }

  .phrase-breakdown {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .breakdown-title {
    margin: 0;
    font-size: var(--text-base);
    font-weight: var(--font-bold);
    color: var(--text-primary);
    text-align: center;
  }

  .breakdown-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .breakdown-item {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-1);
    text-align: center;
  }

  .breakdown-part {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    display: flex;
    justify-content: center;
    gap: var(--space-1);
    color: var(--text-primary);
  }

  .breakdown-meaning {
    font-size: var(--text-base);
    color: var(--text-secondary);
  }

  .breakdown-note {
    font-size: var(--text-sm);
    color: var(--text-tertiary);
  }

  .connector {
    color: var(--text-tertiary);
  }

  .composition-summary {
    font-size: var(--text-base);
    color: var(--text-secondary);
  }



  @media (max-width: var(--breakpoint-sm)) {
    .front-term {
      font-size: var(--text-3xl);
    }

    .translation-text {
      font-size: var(--text-xl);
    }

    .flashcard-container {
      height: 480px;
    }
  }

.mnemonic-highlight {
    background-color: rgba(251, 191, 36, 0.12);
    border-left: 4px solid var(--warning);
    font-style: italic;
  }

  .audio-container {
    margin-bottom: var(--space-4);
    display: flex;
    justify-content: center;
  }

  .flashcard-container {
    perspective: 1000px;
    width: min(420px, 100%);
    height: clamp(320px, 65vw, 520px);
    max-height: 80vh;
    margin: 0 auto;
    pointer-events: auto;
  }

  .flashcard {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.6s;
    cursor: pointer;
    border-radius: 16px;
    box-shadow: var(--shadow-lg);
    background: transparent;
    border: none;
    overflow: hidden;
  }

  .audio-container {
    margin-bottom: var(--space-4);
    display: flex;
    justify-content: center;
  }
</style>