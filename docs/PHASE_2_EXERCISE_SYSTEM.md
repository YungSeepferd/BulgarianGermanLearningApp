# Phase 2: Interactive Exercise System - Technical Specifications & Sprint Plan

**Status**: Ready for Implementation  
**Date**: December 17, 2025  
**Duration**: 2 weeks (50 hours)  
**Prerequisite**: Phase 1 Foundation Complete  
**Successor**: Phase 3 Content & Editing

---

## 🎯 Phase 2 Overview

After Phase 1 establishes the learning hub dashboard, Phase 2 adds **interactive exercise types** to practice vocabulary in context. Instead of passive flashcards, users solve problems, translate, and build sentences.

### Goals
- ✅ Create 5+ exercise types (cloze, sentence builder, typing, multiple choice, matching)
- ✅ Implement instant feedback system
- ✅ Track exercise completion & mastery
- ✅ Build exercise recommendation engine
- ✅ Create hint/help system

### Success Criteria
- Users can complete all exercise types without errors
- Performance tracked per exercise type
- Hints/explanations improve learning outcomes
- No console errors across all browsers

---

## 📋 Exercise Types to Implement

### 1. Cloze Test (Fill-in-the-Blank)
**Purpose**: Fill missing words in sentences  
**Interaction**: Text input → validation → feedback

**Example**:
```
"The word ___ means 'Hallo' in Bulgarian."
[User types: Hallo]
→ Feedback: "Correct! You wrote: Hallo"
```

**Technical Implementation**:
```typescript
// src/lib/types/exercises.ts
export interface ClozeExercise extends BaseExercise {
  type: 'cloze';
  sentence: string;
  blankIndex: number; // position in sentence
  blanks: {
    position: number;
    correctAnswer: string;
    hints: string[];
  }[];
}

// Component: src/lib/components/exercises/ClozeTest.svelte
// - Parse sentence for blanks (marked with ___)
// - Render input fields
// - Validate answer with fuzzy matching (tolerance for typos)
// - Show hints on request
// - Track time & attempts
```

**Files to Create**:
- `src/lib/components/exercises/ClozeTest.svelte` (120 lines)
- `src/lib/services/exercises/cloze-validator.ts` (80 lines)
- `src/lib/types/exercises.ts` (update with ClozeExercise type)

---

### 2. Sentence Builder (Drag-Drop Word Order)
**Purpose**: Arrange words in correct sentence order  
**Interaction**: Drag words → drop into slots → validation → feedback

**Example**:
```
"Arrange to make: 'I am learning Bulgarian'"

[Learning] [Am] [I] [Bulgarian]
↓ (user drags)
[I] [Am] [Learning] [Bulgarian]
→ Feedback: "Correct word order!"
```

**Technical Implementation**:
```typescript
// src/lib/types/exercises.ts
export interface SentenceBuilderExercise extends BaseExercise {
  type: 'sentence-builder';
  words: string[];
  correctOrder: number[]; // indices of correct arrangement
  sentence: string; // expected result
  variations: number[][]; // acceptable variations (e.g., word order flexibility)
}

// Component: src/lib/components/exercises/SentenceBuilder.svelte
// - Render draggable word tiles using svelte-dnd-action
// - Track user's arrangement in real-time
// - Validate against correct order + variations
// - Provide reorder hints
// - Show full sentence translation after completion
```

**Files to Create**:
- `src/lib/components/exercises/SentenceBuilder.svelte` (150 lines)
- `src/lib/services/exercises/sentence-validator.ts` (100 lines)
- Update `package.json` to add `svelte-dnd-action` dependency

---

### 3. Typing Exercise (Write in Cyrillic)
**Purpose**: Type Bulgarian translation or conjugation  
**Interaction**: Listen to audio → type answer → validation → feedback

**Example**:
```
"Type the Bulgarian word for 'hello'"
[Audio button: plays "Hallo"]

[User types: Здравей]
→ Feedback: "Perfect! That's how Bulgarians say hello."
```

**Technical Implementation**:
```typescript
// src/lib/types/exercises.ts
export interface TypingExercise extends BaseExercise {
  type: 'typing';
  prompt: string;
  correctAnswer: string;
  variations: string[]; // acceptable variations (spelling, diacritics)
  audioUrl?: string; // pronunciation guide
}

// Component: src/lib/components/exercises/TypingExercise.svelte
// - Display prompt (text or audio)
// - Render text input with Cyrillic support
// - Fuzzy match against variations (Levenshtein distance < 2)
// - Show character-by-character feedback
// - Link to keyboard layouts for Cyrillic input
```

**Files to Create**:
- `src/lib/components/exercises/TypingExercise.svelte` (130 lines)
- `src/lib/services/exercises/typing-validator.ts` (90 lines)
- `src/lib/utils/cyrillic-input.ts` (utility for keyboard setup)

---

### 4. Multiple Choice
**Purpose**: Select correct answer from options  
**Interaction**: Click option → validation → feedback

**Example**:
```
"Which means 'thank you'?"
☐ Здравей
☑ Благодаря
☐ Добър ден
☐ Приказване

→ Feedback: "Correct! Благодаря is the Bulgarian word for 'thank you'."
```

**Technical Implementation**:
```typescript
// src/lib/types/exercises.ts
export interface MultipleChoiceExercise extends BaseExercise {
  type: 'multiple-choice';
  question: string;
  options: {
    text: string;
    correct: boolean;
    explanation: string; // why this is correct/wrong
  }[];
  randomizeOptions?: boolean;
}

// Component: src/lib/components/exercises/MultipleChoice.svelte
// - Render question + options
// - Shuffle options (if enabled)
// - Track selected option
// - Show explanation after selection
// - Prevent changing answer (or allow with penalty)
```

**Files to Create**:
- `src/lib/components/exercises/MultipleChoice.svelte` (110 lines)
- `src/lib/services/exercises/mc-validator.ts` (40 lines)

---

### 5. Matching (Pair Words/Definitions)
**Purpose**: Match German words to Bulgarian translations  
**Interaction**: Drag or click pairs → validation → feedback

**Example**:
```
German                  Bulgarian
Hallo               ←→  Благодаря
Danke               ←→  Здравей
Guten Tag           ←→  Добър ден

[User pairs all correctly]
→ Feedback: "Perfect! All pairs matched."
```

**Technical Implementation**:
```typescript
// src/lib/types/exercises.ts
export interface MatchingExercise extends BaseExercise {
  type: 'matching';
  pairs: {
    left: string;
    right: string;
    id: string;
  }[];
  shuffleRight?: boolean;
}

// Component: src/lib/components/exercises/Matching.svelte
// - Render two columns (left/right)
// - Support drag-drop or click-based pairing
// - Track user's pairings
// - Validate all pairs correct before success
// - Show pairs remaining counter
```

**Files to Create**:
- `src/lib/components/exercises/Matching.svelte` (140 lines)
- `src/lib/services/exercises/matching-validator.ts` (60 lines)

---

## 🏗️ Shared Infrastructure

### Base Exercise Type
```typescript
// src/lib/types/exercises.ts
export interface BaseExercise {
  id: string;
  lessonId: string;
  wordId: string;
  type: 'cloze' | 'sentence-builder' | 'typing' | 'multiple-choice' | 'matching';
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  estimatedTime: number; // minutes
  hints: string[];
  commonMistakes?: {
    mistake: string;
    explanation: string;
  }[];
}

export type Exercise = 
  | ClozeExercise 
  | SentenceBuilderExercise 
  | TypingExercise 
  | MultipleChoiceExercise 
  | MatchingExercise;
```

### Exercise Feedback Component
```svelte
<!-- src/lib/components/exercises/ExerciseFeedback.svelte -->
<script lang="ts">
  export let correct: boolean;
  export let message: string;
  export let explanation: string;
  export let nextButton: boolean = true;
</script>

<!-- Renders success/failure state with explanation -->
<!-- Shared across all exercise types -->
```

### Exercise Validation Service
```typescript
// src/lib/services/exercises/exercise-validator.ts
export async function validateExerciseAnswer(
  exercise: Exercise,
  answer: string | string[] | number | Record<string, string>
): Promise<{
  correct: boolean;
  message: string;
  explanation: string;
  score: number; // 0-100
}> {
  switch (exercise.type) {
    case 'cloze': return validateCloze(exercise as ClozeExercise, answer as string);
    case 'typing': return validateTyping(exercise as TypingExercise, answer as string);
    case 'multiple-choice': return validateMC(exercise as MultipleChoiceExercise, answer as number);
    case 'sentence-builder': return validateSentenceBuilder(exercise as SentenceBuilderExercise, answer as number[]);
    case 'matching': return validateMatching(exercise as MatchingExercise, answer as Record<string, string>);
  }
}
```

### Progress Tracking Service
```typescript
// src/lib/services/exercises/exercise-progress.ts
export interface ExerciseProgress {
  exerciseId: string;
  userId: string;
  attempts: number;
  correct: number;
  lastAttempted: Date;
  masteryScore: number; // 0-100
  hints: string[]; // hints used
  timeSpent: number; // seconds
}

export async function recordExerciseAttempt(
  exerciseId: string,
  correct: boolean,
  timeSpent: number,
  hintsUsed: string[]
): Promise<ExerciseProgress> {
  // Update IndexedDB
  // Calculate masteryScore
  // Trigger notifications if threshold crossed
}
```

---

## 📅 Phase 2 Sprint Plan (2 weeks)

### Week 1: Foundation & Core Types

**Day 1: Planning & Setup (4 hours)**
- [ ] Finalize exercise type specifications
- [ ] Create shared infrastructure (BaseExercise, types)
- [ ] Set up component scaffolding
- [ ] Add `svelte-dnd-action` dependency
- **Deliverable**: All folders & interfaces ready

**Day 2: Cloze Test (6 hours)**
- [ ] Build ClozeTest.svelte component
- [ ] Implement cloze-validator.ts
- [ ] Add fuzzy matching (Levenshtein distance)
- [ ] Create hints system
- [ ] Test with 5+ examples
- **Deliverable**: Cloze tests 100% functional

**Day 3: Sentence Builder (7 hours)**
- [ ] Build SentenceBuilder.svelte component
- [ ] Implement drag-drop with svelte-dnd-action
- [ ] Build sentence-validator.ts
- [ ] Add word order variations logic
- [ ] Test ordering flexibility
- **Deliverable**: Drag-drop fully working

**Day 4: Typing Exercise (6 hours)**
- [ ] Build TypingExercise.svelte component
- [ ] Implement typing-validator.ts
- [ ] Add Cyrillic input helpers
- [ ] Implement typo tolerance
- [ ] Test with keyboard input
- **Deliverable**: Typing validated & scored

**Day 5: Testing & Integration (5 hours)**
- [ ] Unit tests for validators (90%+ coverage)
- [ ] Component integration tests
- [ ] Fix any bugs from Week 1 types
- [ ] Performance optimization
- [ ] Code review & cleanup
- **Deliverable**: Week 1 types fully tested

---

### Week 2: Advanced Types & Polish

**Day 6: Multiple Choice & Matching (8 hours)**
- [ ] Build MultipleChoice.svelte component
- [ ] Build Matching.svelte component
- [ ] Implement both validators
- [ ] Add randomization logic
- [ ] Test both components thoroughly
- **Deliverable**: Both components working

**Day 7: Feedback System & Progress (7 hours)**
- [ ] Build ExerciseFeedback.svelte
- [ ] Implement exercise-progress.ts service
- [ ] Connect to IndexedDB storage
- [ ] Add masteryScore calculation
- [ ] Test progress tracking
- **Deliverable**: Progress persists & updates

**Day 8: Exercise Integration (6 hours)**
- [ ] Create ExercisePractice.svelte wrapper component
- [ ] Integrate all 5 exercise types
- [ ] Add exercise selection logic
- [ ] Implement difficulty-based recommendations
- [ ] Add timing & streak tracking
- **Deliverable**: All exercises accessible from /learn/[word]

**Day 9: Validation & Accessibility (6 hours)**
- [ ] Keyboard navigation for all exercise types
- [ ] WCAG 2.1 AA compliance audit
- [ ] Screen reader testing
- [ ] Mobile responsiveness testing
- [ ] Fix any a11y issues
- **Deliverable**: All components fully accessible

**Day 10: Polish & Documentation (5 hours)**
- [ ] Performance optimization pass
- [ ] Error handling edge cases
- [ ] Create component documentation
- [ ] Update PHASE_2_PROGRESS.md
- [ ] Final code review
- [ ] Prepare for Phase 3
- **Deliverable**: Phase 2 ready for handoff

---

## 📊 Phase 2 Deliverables Checklist

### Components (5 required + 2 supporting = 7 total)

- [ ] `ClozeTest.svelte` - Fill-in-the-blank component
- [ ] `SentenceBuilder.svelte` - Drag-drop word ordering
- [ ] `TypingExercise.svelte` - Write Cyrillic answers
- [ ] `MultipleChoice.svelte` - Multiple choice questions
- [ ] `Matching.svelte` - Pair words/definitions
- [ ] `ExerciseFeedback.svelte` - Shared feedback display
- [ ] `ExercisePractice.svelte` - Exercise launcher/wrapper

### Services (5 validators + 1 progress tracker = 6 total)

- [ ] `cloze-validator.ts` - Validation logic for cloze
- [ ] `typing-validator.ts` - Fuzzy matching for typing
- [ ] `sentence-validator.ts` - Word order validation
- [ ] `mc-validator.ts` - Multiple choice validation
- [ ] `matching-validator.ts` - Pair matching validation
- [ ] `exercise-progress.ts` - Progress tracking & scoring

### Types & Schemas

- [ ] `exercises.ts` - All exercise types defined
- [ ] Database schema update for ExerciseProgress store
- [ ] Exercise data structure in lessons

### Testing

- [ ] Unit tests for all 5 validators (95%+ coverage)
- [ ] Component tests for all 7 components (80%+ coverage)
- [ ] E2E tests for complete exercise flow
- [ ] Accessibility tests (WCAG 2.1 AA)

### Documentation

- [ ] Component API documentation (JSDoc)
- [ ] Exercise type examples (5+ per type)
- [ ] Validator logic explanation
- [ ] Progress tracking algorithm explained
- [ ] Phase 2 completion report

---

## 🚀 Getting Started

### Day 1 Execution Checklist

```bash
# 1. Create folder structure
mkdir -p src/lib/components/exercises
mkdir -p src/lib/services/exercises

# 2. Add dependency
pnpm add svelte-dnd-action

# 3. Create base types file
touch src/lib/types/exercises.ts

# 4. Create component scaffolds
touch src/lib/components/exercises/{ClozeTest,SentenceBuilder,TypingExercise,MultipleChoice,Matching,ExerciseFeedback,ExercisePractice}.svelte

# 5. Create validator scaffolds
touch src/lib/services/exercises/{cloze-validator,typing-validator,sentence-validator,mc-validator,matching-validator,exercise-progress,exercise-validator}.ts

# 6. Run type check
pnpm run check

# 7. Verify no errors
echo "✅ Phase 2 setup complete"
```

---

## 🔗 Dependencies & Prerequisites

**Required From Phase 1**:
- Learning hub dashboard (`/learn/[word]` route)
- Vocabulary data store
- Progress persistence in IndexedDB
- User context provider

**New Dependencies**:
- `svelte-dnd-action` - Drag and drop library
- (No other major dependencies needed - use built-in Svelte 5)

**TypeScript Configurations**:
- Strict mode enabled ✅
- exactOptionalPropertyTypes enabled ✅
- All existing tsconfig settings preserved ✅

---

## 📈 Success Metrics

| Metric | Target | How to Measure |
|--------|--------|-----------------|
| **Code Coverage** | 95% validators, 80% components | `pnpm run test:unit -- --coverage` |
| **Performance** | < 100ms per exercise validation | DevTools Performance tab |
| **Accessibility** | WCAG 2.1 AA | axe DevTools + manual testing |
| **Mobile Responsive** | Works on 320px-2560px | Chrome DevTools responsive mode |
| **Keyboard Nav** | All exercises via Tab/Enter/Space | Manual testing |
| **Error Rate** | < 0.1% in production | Console error monitoring |
| **User Satisfaction** | > 80% find exercises helpful | Future survey |

---

## ⚠️ Known Constraints & Workarounds

| Issue | Impact | Workaround |
|-------|--------|-----------|
| Cyrillic input on non-Cyrillic keyboards | Typing exercises hard on English keyboards | Link to keyboard layout tools + on-screen keyboard option (Phase 3) |
| Drag-drop on touch devices | Sentence builder may feel awkward on mobile | Add alternative click-based pairing UI for mobile |
| Spell-check interference | Browser spell-check may confuse learners | Disable spell-check on Cyrillic input fields |
| Audio pronunciation (future) | Not available in Phase 2 | Use text prompts + links to external audio (future: Phase 4) |

---

## 🎓 Learning Resources

### For Implementing Validators
- Levenshtein distance: https://en.wikipedia.org/wiki/Levenshtein_distance
- Fuzzy string matching: `fastest-levenshtein` package (lightweight)

### For Exercise UX
- Duolingo's design patterns
- Bulgaro.io's exercise implementation
- Khan Academy exercise patterns

### For Accessibility
- WebAIM: https://webaim.org/
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/

---

## 🔄 Phase 2 → Phase 3 Handoff

**What Phase 3 Needs From Phase 2**:
- ✅ 5 functional exercise types
- ✅ Exercise data structure finalized
- ✅ Progress tracking working
- ✅ All validators tested

**What Phase 3 Delivers**:
- Actual lesson content (15-20 lessons)
- 60+ exercise instances (3 per lesson)
- Vocabulary editor for user contributions
- Edit history tracking

---

## 📞 Questions & Support

**During Phase 2 implementation**:
1. Check [PHASE_1_IMPLEMENTATION_SPRINT.md](PHASE_1_IMPLEMENTATION_SPRINT.md) for similar patterns
2. Reference [BULGARO_ANALYSIS_COMPREHENSIVE.md](BULGARO_ANALYSIS_COMPREHENSIVE.md) for UX inspiration
3. Review [ARCHITECTURAL_REDESIGN_VOCABULARY_LEARNING_MERGE.md](ARCHITECTURAL_REDESIGN_VOCABULARY_LEARNING_MERGE.md) for data schemas

---

**Status**: Ready to Execute  
**Last Updated**: December 17, 2025  
**Next Milestone**: Phase 3 (Content & Editing)
