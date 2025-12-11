<script lang="ts">
	import { type VariantProps } from "tailwind-variants";
	import type { Button as ButtonPrimitive } from "bits-ui";
	import { cn } from "$lib/utils";
	import { buttonVariants } from ".";

	let { variant, size, class: className, children, disabled, ...rest }: ButtonPrimitive.RootProps & VariantProps<typeof buttonVariants> & {
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
{@render children()}
</button>