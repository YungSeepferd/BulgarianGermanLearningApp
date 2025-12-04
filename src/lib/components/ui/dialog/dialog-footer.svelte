<script lang="ts">
	import { cn } from "$lib/utils";
	import type { HTMLAttributes } from "svelte/elements";

	type $$Props = HTMLAttributes<HTMLDivElement> & {
	children?: Snippet;
};

	let {
		children,
		class: className = undefined,
		...rest
	}: $$Props = $props();
</script>

<div
	class={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
	{...rest}
>
	{@render children()}
</div>