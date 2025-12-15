<script lang="ts">
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { type VariantProps } from "tailwind-variants";
	import { cn } from "$lib/utils";
	import { buttonVariants } from ".";

	let { variant, size, class: className, children, disabled, ...rest }: HTMLButtonAttributes & VariantProps<typeof buttonVariants> & {
		[key: `aria-${string}`]: any;
		class?: string;
	} = $props();

	// Ensure proper ARIA attributes and HTML disabled state
	$effect(() => {
		// This ensures the disabled state is properly synchronized
		// between HTML disabled attribute and ARIA attributes
	});
</script>

<button
class={cn(buttonVariants({ variant, size, className }))}
aria-disabled={disabled}
disabled={disabled}
{...rest}
>
	{#if children}
		{@render children()}
	{/if}
</button>