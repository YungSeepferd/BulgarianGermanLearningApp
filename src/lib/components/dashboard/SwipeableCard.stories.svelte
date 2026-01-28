<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { fn } from 'storybook/test';
  import SwipeableCard from './SwipeableCard.svelte';

  // Mock vocabulary item for stories
  const mockItem = {
    id: 'daily-1',
    german: 'Guten Morgen',
    bulgarian: 'Добро утро',
    partOfSpeech: 'phrase',
    category: ['greetings'],
    difficulty: 'beginner',
    examples: [
      { german: 'Guten Morgen, wie haben Sie geschlafen?', bulgarian: 'Добро утро, как спахте?' }
    ],
    notes: 'Morning greeting',
    tags: ['greeting', 'morning'],
    culturalNotes: 'Used until around noon'
  };

  const { Story } = defineMeta({
    title: 'Dashboard/SwipeableCard',
    component: SwipeableCard,
    tags: ['autodocs'],
    parameters: {
      layout: 'centered',
      backgrounds: {
        default: 'light-gradient'
      }
    },
    argTypes: {
      isActive: {
        control: 'boolean',
        description: 'Whether this card is currently active (on top of stack)'
      }
    },
    args: {
      item: mockItem,
      isActive: true,
      onSwipeLeft: fn(),
      onSwipeRight: fn(),
      onTap: fn()
    }
  });
</script>

<!-- Default Active Card -->
<Story name="Active Card" args={{ isActive: true }} />

<!-- Inactive Card (in stack) -->
<Story name="Inactive Card" args={{ isActive: false }} />

<!-- Noun Card -->
<Story 
  name="Noun Card" 
  args={{ 
    item: {
      id: 'noun-1',
      german: 'der Hund',
      bulgarian: 'кучето',
      partOfSpeech: 'noun',
      category: ['animals'],
      difficulty: 'beginner',
      examples: [{ german: 'Der Hund bellt.', bulgarian: 'Кучето лае.' }],
      tags: ['animals', 'pet']
    },
    isActive: true 
  }} 
/>

<!-- Verb Card -->
<Story 
  name="Verb Card" 
  args={{ 
    item: {
      id: 'verb-1',
      german: 'gehen',
      bulgarian: 'ходя',
      partOfSpeech: 'verb',
      category: ['movement'],
      difficulty: 'beginner',
      examples: [{ german: 'Ich gehe nach Hause.', bulgarian: 'Отивам вкъщи.' }],
      tags: ['movement', 'basic']
    },
    isActive: true 
  }} 
/>

<!-- Adjective Card -->
<Story 
  name="Adjective Card" 
  args={{ 
    item: {
      id: 'adj-1',
      german: 'groß',
      bulgarian: 'голям',
      partOfSpeech: 'adjective',
      category: ['descriptions'],
      difficulty: 'beginner',
      examples: [{ german: 'Das Haus ist groß.', bulgarian: 'Къщата е голяма.' }],
      tags: ['size', 'basic']
    },
    isActive: true 
  }} 
/>

<!-- Advanced Word -->
<Story 
  name="Advanced Word" 
  args={{ 
    item: {
      id: 'adv-1',
      german: 'Gleichberechtigung',
      bulgarian: 'равноправие',
      partOfSpeech: 'noun',
      category: ['society'],
      difficulty: 'advanced',
      examples: [{ german: 'Gleichberechtigung ist wichtig.', bulgarian: 'Равноправието е важно.' }],
      notes: 'Compound word: gleich (equal) + berechtigung (rights)',
      tags: ['society', 'advanced']
    },
    isActive: true 
  }} 
/>

<!-- With Cultural Note -->
<Story 
  name="With Cultural Note" 
  args={{ 
    item: {
      id: 'culture-1',
      german: 'Prost',
      bulgarian: 'Наздраве',
      partOfSpeech: 'interjection',
      category: ['social'],
      difficulty: 'beginner',
      examples: [{ german: 'Prost! Auf deine Gesundheit!', bulgarian: 'Наздраве! За твоето здраве!' }],
      culturalNotes: 'In Germany, maintain eye contact when toasting. In Bulgaria, clink glasses below the rim to show respect.',
      tags: ['social', 'toast']
    },
    isActive: true 
  }} 
/>
