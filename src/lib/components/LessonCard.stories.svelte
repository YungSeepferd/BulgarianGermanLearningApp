<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { fn } from 'storybook/test';
  import LessonCard from './LessonCard.svelte';

  // Mock lesson data
  const mockLesson = {
    id: 'lesson-1',
    title: 'Everyday Greetings',
    description: 'Learn common German greetings and their Bulgarian equivalents',
    difficulty: 'beginner',
    type: 'vocabulary',
    vocabulary: [
      { id: 'v1', german: 'Guten Morgen', bulgarian: 'Добро утро', partOfSpeech: 'phrase', difficulty: 1 },
      { id: 'v2', german: 'Guten Tag', bulgarian: 'Добър ден', partOfSpeech: 'phrase', difficulty: 1 },
      { id: 'v3', german: 'Guten Abend', bulgarian: 'Добър вечер', partOfSpeech: 'phrase', difficulty: 1 },
      { id: 'v4', german: 'Gute Nacht', bulgarian: 'Лека нощ', partOfSpeech: 'phrase', difficulty: 1 },
      { id: 'v5', german: 'Auf Wiedersehen', bulgarian: 'Довиждане', partOfSpeech: 'phrase', difficulty: 1 }
    ],
    exercises: [],
    grammarPoints: [],
    estimatedTime: 15,
    progress: { completed: false, score: 0, attempts: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const advancedLesson = {
    ...mockLesson,
    id: 'lesson-2',
    title: 'Advanced Expressions',
    description: 'Master complex German expressions and idioms',
    difficulty: 'advanced',
    estimatedTime: 30,
    vocabulary: [
      { id: 'v6', german: 'Das ist mir Wurst', bulgarian: 'Все ми е едно', partOfSpeech: 'phrase', difficulty: 3 },
      { id: 'v7', german: 'Ich verstehe nur Bahnhof', bulgarian: 'Нищо не разбирам', partOfSpeech: 'phrase', difficulty: 3 }
    ]
  };

  const completedLesson = {
    ...mockLesson,
    id: 'lesson-3',
    title: 'Colors and Numbers',
    progress: { completed: true, score: 85, attempts: 2 }
  };

  const { Story } = defineMeta({
    title: 'Components/LessonCard',
    component: LessonCard,
    tags: ['autodocs'],
    parameters: {
      layout: 'centered',
      docs: {
        description: {
          component: 'A card displaying a lesson with vocabulary items, difficulty level, and progress tracking.'
        }
      }
    },
    args: {
      lesson: mockLesson,
      onStart: fn()
    }
  });
</script>

<!-- Beginner Lesson -->
<Story name="Beginner Lesson" args={{ lesson: mockLesson }} />

<!-- Advanced Lesson -->
<Story name="Advanced Lesson" args={{ lesson: advancedLesson }} />

<!-- Completed Lesson -->
<Story name="Completed Lesson" args={{ lesson: completedLesson }} />

<!-- In Progress -->
<Story 
  name="In Progress" 
  args={{ 
    lesson: {
      ...mockLesson,
      progress: { completed: false, score: 45, attempts: 1 }
    }
  }} 
/>

<!-- Grammar Lesson Type -->
<Story 
  name="Grammar Lesson" 
  args={{ 
    lesson: {
      ...mockLesson,
      type: 'grammar',
      title: 'German Cases',
      description: 'Understanding Nominativ, Akkusativ, Dativ, and Genitiv'
    }
  }} 
/>

<!-- Multiple Lessons Grid -->
<Story name="Lesson Grid">
  {#snippet children(args)}
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; padding: 16px; max-width: 800px;">
      <LessonCard lesson={mockLesson} onStart={args.onStart} />
      <LessonCard lesson={advancedLesson} onStart={args.onStart} />
      <LessonCard lesson={completedLesson} onStart={args.onStart} />
      <LessonCard 
        lesson={{...mockLesson, id: 'lesson-4', title: 'Food & Drinks', type: 'vocabulary'}} 
        onStart={args.onStart} 
      />
    </div>
  {/snippet}
</Story>
