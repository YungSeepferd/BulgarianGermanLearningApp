<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ExampleCard from './ExampleCard.svelte';

  const mockExamples = [
    {
      id: 'ex-1',
      german: 'Guten Tag, wie geht es Ihnen?',
      bulgarian: 'Добър ден, как сте?',
      context: 'Formal greeting'
    },
    {
      id: 'ex-2',
      german: 'Das ist ein schöner Tag.',
      bulgarian: 'Това е хубав ден.',
      context: 'Weather'
    }
  ];

  const { Story } = defineMeta({
    title: 'Learning/ExampleCard',
    component: ExampleCard,
    tags: ['autodocs'],
    parameters: {
      layout: 'centered',
      docs: {
        description: {
          component: 'Card displaying example sentences for vocabulary items.'
        }
      }
    },
    argTypes: {
      example: {
        control: 'object',
        description: 'Example sentence object'
      },
      showContext: {
        control: 'boolean',
        description: 'Show context badge'
      },
      interactive: {
        control: 'boolean',
        description: 'Enable interactive features (audio, etc.)'
      },
      compact: {
        control: 'boolean',
        description: 'Show compact version'
      }
    },
    args: {
      example: mockExamples[0],
      showContext: true,
      interactive: true,
      compact: false
    }
  });
</script>

<!-- Default Example Card -->
<Story name="Default" />

<!-- Without Context -->
<Story name="Without Context" args={{ showContext: false }} />

<!-- Non-interactive -->
<Story name="Non-interactive" args={{ interactive: false }} />

<!-- Compact -->
<Story name="Compact" args={{ compact: true }} />

<!-- Second Example -->
<Story name="Second Example" args={{ example: mockExamples[1] }} />

<!-- All Variants -->
<Story name="All Variants">
  <div class="flex flex-col gap-4 max-w-lg">
    <ExampleCard example={mockExamples[0]} />
    <ExampleCard example={mockExamples[1]} compact={true} />
    <ExampleCard example={mockExamples[0]} interactive={false} />
  </div>
</Story>
