<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	
	const { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if children}
	{@render children()}
{/if}