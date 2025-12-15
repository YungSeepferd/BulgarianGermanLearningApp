<script lang="ts">
  import { appState } from '$lib/state/app-state';
  import type { VocabularyItem } from '$lib/types/vocabulary';
  import MnemonicEditor from '$lib/components/ui/MnemonicEditor.svelte';

  let { item }: { item: VocabularyItem } = $props();

  // Type-safe derived values with proper guards
  const generalNotes = $derived(item.notes?.general || item.metadata?.notes || '');
  const culturalNotes = $derived(
    (item.culturalNotes && item.culturalNotes.length > 0 ? item.culturalNotes[0] : '') || 
    item.metadata?.culturalNote || 
    ''
  );
  const forGerman = $derived(item.notes?.forGermanSpeakers || '');
  const forBulgarian = $derived(item.notes?.forBulgarianSpeakers || '');
  const linguisticNote = $derived(item.notes?.linguistic || '');
</script>

<div class="notes-panel" role="region" aria-label={appState.languageMode === 'DE_BG' ? 'Notizen und Tipps' : 'Бележки и съвети'}>
  <!-- Mnemonics (Always visible to allow adding) -->
  <section class="note-section mnemonic-note">
    <h4 class="section-title">
      <span class="section-icon" aria-hidden="true">💡</span>
      {appState.languageMode === 'DE_BG' ? 'Merkhilfe' : 'Помощ за запомняне'}
    </h4>
    <div class="note-content">
      <MnemonicEditor {item} />
    </div>
  </section>

  <!-- Cultural Notes -->
  {#if culturalNotes}
    <section class="note-section cultural-note">
      <h4 class="section-title">
        <span class="section-icon" aria-hidden="true">🌍</span>
        {appState.languageMode === 'DE_BG' ? 'Kulturelle Hinweise' : 'Културни бележки'}
      </h4>
      <div class="note-content">
        <p class="note-text">{culturalNotes}</p>
      </div>
    </section>
  {/if}

  <!-- General Notes -->
  {#if generalNotes}
    <section class="note-section general-note">
      <h4 class="section-title">
        <span class="section-icon" aria-hidden="true">📝</span>
        {appState.languageMode === 'DE_BG' ? 'Allgemeine Hinweise' : 'Общи бележки'}
      </h4>
      <div class="note-content">
        <p class="note-text">{generalNotes}</p>
      </div>
    </section>
  {/if}

  <!-- Linguistic Notes -->
  {#if linguisticNote}
    <section class="note-section linguistic-note">
      <h4 class="section-title">
        <span class="section-icon" aria-hidden="true">🔬</span>
        {appState.languageMode === 'DE_BG' ? 'Linguistische Anmerkungen' : 'Лингвистични бележки'}
      </h4>
      <div class="note-content">
        <p class="note-text">{linguisticNote}</p>
      </div>
    </section>
  {/if}

  <!-- Language-Specific Tips -->
  {#if forGerman || forBulgarian}
    <section class="note-section language-tips">
      <h4 class="section-title">
        <span class="section-icon" aria-hidden="true">🎓</span>
        {appState.languageMode === 'DE_BG' ? 'Lerntipps' : 'Съвети за учене'}
      </h4>
      <div class="tips-grid">
        {#if forGerman}
          <div class="tip-card german-tip">
            <div class="tip-header">
              <span class="tip-flag" aria-hidden="true">🇩🇪</span>
              <span class="tip-label">
                {appState.languageMode === 'DE_BG' ? 'Für Deutschsprachige' : 'За говорещи немски'}
              </span>
            </div>
            <p class="tip-text">{forGerman}</p>
          </div>
        {/if}
        {#if forBulgarian}
          <div class="tip-card bulgarian-tip">
            <div class="tip-header">
              <span class="tip-flag" aria-hidden="true">🇧🇬</span>
              <span class="tip-label">
                {appState.languageMode === 'DE_BG' ? 'Für Bulgarischsprachige' : 'За говорещи български'}
              </span>
            </div>
            <p class="tip-text">{forBulgarian}</p>
          </div>
        {/if}
      </div>
    </section>
  {/if}
</div>

<style>
  .notes-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .note-section {
    border: 1px solid var(--color-neutral-border);
    border-radius: var(--border-radius-lg);
    padding: var(--space-4);
    background: var(--color-neutral-light);
  }

  .cultural-note {
    border-left: 4px solid var(--color-success);
    background: linear-gradient(135deg, #f0fdf4 0%, white 100%);
  }

  .mnemonic-note {
    border-left: 4px solid var(--color-warning);
    background: linear-gradient(135deg, #fffbeb 0%, white 100%);
  }

  .general-note {
    border-left: 4px solid var(--color-primary);
    background: linear-gradient(135deg, #f0f9ff 0%, white 100%);
  }

  .linguistic-note {
    border-left: 4px solid var(--color-info);
    background: linear-gradient(135deg, #f0f9ff 0%, white 100%);
  }

  .language-tips {
    border-left: 4px solid var(--color-accent);
    background: linear-gradient(135deg, #faf5ff 0%, white 100%);
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

  .note-content {
    background: white;
    padding: var(--space-3);
    border-radius: var(--border-radius-md);
  }

  .note-text {
    margin: 0;
    line-height: 1.7;
    color: var(--color-neutral-dark);
    font-size: var(--text-md);
  }

  .tips-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-3);
  }

  .tip-card {
    background: white;
    border-radius: var(--border-radius-md);
    padding: var(--space-3);
    transition: all 0.2s ease;
  }

  .tip-card:hover {
    box-shadow: var(--shadow-card);
    transform: translateY(-2px);
  }

  .german-tip {
    border: 1px solid #dbeafe;
  }

  .bulgarian-tip {
    border: 1px solid #fce7f3;
  }

  .tip-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--color-neutral-border);
  }

  .tip-flag {
    font-size: var(--text-xl);
  }

  .tip-label {
    font-weight: var(--font-semibold);
    font-size: var(--text-sm);
    color: var(--color-neutral-dark);
  }

  .tip-text {
    margin: 0;
    line-height: 1.6;
    color: var(--color-neutral-dark);
    font-size: var(--text-sm);
  }

  @media (max-width: 768px) {
    .tips-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
