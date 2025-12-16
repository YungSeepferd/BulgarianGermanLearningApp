<script lang="ts">
  let { mastery = 0 } = $props<{ mastery: number }>();
  
  // 5 segments: 20, 40, 60, 80, 100
  const segments = [20, 40, 60, 80, 100];
</script>

<div 
  class="mastery-gauge" 
  role="progressbar" 
  aria-valuenow={mastery} 
  aria-valuemin="0" 
  aria-valuemax="100" 
  aria-label="Mastery Level"
  title={`Mastery: ${mastery}%`}
>
  {#each segments as threshold}
    <div class="segment {mastery >= threshold ? 'filled' : ''}"></div>
  {/each}
</div>

<style>
  .mastery-gauge {
    display: flex;
    gap: 4px;
    align-items: center;
  }
  
  .segment {
    width: 24px;
    height: 6px;
    background-color: var(--muted);
    border-radius: 2px;
    transition: background-color 0.3s ease;
  }
  
  .segment.filled {
    background-color: var(--primary);
  }
</style>
