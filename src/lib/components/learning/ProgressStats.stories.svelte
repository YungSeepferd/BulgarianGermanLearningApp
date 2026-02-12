<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ProgressStats from './ProgressStats.svelte';

  const { Story } = defineMeta({
    title: 'Learning/ProgressStats',
    component: ProgressStats,
    tags: ['autodocs'],
    parameters: {
      layout: 'centered',
      docs: {
        description: {
          component: 'Statistics display showing learning progress with cards for different metrics.'
        }
      }
    },
    argTypes: {
      totalItems: {
        control: 'number',
        description: 'Total vocabulary items'
      },
      learned: {
        control: 'number',
        description: 'Number of items learned'
      },
      inProgress: {
        control: 'number',
        description: 'Number of items in progress'
      },
      accuracy: {
        control: 'number',
        min: 0,
        max: 100,
        description: 'Accuracy percentage'
      },
      streak: {
        control: 'number',
        description: 'Current learning streak in days'
      },
      compact: {
        control: 'boolean',
        description: 'Show compact version'
      }
    },
    args: {
      totalItems: 746,
      learned: 312,
      inProgress: 89,
      accuracy: 85,
      streak: 7,
      compact: false
    }
  });
</script>

<!-- Default Stats -->
<Story name="Default" />

<!-- High Accuracy -->
<Story name="High Accuracy" args={{ accuracy: 95, streak: 14 }} />

<!-- Low Accuracy -->
<Story name="Low Accuracy" args={{ accuracy: 45, streak: 2 }} />

<!-- Just Started -->
<Story name="Just Started" args={{ learned: 0, inProgress: 5, accuracy: 0, streak: 0 }} />

<!-- Almost Complete -->
<Story name="Almost Complete" args={{ learned: 700, inProgress: 46, accuracy: 92, streak: 21 }} />

<!-- Compact Mode -->
<Story name="Compact" args={{ compact: true }} />

<!-- Long Streak -->
<Story name="Long Streak" args={{ streak: 100 }} />

<!-- High Progress -->
<Story name="High Progress" args={{ learned: 500, inProgress: 200, totalItems: 700 }} />
