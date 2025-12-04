<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";
import type { Snippet } from "svelte";

	type $$Props = DialogPrimitive.RootProps;

	let {
		children,
		open = undefined,
		onOpenChange = undefined,
		closeOnOutsideClick = undefined,
		closeOnEscape = undefined,
		preventScroll = undefined,
		onOutsideClick = undefined,
		onEscapeKeyDown = undefined,
		onClose = undefined,
		portal = undefined,
		openFocus = undefined,
		closeFocus = undefined,
		...rest
	}: $$Props = $props();
</script>

<DialogPrimitive.Root
	bind:open
	onOpenChange={onOpenChange}
	closeOnOutsideClick={closeOnOutsideClick}
	closeOnEscape={closeOnEscape}
	preventScroll={preventScroll}
	onOutsideClick={onOutsideClick}
	onEscapeKeyDown={onEscapeKeyDown}
	onClose={onClose}
	portal={portal}
	{...rest}
>
	{@render children()}
</DialogPrimitive.Root>