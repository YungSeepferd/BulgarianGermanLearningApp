<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { fn } from 'storybook/test';
  import VocabularyCard from './VocabularyCard.svelte';

  // Mock vocabulary item
  const mockItem = {
    id: 'test-1',
    german: 'Guten Tag',
    bulgarian: 'Добър ден',
    partOfSpeech: 'phrase',
    category: ['greetings'],
    difficulty: 'beginner',
    examples: [
      { german: 'Guten Tag, wie geht es Ihnen?', bulgarian: 'Добър ден, как сте?' }
    ],
    notes: 'Formal greeting used during the day',
    tags: ['formal', 'greeting'],
    culturalNotes: 'Used in professional and formal settings'
  };

  const { Story } = defineMeta({
    title: 'UI/VocabularyCard',
    component: VocabularyCard,
    tags: ['autodocs'],
    argTypes: {
      variant: {
        control: 'select',
        options: ['grid', 'list', 'flashcard', 'lesson']
      },
      direction: {
        control: 'select',
        options: ['DE->BG', 'BG->DE']
      }
    },
    args: {
      item: mockItem,
      onPractice: fn(),
      onQuickPractice: fn(),
      onToggleSelect: fn(),
      onFlip: fn(),
      onOpenDetail: fn()
    }
  });
</script>

<!-- Default Grid Variant -->
<Story name="Grid Variant" args={{ variant: 'grid' }} />

<!-- List Variant -->
<Story name="List Variant" args={{ variant: 'list' }} />

<!-- Flashcard Variant (Front) -->
<Story name="Flashcard Front" args={{ variant: 'flashcard', isFlipped: false }} />

<!-- Flashcard Variant (Flipped/Back) -->
<Story name="Flashcard Back" args={{ variant: 'flashcard', isFlipped: true }} />

<!-- Lesson Variant -->
<Story name="Lesson Variant" args={{ variant: 'lesson' }} />

<!-- Selected State -->
<Story name="Selected State" args={{ variant: 'grid', isSelected: true }} />

<!-- Bulgarian to German Direction -->
<Story name="Bulgarian to German" args={{ variant: 'grid', direction: 'BG->DE' }} />

<!-- Without Metadata -->
<Story name="Without Metadata" args={{ variant: 'grid', showMetadata: false }} />

<!-- Without Actions -->
<Story name="Without Actions" args={{ variant: 'grid', showActions: false }} />

<!-- Without Tags -->
<Story name="Without Tags" args={{ variant: 'grid', showTags: false }} />

<!-- Minimal Card -->
<Story 
  name="Minimal" 
  args={{ 
    variant: 'grid', 
    showMetadata: false, 
    showActions: false, 
    showTags: false 
  }} 
/>
