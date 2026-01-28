<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { fn } from 'storybook/test';
  import ActionButton from './ActionButton.svelte';

  const { Story } = defineMeta({
    title: 'UI/ActionButton',
    component: ActionButton,
    tags: ['autodocs'],
    parameters: {
      layout: 'centered',
      docs: {
        description: {
          component: 'A versatile action button component with multiple variants and sizes for the learning app.'
        }
      }
    },
    argTypes: {
      variant: {
        control: 'select',
        options: ['primary', 'secondary', 'success', 'danger', 'practice', 'quick-practice', 'learn', 'text'],
        description: 'Visual style variant'
      },
      size: {
        control: 'select',
        options: ['sm', 'md', 'lg'],
        description: 'Button size'
      },
      icon: {
        control: 'text',
        description: 'Emoji or icon character to show before label'
      },
      disabled: {
        control: 'boolean',
        description: 'Whether the button is disabled'
      }
    },
    args: {
      label: 'Button',
      variant: 'primary',
      size: 'md',
      onclick: fn()
    }
  });
</script>

<!-- Primary Variant -->
<Story name="Primary" args={{ label: 'Primary Button', variant: 'primary' }} />

<!-- Secondary Variant -->
<Story name="Secondary" args={{ label: 'Secondary Button', variant: 'secondary' }} />

<!-- Success Variant -->
<Story name="Success" args={{ label: 'Success', variant: 'success', icon: '✓' }} />

<!-- Danger Variant -->
<Story name="Danger" args={{ label: 'Delete', variant: 'danger', icon: '🗑️' }} />

<!-- Practice Variant -->
<Story name="Practice" args={{ label: 'Start Practice', variant: 'practice', icon: '🎯' }} />

<!-- Quick Practice Variant -->
<Story name="Quick Practice" args={{ label: 'Quick Practice', variant: 'quick-practice', icon: '⚡' }} />

<!-- Learn Variant -->
<Story name="Learn" args={{ label: 'Start Learning', variant: 'learn', icon: '📚' }} />

<!-- With Icon -->
<Story name="With Icon" args={{ label: 'Add to Favorites', variant: 'primary', icon: '⭐' }} />

<!-- Small Size -->
<Story name="Small" args={{ label: 'Small', variant: 'primary', size: 'sm' }} />

<!-- Medium Size -->
<Story name="Medium" args={{ label: 'Medium', variant: 'primary', size: 'md' }} />

<!-- Large Size -->
<Story name="Large" args={{ label: 'Large', variant: 'primary', size: 'lg' }} />

<!-- Disabled State -->
<Story name="Disabled" args={{ label: 'Disabled', variant: 'primary', disabled: true }} />

<!-- All Variants Row -->
<Story name="All Variants">
  {#snippet children(args)}
    <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
      <ActionButton label="Primary" variant="primary" onclick={args.onclick} />
      <ActionButton label="Secondary" variant="secondary" onclick={args.onclick} />
      <ActionButton label="Success" variant="success" onclick={args.onclick} />
      <ActionButton label="Danger" variant="danger" onclick={args.onclick} />
      <ActionButton label="Practice" variant="practice" onclick={args.onclick} />
      <ActionButton label="Quick" variant="quick-practice" onclick={args.onclick} />
      <ActionButton label="Learn" variant="learn" onclick={args.onclick} />
    </div>
  {/snippet}
</Story>

<!-- All Sizes Row -->
<Story name="All Sizes">
  {#snippet children(args)}
    <div style="display: flex; gap: 8px; align-items: center;">
      <ActionButton label="Small" variant="primary" size="sm" onclick={args.onclick} />
      <ActionButton label="Medium" variant="primary" size="md" onclick={args.onclick} />
      <ActionButton label="Large" variant="primary" size="lg" onclick={args.onclick} />
    </div>
  {/snippet}
</Story>
