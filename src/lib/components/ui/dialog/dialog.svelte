<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";

	type $$Props = DialogPrimitive.RootProps & { children?: any };

	let {
		children,
		open = undefined,
		onOpenChange = undefined,
		...rest
	}: $$Props = $props();
</script>

<DialogPrimitive.Root
	bind:open
	{onOpenChange}
	{...rest}
>
	{#if children}
		{@render children()}
	{/if}
</DialogPrimitive.Root>
