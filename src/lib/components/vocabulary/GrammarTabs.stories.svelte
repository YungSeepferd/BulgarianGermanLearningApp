<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import GrammarTabs from './GrammarTabs.svelte';

  const mockTabs = [
    { id: 'tab-1', label: 'Articles', content: 'Bulgarian definite articles are suffixes added to nouns.' },
    { id: 'tab-2', label: 'Verbs', content: 'Bulgarian verbs conjugate for person, number, and tense.' },
    { id: 'tab-3', label: 'Cases', content: 'Bulgarian has a complex case system for nouns and adjectives.' }
  ];

  const { Story } = defineMeta({
    title: 'Vocabulary/GrammarTabs',
    component: GrammarTabs,
    tags: ['autodocs'],
    parameters: {
      layout: 'centered',
      docs: {
        description: {
          component: 'Tabbed interface for displaying grammar information.'
        }
      }
    },
    argTypes: {
      tabs: {
        control: 'object',
        description: 'Array of tab objects with id, label, and content'
      },
      defaultTab: {
        control: 'text',
        description: 'Default tab ID to show'
      },
      variant: {
        control: 'select',
        options: ['default', 'pills', 'underline'],
        description: 'Visual variant'
      }
    },
    args: {
      tabs: mockTabs,
      defaultTab: 'tab-1',
      variant: 'default'
    }
  });
</script>

<!-- Default Tabs -->
<Story name="Default" />

<!-- Pills Variant -->
<Story name="Pills" args={{ variant: 'pills' }} />

<!-- Underline Variant -->
<Story name="Underline" args={{ variant: 'underline' }} />

<!-- Second Tab Default -->
<Story name="Second Tab Default" args={{ defaultTab: 'tab-2' }} />

<!-- Many Tabs -->
<Story name="Many Tabs">
  {@render children()}
</Story>

<!-- Template for many tabs -->
<GrammarTabs 
  tabs={[
    { id: 't1', label: 'Articles', content: 'Content 1' },
    { id: 't2', label: 'Verbs', content: 'Content 2' },
    { id: 't3', label: 'Nouns', content: 'Content 3' },
    { id: 't4', label: 'Adjectives', content: 'Content 4' },
    { id: 't5', label: 'Pronouns', content: 'Content 5' }
  ]} 
  variant="pills"
/>
