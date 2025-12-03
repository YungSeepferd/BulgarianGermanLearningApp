<script lang="ts">
	import { Button as ButtonPrimitive } from "bits-ui";
	import { buttonVariants, type $$Props } from "./index.js";
	import { cn } from "$lib/utils";
	import type { Snippets } from "svelte";

	let {
		variant = "default",
		size = "default",
		class: className = undefined,
		children,
		...rest
	}: $$Props = $props();
</script>

<ButtonPrimitive.Root
	class="{cn(buttonVariants({ variant, size, className }))}"
	{...rest}
>
	{@render children()}
</ButtonPrimitive.Root>