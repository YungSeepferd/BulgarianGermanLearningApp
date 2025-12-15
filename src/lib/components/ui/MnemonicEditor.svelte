<script lang="ts">
  import { appState } from '$lib/state/app-state';
  import { Button } from '$lib/components/ui/button';
  import type { VocabularyItem } from '$lib/types/vocabulary';

  let { item, onSave } = $props<{ 
    item: VocabularyItem; 
    onSave?: (mnemonic: string) => void 
  }>();

  // Resolve mnemonic from various possible locations (unified schema or legacy metadata)
  const resolvedMnemonic = $derived(
    (item.mnemonics && item.mnemonics.length > 0 ? item.mnemonics[0] : '') || 
    (item.metadata as any)?.mnemonic || 
    ''
  );

  let isEditing = $state(false);
  let mnemonicText = $state(resolvedMnemonic);
  let error = $state<string | null>(null);

  // Update local state when item changes (if not editing)
  $effect(() => {
    if (!isEditing) {
      mnemonicText = resolvedMnemonic;
    }
  });

  function handleSave() {
    if (!mnemonicText.trim()) {
      error = 'Mnemonic cannot be empty';
      return;
    }

    // In a real app, we would save this to the backend
    // For now, we just update the local state via the callback
    if (onSave) {
      onSave(mnemonicText);
    }
    
    isEditing = false;
    error = null;
  }

  function handleCancel() {
    mnemonicText = resolvedMnemonic;
    isEditing = false;
    error = null;
  }
</script>

<div class="mnemonic-editor">
  {#if !isEditing}
    <div class="mnemonic-display">
      {#if resolvedMnemonic}
        <p class="mnemonic-text">{resolvedMnemonic}</p>
      {:else}
        <p class="no-mnemonic">
          {appState.languageMode === 'DE_BG' ? 'Keine Merkhilfe vorhanden' : 'Няма помощ за запомняне'}
        </p>
      {/if}
      <Button variant="outline" size="sm" onclick={() => isEditing = true}>
        {resolvedMnemonic 
          ? (appState.languageMode === 'DE_BG' ? 'Bearbeiten' : 'Редактирай')
          : (appState.languageMode === 'DE_BG' ? 'Hinzufügen' : 'Добави')}
      </Button>
    </div>
  {:else}
    <div class="mnemonic-edit-form">
      <textarea 
        bind:value={mnemonicText} 
        placeholder={appState.languageMode === 'DE_BG' ? 'Geben Sie eine Merkhilfe ein...' : 'Въведете помощ за запомняне...'}
        class="mnemonic-input"
        rows="3"
      ></textarea>
      {#if error}
        <p class="error-text">{error}</p>
      {/if}
      <div class="edit-actions">
        <Button variant="ghost" size="sm" onclick={handleCancel}>
          {appState.languageMode === 'DE_BG' ? 'Abbrechen' : 'Отказ'}
        </Button>
        <Button size="sm" onclick={handleSave}>
          {appState.languageMode === 'DE_BG' ? 'Speichern' : 'Запази'}
        </Button>
      </div>
    </div>
  {/if}
</div>

<style>
  .mnemonic-editor {
    margin-top: 1rem;
    padding: 1rem;
    background-color: var(--color-surface-alt);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
  }

  .mnemonic-display {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .mnemonic-text {
    font-style: italic;
    color: var(--color-text-primary);
    margin: 0;
  }

  .no-mnemonic {
    color: var(--color-text-secondary);
    font-style: italic;
    margin: 0;
  }

  .mnemonic-edit-form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .mnemonic-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-family: inherit;
    font-size: 0.875rem;
    resize: vertical;
  }

  .error-text {
    color: var(--color-error);
    font-size: 0.875rem;
    margin: 0;
  }

  .edit-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
</style>
