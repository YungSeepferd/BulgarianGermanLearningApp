<script lang="ts">
  import type { VocabularyItem } from '$lib/types/vocabulary';

  interface Props {
    item: VocabularyItem;
  }

  let { item }: Props = $props();

  // Part of speech display mapping
  const partOfSpeechLabels: Record<string, string> = {
    noun: 'Noun',
    verb: 'Verb',
    adjective: 'Adjective',
    adverb: 'Adverb',
    preposition: 'Preposition',
    conjunction: 'Conjunction',
    pronoun: 'Pronoun',
    interjection: 'Interjection',
    particle: 'Particle',
    number: 'Number',
    phrase: 'Phrase'
  };

  const partOfSpeechLabel = $derived(
    partOfSpeechLabels[item.partOfSpeech] || item.partOfSpeech
  );

  // Gender display for nouns
  const genderDisplay = $derived.by(() => {
    if (item.partOfSpeech === 'noun' && item.grammar?.gender) {
      const genderMap: Record<string, string> = {
        masculine: '♂',
        feminine: '♀',
        neuter: '⬲'
      };
      return genderMap[item.grammar.gender] || item.grammar.gender;
    }
    return null;
  });
</script>

<div class="word-card">
  <div class="word-header">
    <div class="word-main">
      <h2 class="german-word">{item.german}</h2>
      <p class="bulgarian-word">{item.bulgarian}</p>
    </div>
    <div class="word-meta">
      <span class="part-of-speech-badge" data-pos={item.partOfSpeech}>
        {partOfSpeechLabel}
      </span>
      {#if genderDisplay}
        <span class="gender-badge">
          {genderDisplay}
        </span>
      {/if}
    </div>
  </div>

  {#if item.transliteration?.german}
    <div class="pronunciation">
      <span class="pronunciation-label">Pronunciation:</span>
      <span class="pronunciation-text">{item.transliteration.german}</span>
      <!-- Future: Audio button -->
      <!-- <button class="audio-button" aria-label="Play pronunciation">
        <span class="audio-icon">🔊</span>
      </button> -->
    </div>
  {/if}

  {#if item.definitions && item.definitions.length > 0}
    <div class="definition">
      <p>See definitions: {item.definitions.length} source(s)</p>
    </div>
  {/if}
</div>

<style>
  .word-card {
    padding: var(--spacing-6, 1.5rem);
    background-color: var(--bg-card);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }

  .word-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--spacing-4, 1rem);
    margin-bottom: var(--spacing-4, 1rem);
  }

  .word-main {
    flex: 1;
  }

  .german-word {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.2;
  }

  .bulgarian-word {
    font-size: 1.5rem;
    font-weight: 500;
    color: var(--text-secondary);
    margin: var(--spacing-2, 0.5rem) 0 0 0;
  }

  .word-meta {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2, 0.5rem);
    align-items: flex-end;
  }

  .part-of-speech-badge {
    padding: var(--spacing-1, 0.25rem) var(--spacing-3, 0.75rem);
    background-color: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
  }

  /* Part of speech specific colors */
  .part-of-speech-badge[data-pos='noun'] {
    background-color: var(--accent);
    opacity: 0.2;
    color: var(--accent);
    border-color: var(--accent);
  }

  .part-of-speech-badge[data-pos='verb'] {
    background-color: var(--success);
    opacity: 0.2;
    color: var(--success);
    border-color: var(--success);
  }

  .part-of-speech-badge[data-pos='adjective'] {
    background-color: var(--warning);
    opacity: 0.2;
    color: var(--warning);
    border-color: var(--warning);
  }

  .part-of-speech-badge[data-pos='adverb'] {
    background-color: var(--danger);
    opacity: 0.2;
    color: var(--danger);
    border-color: var(--danger);
  }

  .gender-badge {
    padding: var(--spacing-1, 0.25rem) var(--spacing-2, 0.5rem);
    background-color: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    font-size: 1rem;
  }

  .pronunciation {
    display: flex;
    align-items: center;
    gap: var(--spacing-2, 0.5rem);
    padding: var(--spacing-3, 0.75rem);
    background-color: var(--bg-surface);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-4, 1rem);
  }

  .pronunciation-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .pronunciation-text {
    font-size: 0.875rem;
    font-family: 'Courier New', monospace;
    color: var(--text-primary);
  }

  .definition {
    padding-top: var(--spacing-4, 1rem);
    border-top: 1px solid var(--border-default);
  }

  .definition p {
    font-size: 1rem;
    line-height: 1.6;
    color: var(--text-primary);
    margin: 0;
  }

  @media (max-width: 640px) {
    .word-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .word-meta {
      flex-direction: row;
      align-items: center;
    }

    .german-word {
      font-size: 1.5rem;
    }

    .bulgarian-word {
      font-size: 1.25rem;
    }
  }
</style>
