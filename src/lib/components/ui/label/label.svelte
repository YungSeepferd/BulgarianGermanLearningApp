<script lang="ts">
	interface Props {
		for?: string;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { for: htmlFor, class: className = "", children }: Props = $props();
</script>

<label for={htmlFor} class="label {className}">
	{@render children?.()}
</label>

<style>
	.label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-primary, #111827);
		cursor: pointer;
	}
</style>
