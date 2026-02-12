<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import DefinitionLink from './DefinitionLink.svelte';

  const { Story } = defineMeta({
    title: 'Vocabulary/DefinitionLink',
    component: DefinitionLink,
    tags: ['autodocs'],
    parameters: {
      layout: 'centered',
      docs: {
        description: {
          component: 'Interactive link component for vocabulary definitions and examples.'
        }
      }
    },
    argTypes: {
      text: {
        control: 'text',
        description: 'Link text to display'
      },
      definition: {
        control: 'text',
        description: 'Definition text (shown on hover/click)'
      },
      language: {
        control: 'select',
        options: ['de', 'bg', 'both'],
        description: 'Language of the term'
      },
      variant: {
        control: 'select',
        options: ['default', 'inline', 'card'],
        description: 'Visual variant'
      }
    },
    args: {
      text: 'Guten Tag',
      definition: 'A formal German greeting used during the day',
      language: 'de',
      variant: 'default'
    }
  });
</script>

<!-- German Term -->
<Story name="German Term" />

<!-- Bulgarian Term -->
<Story name="Bulgarian Term" args={{ text: 'Здравей', definition: 'Informal Bulgarian greeting', language: 'bg' }} />

<!-- Both Languages -->
<Story name="Both Languages" args={{ text: 'Guten Tag / Добър ден', definition: 'Formal greeting in both languages', language: 'both' }} />

<!-- Inline Variant -->
<Story name="Inline" args={{ variant: 'inline' }} />

<!-- Card Variant -->
<Story name="Card" args={{ variant: 'card' }} />

<!-- Long Definition -->
<Story name="Long Definition" args={{ 
  text: 'die Ausstellung',
  definition: 'An organized public display of works of art, products, or other items of interest, often held in a gallery, museum, or exhibition center.'
}} />

<!-- Multiple Links -->
<Story name="Multiple Links">
  <p class="max-w-lg text-gray-700">
    To say hello in German, you can use <DefinitionLink text="Guten Tag" definition="Formal greeting" language="de" /> or 
    <DefinitionLink text="Hallo" definition="Informal greeting" language="de" variant="inline" />. 
    In Bulgarian, use <DefinitionLink text="Добър ден" definition="Formal greeting" language="bg" variant="inline" /> or 
    <DefinitionLink text="Здравей" definition="Informal greeting" language="bg" variant="inline" />.
  </p>
</Story>
