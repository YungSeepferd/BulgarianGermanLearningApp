<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Button from './button.svelte';

  const { Story } = defineMeta({
    title: 'UI/Button',
    component: Button,
    tags: ['autodocs'],
    parameters: {
      layout: 'centered',
      docs: {
        description: {
          component: 'A versatile button component with multiple variants and sizes using Tailwind Variants.'
        }
      }
    },
    argTypes: {
      variant: {
        control: 'select',
        options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
        description: 'Visual style variant'
      },
      size: {
        control: 'select',
        options: ['default', 'sm', 'lg', 'icon'],
        description: 'Button size'
      },
      disabled: {
        control: 'boolean',
        description: 'Whether the button is disabled'
      }
    },
    args: {
      children: 'Button',
      variant: 'default',
      size: 'default',
      disabled: false
    }
  });
</script>

<!-- Default Variant -->
<Story name="Default">
  {@render children('Default Button')}
</Story>

<!-- Destructive Variant -->
<Story name="Destructive">
  {@render children('Destructive')}
</Story>

<!-- Outline Variant -->
<Story name="Outline">
  {@render children('Outline')}
</Story>

<!-- Secondary Variant -->
<Story name="Secondary">
  {@render children('Secondary')}
</Story>

<!-- Ghost Variant -->
<Story name="Ghost">
  {@render children('Ghost')}
</Story>

<!-- Link Variant -->
<Story name="Link">
  {@render children('Link')}
</Story>

<!-- Small Size -->
<Story name="Small">
  {@render children('Small')}
</Story>

<!-- Large Size -->
<Story name="Large">
  {@render children('Large')}
</Story>

<!-- Icon Size -->
<Story name="Icon" args={{ size: 'icon' }}>
  {@render children('✓')}
</Story>

<!-- Disabled State -->
<Story name="Disabled" args={{ disabled: true }}>
  {@render children('Disabled')}
</Story>

<!-- All Variants -->
<Story name="All Variants">
  <div class="flex flex-col gap-2">
    <Button variant="default">Default</Button>
    <Button variant="destructive">Destructive</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="link">Link</Button>
  </div>
</Story>

<!-- All Sizes -->
<Story name="All Sizes">
  <div class="flex items-center gap-2">
    <Button size="sm">Small</Button>
    <Button size="default">Default</Button>
    <Button size="lg">Large</Button>
    <Button size="icon">✓</Button>
  </div>
</Story>
