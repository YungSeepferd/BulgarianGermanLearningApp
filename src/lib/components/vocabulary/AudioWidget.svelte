<script lang="ts">
  import { Volume2, ExternalLink } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import { onMount } from 'svelte';

  let { audioUrl } = $props<{ audioUrl?: string }>();

  let isOffline = $state(false);
  let isForvo = $derived(audioUrl?.includes('forvo.com'));

  // Named handler functions for proper cleanup
  function handleOnline() {
    isOffline = false;
  }
  function handleOffline() {
    isOffline = true;
  }

  onMount(() => {
    isOffline = !navigator.onLine;
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });

  function playAudio() {
    if (!audioUrl || isOffline) return;
    
    if (isForvo) {
      window.open(audioUrl, '_blank');
    } else {
      const audio = new Audio(audioUrl);
      audio.play().catch(e => console.error('Audio playback failed:', e));
    }
  }
</script>

{#if audioUrl}
  <div class="audio-widget">
    <Button 
      variant="outline" 
      size="sm" 
      onclick={playAudio}
      disabled={isOffline}
      title={isOffline ? 'Offline' : (isForvo ? 'Open on Forvo' : 'Play Audio')}
    >
      {#if isForvo}
        <ExternalLink size={16} class="mr-2" />
        <span>Forvo</span>
      {:else}
        <Volume2 size={16} class="mr-2" />
        <span>Audio</span>
      {/if}
    </Button>
  </div>
{/if}

<style>
  .audio-widget {
    display: inline-flex;
  }
</style>
