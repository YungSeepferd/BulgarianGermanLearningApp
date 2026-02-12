<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import XIcon from './X.svelte';

  const { Story } = defineMeta({
    title: 'UI/Icons/X',
    component: XIcon,
    tags: ['autodocs'],
    parameters: {
      layout: 'centered',
      docs: {
        description: {
          component: 'Close/X icon component used in dialogs and modals.'
        }
      }
    },
    argTypes: {
      size: {
        control: 'select',
        options: ['sm', 'md', 'lg'],
        description: 'Icon size'
      },
      color: {
        control: 'select',
        options: ['default', 'muted', 'danger'],
        description: 'Icon color variant'
      }
    }
  });
</script>

<!-- Default Size -->
<Story name="Default" args={{ size: 'md', color: 'default' }} />

<!-- Small -->
<Story name="Small" args={{ size: 'sm', color: 'default' }} />

<!-- Large -->
<Story name="Large" args={{ size: 'lg', color: 'default' }} />

<!-- Muted Color -->
<Story name="Muted" args={{ size: 'md', color: 'muted' }} />

<!-- Danger Color -->
<Story name="Danger" args={{ size: 'md', color: 'danger' }} />

<!-- All Variants -->
<Story name="All Variants">
  <div class="flex items-center gap-4 p-4">
    <div class="flex flex-col items-center gap-2">
      <XIcon size="sm" color="default" />
      <span class="text-xs">sm/default</span>
    </div>
    <div class="flex flex-col items-center gap-2">
      <XIcon size="md" color="default" />
      <span class="text-xs">md/default</span>
    </div>
    <div class="flex flex-col items-center gap-2">
      <XIcon size="lg" color="default" />
      <span class="text-xs">lg/default</span>
    </div>
    <div class="flex flex-col items-center gap-2">
      <XIcon size="md" color="muted" />
      <span class="text-xs">md/muted</span>
    </div>
    <div class="flex flex-col items-center gap-2">
      <XIcon size="md" color="danger" />
      <span class="text-xs">md/danger</span>
    </div>
  </div>
</Story>
