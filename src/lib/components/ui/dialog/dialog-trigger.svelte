<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";
	import { buttonVariants } from "$lib/components/ui/button";
	import { cn } from "$lib/utils";

	type $$Props = DialogPrimitive.TriggerProps;

	let {
		children,
		class: className = undefined,
		...rest
	}: $$Props = $props();
</script>

<DialogPrimitive.Trigger
	class={cn(buttonVariants({ variant: 'outline' }), className)}
	{...rest}
>
	{@render children()}
</DialogPrimitive.Trigger>