<script lang="ts">
  import FlashCard from '$lib/components/Flashcard.svelte';
  import type { VocabularyItem } from '$lib/types/vocabulary.js';

  let { item, flipped = false }: $$Props = $props();

  // Mock flip handler
  function handleFlip() {
    flipped = !flipped;
  }
</script>

<FlashCard vocabularyItem={item} />