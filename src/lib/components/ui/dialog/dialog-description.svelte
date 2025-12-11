<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";
	import { cn } from "$lib/utils";

	type $$Props = DialogPrimitive.DescriptionProps;

	let {
		children,
		class: className = undefined,
		...rest
	}: $$Props = $props();
</script>

<DialogPrimitive.Description
	class={cn('text-sm text-muted-foreground', className)}
	{...rest}
>
	{#if children}
		{@render children()}
	{/if}
</DialogPrimitive.Description>