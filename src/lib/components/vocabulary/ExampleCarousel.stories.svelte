<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ExampleCarousel from './ExampleCarousel.svelte';

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
    },
    {
      id: 'ex-3',
      german: 'Ich lerne Deutsch.',
      bulgarian: 'Уча немски.',
      context: 'Learning'
    },
    {
      id: 'ex-4',
      german: 'Wo ist die Bibliothek?',
      bulgarian: 'Къде е библиотеката?',
      context: 'Location'
    },
    {
      id: 'ex-5',
      german: 'Danke schön!',
      bulgarian: 'Много ви благодаря!',
      context: 'Gratitude'
    }
  ];

  const { Story } = defineMeta({
    title: 'Vocabulary/ExampleCarousel',
    component: ExampleCarousel,
    tags: ['autodocs'],
    parameters: {
      layout: 'centered',
      docs: {
        description: {
          component: 'Carousel component for browsing example sentences.'
        }
      }
    },
    argTypes: {
      examples: {
        control: 'object',
        description: 'Array of example objects'
      },
      showContext: {
        control: 'boolean',
        description: 'Show context badges'
      },
      autoPlay: {
        control: 'boolean',
        description: 'Auto-advance slides'
      },
      showNavigation: {
        control: 'boolean',
        description: 'Show navigation arrows'
      },
      showIndicators: {
        control: 'boolean',
        description: 'Show slide indicators'
      }
    },
    args: {
      examples: mockExamples,
      showContext: true,
      autoPlay: false,
      showNavigation: true,
      showIndicators: true
    }
  });
</script>

<!-- Default Carousel -->
<Story name="Default" />

<!-- Without Context -->
<Story name="Without Context" args={{ showContext: false }} />

<!-- Without Navigation -->
<Story name="Without Navigation" args={{ showNavigation: false }} />

<!-- Without Indicators -->
<Story name="Without Indicators" args={{ showIndicators: false }} />

<!-- Auto Play -->
<Story name="Auto Play" args={{ autoPlay: true }} />

<!-- Minimal -->
<Story name="Minimal" args={{ showContext: false, showNavigation: false, showIndicators: false }} />

<!-- Single Example -->
<Story name="Single Example" args={{ examples: [mockExamples[0]] }} />

<!-- Many Examples -->
<Story name="Many Examples">
  {@render children()}
</Story>

<!-- Template for many examples -->
<ExampleCarousel 
  examples={[
    ...mockExamples,
    { id: 'ex-6', german: 'Ich brauche Hilfe.', bulgarian: 'Трябва ми помощ.', context: 'Help' },
    { id: 'ex-7', german: 'Was machst du heute?', bulgarian: 'Какво правиш днес?', context: 'Questions' },
    { id: 'ex-8', german: 'Das Essen ist lecker.', bulgarian: 'Храната е вкусна.', context: 'Food' }
  ]} 
/>
