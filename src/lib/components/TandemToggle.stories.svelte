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

<!-- Interactive Demo - Click direction to toggle DE→BG/BG→DE, click mode to switch practice/search -->
<Story name="Interactive" args={{ mode: 'practice' }} />
