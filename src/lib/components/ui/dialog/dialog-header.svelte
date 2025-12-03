<script lang="ts">
	import { cn } from "$lib/utils";
	import type { HTMLAttributes } from "svelte/elements";

	type $$Props = HTMLAttributes<HTMLDivElement>;

	let {
		class: className = undefined,
		...rest
	}: $$Props = $props();
</script>

<div
	class="{cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}"
	{...rest}
>
	<slot />
</div>