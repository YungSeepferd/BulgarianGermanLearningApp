# Interactive Exercises Implementation Plan

**Goal**: Transform passive learning into active practice with gamified exercises  
**Target**: 6 exercise types across grammar, vocabulary, and comprehension  
**Estimated Time**: 60-80 hours  
**Priority**: High engagement, low cognitive load

---

## 📋 Exercise Types Overview

| Exercise Type | Complexity | Time Estimate | Priority | Status |
|---------------|------------|---------------|----------|--------|
| 1. Fill-in-the-Blank (Grammar) | Low | 12h | 🔴 High | ⏳ Planned |
| 2. Multiple Choice (Vocabulary) | Low | 10h | 🔴 High | ⏳ Planned |
| 3. Matching Pairs (Synonyms/Antonyms) | Medium | 15h | 🟡 Medium | ⏳ Planned |
| 4. Sentence Building (Word Order) | High | 20h | 🟡 Medium | ⏳ Planned |
| 5. Conjugation Practice (Verb Drills) | Medium | 15h | 🔴 High | ⏳ Planned |
| 6. Listening Comprehension (Audio) | High | 25h | 🟢 Low | 🔮 Future |

**Total**: ~97 hours (Phases 1-3: 72h, Phase 4: 25h)

---

## 🎯 Exercise 1: Fill-in-the-Blank (Declension Practice)

### Description

Users practice noun declension by filling in missing case forms in context sentences.

**Example**:
```
Sentence: Ich sehe ____ Mann. (Akkusativ)
Answer: den

Feedback: ✅ Correct! "den Mann" is accusative masculine singular.
```

### Component Structure

```
/src/routes/practice/exercises/
├── fill-in-blank/
│   ├── FillInBlank.svelte           # Main exercise container
│   ├── SentencePrompt.svelte        # Displays sentence with blank
│   ├── AnswerInput.svelte           # Text input for answer
│   └── CaseFeedback.svelte          # Explains correct/incorrect answer
```

### Data Schema

```typescript
interface FillInBlankExercise {
  id: string;
  type: 'fill-in-blank';
  difficulty: 'easy' | 'medium' | 'hard';
  
  // Exercise content
  sentence: string;         // "Ich sehe ____ Mann."
  blankIndex: number;       // Position of blank (word index)
  correctAnswer: string;    // "den"
  acceptableAnswers?: string[]; // ["den"] (alternative spellings)
  
  // Context
  vocabularyId: string;     // Link to noun in database
  case: 'nominative' | 'accusative' | 'dative' | 'genitive';
  number: 'singular' | 'plural';
  
  // Hints
  hint?: string;            // "Accusative case for direct object"
  explanation: string;      // "Mann is masculine, so accusative = den"
  
  // Gamification
  points: number;           // 10 for easy, 20 for medium, 30 for hard
  timeLimit?: number;       // Optional time limit in seconds
}
```

### Implementation (12 hours)

**Phase 1: Component Development (6h)**
```bash
# 1. Create exercise component (2h)
# File: src/routes/practice/exercises/fill-in-blank/FillInBlank.svelte

<script lang="ts">
  import { appState } from '$lib/state/app-state';
  import type { FillInBlankExercise } from '$lib/types/exercises';
  
  let { exercise }: { exercise: FillInBlankExercise } = $props();
  
  let userAnswer = $state('');
  let isCorrect = $state<boolean | null>(null);
  let showFeedback = $state(false);
  let attempts = $state(0);
  
  function checkAnswer() {
    attempts++;
    const normalized = userAnswer.trim().toLowerCase();
    const correct = exercise.correctAnswer.toLowerCase();
    
    isCorrect = normalized === correct || 
                exercise.acceptableAnswers?.some(a => a.toLowerCase() === normalized);
    
    showFeedback = true;
    
    if (isCorrect) {
      // Award points, record progress
      appState.recordPracticeResult(exercise.vocabularyId, true);
    }
  }
</script>

<div class="fill-in-blank-exercise">
  <div class="sentence-prompt">
    {exercise.sentence.replace('____', `<input bind:value={userAnswer} />`)}
  </div>
  
  <button on:click={checkAnswer}>Check Answer</button>
  
  {#if showFeedback}
    <div class="feedback" class:correct={isCorrect} class:incorrect={!isCorrect}>
      {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
      <p>{exercise.explanation}</p>
    </div>
  {/if}
</div>

# 2. Create exercise generator (3h)
# File: src/lib/services/exercise-generator.ts

# 3. Add exercise data (1h)
# File: data/exercises/fill-in-blank.json
```

**Phase 2: Data Generation (4h)**
- Generate 50 exercises from existing nouns with declension tables
- Cover all 4 cases × singular/plural combinations
- Difficulty based on case complexity (Nom < Acc < Dat < Gen)

**Phase 3: Testing (2h)**
- Unit tests for answer validation
- Component tests for UI interactions
- E2E test for complete exercise flow

### Exercise Generation Script

```typescript
// scripts/generate-fill-in-blank-exercises.ts
import { readFileSync, writeFileSync } from 'fs';
import type { VocabularyItem, FillInBlankExercise } from '../src/lib/types';

function generateFillInBlankExercises(): FillInBlankExercise[] {
  const vocab: VocabularyItem[] = JSON.parse(
    readFileSync('./data/unified-vocabulary.json', 'utf-8')
  );
  
  const nounsWithDeclension = vocab.filter(
    item => item.partOfSpeech === 'noun' && item.metadata?.declension
  );
  
  const exercises: FillInBlankExercise[] = [];
  
  nounsWithDeclension.forEach(noun => {
    const declension = noun.metadata!.declension!;
    
    // Generate exercise for each case
    ['nominative', 'accusative', 'dative', 'genitive'].forEach((caseType, idx) => {
      const caseData = declension[caseType as keyof typeof declension];
      
      exercises.push({
        id: `fib-${noun.id}-${caseType}-sg`,
        type: 'fill-in-blank',
        difficulty: idx === 0 ? 'easy' : idx <= 2 ? 'medium' : 'hard',
        sentence: generateSentence(noun.german, caseType, 'singular'),
        blankIndex: 2, // Position depends on sentence structure
        correctAnswer: caseData.singular,
        vocabularyId: noun.id,
        case: caseType as any,
        number: 'singular',
        hint: getCaseHint(caseType),
        explanation: `${noun.german} is ${noun.grammar?.gender}, so ${caseType} singular = ${caseData.singular}`,
        points: idx === 0 ? 10 : idx <= 2 ? 20 : 30
      });
    });
  });
  
  writeFileSync(
    './data/exercises/fill-in-blank.json',
    JSON.stringify(exercises, null, 2)
  );
  
  console.log(`✅ Generated ${exercises.length} fill-in-blank exercises`);
  return exercises;
}

function generateSentence(noun: string, caseType: string, number: string): string {
  const templates = {
    nominative: `____ ist hier.`, // "Der Mann ist hier."
    accusative: `Ich sehe ____.`, // "Ich sehe den Mann."
    dative: `Ich gebe ____ das Buch.`, // "Ich gebe dem Mann das Buch."
    genitive: `Das ist das Haus ____.` // "Das ist das Haus des Mannes."
  };
  
  return templates[caseType as keyof typeof templates] || templates.nominative;
}

function getCaseHint(caseType: string): string {
  const hints = {
    nominative: "Subject of the sentence (Wer/Was?)",
    accusative: "Direct object (Wen/Was?)",
    dative: "Indirect object (Wem?)",
    genitive: "Possession (Wessen?)"
  };
  
  return hints[caseType as keyof typeof hints] || '';
}
```

---

## 🎯 Exercise 2: Multiple Choice (Vocabulary)

### Description

Users select correct translation from 4 options.

**Example**:
```
Question: What is "Hallo" in Bulgarian?
Options:
  A) Довиждане
  B) Здравей ✅
  C) Благодаря
  D) Извинете

Feedback: ✅ Correct! "Здравей" (Zdravey) means "Hello" in Bulgarian.
```

### Component Structure

```
/src/routes/practice/exercises/
├── multiple-choice/
│   ├── MultipleChoice.svelte        # Main exercise container
│   ├── QuestionPrompt.svelte        # Displays question
│   ├── AnswerOptions.svelte         # 4 clickable options
│   └── TranslationFeedback.svelte   # Shows correct answer
```

### Data Schema

```typescript
interface MultipleChoiceExercise {
  id: string;
  type: 'multiple-choice';
  difficulty: 'easy' | 'medium' | 'hard';
  
  // Exercise content
  question: string;           // "What is 'Hallo' in Bulgarian?"
  options: string[];          // ["Довиждане", "Здравей", "Благодаря", "Извинете"]
  correctIndex: number;       // 1 (zero-indexed)
  
  // Context
  vocabularyId: string;
  direction: 'de_to_bg' | 'bg_to_de';
  
  // Feedback
  explanation: string;
  exampleSentence?: string;
  
  // Gamification
  points: number;
  timeLimit?: number;
}
```

### Implementation (10 hours)

**Phase 1: Component (4h)**
**Phase 2: Data Generation (4h)** - Generate 200 exercises from vocabulary
**Phase 3: Testing (2h)**

### Distractors Algorithm

```typescript
// Generate wrong answers that are plausible
function generateDistractors(
  correctAnswer: string,
  allVocab: VocabularyItem[],
  count: number = 3
): string[] {
  // Strategy 1: Same part of speech
  const samePos = allVocab.filter(
    v => v.partOfSpeech === item.partOfSpeech && v.bulgarian !== correctAnswer
  );
  
  // Strategy 2: Similar length
  const similarLength = samePos.filter(
    v => Math.abs(v.bulgarian.length - correctAnswer.length) <= 3
  );
  
  // Strategy 3: Same category
  const sameCategory = samePos.filter(
    v => v.categories?.some(cat => item.categories?.includes(cat))
  );
  
  // Pick 3 distractors (weighted by similarity)
  const distractors = [
    ...shuffle(similarLength).slice(0, 2),
    ...shuffle(sameCategory).slice(0, 1)
  ].slice(0, count);
  
  return distractors.map(v => v.bulgarian);
}
```

---

## 🎯 Exercise 3: Matching Pairs (Synonyms/Antonyms)

### Description

Drag-and-drop or click-to-match synonyms or antonyms.

**Example**:
```
Match the synonyms:

Column A          Column B
--------          --------
gut               schlecht
groß              klein
schön       ↔     hübsch ✅
schnell           langsam
                  toll ✅
```

### Component Structure

```
/src/routes/practice/exercises/
├── matching-pairs/
│   ├── MatchingPairs.svelte         # Main exercise container
│   ├── DraggableWord.svelte         # Draggable word card
│   ├── DropZone.svelte              # Drop target
│   └── MatchFeedback.svelte         # Shows correctness
```

### Data Schema

```typescript
interface MatchingPairsExercise {
  id: string;
  type: 'matching-pairs';
  difficulty: 'easy' | 'medium' | 'hard';
  
  // Exercise content
  pairs: Array<{ left: string; right: string }>;
  // [{ left: "gut", right: "schön" }, ...]
  
  matchType: 'synonyms' | 'antonyms' | 'translations';
  
  // Gamification
  points: number;
  timeLimit?: number;
}
```

### Implementation (15 hours)

**Phase 1: Drag-and-Drop Component (8h)** - Complex interaction
**Phase 2: Data Generation (5h)** - Extract from word family data
**Phase 3: Testing (2h)**

---

## 🎯 Exercise 4: Sentence Building (Word Order)

### Description

Rearrange shuffled words to form correct German sentence.

**Example**:
```
Rearrange: [Mann, sehe, Ich, den]

Your answer: Ich sehe den Mann ✅

Feedback: ✅ Correct word order! Subject → Verb → Object
```

### Data Schema

```typescript
interface SentenceBuildingExercise {
  id: string;
  type: 'sentence-building';
  difficulty: 'easy' | 'medium' | 'hard';
  
  // Exercise content
  words: string[];               // Shuffled words
  correctSentence: string;       // "Ich sehe den Mann"
  correctOrder: number[];        // [0, 1, 2, 3] (indices)
  
  // Context
  grammarRule: string;           // "Subject-Verb-Object order"
  hint?: string;
  
  // Gamification
  points: number;
}
```

### Implementation (20 hours)

**Phase 1: Drag-and-Drop Word Tiles (10h)**
**Phase 2: Grammar Rule Engine (6h)** - Validate word order
**Phase 3: Data Generation (4h)**

---

## 🎯 Exercise 5: Conjugation Practice (Verb Drills)

### Description

Fill in verb conjugation for given pronoun and tense.

**Example**:
```
Conjugate: sein (to be)
Pronoun: ich
Tense: Präsens

Your answer: bin ✅

Feedback: ✅ Correct! "ich bin" (I am)
```

### Data Schema

```typescript
interface ConjugationPracticeExercise {
  id: string;
  type: 'conjugation-practice';
  difficulty: 'easy' | 'medium' | 'hard';
  
  // Exercise content
  verbInfinitive: string;        // "sein"
  pronoun: string;               // "ich"
  tense: 'present' | 'past' | 'perfect' | 'future';
  correctAnswer: string;         // "bin"
  
  // Context
  vocabularyId: string;
  verbType: 'regular' | 'irregular' | 'modal' | 'auxiliary';
  
  // Gamification
  points: number;
}
```

### Implementation (15 hours)

**Phase 1: Component (5h)**
**Phase 2: Data Generation (8h)** - Extract from conjugation tables
**Phase 3: Testing (2h)**

---

## 📅 Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2) - 22 hours

**Week 1: Infrastructure (12h)**
- [ ] Exercise type system (TypeScript interfaces)
- [ ] Exercise router (`/practice/exercises/[type]`)
- [ ] Progress tracking integration
- [ ] Points/scoring system

**Week 2: First Exercise (10h)**
- [ ] Multiple Choice implementation
- [ ] 100 exercises generated
- [ ] Basic testing

### Phase 2: Grammar Exercises (Weeks 3-4) - 27 hours

**Week 3: Fill-in-the-Blank (12h)**
- [ ] Component implementation
- [ ] 50 exercises generated
- [ ] Integration with declension data

**Week 4: Conjugation Practice (15h)**
- [ ] Component implementation
- [ ] 75 exercises generated
- [ ] Integration with conjugation data

### Phase 3: Advanced Exercises (Weeks 5-7) - 35 hours

**Week 5: Matching Pairs (15h)**
- [ ] Drag-and-drop implementation
- [ ] 40 exercises generated

**Week 6-7: Sentence Building (20h)**
- [ ] Word tile system
- [ ] Grammar validation
- [ ] 30 exercises generated

### Phase 4: Polish & Gamification (Week 8) - 10 hours

**Week 8: Final Integration (10h)**
- [ ] Exercise selection algorithm (adaptive difficulty)
- [ ] Leaderboard system
- [ ] Achievement badges
- [ ] Analytics dashboard

**Total**: ~94 hours over 8 weeks (~12 hours/week)

---

## 🎮 Gamification Features

### Points System

```typescript
const POINTS = {
  FILL_IN_BLANK: {
    easy: 10,
    medium: 20,
    hard: 30
  },
  MULTIPLE_CHOICE: {
    easy: 5,
    medium: 10,
    hard: 15
  },
  MATCHING_PAIRS: {
    easy: 15,
    medium: 25,
    hard: 40
  },
  SENTENCE_BUILDING: {
    easy: 20,
    medium: 35,
    hard: 50
  },
  CONJUGATION: {
    easy: 15,
    medium: 25,
    hard: 35
  }
};

// Bonus multipliers
const MULTIPLIERS = {
  FIRST_TRY: 1.5,      // 50% bonus for first attempt
  SPEED_BONUS: 1.25,   // 25% bonus for fast answers (< 5s)
  STREAK: (streak: number) => 1 + (streak * 0.1) // 10% per correct answer in a row
};
```

### Achievement Badges

| Badge | Criteria | Icon |
|-------|----------|------|
| Grammar Guru | 100 fill-in-blank exercises | 🎓 |
| Vocab Wizard | 200 multiple choice | 🧙‍♂️ |
| Conjugation King | 50 conjugation drills | 👑 |
| Speed Demon | 20 exercises < 5 seconds | ⚡ |
| Perfectionist | 10 perfect scores in a row | 💯 |
| Early Bird | Practice before 9 AM | 🌅 |
| Night Owl | Practice after 9 PM | 🦉 |

### Leaderboard

```typescript
interface LeaderboardEntry {
  userId: string;
  username: string;
  totalPoints: number;
  exercisesCompleted: number;
  averageAccuracy: number;
  currentStreak: number;
  rank: number;
}

// Weekly, monthly, all-time leaderboards
// Filter by exercise type, difficulty
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// tests/unit/exercises/fill-in-blank.test.ts
describe('Fill-in-Blank Exercise', () => {
  it('should validate correct answer', () => {
    const exercise: FillInBlankExercise = {
      correctAnswer: 'den',
      acceptableAnswers: ['den']
    };
    
    expect(validateAnswer(exercise, 'den')).toBe(true);
    expect(validateAnswer(exercise, 'der')).toBe(false);
  });
  
  it('should handle case-insensitive answers', () => {
    expect(validateAnswer(exercise, 'Den')).toBe(true);
  });
});
```

### Component Tests

```typescript
// tests/components/FillInBlank.test.ts
import { test, expect } from '@playwright/experimental-ct-svelte';
import FillInBlank from '$lib/components/exercises/FillInBlank.svelte';

test('should show feedback after submit', async ({ mount }) => {
  const component = await mount(FillInBlank, {
    props: { exercise: mockExercise }
  });
  
  await component.locator('input').fill('den');
  await component.locator('button:has-text("Check")').click();
  
  await expect(component.locator('.feedback')).toContainText('✅ Correct!');
});
```

### E2E Tests

```typescript
// tests/e2e/exercises/fill-in-blank.test.ts
test('complete exercise flow', async ({ page }) => {
  await page.goto('/practice/exercises/fill-in-blank');
  
  // Select exercise
  await page.click('.exercise-card:first-child');
  
  // Answer question
  await page.fill('input[type="text"]', 'den');
  await page.click('button:has-text("Check")');
  
  // Verify feedback
  await expect(page.locator('.feedback')).toContainText('✅');
  
  // Verify points awarded
  await expect(page.locator('.points')).toContainText('+20');
});
```

---

## 🚀 Next Steps (Immediate Actions)

1. **This Week** (12h):
   - [ ] Create exercise type system
   - [ ] Set up exercise router
   - [ ] Implement Multiple Choice component
   - [ ] Generate 20 test exercises

2. **Next Week** (12h):
   - [ ] Implement Fill-in-the-Blank
   - [ ] Generate 50 exercises
   - [ ] Add progress tracking

3. **Week 3** (15h):
   - [ ] Implement Conjugation Practice
   - [ ] Integrate with verb conjugation data
   - [ ] Test with 10 users

---

## 📊 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Exercise Completion Rate | > 70% | % of started exercises finished |
| Average Accuracy | > 60% | Correct answers / Total answers |
| User Engagement | > 3 sessions/week | Sessions per active user |
| Time Spent | > 15 min/session | Average session duration |
| Retention | > 40% (Week 2) | Users returning after 1 week |

---

**Status**: 📋 Planning Phase  
**Next Action**: Create exercise type system  
**Owner**: YungSeepferd  
**Estimated Completion**: April 2026 (8 weeks)
