# Implementation Roadmap: Phase 1 - Foundation Sprint

**Start Date**: December 17, 2025  
**Duration**: 2 weeks (Weeks 1-2)  
**Goal**: Build foundational architecture for learning hub dashboard and lesson structure  
**Success Criteria**: Users can navigate from vocabulary to learning hub, view word context, see progress

---

## Phase 1 Overview

### What We're Building
A foundation for the learning hub where:
- Clicking a vocabulary word navigates to `/learn/[word]`
- Dashboard displays word + translations + context
- Lesson structure is visible
- Progress can be tracked locally
- All data persists in IndexedDB

### What We're NOT Building Yet
- Exercises (Phase 2)
- Vocabulary editing (Phase 3)
- Spaced repetition (Phase 4)
- Community features (Phase 5)

---

## Week 1 Sprint

### Day 1: Design & Setup

#### Task 1.1: Finalize Data Schemas
**Owner**: Architect  
**Time**: 4 hours

**Deliverables**:
- [ ] Validate Lesson schema (JSON example)
- [ ] Validate Learning Path schema
- [ ] Validate Progress schema
- [ ] Validate Exercise schema (future-proof)
- [ ] Create TypeScript types for all schemas

**Files to Create**:
```
src/lib/types/
├── lesson.ts
├── vocabulary.ts
├── progress.ts
├── learning-path.ts
└── exercise.ts
```

**Example Lesson Type**:
```typescript
// src/lib/types/lesson.ts
export interface Lesson {
  id: string;
  title: string;
  subtitle?: string;
  order: number;
  path: string; // which learning path
  contentUrl: string; // /lessons/basics/numbers-0-10.md
  duration: number; // minutes
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  vocabularyIds: string[]; // [eins, zwei, drei, ...]
  exerciseIds?: string[];
  grammarTopics: string[];
  prerequisites?: string[]; // lessonIds
  objectives: string[];
}
```

---

#### Task 1.2: Create Database Schema (IndexedDB)

**Owner**: Backend Engineer  
**Time**: 3 hours

**Deliverables**:
- [ ] IndexedDB initialization code
- [ ] Database migrations
- [ ] Query helpers
- [ ] Type definitions

**Files to Create**:
```
src/lib/db/
├── idb.ts (initialization)
├── stores.ts (store definitions)
├── queries.ts (read operations)
├── mutations.ts (write operations)
└── types.ts (TypeScript types)
```

**Code Structure** (src/lib/db/idb.ts):
```typescript
export async function initializeDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BulgarianGermanApp', 1);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      
      // Vocabulary store
      const vocabStore = db.createObjectStore('vocabulary', { keyPath: 'id' });
      vocabStore.createIndex('partOfSpeech', 'partOfSpeech');
      vocabStore.createIndex('difficulty', 'difficulty');
      
      // Progress store
      const progressStore = db.createObjectStore('progress', { keyPath: 'userId' });
      
      // Lessons store
      const lessonStore = db.createObjectStore('lessons', { keyPath: 'id' });
      lessonStore.createIndex('path', 'path');
      lessonStore.createIndex('order', 'order');
      
      // Learning paths store
      db.createObjectStore('learningPaths', { keyPath: 'id' });
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
```

---

#### Task 1.3: Create Learning Path Data

**Owner**: Content Manager  
**Time**: 3 hours

**Deliverables**:
- [ ] Create 3 learning paths (Basics, Intermediate, Advanced)
- [ ] Define 15 lessons total
- [ ] Map vocabulary to lessons
- [ ] Define prerequisites

**Files to Create**:
```
src/lib/data/
├── learning-paths.json (main structure)
├── lessons.json (lesson details)
└── course-metadata.json (course info)
```

**Example Structure** (src/lib/data/learning-paths.json):
```json
{
  "paths": [
    {
      "id": "basics",
      "title": "German Basics",
      "description": "Learn fundamental German vocabulary and grammar",
      "lessons": [
        {
          "id": "les-001",
          "title": "Numbers 0-20",
          "order": 1,
          "difficulty": "A1",
          "duration": 15,
          "vocabularyIds": ["null", "eins", "zwei", ..., "zwanzig"],
          "grammarTopics": ["numbers", "counting"]
        },
        {
          "id": "les-002",
          "title": "Greetings & Politeness",
          "order": 2,
          "difficulty": "A1",
          "duration": 20,
          "vocabularyIds": ["hallo", "guten-tag", ...],
          "prerequisites": ["les-001"]
        }
      ]
    }
  ]
}
```

---

### Day 2: Create Core Components

#### Task 2.1: Build LearningDashboard Component

**Owner**: Frontend Engineer  
**Time**: 6 hours

**Deliverables**:
- [ ] Component displays word prominently
- [ ] Shows German ↔ Bulgarian
- [ ] Displays metadata (part of speech, difficulty)
- [ ] Shows progress stats
- [ ] Links to related words

**File**: src/routes/learn/[word]/components/LearningDashboard.svelte

**Key Features**:
- Word card with visual styling
- Statistics grid (attempts, correct %, mastery)
- Example sentences
- Related words section
- Next/Previous word navigation

---

#### Task 2.2: Create LearningPathNav Component

**Owner**: Frontend Engineer  
**Time**: 4 hours

**Deliverables**:
- [ ] Show current lesson context
- [ ] Highlight current word in lesson
- [ ] Link to other words in lesson
- [ ] Show progress through lesson

**File**: src/routes/learn/[word]/components/LearningPathNav.svelte

---

#### Task 2.3: Build LessonPage Component

**Owner**: Frontend Engineer  
**Time**: 5 hours

**Deliverables**:
- [ ] Display lesson content
- [ ] Show all vocabulary in lesson
- [ ] Link to individual word learning
- [ ] Track lesson completion

**File**: src/routes/learn/paths/[path]/[lesson]/+page.svelte

---

### Day 3: Routing & Navigation

#### Task 3.1: Create Route Structure

**Owner**: Frontend Engineer  
**Time**: 3 hours

**Deliverables**:
- [ ] `/learn` landing page
- [ ] `/learn/[word]` learning hub
- [ ] `/learn/paths` learning paths index
- [ ] `/learn/paths/[path]` path detail
- [ ] Update vocabulary page to link to learning

**Files to Create**:
```
src/routes/learn/
├── +page.svelte (landing)
├── [word]/
│   ├── +page.svelte (hub)
│   └── +layout.svelte (word context)
├── paths/
│   ├── +page.svelte (index)
│   └── [path]/
│       └── +page.svelte (path detail)
```

---

#### Task 3.2: Add Navigation Links

**Owner**: Frontend Engineer  
**Time**: 2 hours

**Deliverables**:
- [ ] Vocabulary card links to `/learn/[word]`
- [ ] Learning hub links back to vocabulary
- [ ] Path navigation works
- [ ] Breadcrumbs show current location

---

### Day 4: Data Loading & State Management

#### Task 4.1: Create Svelte Stores

**Owner**: Frontend Engineer  
**Time**: 4 hours

**Deliverables**:
- [ ] Create currentWord store
- [ ] Create currentLesson store
- [ ] Create currentPath store
- [ ] Create progress store
- [ ] Implement state synchronization

**Files to Create**:
```
src/lib/stores/
├── learning.ts (currentWord, currentLesson)
├── progress.ts (user progress)
├── paths.ts (learning paths)
└── vocabulary.ts (word data)
```

**Example Store** (src/lib/stores/learning.ts):
```typescript
import { writable } from 'svelte/store';

export const currentWord = writable(null);
export const currentLesson = writable(null);
export const currentPath = writable(null);

export async function loadWord(wordId: string) {
  const db = await getDB();
  const word = await db.get('vocabulary', wordId);
  currentWord.set(word);
  
  // Also load lesson context
  const lesson = await findLessonForWord(wordId);
  currentLesson.set(lesson);
}
```

---

#### Task 4.2: Implement Progress Tracking

**Owner**: Backend Engineer  
**Time**: 5 hours

**Deliverables**:
- [ ] Load progress on app init
- [ ] Save progress locally
- [ ] Sync with word store
- [ ] Update on user actions

**Key Functions**:
```typescript
export async function loadProgress(userId: string) {
  // Load user's progress from IndexedDB
}

export async function updateProgress(
  userId: string,
  wordId: string,
  data: Partial<WordProgress>
) {
  // Update word-specific progress
}

export async function trackLessonCompletion(userId: string, lessonId: string) {
  // Mark lesson as complete
}
```

---

### Day 5: Testing & Refinement

#### Task 5.1: Manual Testing

**Owner**: QA Engineer  
**Time**: 4 hours

**Test Cases**:
- [ ] App loads without errors
- [ ] Click vocabulary → navigate to learning
- [ ] Learning page displays word correctly
- [ ] Progress saves when refresh
- [ ] Navigation between words works
- [ ] Learning paths visible and navigable

---

#### Task 5.2: Accessibility Check

**Owner**: Accessibility Engineer  
**Time**: 2 hours

**Checks**:
- [ ] Keyboard navigation works
- [ ] Screen reader announces content
- [ ] Color contrast sufficient
- [ ] Focus visible on all interactive elements

---

#### Task 5.3: Performance Optimization

**Owner**: Frontend Engineer  
**Time**: 3 hours

**Optimizations**:
- [ ] Lazy load word data
- [ ] Cache lesson content
- [ ] Optimize bundle size
- [ ] Minimize re-renders

---

## Week 2 Sprint

### Day 6: Load Lesson Content

#### Task 6.1: Render Markdown Lessons

**Owner**: Frontend Engineer  
**Time**: 5 hours

**Deliverables**:
- [ ] Setup mdsvex for Markdown rendering
- [ ] Create lesson template
- [ ] Render in SvelteKit
- [ ] Style lesson content

**Files to Create**:
```
src/lib/components/
└── LessonContent.svelte

src/routes/learn/paths/[path]/
└── [lesson]/+page.svelte
```

**Lesson Markdown Structure** (src/lib/lessons/basics/lesson-001.md):
```markdown
# Numbers 0-20

## Learning Objectives
- Learn German numbers 0-20
- Understand pronunciation
- Practice counting

## Grammar Rules

### Cardinal Numbers
| Number | German | Pronunciation |
|--------|--------|---------------|
| 0 | null | null |
| 1 | eins | ayns |
| 2 | zwei | tsvay |

## Examples

### In Context
- "Ich bin 8 Jahre alt" = I am 8 years old
- "Ich habe 3 Katzen" = I have 3 cats

## Vocabulary
- null (zero)
- eins (one)
- zwei (two)
...

## Practice
Click the practice button to answer exercises about these numbers.
```

---

#### Task 6.2: Create GrammarReference Component

**Owner**: Frontend Engineer  
**Time**: 4 hours

**Deliverables**:
- [ ] Component displays grammar rules
- [ ] Searchable grammar reference
- [ ] Links to related vocabulary

---

### Day 7: Add Learning Context

#### Task 7.1: Word Context Provider

**Owner**: Frontend Engineer  
**Time**: 3 hours

**Deliverables**:
- [ ] Create context for word data
- [ ] Provide to all child components
- [ ] Make accessible from anywhere

**File**: src/routes/learn/[word]/+layout.svelte

```typescript
import { setContext } from 'svelte';
import { currentWord } from '$lib/stores/learning';

export let data;

setContext('word', {
  word: data.word,
  lesson: data.lesson,
  path: data.path
});
```

---

#### Task 7.2: Related Words Display

**Owner**: Frontend Engineer  
**Time**: 3 hours

**Deliverables**:
- [ ] Show words from same lesson
- [ ] Show words from same topic
- [ ] Link to those words

---

### Day 8: Complete Integration

#### Task 8.1: End-to-End Flow

**Owner**: Full-Stack  
**Time**: 4 hours

**Test Flow**:
1. User opens app
2. Navigate to Vocabulary
3. Click word "acht"
4. Land on `/learn/acht`
5. See word, progress, context
6. See current lesson "Numbers 0-20"
7. See related words (eins, zwei, drei, ...)
8. Click related word → navigate to its hub
9. Progress persists on refresh

---

#### Task 8.2: Error Handling

**Owner**: Backend Engineer  
**Time**: 2 hours

**Deliverables**:
- [ ] Handle missing words gracefully
- [ ] Handle missing lessons
- [ ] Provide helpful error messages
- [ ] Fallback to sensible defaults

---

### Day 9: Documentation & Handoff

#### Task 9.1: Code Documentation

**Owner**: Tech Lead  
**Time**: 3 hours

**Deliverables**:
- [ ] Document all schemas
- [ ] Document component props
- [ ] Document store API
- [ ] Create README for Phase 1

---

#### Task 9.2: Prepare for Phase 2

**Owner**: Tech Lead  
**Time**: 2 hours

**Deliverables**:
- [ ] Identify extension points for exercises
- [ ] Document exercise architecture
- [ ] Create exercise templates

---

### Day 10: User Testing & Feedback

#### Task 10.1: Internal Testing

**Owner**: Team  
**Time**: 3 hours

**Feedback Areas**:
- [ ] Is navigation intuitive?
- [ ] Is learning context clear?
- [ ] Is data visible/useful?
- [ ] Any usability issues?

---

#### Task 10.2: Iterate Based on Feedback

**Owner**: Frontend Engineer  
**Time**: 4 hours

**Possible Iterations**:
- [ ] Adjust dashboard layout
- [ ] Improve visual hierarchy
- [ ] Add missing information
- [ ] Fix bugs found in testing

---

## Deliverables Summary

### Code
- [ ] Full route structure (`/learn/*`)
- [ ] LearningDashboard component
- [ ] LearningPathNav component
- [ ] LessonContent renderer
- [ ] Database queries/mutations
- [ ] Svelte stores

### Data
- [ ] Learning path JSON (3 paths, 15 lessons)
- [ ] Lesson content (Markdown)
- [ ] TypeScript types

### Documentation
- [ ] Schema documentation
- [ ] Component API
- [ ] Store API
- [ ] Data structure guide
- [ ] Phase 1 completion report

### Testing
- [ ] Manual test cases (passed)
- [ ] Accessibility audit (passed)
- [ ] Performance report

---

## Success Criteria for Phase 1

- [ ] Users can navigate from vocabulary to learning hub
- [ ] Learning dashboard displays all word information
- [ ] Progress tracks and persists locally
- [ ] No console errors
- [ ] Load time <2s
- [ ] All route links work correctly
- [ ] Keyboard navigation functional
- [ ] Screen reader compatible
- [ ] Mobile responsive
- [ ] Team agrees architecture supports Phase 2

---

## Blockers & Risks

### Risk 1: IndexedDB Complexity
**Mitigation**: Use existing library (dexie.js) instead of raw IndexedDB

### Risk 2: Lesson Content Authoring
**Mitigation**: Create templates so fast to write

### Risk 3: Performance with 734 words
**Mitigation**: Pagination + lazy loading from start

### Risk 4: Scope Creep
**Mitigation**: Strictly limit to Phase 1 goals, defer everything else

---

## Team Assignments

| Role | Person | Hours |
|------|--------|-------|
| Tech Lead | (Lead) | 10 |
| Frontend Engineer | (Dev 1) | 60 |
| Backend Engineer | (Dev 2) | 30 |
| Content Manager | (Content) | 15 |
| QA Engineer | (QA) | 20 |
| Designer | (Design) | 10 |
| **Total** | | **145 hours** |

---

## Next Steps After Phase 1

1. **Phase 2 Planning**: Exercise architecture (1 day)
2. **Phase 2 Sprint**: Build exercises (2 weeks)
3. **Gather Feedback**: User testing (3 days)
4. **Iterate**: Based on Phase 2 feedback (3 days)

---

**Status**: Ready to Begin  
**Timeline**: Dec 17 - Dec 31, 2025 (2 weeks)  
**Next: Start Day 1**
