<script lang="ts">
	interface Props {
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { class: className = "", children }: Props = $props();
</script>

<div class="scroll-area {className}">
	{@render children?.()}
</div>

<style>
	.scroll-area {
		overflow: auto;
	}

	.scroll-area::-webkit-scrollbar {
		width: 8px;
		height: 8px;
	}

	.scroll-area::-webkit-scrollbar-track {
		background: transparent;
	}

	.scroll-area::-webkit-scrollbar-thumb {
		background-color: var(--color-border, #d1d5db);
		border-radius: 4px;
	}

	.scroll-area::-webkit-scrollbar-thumb:hover {
		background-color: var(--color-text-muted, #9ca3af);
	}
</style>
