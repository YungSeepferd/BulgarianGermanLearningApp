# Storybook Stories Status

## Completed Stories ✅

1. **ActionButton** - src/lib/components/ui/ActionButton.stories.svelte
2. **MasteryGauge** - src/lib/components/ui/MasteryGauge.stories.svelte
3. **VocabularyCard** - src/lib/components/ui/VocabularyCard.stories.svelte
4. **Flashcard** - src/lib/components/Flashcard.stories.svelte
5. **LessonCard** - src/lib/components/LessonCard.stories.svelte
6. **TandemToggle** - src/lib/components/TandemToggle.stories.svelte
7. **WordCard** - src/lib/components/learning/WordCard.stories.svelte
8. **DailyCarousel** - src/lib/components/dashboard/DailyCarousel.stories.svelte
9. **SwipeableCard** - src/lib/components/dashboard/SwipeableCard.stories.svelte
10. **Button** - src/lib/components/ui/button/button.stories.svelte

## Components Needing Stories

### UI Components (12)
- [ ] ContextCard.svelte - Uses gameState (global state)
- [ ] Navigation.svelte - Uses appState, page stores
- [ ] SearchList.svelte - Uses appState
- [ ] SimpleProgressCounter.svelte - Uses appState
- [ ] TandemPractice.svelte - Uses appState
- [ ] TestCard.svelte - Uses appState
- [ ] TestProgressService.svelte - Uses appState
- [ ] GlobalErrorHandler.svelte - Error boundary component
- [ ] LessonGenerator.svelte - Uses services
- [ ] GeneratedLesson.svelte - Uses lesson data
- [X] Button (completed)

### Dialog Components (10)
- [X] Dialog - Basic wrapper (partial)
- [ ] DialogContent
- [ ] DialogHeader
- [ ] DialogTitle
- [ ] DialogDescription
- [ ] DialogFooter
- [ ] DialogTrigger
- [ ] DialogClose
- [ ] DialogOverlay
- [ ] DialogPortal

### Dashboard Components (3)
- [X] DailyCarousel (completed)
- [X] SwipeableCard (completed)
- [ ] VocabularyDetailPanel

### Exercise Components (7)
- [ ] ExerciseContainer
- [ ] FillInTheBlankExercise
- [ ] MatchingExercise
- [ ] MultipleChoiceExercise
- [ ] OrderingExercise
- [ ] SentenceBuilder
- [ ] TypingExercise

### Flashcard Components (1)
- [ ] quiz-controller

### Learning Components (8)
- [ ] LearningDashboard
- [ ] LessonList
- [ ] PathBrowser
- [ ] PathCard
- [ ] ProgressIndicator
- [ ] ProgressStats
- [ ] ExampleCard
- [ ] GrammarInfo
- [X] WordCard (completed)

### Vocabulary Components (7)
- [ ] VocabularyEditor
- [ ] WordDetailModal
- [ ] DefinitionLink
- [ ] GrammarTabs
- [ ] ExampleCarousel
- [X] EnrichmentBadge (created)
- [ ] AudioWidget

### Enrichment Components (1)
- [ ] MnemonicEditor

### Icons (1)
- [ ] X.svelte - Simple icon component

## Priority Order for Story Creation

### High Priority (Self-contained, reusable)
1. X.svelte - Simple icon
2. Dialog components - Basic UI patterns
3. ExerciseContainer - Core exercise wrapper
4. ProgressIndicator - UI progress component
5. ProgressStats - Statistics display
6. AudioWidget - Audio player component

### Medium Priority (Some external deps)
1. ExampleCard - Card component
2. GrammarInfo - Information display
3. PathCard - Card with path info
4. TestCard - Test display
5. DefinitionLink - Link component
6. GrammarTabs - Tab component
7. ExampleCarousel - Carousel component
8. VocabularyEditor - Editor component
9. MnemonicEditor - Editor component

### Low Priority (Global state dependencies)
1. ContextCard - Uses gameState
2. Navigation - Uses appState, page stores
3. SearchList - Uses appState
4. SimpleProgressCounter - Uses appState
5. TandemPractice - Uses appState
6. TestProgressService - Uses appState
7. LearningDashboard - Complex dashboard
8. LessonGenerator - Complex generator
9. GeneratedLesson - Complex lesson display
10. VocabularyDetailPanel - Complex panel
11. WordDetailModal - Complex modal
12. LessonList - Uses appState
13. PathBrowser - Uses appState
14. MultipleChoiceExercise - Exercise type
15. FillInTheBlankExercise - Exercise type
16. MatchingExercise - Exercise type
17. OrderingExercise - Exercise type
18. SentenceBuilder - Exercise type
19. TypingExercise - Exercise type
20. quiz-controller - Complex controller
21. GlobalErrorHandler - Error boundary

## Story Template

```svelte
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { fn } from 'storybook/test';
  import ComponentName from './ComponentName.svelte';

  const { Story } = defineMeta({
    title: 'Category/ComponentName',
    component: ComponentName,
    tags: ['autodocs'],
    parameters: {
      layout: 'centered',
      docs: {
        description: {
          component: 'Component description here'
        }
      }
    },
    argTypes: {
      prop1: {
        control: 'text',
        description: 'Prop description'
      },
      callback: {
        action: 'called',
        description: 'Callback function'
      }
    },
    args: {
      prop1: 'default value',
      callback: fn()
    }
  });
</script>

<!-- Story Name -->
<Story name="Story Name" args={{ prop1: 'value' }} />
```

## Notes

- Components using `appState` or `gameState` require mocked state for stories
- Components using `$app/stores` (page, navigating) require SvelteKit-specific setup
- Exercise components have complex data structures that need mock data
- Dialog components from bits-ui work together as composable parts
- Priority should be given to UI components that are reused across the app
