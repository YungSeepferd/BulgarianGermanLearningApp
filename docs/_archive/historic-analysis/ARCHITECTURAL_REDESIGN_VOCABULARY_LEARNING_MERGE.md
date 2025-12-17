# Comprehensive Architectural Redesign: Merging Vocabulary & Learning

**Date**: December 17, 2025  
**Status**: Planning Phase  
**Objective**: Create unified vocabulary-learning experience with high-fidelity practice modes

---

## Executive Summary

The current app has two disconnected experiences:
- **Vocabulary Tab**: Browse all words, view translations
- **Learn Tab**: Generic flashcard interface

**Problem**: These should be integrated. Clicking a vocabulary card should open a rich learning dashboard with that word at the center, featuring exercises, grammar context, and editing capabilities.

**Solution**: Merge vocabulary and learning into a unified `/learn` route system where:
- `/learn` → Landing dashboard with random word or quick-start modes
- `/learn/[word]` → Individual word learning hub with dashboard, exercises, grammar notes
- `/vocabulary` → Lightweight card browser (link to `/learn/[word]` on click)

---

## Current State Analysis

### Existing Routes
```
src/routes/
├── +page.svelte (Home/Dashboard)
├── vocabulary/
│   └── +page.svelte (Vocabulary list)
├── practice/
│   └── +page.svelte (Generic practice)
├── grammar/
│   └── +page.svelte (Grammar reference)
└── learn/
    └── +page.svelte (Flashcard interface - redundant)
```

### Problems with Current Structure
1. **Redundant Practice Routes**: `/practice` and `/learn` both serve practice, but at different fidelity levels
2. **No Deep Linking**: Vocabulary cards don't link to specific learning experiences
3. **No Word-Centric Hub**: No single-word dashboard
4. **No Editing**: Users can't update vocabulary metadata
5. **No Exercise Variety**: Only flashcards, missing cloze/sentence builders
6. **No Learning Paths**: No structured progression through lessons

---

## Proposed Architecture

### New Route Structure
```
src/routes/
├── +page.svelte (Home/Dashboard)
├── vocabulary/
│   └── +page.svelte (Card browser, links to /learn/[word])
├── grammar/
│   └── +page.svelte (Grammar reference, links to related /learn/[word])
├── learn/
│   ├── +page.svelte (Landing: random word + quick-start options)
│   ├── [word]/
│   │   ├── +page.svelte (Learning hub dashboard)
│   │   ├── +layout.svelte (Word context provider)
│   │   └── components/
│   │       ├── LearningDashboard.svelte
│   │       ├── ExercisePractice.svelte
│   │       ├── VocabularyEditor.svelte
│   │       ├── GrammarReference.svelte
│   │       └── LearningPathNav.svelte
│   └── paths/
│       ├── +page.svelte (Learning paths index)
│       └── [path]/
│           └── +page.svelte (Path progress)
└── exercises/
    ├── +page.svelte (Exercise index)
    └── [exerciseType]/
        └── +page.svelte (Practice mode)
```

### Data Architecture (Local-First)

#### 1. **Vocabulary Item Schema**
```json
{
  "id": "acht",
  "german": "acht",
  "bulgarian": "осем",
  "partOfSpeech": "number",
  "grammar": {
    "gender": null,
    "case": null,
    "number": "singular"
  },
  "example": {
    "german": "Ich bin acht Jahre alt.",
    "bulgarian": "Аз съм осем години.",
    "translation_en": "I am eight years old."
  },
  "mnemonics": "Eight looks like an eye - 'acht'",
  "culturalNotes": "Useful for telling your age",
  "audioUrl": "https://..../acht.mp3",
  "learningPath": "basics",
  "difficulty": "A1",
  "metadata": {
    "createdAt": "2025-01-01",
    "editedAt": "2025-01-15",
    "editedBy": "user",
    "edits": [
      {"field": "mnemonics", "oldValue": "", "newValue": "...", "timestamp": "..."}
    ]
  }
}
```

#### 2. **User Progress Schema** (IndexedDB)
```json
{
  "userId": "local-user-001",
  "progress": {
    "acht": {
      "attempts": 5,
      "correct": 4,
      "lastAttempt": "2025-01-15T10:30:00Z",
      "mastery": 0.8,
      "nextReview": "2025-01-20T10:30:00Z",
      "interval": 3,
      "easeFactor": 2.5
    }
  },
  "learningPath": {
    "currentPath": "basics",
    "currentLesson": 2,
    "completedLessons": [1],
    "completedExercises": ["ex-001", "ex-002"]
  },
  "streak": {
    "current": 5,
    "longest": 23,
    "lastPractice": "2025-01-15"
  }
}
```

#### 3. **Learning Path Schema** (JSON)
```json
{
  "id": "basics",
  "title": "Basics",
  "description": "Learn fundamental German grammar and vocabulary",
  "lessons": [
    {
      "id": "les-001",
      "title": "Numbers 0-10",
      "order": 1,
      "contentUrl": "/lessons/basics/numbers-0-10.md",
      "vocabularyIds": ["eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "null"],
      "exerciseIds": ["ex-001", "ex-002", "ex-003"],
      "grammarTopics": ["numbers", "ordinals"],
      "prerequisites": [],
      "estimatedTime": 15,
      "difficulty": "A1"
    }
  ]
}
```

#### 4. **Exercise Schema**
```json
{
  "id": "ex-001",
  "type": "cloze",
  "lesson": "les-001",
  "title": "Fill in the Numbers",
  "instructions": "Complete the sentences with correct numbers",
  "content": {
    "sentences": [
      {
        "german": "Ich bin ___ Jahre alt.",
        "bulgarian": "Аз съм ___ години.",
        "answer": "acht",
        "hints": ["It's the number after seven"],
        "commonMistakes": [
          {
            "mistake": "acht",
            "explanation": "acht is correct! This is the number 8."
          }
        ]
      }
    ]
  },
  "difficulty": "A1",
  "estimatedTime": 5
}
```

---

## Component Architecture

### Learning Hub Dashboard (`/learn/[word]`)

```svelte
<!-- src/routes/learn/[word]/+page.svelte -->

<script lang="ts">
  import { page } from '$app/stores';
  import LearningDashboard from './components/LearningDashboard.svelte';
  import ExercisePractice from './components/ExercisePractice.svelte';
  import VocabularyEditor from './components/VocabularyEditor.svelte';
  import GrammarReference from './components/GrammarReference.svelte';

  let activeTab = 'overview'; // overview, exercises, grammar, edit
  let vocabularyItem = {}; // loaded from store
  let userProgress = {}; // loaded from IndexedDB
</script>

<div class="learning-hub">
  <LearningDashboard {vocabularyItem} {userProgress} />
  
  <div class="tabs">
    <button on:click={() => activeTab = 'overview'}>Overview</button>
    <button on:click={() => activeTab = 'exercises'}>Practice</button>
    <button on:click={() => activeTab = 'grammar'}>Grammar</button>
    <button on:click={() => activeTab = 'edit'}>Edit</button>
  </div>

  <div class="content">
    {#if activeTab === 'overview'}
      <LearningDashboard {vocabularyItem} {userProgress} />
    {:else if activeTab === 'exercises'}
      <ExercisePractice {vocabularyItem} {userProgress} />
    {:else if activeTab === 'grammar'}
      <GrammarReference {vocabularyItem} />
    {:else if activeTab === 'edit'}
      <VocabularyEditor {vocabularyItem} on:save={handleSave} />
    {/if}
  </div>
</div>
```

### Learning Dashboard Component

```svelte
<!-- src/routes/learn/[word]/components/LearningDashboard.svelte -->

<script lang="ts">
  export let vocabularyItem;
  export let userProgress;
  
  const { german, bulgarian, partOfSpeech, example, mnemonics, culturalNotes } = vocabularyItem;
  const { mastery, attempts, correct, nextReview } = userProgress;
</script>

<div class="dashboard">
  <!-- Word Card -->
  <div class="word-card">
    <div class="word-display">
      <div class="german">{german}</div>
      <div class="direction">↔</div>
      <div class="bulgarian">{bulgarian}</div>
    </div>
    <div class="metadata">
      <span class="pos">{partOfSpeech}</span>
      <span class="difficulty">A1</span>
    </div>
  </div>

  <!-- Example -->
  <div class="section">
    <h3>Example</h3>
    <div class="example">
      <p><strong>German:</strong> {example.german}</p>
      <p><strong>Bulgarian:</strong> {example.bulgarian}</p>
    </div>
  </div>

  <!-- Mnemonics & Cultural Notes -->
  <div class="grid">
    <div class="section">
      <h3>Memory Aid</h3>
      <p>{mnemonics || 'No memory aid yet'}</p>
    </div>
    <div class="section">
      <h3>Cultural Context</h3>
      <p>{culturalNotes || 'No context yet'}</p>
    </div>
  </div>

  <!-- Progress -->
  <div class="section">
    <h3>Your Progress</h3>
    <div class="progress-grid">
      <div class="stat">
        <div class="number">{mastery * 100}%</div>
        <div class="label">Mastery</div>
      </div>
      <div class="stat">
        <div class="number">{attempts}</div>
        <div class="label">Attempts</div>
      </div>
      <div class="stat">
        <div class="number">{correct}/{attempts}</div>
        <div class="label">Correct</div>
      </div>
      <div class="stat">
        <div class="label">Next Review</div>
        <div class="date">{new Date(nextReview).toLocaleDateString()}</div>
      </div>
    </div>
  </div>

  <!-- Quick Actions -->
  <div class="actions">
    <button class="btn-primary">Practice This Word</button>
    <button class="btn-secondary">Related Words</button>
    <button class="btn-secondary">Add to List</button>
  </div>

  <!-- Learning Path Navigation -->
  <div class="section">
    <h3>Learning Path: Basics</h3>
    <LearningPathNav />
  </div>
</div>

<style>
  .dashboard {
    display: grid;
    gap: 24px;
    max-width: 800px;
  }

  .word-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 32px;
    border-radius: 12px;
    text-align: center;
  }

  .word-display {
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }

  .german, .bulgarian {
    flex: 1;
  }

  .direction {
    opacity: 0.7;
  }
</style>
```

### Vocabulary Editor Component

```svelte
<!-- src/routes/learn/[word]/components/VocabularyEditor.svelte -->

<script lang="ts">
  export let vocabularyItem;
  
  let editedFields = { ...vocabularyItem };
  
  async function handleSave() {
    // Save to IndexedDB
    await db.vocabulary.put(editedFields);
    
    // Emit save event
    dispatch('save', editedFields);
  }
</script>

<div class="editor">
  <form on:submit|preventDefault={handleSave}>
    
    <!-- Example Sentence -->
    <div class="form-group">
      <label>German Example</label>
      <textarea bind:value={editedFields.example.german}></textarea>
    </div>

    <div class="form-group">
      <label>Bulgarian Translation</label>
      <textarea bind:value={editedFields.example.bulgarian}></textarea>
    </div>

    <!-- Mnemonics -->
    <div class="form-group">
      <label>Memory Aid (Mnemonic)</label>
      <textarea 
        bind:value={editedFields.mnemonics}
        placeholder="e.g., Eight looks like an eye - 'acht'"
      ></textarea>
    </div>

    <!-- Cultural Notes -->
    <div class="form-group">
      <label>Cultural Context</label>
      <textarea 
        bind:value={editedFields.culturalNotes}
        placeholder="e.g., Important for telling age"
      ></textarea>
    </div>

    <!-- Grammar Metadata -->
    <div class="form-group">
      <label>Part of Speech</label>
      <select bind:value={editedFields.partOfSpeech}>
        <option value="noun">Noun</option>
        <option value="verb">Verb</option>
        <option value="adjective">Adjective</option>
        <option value="number">Number</option>
        <option value="conjunction">Conjunction</option>
      </select>
    </div>

    {#if editedFields.partOfSpeech === 'noun'}
      <div class="form-group">
        <label>Gender</label>
        <select bind:value={editedFields.grammar.gender}>
          <option value="">Select...</option>
          <option value="masculine">Masculine (der)</option>
          <option value="feminine">Feminine (die)</option>
          <option value="neuter">Neuter (das)</option>
        </select>
      </div>
    {/if}

    <div class="actions">
      <button type="submit" class="btn-primary">Save Changes</button>
      <button type="button" class="btn-secondary">Cancel</button>
    </div>
  </form>
</div>
```

---

## Navigation Flow

### User Journey 1: Browse → Learn → Practice

```
1. User opens app
   ↓
2. Home Dashboard (shows random word)
   ├─ "Practice Random Word" button
   ├─ "Browse Vocabulary" link
   └─ "Start Learning Path" link
   
3. User clicks "Browse Vocabulary"
   ↓
4. Vocabulary Page
   ├─ Card grid with all words
   └─ Click any card
   
5. Navigate to /learn/[word]
   ↓
6. Learning Hub Dashboard
   ├─ Word overview
   ├─ Progress stats
   ├─ Example sentences
   ├─ Practice button
   └─ Edit button
   
7. User clicks "Practice This Word"
   ↓
8. Exercise Practice Mode
   ├─ Multiple exercise types
   ├─ Cloze tests
   ├─ Sentence builders
   └─ Recording progress
   
9. Complete exercises
   ↓
10. Back to dashboard with updated progress
```

### User Journey 2: Follow Learning Path

```
1. Home Dashboard
   ↓
2. User clicks "Basics - Numbers 0-10"
   ↓
3. Lesson Content Page
   ├─ Lesson notes (markdown)
   ├─ 10 vocabulary items
   └─ Exercise buttons
   
4. Click vocabulary item
   ↓
5. /learn/[word] Dashboard (contextual)
   ├─ Word tied to lesson
   ├─ Path navigation visible
   └─ Related words shown
   
6. Complete all words in lesson
   ↓
7. Unlock next lesson
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Create `/learn/[word]` route structure
- [ ] Build LearningDashboard component (display only)
- [ ] Implement IndexedDB progress tracking
- [ ] Add word-to-learn navigation from vocabulary page

### Phase 2: Editing & Enrichment (Week 2)
- [ ] Build VocabularyEditor component
- [ ] Implement local data persistence
- [ ] Add edit history tracking
- [ ] Create export functionality

### Phase 3: Exercises (Week 2-3)
- [ ] Build ClozeTest component
- [ ] Build SentenceBuilder component
- [ ] Create exercise validation
- [ ] Implement progress updates

### Phase 4: Learning Paths (Week 3-4)
- [ ] Design learning path JSON structure
- [ ] Build LearningPathNav component
- [ ] Create lesson content renderer
- [ ] Implement lesson unlock logic

### Phase 5: Polish & Integration (Week 4)
- [ ] Connect all tabs in hub
- [ ] Add keyboard navigation
- [ ] Optimize performance
- [ ] Mobile responsiveness

---

## Database Schema (IndexedDB)

```javascript
// Initialize IndexedDB
const dbConfig = {
  name: 'BulgarianGermanApp',
  version: 1,
  stores: {
    vocabulary: {
      keyPath: 'id',
      indexes: [
        { name: 'partOfSpeech', unique: false },
        { name: 'difficulty', unique: false },
        { name: 'learningPath', unique: false }
      ]
    },
    progress: {
      keyPath: 'userId',
      indexes: [
        { name: 'lastUpdated', unique: false }
      ]
    },
    learningPaths: {
      keyPath: 'id'
    },
    exercises: {
      keyPath: 'id',
      indexes: [
        { name: 'lesson', unique: false },
        { name: 'type', unique: false }
      ]
    },
    editHistory: {
      keyPath: 'id',
      autoIncrement: true,
      indexes: [
        { name: 'vocabularyId', unique: false },
        { name: 'timestamp', unique: false }
      ]
    }
  }
};
```

---

## Removing Redundancy

### Current Issues
```
/learn          → Flashcard interface (low-fidelity)
/practice       → Generic practice (no context)
/vocabulary     → Browse only (no deep engagement)
```

### After Redesign
```
/vocabulary     → Lightweight browser (links to /learn/[word])
/learn          → Landing + random word starter
/learn/[word]   → Full learning hub (replaced flashcards)
/exercises      → Specialized practice modes
/learn/paths    → Structured learning (replaced /practice)
```

**Removed**: Generic `/practice` and generic `/learn` flashcard interface

---

## Success Metrics

- [ ] Users spend 3x longer in learning mode
- [ ] 80%+ of words have enriched metadata (mnemonics, cultural notes)
- [ ] Users complete 2+ learning paths
- [ ] 50%+ editing participation (add/edit vocabulary)
- [ ] Exercise completion rate >70%
- [ ] User satisfaction >4/5

---

## Technical Debt & Considerations

1. **Data Sync**: With future backend, sync edited vocabulary
2. **Scalability**: IndexedDB limits for large datasets
3. **Mobile UX**: Responsive design for small screens
4. **Accessibility**: Keyboard navigation, screen reader support
5. **Performance**: Lazy load large exercise sets
6. **Audio**: Integrate Web Speech API for pronunciation

---

## File Structure to Create

```
src/routes/learn/
├── +page.svelte (landing)
├── +layout.svelte (shared context)
├── [word]/
│   ├── +page.svelte (hub)
│   ├── +layout.svelte (word provider)
│   └── components/
│       ├── LearningDashboard.svelte
│       ├── ExercisePractice.svelte
│       ├── VocabularyEditor.svelte
│       ├── GrammarReference.svelte
│       └── LearningPathNav.svelte
├── paths/
│   ├── +page.svelte (index)
│   └── [path]/
│       └── +page.svelte (path view)
└── exercises/
    ├── +page.svelte
    ├── components/
    │   ├── ClozeTest.svelte
    │   ├── SentenceBuilder.svelte
    │   └── TypingExercise.svelte
    └── [type]/
        └── +page.svelte

src/lib/
├── stores/
│   ├── vocabulary.ts
│   ├── progress.ts
│   └── learning-paths.ts
├── db/
│   ├── idb.ts (IndexedDB setup)
│   ├── queries.ts
│   └── mutations.ts
├── components/
│   └── (all existing + new)
└── utils/
    ├── exercise-validator.ts
    ├── spaced-repetition.ts
    └── progress-calculator.ts
```

---

## Next Steps

1. **Finalize Data Schema**: Validate JSON structures with team
2. **Design Mockups**: Create Figma wireframes for dashboard
3. **Create Spike**: Build Phase 1 prototype
4. **Gather Feedback**: Test with early users
5. **Iterate**: Refine based on feedback
6. **Execute Phases**: Follow implementation roadmap
