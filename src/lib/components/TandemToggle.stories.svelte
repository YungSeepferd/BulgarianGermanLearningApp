<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { fn } from 'storybook/test';
  import TandemToggle from './TandemToggle.svelte';

  const { Story } = defineMeta({
    title: 'Components/TandemToggle',
    component: TandemToggle,
    tags: ['autodocs'],
    parameters: {
      layout: 'centered',
      docs: {
        description: {
          component: 'Toggle between German→Bulgarian and Bulgarian→German learning directions, with optional practice/search mode switch.'
        }
      }
    },
    argTypes: {
      mode: {
        control: 'radio',
        options: ['practice', 'search'],
        description: 'Current mode of the toggle'
      }
    },
    args: {
      mode: 'practice',
      onDirectionChange: fn(),
      onModeChange: fn()
    }
  });
</script>

<!-- Default Practice Mode -->
<Story name="Practice Mode" args={{ mode: 'practice' }} />

<!-- Search Mode -->
<Story name="Search Mode" args={{ mode: 'search' }} />

<!-- Interactive Demo -->
<Story 
  name="Interactive"
  parameters={{
    docs: {
      description: {
        story: 'Click the direction button to toggle between DE→BG and BG→DE. Click the mode button to switch between practice and search modes.'
      }
    }
  }}
>
  {#snippet children(args)}
    <div style="padding: 20px; background: var(--background); border-radius: 8px;">
      <TandemToggle 
        mode={args.mode} 
        onDirectionChange={args.onDirectionChange}
        onModeChange={args.onModeChange}
      />
    </div>
  {/snippet}
</Story>
