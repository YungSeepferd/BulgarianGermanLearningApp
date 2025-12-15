<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";

	type $$Props = DialogPrimitive.RootProps & { children?: any };

	let {
		children,
		open = $bindable(false),
		...rest
	}: $$Props = $props();
</script>

<DialogPrimitive.Root
	bind:open
	{...rest}
>
	{#if children}
		{@render children()}
	{/if}
</DialogPrimitive.Root>
