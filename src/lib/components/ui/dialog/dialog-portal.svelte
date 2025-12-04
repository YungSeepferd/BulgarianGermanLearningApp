<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";
	type $$Props = DialogPrimitive.PortalProps;

	let {
		children,
		class: className = undefined,
		...rest
	}: $$Props = $props();
</script>

<DialogPrimitive.Portal
	class={className}
	{...rest}
>
	{@render children()}
</DialogPrimitive.Portal>