<script lang="ts">
  import type { VocabularyItem } from '$lib/types/vocabulary';

  let { item, flipped, onFlip }: {
    item: VocabularyItem;
    flipped: boolean;
    onFlip: () => void;
  } = $props();
  let audioPlayer: HTMLAudioElement | null = $state(null);

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onFlip();
    }
  }

  function playAudio() {
    if (audioPlayer) {
      audioPlayer.currentTime = 0;
      audioPlayer.play().catch(() => {
        // Silently fail on audio playback errors
      });
    }
  }

  // Audio playback removed - property not in VocabularyItem type
</script>

<div
  class="scene"
  role="button"
  tabindex="0"
  onclick={onFlip}
  onkeydown={handleKeydown}
  aria-label="Flashcard: {item.german}. Click or press Enter to flip."
  aria-expanded={flipped}
>
  <div class="card" class:is-flipped={flipped}>
    <!-- Front Face -->
    <div class="card-face card-face-front">
      <div class="emoji">📝</div>
      <h2 class="word">{item.german}</h2>
      <p class="part-of-speech">{item.partOfSpeech}</p>
      <!-- Audio feature removed: use metadata for audio URLs if available -->
      <p class="hint">Tap to flip</p>
    </div>

    <!-- Back Face -->
    <div class="card-face card-face-back">
      <div class="header">
        <span class="category">{item.categories?.[0] ?? 'general'}</span>
        {#if item.metadata?.level}
          <span class="level-badge {item.metadata.level.toLowerCase()}">{item.metadata.level}</span>
        {/if}
      </div>

      <h2 class="word-bg">{item.bulgarian}</h2>
      
      <!-- Pronunciation feature uses metadata if available -->

      {#if item.audio_url}
        <button
          class="audio-button"
          onclick={(e) => { e.stopPropagation(); playAudio(); }}
          aria-label="Play pronunciation"
        >
          🔊
        </button>
      {/if}


      {#if item.metadata?.culturalNote}
        <div class="nuance-box">
          <span class="icon">💡</span>
          <p>{item.metadata.culturalNote}</p>
        </div>
      {/if}
    </div>
      {#if item.grammar}
        <div class="grammar-pills">
          {#if item.grammar.gender}
            <span class="pill gender-{item.grammar.gender}">{item.grammar.gender}</span>
          {/if}
          {#if item.grammar.verbAspect}
            <span class="pill aspect">{item.grammar.verbAspect}</span>
          {/if}
        </div>
      {/if}
      
      {#if item.metadata?.mnemonic}
        <p class="mnemonic">🧠 {item.metadata.mnemonic}</p>
      {/if}
  </div>
</div>

<style>
  .scene {
    width: 100%;
    max-width: 400px;
    height: 500px;
    perspective: 1000px;
    cursor: pointer;
    margin: 0 auto;
  }

  .card {
    width: 100%;
    height: 100%;
    position: relative;
    transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
    transform-style: preserve-3d;
    border-radius: 1.5rem;
    box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.1);
  }

  .is-flipped {
    transform: rotateY(180deg);
  }

  .card-face {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: white;
    border-radius: 1.5rem;
    border: 1px solid rgba(0,0,0,0.05);
  }

  .card-face-back {
    transform: rotateY(180deg);
    background: #fdfdfd;
  }

  /* Front Styles */
  .emoji {
    font-size: 5rem;
    margin-bottom: 2rem;
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
  }

  .word {
    font-size: 2.5rem;
    font-weight: 800;
    color: #1e293b;
    margin: 0;
    text-align: center;
  }

  .hint {
    margin-top: auto;
    font-size: 0.875rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Back Styles */
  .header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .category {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    color: #64748b;
    letter-spacing: 0.05em;
  }

  .level-badge {
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    color: white;
  }

  .level-badge.a1 { background: #22c55e; }
  .level-badge.a2 { background: #16a34a; }
  .level-badge.b1 { background: #eab308; }
  .level-badge.b2 { background: #ea580c; }

  .word-bg {
    font-size: 3rem;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 0.5rem 0;
    text-align: center;
  }

  .pronunciation {
    font-family: monospace;
    color: #64748b;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
  }

  .nuance-box {
    background: #f1f5f9;
    padding: 1rem;
    border-radius: 0.75rem;
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    width: 100%;
    text-align: left;
  }

  .nuance-box p {
    margin: 0;
    font-size: 0.9rem;
    color: #334155;
    line-height: 1.4;
  }

  .grammar-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin-bottom: 1.5rem;
  }

  .pill {
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
    background: #e2e8f0;
    border-radius: 999px;
    color: #475569;
    font-weight: 500;
  }

  .gender-masculine { background: #dbeafe; color: #1e40af; }
  .gender-feminine { background: #fce7f3; color: #9d174d; }
  .gender-neuter { background: #f3f4f6; color: #374151; }
  
  .mnemonic {
    font-size: 0.85rem;
    color: #64748b;
    font-style: italic;
    margin-top: auto;
  }
</style>