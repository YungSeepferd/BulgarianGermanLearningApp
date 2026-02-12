<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Dialog from './dialog.svelte';
  import DialogContent from './dialog-content.svelte';
  import DialogHeader from './dialog-header.svelte';
  import DialogTitle from './dialog-title.svelte';
  import DialogDescription from './dialog-description.svelte';
  import DialogFooter from './dialog-footer.svelte';
  import DialogTrigger from './dialog-trigger.svelte';
  import DialogClose from './dialog-close.svelte';
  import DialogOverlay from './dialog-overlay.svelte';
  import Button from '../button/button.svelte';

  const { Story } = defineMeta({
    title: 'UI/Dialog',
    component: Dialog,
    tags: ['autodocs'],
    parameters: {
      layout: 'centered',
      docs: {
        description: {
          component: 'Modal dialog component built with bits-ui. Supports title, description, footer, and custom content.'
        }
      }
    }
  });
</script>

<!-- Basic Dialog -->
<Story name="Basic">
  {@render children()}
</Story>

<svelte:component this={children} />

<!-- Custom Template for basic dialog -->
<Dialog open={false}>
  <DialogTrigger asChild let:open>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>This action cannot be undone.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button variant="destructive">Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
