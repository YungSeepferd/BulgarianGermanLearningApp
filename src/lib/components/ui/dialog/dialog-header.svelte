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
	class={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
	{...rest}
>
	{@render children()}
</div>