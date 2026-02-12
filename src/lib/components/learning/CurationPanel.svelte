<script lang="ts">
  /**
   * CurationPanel - Manual Vocabulary Enrichment Interface
   *
   * Allows curators to add/edit:
   * - Mnemonics (memory aids)
   * - Etymology (word origins)
   * - Cultural notes
   * - Usage notes
   */

  import type { VocabularyItem } from '$lib/types/vocabulary';
  import { Button } from '$lib/components/ui/button';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Label } from '$lib/components/ui/label';
  import { Badge } from '$lib/components/ui/badge';

  interface Props {
    item: VocabularyItem | null;
    onSave?: (item: VocabularyItem) => void;
    onSkip?: () => void;
  }

  let { item, onSave, onSkip }: Props = $props();

  // Form state
  let mnemonic = $state('');
  let etymology = $state('');
  let culturalNote = $state('');
  let linguisticNote = $state('');
  let notesForBulgarians = $state('');
  let notesForGermans = $state('');

  // Reset form when item changes
  $effect(() => {
    if (item) {
      mnemonic = item.mnemonic?.text || item.metadata?.mnemonic || '';
      etymology = item.etymology || item.metadata?.etymology || '';
      culturalNote = item.culturalNotes || item.metadata?.culturalNote || '';
      linguisticNote = item.notes?.linguistic || '';
      notesForBulgarians = item.notes?.forBulgarianSpeakers || '';
      notesForGermans = item.notes?.forGermanSpeakers || '';
    }
  });

  const hasChanges = $derived(() => {
    if (!item) return false;
    return (
      mnemonic !== (item.mnemonic?.text || item.metadata?.mnemonic || '') ||
      etymology !== (item.etymology || item.metadata?.etymology || '') ||
      culturalNote !== (item.culturalNotes || item.metadata?.culturalNote || '') ||
      linguisticNote !== (item.notes?.linguistic || '') ||
      notesForBulgarians !== (item.notes?.forBulgarianSpeakers || '') ||
      notesForGermans !== (item.notes?.forGermanSpeakers || '')
    );
  });

  const enrichmentScore = $derived(() => {
    let score = 0;
    if (mnemonic) score++;
    if (etymology) score++;
    if (culturalNote) score++;
    if (linguisticNote) score++;
    if (notesForBulgarians || notesForGermans) score++;
    return score;
  });

  const scoreLabel = $derived(() => {
    const score = enrichmentScore();
    if (score === 0) return { text: 'Minimal', color: 'bg-gray-100 text-gray-600' };
    if (score <= 2) return { text: 'Basic', color: 'bg-yellow-100 text-yellow-700' };
    if (score <= 4) return { text: 'Good', color: 'bg-blue-100 text-blue-700' };
    return { text: 'Rich', color: 'bg-green-100 text-green-700' };
  });

  function handleSave() {
    if (!item || !onSave) return;

    const updatedItem: VocabularyItem = {
      ...item,
      mnemonic: mnemonic ? {
        text: mnemonic,
        author: 'curator',
        upvotes: 0,
        createdAt: new Date().toISOString()
      } : undefined,
      etymology: etymology || undefined,
      culturalNotes: culturalNote || undefined,
      notes: {
        general: item.notes?.general,
        linguistic: linguisticNote || undefined,
        forBulgarianSpeakers: notesForBulgarians || undefined,
        forGermanSpeakers: notesForGermans || undefined,
        source: 'current'
      },
      metadata: {
        ...item.metadata,
        mnemonic: mnemonic || undefined,
        etymology: etymology || undefined,
        culturalNote: culturalNote || undefined,
        lastUpdatedBy: 'curator',
        isVerified: true,
        isCommon: item.metadata?.isCommon ?? false
      }
    };

    onSave(updatedItem);
  }

  function handleSkip() {
    if (onSkip) onSkip();
  }

  const mnemonicPlaceholder = `Create a memory aid to help learners remember this word...

Examples:
• "Haus sounds like 'house' in English"
• "Къща (Kashta) - imagine a CASH register in a house"
• "The big AH in H-AU-S is like the open door of a house"`;

  const etymologyPlaceholder = `Explain the word origin and historical development...

Example:
• German "Haus" comes from Old High German "hūs"
• Related to English "house" and Dutch "huis"
• Proto-Germanic root: *hūsą`;

  const culturalPlaceholder = `Add cultural context about how this word is used...

Example:
• In Bulgaria, "Здравей" (Zdravey) is used for informal greetings with friends
• Germans often shorten "Guten Tag" to just "Tag" in casual settings
• Bulgarian has formal/informal distinctions that German also has`;
</script>

{#if item}
  <div class="curation-panel">
    <header class="panel-header">
      <div class="word-info">
        <span class="emoji">{item.emoji || '🔤'}</span>
        <div class="word-titles">
          <h3 class="german">{item.german}</h3>
          <span class="bulgarian">{item.bulgarian}</span>
          <span class="transliteration">{item.transliteration?.bulgarian || ''}</span>
        </div>
      </div>
      <div class="score-badge">
        <Badge class={scoreLabel().color}>
          {scoreLabel().text} ({enrichmentScore()}/5)
        </Badge>
      </div>
    </header>

    <div class="form-sections">
      <!-- Mnemonic Section -->
      <section class="form-section">
        <div class="section-header">
          <Label for="mnemonic" class="section-label">
            <span class="label-icon">🧠</span>
            Mnemonic (Memory Aid)
          </Label>
          {#if item.mnemonic || item.metadata?.mnemonic}
            <Badge variant="outline" class="existing-badge">Existing</Badge>
          {/if}
        </div>
        <Textarea
          id="mnemonic"
          bind:value={mnemonic}
          placeholder={mnemonicPlaceholder}
          rows={4}
          class="enrichment-textarea"
        />
        <p class="help-text">Create a memorable association to help learners remember this word</p>
      </section>

      <!-- Etymology Section -->
      <section class="form-section">
        <div class="section-header">
          <Label for="etymology" class="section-label">
            <span class="label-icon">📜</span>
            Etymology (Word Origin)
          </Label>
          {#if item.etymology || item.metadata?.etymology}
            <Badge variant="outline" class="existing-badge">Existing</Badge>
          {/if}
        </div>
        <Textarea
          id="etymology"
          bind:value={etymology}
          placeholder={etymologyPlaceholder}
          rows={3}
          class="enrichment-textarea"
        />
        <p class="help-text">Explain the historical origin and evolution of this word</p>
      </section>

      <!-- Cultural Notes Section -->
      <section class="form-section">
        <div class="section-header">
          <Label for="cultural" class="section-label">
            <span class="label-icon">🌍</span>
            Cultural Context
          </Label>
          {#if item.culturalNotes || item.metadata?.culturalNote}
            <Badge variant="outline" class="existing-badge">Existing</Badge>
          {/if}
        </div>
        <Textarea
          id="cultural"
          bind:value={culturalNote}
          placeholder={culturalPlaceholder}
          rows={3}
          class="enrichment-textarea"
        />
        <p class="help-text">Describe cultural nuances and usage differences between German and Bulgarian</p>
      </section>

      <!-- Linguistic Notes Section -->
      <section class="form-section">
        <div class="section-header">
          <Label for="linguistic" class="section-label">
            <span class="label-icon">📝</span>
            Linguistic Notes
          </Label>
          {#if item.notes?.linguistic}
            <Badge variant="outline" class="existing-badge">Existing</Badge>
          {/if}
        </div>
        <Textarea
          id="linguistic"
          bind:value={linguisticNote}
          placeholder="Add grammatical or phonological observations..."
          rows={2}
          class="enrichment-textarea"
        />
      </section>

      <!-- Direction-Specific Notes -->
      <section class="form-section">
        <div class="section-header">
          <Label class="section-label">
            <span class="label-icon">🎯</span>
            Learner-Specific Notes
          </Label>
        </div>
        <div class="direction-notes">
          <div class="direction-field">
            <Label for="bg-speakers" class="direction-label">For Bulgarian Speakers</Label>
            <Textarea
              id="bg-speakers"
              bind:value={notesForBulgarians}
              placeholder="Tips for Bulgarian speakers learning German..."
              rows={2}
              class="enrichment-textarea"
            />
          </div>
          <div class="direction-field">
            <Label for="de-speakers" class="direction-label">For German Speakers</Label>
            <Textarea
              id="de-speakers"
              bind:value={notesForGermans}
              placeholder="Tips for German speakers learning Bulgarian..."
              rows={2}
              class="enrichment-textarea"
            />
          </div>
        </div>
      </section>
    </div>

    <footer class="panel-footer">
      <div class="item-meta">
        <Badge variant="secondary">{item.partOfSpeech}</Badge>
        <Badge variant="secondary">{item.cefrLevel || 'A1'}</Badge>
        <span class="item-id">ID: {item.id}</span>
      </div>
      <div class="actions">
        <Button
          variant="outline"
          onclick={handleSkip}
          class="skip-btn"
        >
          Skip
        </Button>
        <Button
          onclick={handleSave}
          disabled={!hasChanges()}
          class="save-btn"
        >
          Save Changes
        </Button>
      </div>
    </footer>
  </div>
{:else}
  <div class="empty-state">
    <span class="empty-icon">📚</span>
    <p>No vocabulary item selected</p>
    <span class="empty-hint">Select an item from the review queue to begin curation</span>
  </div>
{/if}

<style>
  .curation-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: white;
    border-radius: var(--radius-lg, 0.5rem);
    overflow: hidden;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: var(--spacing-4, 1rem);
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    border-bottom: 1px solid var(--color-border, #e5e7eb);
  }

  .word-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-3, 0.75rem);
  }

  .emoji {
    font-size: 2rem;
  }

  .word-titles {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-1, 0.25rem);
  }

  .german {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text-primary, #111827);
  }

  .bulgarian {
    font-size: 1rem;
    color: var(--color-text-secondary, #6b7280);
    font-family: 'Noto Sans', 'Segoe UI', sans-serif;
  }

  .transliteration {
    font-size: 0.875rem;
    color: var(--color-text-muted, #9ca3af);
    font-style: italic;
  }

  .score-badge {
    flex-shrink: 0;
  }

  .form-sections {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-4, 1rem);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-6, 1.5rem);
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2, 0.5rem);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* These styles are applied to child components via class props */
  :global(.section-label) {
    display: flex;
    align-items: center;
    gap: var(--spacing-2, 0.5rem);
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--color-text-primary, #111827);
  }

  .label-icon {
    font-size: 1rem;
  }

  :global(.existing-badge) {
    font-size: 0.75rem;
  }

  :global(.enrichment-textarea) {
    font-size: 0.875rem;
    resize: vertical;
  }

  .help-text {
    margin: 0;
    font-size: 0.75rem;
    color: var(--color-text-secondary, #6b7280);
  }

  .direction-notes {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-3, 0.75rem);
  }

  .direction-field {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-1, 0.25rem);
  }

  :global(.direction-label) {
    font-size: 0.75rem;
    color: var(--color-text-secondary, #6b7280);
  }

  .panel-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-4, 1rem);
    border-top: 1px solid var(--color-border, #e5e7eb);
    background-color: var(--color-bg-secondary, #f9fafb);
  }

  .item-meta {
    display: flex;
    align-items: center;
    gap: var(--spacing-2, 0.5rem);
  }

  .item-id {
    font-size: 0.75rem;
    color: var(--color-text-muted, #9ca3af);
    font-family: monospace;
  }

  .actions {
    display: flex;
    gap: var(--spacing-2, 0.5rem);
  }

  :global(.skip-btn) {
    color: var(--color-text-secondary, #6b7280);
  }

  :global(.save-btn) {
    background-color: #22c55e;
    color: white;
  }

  :global(.save-btn:hover:not(:disabled)) {
    background-color: #16a34a;
  }

  :global(.save-btn:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-12, 3rem);
    text-align: center;
    color: var(--color-text-secondary, #6b7280);
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: var(--spacing-4, 1rem);
    opacity: 0.5;
  }

  .empty-state p {
    margin: 0 0 var(--spacing-2, 0.5rem) 0;
    font-size: 1rem;
    font-weight: 500;
  }

  .empty-hint {
    font-size: 0.875rem;
    opacity: 0.7;
  }

  @media (max-width: 768px) {
    .direction-notes {
      grid-template-columns: 1fr;
    }

    .panel-footer {
      flex-direction: column;
      gap: var(--spacing-3, 0.75rem);
    }

    .actions {
      width: 100%;
    }

    .actions :global(button) {
      flex: 1;
    }
  }
</style>
