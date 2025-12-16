<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import type { VocabularyItem } from '$lib/types/vocabulary';

  let { item, onSave } = $props<{ 
    item: VocabularyItem; 
    onSave?: (mnemonic: NonNullable<VocabularyItem['mnemonic']>) => void 
  }>();

  // Resolve mnemonic from new schema
  const resolvedMnemonic = $derived(item.mnemonic?.text || '');

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

    const newMnemonic = {
      text: mnemonicText,
      author: 'user',
      createdAt: new Date().toISOString(),
      upvotes: 0
    };

    if (onSave) {
      onSave(newMnemonic);
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

<div class="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
  <div class="flex justify-between items-center mb-3">
    <h3 class="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Mnemonic / Eselsbrücke</h3>
    {#if !isEditing}
      <Button variant="ghost" size="sm" onclick={() => isEditing = true}>
        {item.mnemonic ? 'Edit' : 'Add'}
      </Button>
    {/if}
  </div>

  {#if isEditing}
    <div class="space-y-3">
      <textarea
        class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        bind:value={mnemonicText}
        placeholder="Enter a mnemonic to help remember this word..."
      ></textarea>
      
      {#if error}
        <p class="text-sm text-destructive">{error}</p>
      {/if}

      <div class="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onclick={handleCancel}>Cancel</Button>
        <Button size="sm" onclick={handleSave}>Save</Button>
      </div>
    </div>
  {:else}
    {#if item.mnemonic}
      <div class="bg-muted/50 p-3 rounded-md">
        <p class="italic text-foreground">{item.mnemonic.text}</p>
        <div class="text-xs text-muted-foreground mt-2 flex justify-between">
          <span>Added {new Date(item.mnemonic.createdAt || '').toLocaleDateString()}</span>
          {#if item.mnemonic.author}
            <span>by {item.mnemonic.author}</span>
          {/if}
        </div>
      </div>
    {:else}
      <p class="text-sm text-muted-foreground italic">No mnemonic added yet. Click 'Add' to create one.</p>
    {/if}
  {/if}
</div>
