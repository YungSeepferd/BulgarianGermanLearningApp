# Phase 3: Content & Enrichment - Implementation Guide

**Project**: Bulgarian-German Learning App  
**Phase**: 3 of 5 (Content & Enrichment)  
**Status**: 🚀 IN PROGRESS  
**Started**: December 17, 2025  
**Target**: January 14, 2026 (1 week, 30 hours)

---

## 📊 Phase 3 Overview

### Primary Objectives
1. **Create 15-20 Structured Lessons** - Cover A1-C2 CEFR levels with grammar + vocabulary
2. **Generate 60+ Exercise Instances** - 3-4 exercises per lesson using Phase 2 infrastructure
3. **Build VocabularyEditor Component** - User contribution system for enriching vocabulary
4. **Implement Edit History Tracking** - Track changes to vocabulary items
5. **Establish User Contribution Workflow** - Enable community contributions

### Success Criteria
- ✅ 15-20 lesson JSON files created with complete metadata
- ✅ 60+ exercise instances linked to lessons and vocabulary
- ✅ VocabularyEditor.svelte component fully functional
- ✅ Edit history persisted in localStorage with full audit trail
- ✅ User contribution workflow documented and tested
- ✅ All components validated with Svelte MCP server
- ✅ Build successful with zero TypeScript errors
- ✅ Documentation complete (PHASE_3_COMPLETION_SUMMARY.md)

### Phase 2 Foundation (Complete ✅)
- ✅ 5 exercise types implemented and validated
- ✅ Exercise service layer with validation
- ✅ Exercise schemas with Zod validation
- ✅ Unit tests (95%+ coverage)
- ✅ Component tests (80%+ coverage)
- ✅ E2E tests for exercise flows
- ✅ Svelte MCP validation (0 critical issues)

---

## 🗓️ Week Breakdown (30 hours)

### Days 1-4: Lesson Content Creation (12 hours)
**Goal**: Write 15-20 structured lesson notes with grammar explanations

**Tasks**:
- [ ] Define lesson schema (Zod validation)
- [ ] Create lesson template structure
- [ ] Write 15-20 lesson markdown/JSON files
- [ ] Cover CEFR levels: A1 (5 lessons), A2 (4), B1 (3), B2 (3), C1 (2), C2 (1)
- [ ] Include grammar explanations per lesson
- [ ] Link vocabulary items to lessons
- [ ] Validate all lessons against schema

**Lesson Distribution by CEFR Level**:
- **A1 (Beginner)**: 5 lessons - Greetings, Numbers, Family, Daily Routines, Basic Questions
- **A2 (Elementary)**: 4 lessons - Shopping, Travel, Weather, Hobbies
- **B1 (Intermediate)**: 3 lessons - Work, Health, Technology
- **B2 (Upper Intermediate)**: 3 lessons - Politics, Culture, Environment
- **C1 (Advanced)**: 2 lessons - Literature, Philosophy
- **C2 (Mastery)**: 1 lesson - Advanced Idioms & Nuances

**Deliverable**: 15-20 validated lesson JSON files in `data/lessons/`

---

### Days 5-7: Exercise Instance Generation (10 hours)
**Goal**: Create 60+ exercise instances (3-4 per lesson)

**Tasks**:
- [ ] Define exercise instance schema
- [ ] Create exercise template per type
- [ ] Generate 60+ exercise JSON instances
- [ ] Link exercises to lessons and vocabulary
- [ ] Distribute exercises: 20 cloze, 15 multiple choice, 10 typing, 10 sentence builder, 5 matching
- [ ] Validate all exercises against schema
- [ ] Test exercise loading and rendering

**Exercise Distribution**:
- **Cloze Tests**: 20 instances (fill-in-the-blank)
- **Multiple Choice**: 15 instances (select correct answer)
- **Typing Exercises**: 10 instances (write in Cyrillic)
- **Sentence Builder**: 10 instances (word ordering)
- **Matching Exercises**: 5 instances (pair words/definitions)

**Deliverable**: 60+ validated exercise JSON files in `data/exercises/`

---

### Day 8: VocabularyEditor Component (5 hours)
**Goal**: Build user contribution component for vocabulary enrichment

**Tasks**:
- [ ] Design VocabularyEditor.svelte component
- [ ] Implement edit form for vocabulary metadata
- [ ] Add fields: mnemonics, cultural notes, examples, tags
- [ ] Implement German grammar validation
- [ ] Add Bulgarian grammar validation
- [ ] Implement save/cancel functionality
- [ ] Add edit preview mode
- [ ] Validate with Svelte MCP server

**Component Structure**:
```svelte
<script lang="ts">
  import { type VocabularyItem } from '$lib/types/vocabulary';
  
  let { item = $bindable() } = $props<{ item: VocabularyItem }>();
  let editMode = $state(false);
  let editedItem = $state<VocabularyItem | null>(null);
  
  function startEdit() {
    editedItem = structuredClone(item);
    editMode = true;
  }
  
  function saveChanges() {
    if (editedItem) {
      item = editedItem;
      // Record edit history
      // Validate changes
      editMode = false;
    }
  }
</script>
```

**Deliverable**: VocabularyEditor.svelte component (150 lines)

---

### Day 9: Edit History Tracking (2 hours)
**Goal**: Track edit history per vocabulary item with audit trail

**Tasks**:
- [ ] Define EditHistory schema
- [ ] Implement edit history service
- [ ] Store edit history in localStorage
- [ ] Display edit history in UI
- [ ] Add timestamp and user tracking
- [ ] Implement undo/redo functionality (optional)
- [ ] Add edit diff visualization

**Edit History Schema**:
```typescript
interface EditHistoryEntry {
  id: string;
  itemId: string;
  userId: string;
  timestamp: Date;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  comment?: string;
}
```

**Deliverable**: Edit history service + UI component (80 lines)

---

### Day 10: Polish & Documentation (1 hour)
**Goal**: Review all Phase 3 deliverables and finalize documentation

**Tasks**:
- [ ] Review all 15-20 lessons for quality
- [ ] Review all 60+ exercises for correctness
- [ ] Test VocabularyEditor component thoroughly
- [ ] Validate edit history functionality
- [ ] Run all tests (unit, component, E2E)
- [ ] Validate with Svelte MCP server
- [ ] Create PHASE_3_COMPLETION_SUMMARY.md
- [ ] Update PROJECT_STATUS.md

**Deliverable**: PHASE_3_COMPLETION_SUMMARY.md + updated docs

---

## 📝 Lesson Schema Definition

### Lesson Structure
```typescript
// src/lib/schemas/lesson.ts
import { z } from 'zod';

export const LessonSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  category: z.enum(['grammar', 'vocabulary', 'culture', 'mixed']),
  estimatedTime: z.number().min(5).max(120), // minutes
  
  // Content
  description: z.string().min(10).max(500),
  grammarExplanation: z.string().min(20),
  culturalNotes: z.array(z.string()).optional(),
  
  // Linked data
  vocabularyIds: z.array(z.string().uuid()).min(5).max(20),
  exerciseIds: z.array(z.string().uuid()).min(3).max(10),
  
  // Prerequisites
  prerequisites: z.array(z.string().uuid()).optional(),
  
  // Metadata
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type Lesson = z.infer<typeof LessonSchema>;
```

### Example Lesson: "Greetings & Politeness" (A1)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Greetings & Politeness",
  "slug": "greetings-politeness",
  "level": "A1",
  "category": "vocabulary",
  "estimatedTime": 15,
  "description": "Learn essential greetings and polite expressions in Bulgarian",
  "grammarExplanation": "Bulgarian greetings vary by time of day. 'Здравей' (zdravey) is informal 'hello', while 'Здравейте' (zdraveyte) is formal or plural. The verb 'to be' (съм) is often omitted in present tense greetings.",
  "culturalNotes": [
    "Bulgarians shake hands firmly when meeting for the first time",
    "Close friends and family kiss on both cheeks",
    "Using formal 'Вие' (Vie) shows respect to elders and strangers"
  ],
  "vocabularyIds": [
    "vocab-id-1", // Hallo → Здравей
    "vocab-id-2", // Danke → Благодаря
    "vocab-id-3", // Bitte → Моля
    "vocab-id-4", // Guten Morgen → Добро утро
    "vocab-id-5", // Guten Tag → Добър ден
    "vocab-id-6", // Gute Nacht → Лека нощ
    "vocab-id-7", // Auf Wiedersehen → Довиждане
    "vocab-id-8", // Entschuldigung → Извинете
    "vocab-id-9", // Ja → Да
    "vocab-id-10" // Nein → Не
  ],
  "exerciseIds": [
    "exercise-1-cloze",
    "exercise-2-mc",
    "exercise-3-typing",
    "exercise-4-sentence"
  ],
  "prerequisites": [],
  "createdAt": "2025-12-17T00:00:00.000Z",
  "updatedAt": "2025-12-17T00:00:00.000Z",
  "author": "BulgarianApp Team",
  "tags": ["beginner", "greetings", "essential", "A1"]
}
```

---

## 🧪 Exercise Instance Schema

### Exercise Instance Structure
```typescript
// src/lib/schemas/exercise-instance.ts
import { z } from 'zod';
import { 
  ClozeExerciseSchema, 
  MultipleChoiceExerciseSchema,
  TypingExerciseSchema,
  SentenceBuilderExerciseSchema,
  MatchingExerciseSchema
} from './exercises';

export const ExerciseInstanceSchema = z.discriminatedUnion('type', [
  ClozeExerciseSchema,
  MultipleChoiceExerciseSchema,
  TypingExerciseSchema,
  SentenceBuilderExerciseSchema,
  MatchingExerciseSchema
]);

export type ExerciseInstance = z.infer<typeof ExerciseInstanceSchema>;
```

### Example Exercise: Cloze Test for "Greetings"
```json
{
  "id": "exercise-1-cloze",
  "type": "cloze",
  "lessonId": "550e8400-e29b-41d4-a716-446655440001",
  "wordId": "vocab-id-1",
  "difficulty": "A1",
  "estimatedTime": 3,
  "sentence": "Hallo! Wie ____ Sie?",
  "correctAnswer": "heißen",
  "variations": ["heissen", "Heißen"],
  "hints": [
    "This is the verb 'to be called'",
    "It starts with 'h'",
    "Answer: heißen"
  ],
  "context": "Formal greeting asking for someone's name",
  "translationBulgarian": "Здравей! Как се казвате?",
  "commonMistakes": [
    {
      "mistake": "sind",
      "explanation": "'Sind' means 'are', but we need 'to be called' here"
    }
  ]
}
```

---

## 🛠️ VocabularyEditor Component Specification

### Component Requirements

**Functionality**:
1. Edit vocabulary metadata (mnemonics, cultural notes, examples)
2. Validate German grammar (articles, gender, cases)
3. Validate Bulgarian grammar (definite articles, gender)
4. Preview changes before saving
5. Record edit history with timestamp
6. Support undo/redo operations
7. Show edit diff visualization

**Validation Rules**:
- **German Nouns**: Must have correct article (der/die/das)
- **German Examples**: Must use correct case (Nominative/Accusative/Dative)
- **Bulgarian Nouns**: Must have correct definite article (-ът/-та/-то/-те)
- **Bulgarian Examples**: Must have correct gender agreement
- **Mnemonics**: 10-200 characters
- **Cultural Notes**: 20-500 characters
- **Examples**: Must include both German and Bulgarian

**Component API**:
```svelte
<script lang="ts">
  import { type VocabularyItem } from '$lib/types/vocabulary';
  
  interface Props {
    item: VocabularyItem;
    onSave?: (updatedItem: VocabularyItem) => void;
    onCancel?: () => void;
    readonly?: boolean;
  }
  
  let { item, onSave, onCancel, readonly = false } = $props<Props>();
</script>
```

**UI Structure**:
```
┌─────────────────────────────────────┐
│ VocabularyEditor                    │
├─────────────────────────────────────┤
│ Word: Hallo → Здравей               │
│                                     │
│ [Edit] [Preview] [History]          │
│                                     │
│ Mnemonics:                          │
│ ┌─────────────────────────────────┐ │
│ │ [Editable text area]            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Cultural Notes:                     │
│ ┌─────────────────────────────────┐ │
│ │ [Editable text area]            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Examples:                           │
│ + Add Example                       │
│ 1. DE: [German text]                │
│    BG: [Bulgarian text]             │
│    [Remove]                         │
│                                     │
│ Tags: [beginner] [greeting] [+]     │
│                                     │
│ [Save Changes] [Cancel]             │
└─────────────────────────────────────┘
```

---

## 📚 Full Lesson List (15-20 Lessons)

### A1 (Beginner) - 5 Lessons
1. **Greetings & Politeness** - Basic greetings, thank you, please
2. **Numbers & Counting** - 1-100, ordinal numbers, dates
3. **Family & Relationships** - Family members, relationships
4. **Daily Routines** - Time, daily activities, verbs
5. **Basic Questions** - Who, what, when, where, why, how

### A2 (Elementary) - 4 Lessons
6. **Shopping & Food** - Grocery shopping, restaurant, food items
7. **Travel & Directions** - Asking for directions, transportation
8. **Weather & Seasons** - Weather conditions, months, seasons
9. **Hobbies & Free Time** - Sports, music, hobbies

### B1 (Intermediate) - 3 Lessons
10. **Work & Professions** - Jobs, workplace, business vocabulary
11. **Health & Body** - Body parts, illnesses, doctor visits
12. **Technology & Media** - Computers, internet, social media

### B2 (Upper Intermediate) - 3 Lessons
13. **Politics & Society** - Government, laws, current events
14. **Culture & Arts** - Music, theater, literature, museums
15. **Environment & Nature** - Climate, ecology, conservation

### C1 (Advanced) - 2 Lessons
16. **Literature & Philosophy** - Literary terms, philosophical concepts
17. **Advanced Business** - Negotiations, contracts, presentations

### C2 (Mastery) - 1 Lesson
18. **Idioms & Nuances** - Advanced idioms, subtle distinctions, cultural references

---

## 🔄 User Contribution Workflow

### Workflow Steps
1. **User selects a vocabulary word** → Opens VocabularyEditor
2. **User clicks "Edit"** → Edit mode enabled
3. **User modifies fields** → Real-time validation
4. **User previews changes** → Diff visualization shown
5. **User saves changes** → Edit history recorded
6. **System validates grammar** → Show errors if any
7. **Changes persisted to localStorage** → Sync across sessions

### Edit History Data Model
```typescript
interface EditHistoryService {
  recordEdit(entry: EditHistoryEntry): void;
  getHistory(itemId: string): EditHistoryEntry[];
  revertToVersion(itemId: string, timestamp: Date): void;
  exportHistory(itemId: string): string; // JSON export
}
```

---

## ✅ Phase 3 Completion Checklist

### Content Creation
- [ ] Define Lesson schema (Zod)
- [ ] Define ExerciseInstance schema (Zod)
- [ ] Create lesson template
- [ ] Write 18 lesson JSON files (A1-C2)
- [ ] Generate 60+ exercise instances
- [ ] Validate all lessons
- [ ] Validate all exercises
- [ ] Link lessons to vocabulary
- [ ] Link exercises to lessons

### VocabularyEditor Component
- [ ] Design component structure
- [ ] Implement edit form
- [ ] Add German grammar validation
- [ ] Add Bulgarian grammar validation
- [ ] Implement save/cancel functionality
- [ ] Add preview mode
- [ ] Add edit diff visualization
- [ ] Validate with Svelte MCP server
- [ ] Add keyboard shortcuts
- [ ] Add accessibility (WCAG 2.1 AA)

### Edit History Tracking
- [ ] Define EditHistory schema
- [ ] Implement EditHistoryService
- [ ] Store history in localStorage
- [ ] Display history in UI
- [ ] Add timestamp tracking
- [ ] Add user tracking
- [ ] Implement undo/redo
- [ ] Add export functionality

### Testing & Validation
- [ ] Unit tests for lesson service (95%+ coverage)
- [ ] Unit tests for exercise service (95%+ coverage)
- [ ] Unit tests for edit history service (95%+ coverage)
- [ ] Component tests for VocabularyEditor (80%+ coverage)
- [ ] E2E tests for user contribution workflow
- [ ] Accessibility tests (WCAG 2.1 AA)
- [ ] Svelte MCP validation (all components)
- [ ] Build verification (pnpm run build)

### Documentation
- [ ] Component API documentation
- [ ] Lesson creation guide
- [ ] Exercise creation guide
- [ ] User contribution workflow guide
- [ ] Edit history usage guide
- [ ] Update AGENTS.md
- [ ] Create PHASE_3_COMPLETION_SUMMARY.md
- [ ] Update PROJECT_STATUS.md

---

## 🚀 Getting Started - Day 1 Execution

### Step 1: Create Folder Structure
```bash
# Create lesson and exercise folders
mkdir -p data/lessons
mkdir -p data/exercises

# Create schema files
touch src/lib/schemas/lesson.ts
touch src/lib/schemas/exercise-instance.ts
touch src/lib/schemas/edit-history.ts

# Create service files
touch src/lib/services/lesson.ts
touch src/lib/services/exercise-instance.ts
touch src/lib/services/edit-history.ts

# Create component files
touch src/lib/components/vocabulary/VocabularyEditor.svelte
touch src/lib/components/vocabulary/EditHistory.svelte
touch src/lib/components/vocabulary/EditDiff.svelte
```

### Step 2: Define Schemas
- Create `src/lib/schemas/lesson.ts` with LessonSchema
- Create `src/lib/schemas/exercise-instance.ts` with ExerciseInstanceSchema
- Create `src/lib/schemas/edit-history.ts` with EditHistorySchema

### Step 3: Run Type Check
```bash
pnpm run check
# Should show 0 errors
```

### Step 4: Begin Lesson Creation
Start writing the first 5 lessons (A1 level):
1. Greetings & Politeness
2. Numbers & Counting
3. Family & Relationships
4. Daily Routines
5. Basic Questions

---

## 📈 Success Metrics

| Metric | Target | How to Measure |
|--------|--------|-----------------|
| **Lessons Created** | 15-20 | Count JSON files in data/lessons/ |
| **Exercises Created** | 60+ | Count JSON files in data/exercises/ |
| **Code Coverage** | 95% services, 80% components | `pnpm run test:unit -- --coverage` |
| **Svelte MCP Validation** | 0 critical issues | Run svelte-autofixer on all components |
| **Build Success** | Zero TypeScript errors | `pnpm run build` |
| **Accessibility** | WCAG 2.1 AA compliant | axe DevTools + manual testing |
| **Performance** | < 200ms lesson load time | DevTools Performance tab |

---

## 📝 Notes & Considerations

### Grammar Validation Considerations
- Use GERMAN_BULGARIAN_GRAMMAR_GUIDE.md as reference
- Validate German articles (der/die/das) for all nouns
- Validate German case usage (Nominative/Accusative/Dative/Genitive)
- Validate Bulgarian definite articles (-ът/-та/-то/-те)
- Validate Bulgarian gender agreement in examples

### Content Quality Standards
- All lessons must have clear grammar explanations
- All exercises must have correct answers validated
- All cultural notes must be accurate and relevant
- All examples must use correct grammar in both languages
- All lessons must be age-appropriate and inclusive

### Performance Considerations
- Lazy load lessons (don't load all 18 at once)
- Cache lesson data in memory after first load
- Debounce edit history recording (avoid too many writes)
- Use virtual scrolling for edit history list (if >100 entries)

---

## 🔗 Dependencies & Prerequisites

**Required From Phase 2**:
- ✅ 5 exercise types (cloze, multiple choice, typing, sentence builder, matching)
- ✅ Exercise validation service
- ✅ Exercise schemas (Zod)
- ✅ Exercise components validated

**New Dependencies**:
- None required for Phase 3 (use existing tech stack)

**TypeScript Configurations**:
- ✅ Strict mode enabled
- ✅ exactOptionalPropertyTypes enabled
- ✅ All existing tsconfig settings preserved

---

## 🎯 Phase 3 → Phase 4 Handoff

**What Phase 4 Will Need**:
- ✅ All 15-20 lessons with exercise links
- ✅ All 60+ exercises validated and working
- ✅ VocabularyEditor functional and tested
- ✅ Edit history tracking operational
- ✅ User contribution workflow documented

**Phase 4 Features to Build Next**:
1. **Spaced Repetition Scheduler (SRS)** - SM-2 algorithm for review intervals
2. **Adaptive Learning Paths** - Personalized progression
3. **Progress Analytics** - Mastery tracking and visualization
4. **Native Audio Support** - Pronunciation guides (optional)

---

**Status**: 🚀 Ready to Execute Phase 3  
**Next Action**: Create lesson schemas and begin content creation  
**Target Completion**: January 14, 2026
