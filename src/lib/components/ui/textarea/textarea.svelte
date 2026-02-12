<script lang="ts">
	interface Props {
		id?: string;
		value?: string;
		placeholder?: string;
		rows?: number;
		class?: string;
		oninput?: (e: Event) => void;
	}

	let {
		id,
		value = $bindable(''),
		placeholder = '',
		rows = 3,
		class: className = '',
		oninput
	}: Props = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		value = target.value;
		oninput?.(e);
	}
</script>

<textarea
	{id}
	{rows}
	{placeholder}
	{value}
	oninput={handleInput}
	class="textarea {className}"
></textarea>

<style>
	.textarea {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: var(--radius-md, 0.375rem);
		background-color: white;
		font-size: 0.875rem;
		line-height: 1.5;
		color: var(--color-text-primary, #111827);
		resize: vertical;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.textarea:focus {
		outline: none;
		border-color: var(--color-primary, #3b82f6);
		box-shadow: 0 0 0 3px var(--color-primary-light, rgba(59, 130, 246, 0.1));
	}

	.textarea::placeholder {
		color: var(--color-text-muted, #9ca3af);
	}
</style>
