<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";
	import { buttonVariants } from "$lib/components/ui/button";
	import { cn } from "$lib/utils";

	type $$Props = DialogPrimitive.CloseProps;

	let {
		children,
		class: className = undefined,
		...rest
	}: $$Props = $props();
</script>

<DialogPrimitive.Close
	class={cn(
		buttonVariants({ variant: 'outline' }),
		'mt-2 sm:mt-0',
		className
	)}
	{...rest}
>
	{@render children()}
</DialogPrimitive.Close>