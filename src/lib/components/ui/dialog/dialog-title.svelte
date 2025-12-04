<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";
	import { cn } from "$lib/utils";

	type $$Props = DialogPrimitive.TitleProps;

	let {
		children,
		class: className = undefined,
		...rest
	}: $$Props = $props();
</script>

<DialogPrimitive.Title
	class={cn('text-lg font-semibold leading-none tracking-tight', className)}
	{...rest}
>
	{@render children()}
</DialogPrimitive.Title>