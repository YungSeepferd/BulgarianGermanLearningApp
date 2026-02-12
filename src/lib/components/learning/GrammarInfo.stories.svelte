<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import GrammarInfo from './GrammarInfo.svelte';

  const mockGrammar = {
    id: 'gram-1',
    title: 'Definite Articles in Bulgarian',
    category: 'Articles',
    description: 'Bulgarian uses definite articles that are added to the end of words.',
    examples: [
      {
        noun: 'човек (man)',
        article: 'човекът (the man)',
        gender: 'masculine'
      },
      {
        noun: 'жена (woman)',
        article: 'жената (the woman)',
        gender: 'feminine'
      }
    ],
    tips: [
      'Masculine nouns add -ът or -ят',
      'Feminine nouns add -та',
      'Neuter nouns add -то'
    ]
  };

  const { Story } = defineMeta({
    title: 'Learning/GrammarInfo',
    component: GrammarInfo,
    tags: ['autodocs'],
    parameters: {
      layout: 'centered',
      docs: {
        description: {
          component: 'Grammar information card with rules, examples, and tips.'
        }
      }
    },
    argTypes: {
      grammar: {
        control: 'object',
        description: 'Grammar information object'
      },
      showExamples: {
        control: 'boolean',
        description: 'Show example sentences'
      },
      showTips: {
        control: 'boolean',
        description: 'Show grammar tips'
      },
      collapsible: {
        control: 'boolean',
        description: 'Make content collapsible'
      }
    },
    args: {
      grammar: mockGrammar,
      showExamples: true,
      showTips: true,
      collapsible: false
    }
  });
</script>

<!-- Default Grammar Info -->
<Story name="Default" />

<!-- Without Examples -->
<Story name="Without Examples" args={{ showExamples: false }} />

<!-- Without Tips -->
<Story name="Without Tips" args={{ showTips: false }} />

<!-- Collapsible -->
<Story name="Collapsible" args={{ collapsible: true }} />

<!-- Minimal -->
<Story name="Minimal" args={{ showExamples: false, showTips: false }} />

<!-- Full Grammar Info -->
<Story name="Full Grammar Info">
  <div class="max-w-lg">
    <GrammarInfo 
      grammar={{
        id: 'gram-2',
        title: 'Verb Conjugation',
        category: 'Verbs',
        description: 'Bulgarian verbs change form based on person, number, and tense.',
        examples: [
          { noun: 'аз пиша (I write)', article: 'аз написах (I wrote)', gender: 'first person' },
          { noun: 'ти пишеш (you write)', article: 'ти написа (you wrote)', gender: 'second person' }
        ],
        tips: ['Use past tense for completed actions', 'Learn the stem endings']
      }}
    />
  </div>
</Story>
