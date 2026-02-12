<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ProgressIndicator from './ProgressIndicator.svelte';

  const { Story } = defineMeta({
    title: 'Learning/ProgressIndicator',
    component: ProgressIndicator,
    tags: ['autodocs'],
    parameters: {
      layout: 'centered',
      docs: {
        description: {
          component: 'Progress indicator showing completion percentage with visual bar.'
        }
      }
    },
    argTypes: {
      progress: {
        control: 'number',
        min: 0,
        max: 100,
        description: 'Progress percentage (0-100)'
      },
      size: {
        control: 'select',
        options: ['sm', 'md', 'lg'],
        description: 'Bar height/size'
      },
      showLabel: {
        control: 'boolean',
        description: 'Show percentage label'
      },
      color: {
        control: 'select',
        options: ['blue', 'green', 'orange', 'red'],
        description: 'Progress bar color'
      }
    },
    args: {
      progress: 50,
      size: 'md',
      showLabel: true,
      color: 'blue'
    }
  });
</script>

<!-- 0% Progress -->
<Story name="0%" args={{ progress: 0 }} />

<!-- 25% Progress -->
<Story name="25%" args={{ progress: 25 }} />

<!-- 50% Progress -->
<Story name="50%" args={{ progress: 50 }} />

<!-- 75% Progress -->
<Story name="75%" args={{ progress: 75 }} />

<!-- 100% Progress -->
<Story name="100%" args={{ progress: 100 }} />

<!-- Without Label -->
<Story name="Without Label" args={{ progress: 65, showLabel: false }} />

<!-- Small Size -->
<Story name="Small" args={{ progress: 50, size: 'sm' }} />

<!-- Large Size -->
<Story name="Large" args={{ progress: 50, size: 'lg' }} />

<!-- Green Color -->
<Story name="Green" args={{ progress: 75, color: 'green' }} />

<!-- Orange Color -->
<Story name="Orange" args={{ progress: 50, color: 'orange' }} />

<!-- Red Color -->
<Story name="Red" args={{ progress: 25, color: 'red' }} />

<!-- All Colors -->
<Story name="All Colors">
  <div class="flex flex-col gap-4 w-80">
    <ProgressIndicator progress={75} color="blue" />
    <ProgressIndicator progress={50} color="green" />
    <ProgressIndicator progress={30} color="orange" />
    <ProgressIndicator progress={90} color="red" />
  </div>
</Story>
