<script lang="ts">
  import FlashCard from '$lib/components/flashcard/FlashCard.svelte';
  import type { VocabularyItem } from '$lib/types/vocabulary.js';

  let { item, flipped = false }: $$Props = $props();

  // Mock flip handler
  function handleFlip() {
    flipped = !flipped;
  }
</script>

<FlashCard {item} {flipped} onFlip={handleFlip} />