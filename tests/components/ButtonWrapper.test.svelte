<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';

	let { variant, size, disabled, buttonText = 'Button' }: $$Props = $props();
</script>

<Button {variant} {size} {disabled}>
	{buttonText}
</Button>