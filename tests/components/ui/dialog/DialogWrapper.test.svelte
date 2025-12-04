<script lang="ts">
  import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose } from '$lib/components/ui/dialog';

  let { open = false }: $$Props = $props();

  function handleOpenChange(newOpen: boolean) {
    open = newOpen;
  }
</script>

<Dialog {open} onOpenChange={handleOpenChange}>
  <DialogTrigger>
    <button>Open Dialog</button>
  </DialogTrigger>

  <DialogContent>
    <DialogTitle>Dialog Title</DialogTitle>
    <div>Dialog Content</div>
    <DialogClose>
      <button>Close</button>
    </DialogClose>
  </DialogContent>
</Dialog>