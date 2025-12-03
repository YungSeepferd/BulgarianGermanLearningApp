<script lang="ts">
  import { learningSession } from '$lib/state/session.svelte.js';
  import LevelUpModal from './LevelUpModal.svelte';

  let previousLevel = $state(learningSession.level);
  let showModal = $state(false);

  $effect(() => {
    if (learningSession.level > previousLevel) {
      showModal = true;
      previousLevel = learningSession.level;
    }
  });

  function handleClose() {
    showModal = false;
  }
</script>

{#if showModal}
  <LevelUpModal
    currentLevel={learningSession.level}
    onClose={handleClose}
  />
{/if}