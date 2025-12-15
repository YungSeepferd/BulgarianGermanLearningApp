<script lang="ts">
  import type { VocabularyItem } from '$lib/types/vocabulary';
  import { appState } from '$lib/state/app-state';
  import { APP_ICONS } from '$lib/constants/icons';
  import EnrichmentBadge from '$lib/components/vocabulary/EnrichmentBadge.svelte';
  import DefinitionLink from '$lib/components/vocabulary/DefinitionLink.svelte';

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
  
  interface NormalizedExample {
    german: string;
    bulgarian: string;
    context?: string;
  }
  
  const examples = $derived.by((): NormalizedExample[] => {
    const metadata = vocabularyItem.metadata;
    const legacy = (vocabularyItem as any).examples;
    
    if (metadata?.examples) {
      return metadata.examples.map((ex: any) => ({
        german: ex.german || ex.source || '',
        bulgarian: ex.bulgarian || ex.target || '',
        context: ex.context
      }));
    }
    
    if (Array.isArray(legacy)) {
      return legacy.map((ex: any) => ({
        german: ex.sentence || ex.translation || '',
        bulgarian: ex.translation || ex.sentence || '',
        context: ex.context
      }));
    }
    
    return [];
  });

  const culturalNote = $derived(vocabularyItem.metadata?.culturalNote || vocabularyItem.metadata?.notes);
  const mnemonic = $derived(vocabularyItem.metadata?.mnemonic || vocabularyItem.mnemonics);
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

  let audioPlayer: HTMLAudioElement | null = $state(null);
  let isPlaying = $state(false);

  function playAudio(e: Event) {
    e.stopPropagation(); // Prevent card flip
    if (audioPlayer) {
      isPlaying = true;
      audioPlayer.currentTime = 0;
      audioPlayer.play()
        .catch(err => console.error('Audio playback failed:', err))
        .finally(() => {
           // Reset playing state when done (handled by onended)
        });
    }
  }

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
          <button 
            class="audio-button {isPlaying ? 'playing' : ''}" 
            onclick={playAudio}
            aria-label="Play pronunciation"
            title="Play pronunciation"
          >
            🔊
          </button>
          <audio 
            bind:this={audioPlayer} 
            src={audioUrl} 
            onended={() => isPlaying = false}
            onpause={() => isPlaying = false}
          ></audio>
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

        {#if examples.length > 0}
          <div class="examples">
            <p class="section-title">{ui.examples}</p>
            <ul>
              {#each examples as example}
                <li>
                  <div class="example-line">{example.german}</div>
                  <div class="example-translation">{example.bulgarian}</div>
                  {#if example.context}
                    <div class="example-context">{example.context}</div>
                  {/if}
                </li>
              {/each}
            </ul>
          </div>
        {/if}

        {#if culturalNote}
          <div class="note-block">
            <p class="section-title">{ui.cultural}</p>
            <p class="section-body">{culturalNote}</p>
          </div>
        {/if}

        {#if mnemonic}
          <div class="note-block">
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
    outline: 3px solid var(--color-focus-ring, #0d6efd);
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
    background: #f1f5f9;
    color: #64748b;
  }

  .level-badge.a1 { background: #dcfce7; color: #166534; }
  .level-badge.a2 { background: #bbf7d0; color: #15803d; }
  .level-badge.b1 { background: #dbeafe; color: #1e40af; }
  .level-badge.b2 { background: #bfdbfe; color: #1d4ed8; }
  .level-badge.c1 { background: #f3e8ff; color: #6b21a8; }
  .level-badge.c2 { background: #e9d5ff; color: #7e22ce; }

  .audio-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.5rem;
  }

  .audio-button:hover {
    background-color: #f1f5f9;
  }

  .audio-button:focus-visible {
    outline: 3px solid var(--color-focus-ring, #0d6efd);
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

  .declension-block { margin-top: 0.75rem; }
  .declension-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  .declension-case { text-align: left; padding: 0.25rem 0.5rem; color: #555; }
  .declension-form { padding: 0.25rem 0.5rem; }
  .external-links { margin-top: 0.75rem; }
  .links-list { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .ext-link { color: #0a58ca; text-decoration: underline; }
  .ext-link:focus-visible { outline: 3px solid var(--color-focus-ring, #0d6efd); outline-offset: 2px; }

  .flashcard.flipped {
    transform: rotateY(180deg);
  }

  .flashcard-front,
  .flashcard-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: white;
    border: 1px solid #e2e8f0;
  }

  .flashcard-back {
    transform: rotateY(180deg);
    overflow-y: auto;
  }

  @media (max-width: 640px) {
    .flashcard-container {
      height: clamp(300px, 75vh, 480px);
    }
  }

  .front-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    height: 100%;
  }

  .emoji-container {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .part-of-speech {
    font-size: 0.9rem;
    color: #64748b;
    margin: 0;
    text-transform: capitalize;
  }

  .front-term {
    font-size: 2.6rem;
    font-weight: 800;
    text-align: center;
    color: #0f172a;
    margin: 0.5rem 0;
  }

  .pronunciation {
    font-family: monospace;
    color: #475569;
    margin: 0;
  }

  .flip-hint {
    font-size: 0.95rem;
    color: #94a3b8;
    margin-top: auto;
  }

  .back-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    color: #0f172a;
  }

  .translation-block {
    text-align: center;
  }

  .translation-label {
    margin: 0;
    font-size: 0.9rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .translation-text {
    margin: 0.35rem 0 0 0;
    font-size: 1.8rem;
    font-weight: 800;
  }

  .nuance-box,
  .note-block,
  .composition-summary,
  .examples,
  .phrase-breakdown {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1rem;
  }

  .enrichment-block {
    background: #f0f7ff;
    border: 1px solid #dbeafe;
    border-radius: 12px;
    padding: 1rem;
  }

  .enrichment-content {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin-top: 0.75rem;
  }

  .nuance-box {
    display: flex;
    gap: 0.75rem;
  }

  .icon {
    font-size: 1.25rem;
  }

  .section-title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 700;
    color: #0f172a;
  }

  .section-body {
    margin: 0.35rem 0 0 0;
    font-size: 0.95rem;
    color: #334155;
    line-height: 1.45;
  }

  .phrase-breakdown {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .breakdown-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #0f172a;
    text-align: center;
  }

  .breakdown-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .breakdown-item {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.25rem;
    text-align: center;
  }

  .breakdown-part {
    font-size: 1.1rem;
    font-weight: 600;
    display: flex;
    justify-content: center;
    gap: 0.35rem;
    color: #0f172a;
  }

  .breakdown-meaning {
    font-size: 0.95rem;
    color: #475569;
  }

  .breakdown-note {
    font-size: 0.85rem;
    color: #94a3b8;
  }

  .connector {
    color: #cbd5e1;
  }

  .composition-summary {
    font-size: 0.95rem;
    color: #334155;
  }

  .examples ul {
    margin: 0.5rem 0 0 0;
    padding-left: 1.1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .examples li {
    list-style: disc;
    color: #334155;
  }

  .example-line {
    font-weight: 600;
  }

  .example-translation {
    font-size: 0.95rem;
    color: #475569;
  }

  .example-context {
    font-size: 0.85rem;
    color: #94a3b8;
  }

  @media (max-width: 640px) {
    .front-term {
      font-size: 2.2rem;
    }

    .translation-text {
      font-size: 1.4rem;
    }

    .flashcard-container {
      height: 480px;
    }
  }
</style>