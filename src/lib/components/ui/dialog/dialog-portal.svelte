<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";
	type $$Props = DialogPrimitive.PortalProps & { children?: any };

	let {
		children,
		...rest
	}: $$Props = $props();
</script>

<DialogPrimitive.Portal
	{...rest}
>
	{#if children}
		{@render children()}
	{/if}
</DialogPrimitive.Portal>