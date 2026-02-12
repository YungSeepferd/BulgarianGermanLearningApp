<script lang="ts">
	interface Props {
		value?: number;
		max?: number;
		class?: string;
	}

	let { value = 0, max = 100, class: className = "" }: Props = $props();

	const percentage = $derived(max > 0 ? (value / max) * 100 : 0);
</script>

<div class="progress-root {className}">
	<div class="progress-indicator" style="width: {percentage}%"></div>
</div>

<style>
	.progress-root {
		position: relative;
		width: 100%;
		height: 0.5rem;
		overflow: hidden;
		border-radius: 9999px;
		background-color: var(--color-bg-tertiary, #e5e7eb);
	}

	.progress-indicator {
		height: 100%;
		background-color: var(--color-primary, #3b82f6);
		transition: width 0.2s ease;
	}
</style>
