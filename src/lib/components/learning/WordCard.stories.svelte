<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import WordCard from './WordCard.svelte';

  // Mock vocabulary items with different parts of speech
  const nounItem = {
    id: 'word-1',
    german: 'der Tisch',
    bulgarian: 'масата',
    partOfSpeech: 'noun',
    category: ['furniture'],
    difficulty: 'beginner',
    grammar: { gender: 'masculine' },
    examples: [{ german: 'Der Tisch ist groß.', bulgarian: 'Масата е голяма.' }]
  };

  const verbItem = {
    id: 'word-2',
    german: 'sprechen',
    bulgarian: 'говоря',
    partOfSpeech: 'verb',
    category: ['communication'],
    difficulty: 'beginner',
    examples: [{ german: 'Ich spreche Deutsch.', bulgarian: 'Говоря немски.' }]
  };

  const adjectiveItem = {
    id: 'word-3',
    german: 'wunderschön',
    bulgarian: 'прекрасен',
    partOfSpeech: 'adjective',
    category: ['descriptions'],
    difficulty: 'intermediate',
    examples: [{ german: 'Das Bild ist wunderschön.', bulgarian: 'Картината е прекрасна.' }]
  };

  const phraseItem = {
    id: 'word-4',
    german: 'Wie geht es dir?',
    bulgarian: 'Как си?',
    partOfSpeech: 'phrase',
    category: ['greetings'],
    difficulty: 'beginner',
    examples: [{ german: 'Hallo! Wie geht es dir?', bulgarian: 'Здравей! Как си?' }]
  };

  const { Story } = defineMeta({
    title: 'Learning/WordCard',
    component: WordCard,
    tags: ['autodocs'],
    parameters: {
      layout: 'centered',
      docs: {
        description: {
          component: 'A card showing a vocabulary word with part of speech, gender (for nouns), and examples.'
        }
      }
    },
    args: {
      item: nounItem
    }
  });
</script>

<!-- Noun with Gender -->
<Story name="Noun" args={{ item: nounItem }} />

<!-- Verb -->
<Story name="Verb" args={{ item: verbItem }} />

<!-- Adjective -->
<Story name="Adjective" args={{ item: adjectiveItem }} />

<!-- Phrase -->
<Story name="Phrase" args={{ item: phraseItem }} />

<!-- Feminine Noun -->
<Story 
  name="Feminine Noun" 
  args={{ 
    item: {
      ...nounItem,
      id: 'word-5',
      german: 'die Blume',
      bulgarian: 'цветето',
      grammar: { gender: 'feminine' }
    }
  }} 
/>

<!-- Neuter Noun -->
<Story 
  name="Neuter Noun" 
  args={{ 
    item: {
      ...nounItem,
      id: 'word-6',
      german: 'das Kind',
      bulgarian: 'детето',
      grammar: { gender: 'neuter' }
    }
  }} 
/>

<!-- All Parts of Speech -->
<Story name="All Types">
  {#snippet children(args)}
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; padding: 16px;">
      <WordCard item={nounItem} />
      <WordCard item={verbItem} />
      <WordCard item={adjectiveItem} />
      <WordCard item={phraseItem} />
    </div>
  {/snippet}
</Story>
