<script lang="ts">
  import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose } from '$lib/components/ui/dialog';

  let { open = false, onOpenChange }: $$Props = $props();

  function handleOpenChange(newOpen: boolean) {
    open = newOpen;
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  }
</script>

<Dialog {open} onOpenChange={handleOpenChange}>
  <DialogTrigger>Open Dialog</DialogTrigger>

  <DialogContent>
    <DialogTitle>Dialog Title</DialogTitle>
    <div>Dialog Content</div>
    <DialogClose data-testid="dialog-close-button">Close</DialogClose>
  </DialogContent>
</Dialog>