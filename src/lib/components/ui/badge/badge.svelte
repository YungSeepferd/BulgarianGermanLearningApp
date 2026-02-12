<script lang="ts">
	import { badgeVariants, type Variant } from "./index";

	interface Props {
		variant?: Variant;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { variant = "default", class: className = "", children }: Props = $props();
</script>

<div class={badgeVariants({ variant, className })}>
	{@render children?.()}
</div>
