<script lang="ts">
  import TandemPractice from '$lib/components/TandemPractice.svelte';
  import { appState } from '$lib/state/app-state';

  const ui = $derived(appState.languageMode === 'DE_BG'
    ? { title: 'Üben' }
    : { title: 'Упражнения' });
</script>

<h1>{ui.title}</h1>

<TandemPractice />