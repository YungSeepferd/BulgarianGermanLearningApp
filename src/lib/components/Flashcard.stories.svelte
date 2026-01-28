<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Flashcard from './Flashcard.svelte';

  // Rich mock vocabulary item with all enrichment data
  const mockItem = {
    id: 'test-flashcard-1',
    german: 'der Schmetterling',
    bulgarian: 'пеперудата',
    partOfSpeech: 'noun',
    category: ['nature', 'animals'],
    difficulty: 'intermediate',
    examples: [
      { 
        german: 'Der Schmetterling fliegt von Blume zu Blume.', 
        bulgarian: 'Пеперудата лети от цвят на цвят.' 
      },
      {
        german: 'Schmetterlinge sind wunderschön.',
        bulgarian: 'Пеперудите са много красиви.'
      }
    ],
    notes: 'Compound word: Schmetter (to smash) + ling (diminutive)',
    tags: ['insects', 'nature', 'beauty'],
    culturalNotes: 'In German folklore, butterflies were believed to be the souls of the dead.',
    enrichedDefinition: {
      german: 'Ein Insekt mit vier großen, oft bunten Flügeln',
      bulgarian: 'Насекомо с четири големи, често цветни крила'
    },
    mnemonic: 'Imagine a butterfly "smattering" colors across the sky',
    pronunciation: {
      german: '/ˈʃmɛtɐlɪŋ/',
      bulgarian: '/pepɛˈrudɐtɐ/'
    }
  };

  const simpleItem = {
    id: 'test-flashcard-2',
    german: 'Hallo',
    bulgarian: 'Здравей',
    partOfSpeech: 'interjection',
    category: ['greetings'],
    difficulty: 'beginner'
  };

  const { Story } = defineMeta({
    title: 'Components/Flashcard',
    component: Flashcard,
    tags: ['autodocs'],
    parameters: {
      layout: 'centered',
      docs: {
        description: {
          component: 'A detailed flashcard component showing vocabulary with examples, grammar info, and cultural notes.'
        }
      }
    },
    args: {
      vocabularyItem: mockItem
    }
  });
</script>

<!-- Default with Rich Content -->
<Story name="Rich Content" args={{ vocabularyItem: mockItem }} />

<!-- Simple Word -->
<Story name="Simple Word" args={{ vocabularyItem: simpleItem }} />

<!-- Noun -->
<Story 
  name="Noun" 
  args={{ 
    vocabularyItem: {
      id: 'noun-1',
      german: 'das Buch',
      bulgarian: 'книгата',
      partOfSpeech: 'noun',
      category: ['objects'],
      difficulty: 'beginner',
      examples: [{ german: 'Ich lese ein Buch.', bulgarian: 'Чета книга.' }]
    }
  }} 
/>

<!-- Verb -->
<Story 
  name="Verb" 
  args={{ 
    vocabularyItem: {
      id: 'verb-1',
      german: 'laufen',
      bulgarian: 'тичам',
      partOfSpeech: 'verb',
      category: ['movement'],
      difficulty: 'beginner',
      examples: [{ german: 'Ich laufe jeden Tag.', bulgarian: 'Тичам всеки ден.' }]
    }
  }} 
/>

<!-- Adjective -->
<Story 
  name="Adjective" 
  args={{ 
    vocabularyItem: {
      id: 'adj-1',
      german: 'schön',
      bulgarian: 'красив',
      partOfSpeech: 'adjective',
      category: ['descriptions'],
      difficulty: 'beginner',
      examples: [{ german: 'Das ist ein schöner Tag.', bulgarian: 'Това е красив ден.' }]
    }
  }} 
/>

<!-- With Mnemonic -->
<Story 
  name="With Mnemonic" 
  args={{ 
    vocabularyItem: {
      ...mockItem,
      mnemonic: 'Picture a butterfly "smattering" paint across the sky like an artist!'
    }
  }} 
/>

<!-- Advanced Word -->
<Story 
  name="Advanced Word" 
  args={{ 
    vocabularyItem: {
      id: 'adv-1',
      german: 'die Sehenswürdigkeit',
      bulgarian: 'забележителност',
      partOfSpeech: 'noun',
      category: ['travel'],
      difficulty: 'advanced',
      examples: [
        { 
          german: 'Berlin hat viele Sehenswürdigkeiten.', 
          bulgarian: 'Берлин има много забележителности.' 
        }
      ],
      notes: 'Compound: sehen (see) + würdig (worthy) + keit (noun suffix)',
      culturalNotes: 'Germans love compound nouns - this one means "something worth seeing"'
    }
  }} 
/>
