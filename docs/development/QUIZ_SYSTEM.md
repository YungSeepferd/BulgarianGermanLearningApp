# Quiz System Documentation

## 📋 Overview

The **Quiz System** is a core feature of the Bulgarian-German Learning App that provides interactive assessment functionality. It allows users to test their knowledge of vocabulary through various question types and receive immediate feedback on their performance.

## 🏗️ Architecture

### Core Components

```
┌───────────────────────────────────────────────────────────────────┐
│                            Quiz System                            │
├───────────────────┬───────────────────┬───────────────────┬───────┤
│    Quiz Schema    │  Quiz Service     │   Quiz UI         │       │
│  (Zod Validation) │  (Business Logic) │   (Components)    │       │
└─────────┬─────────┴─────────┬─────────┴─────────┬─────────┴───────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   Data Layer    │ │  State Layer    │ │   UI Layer      │
│ - Vocabulary DB │ │ - Quiz State    │ │ - QuizCard      │
│ - Generated     │ │ - Session State │ │ - QuizPage      │
│   Questions     │ └─────────────────┘ └─────────────────┘
└─────────────────┘
```

## 📚 Schemas & Types

### Quiz Question Schema (`src/lib/schemas/quiz.ts`)

```typescript
interface QuizQuestion {
  id: string;                  // UUID
  question: string;            // Question text
  questionType: 'multiple_choice'; // Question type
  options: string[];           // Answer options
  correctAnswer: string;       // Correct answer
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'; // Difficulty level
  category: string[];          // Vocabulary categories
  vocabularyIds: string[];     // Related vocabulary IDs
  explanation?: string;        // Optional explanation
}
```

### Quiz Schema (`src/lib/schemas/quiz.ts`)

```typescript
interface Quiz {
  id: string;                  // UUID
  title: string;               // Quiz title
  description: string;         // Quiz description
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'Mixed'; // Difficulty
  type: 'vocabulary';          // Quiz type
  questions: string[];         // Array of question IDs
  estimatedTime: number;       // Estimated time in seconds
}
```

### Quiz Session Schema (`src/lib/schemas/quiz.ts`)

```typescript
interface QuizSession {
  id: string;                  // UUID
  quizId: string;              // Quiz ID
  questions: Array<{           // Question state
    questionId: string;        // Question ID
    userAnswer?: string;       // User's answer
    isCorrect?: boolean;       // Whether answer is correct
  }>;
  score?: number;              // Current score
  status: 'in_progress' | 'completed'; // Session status
}
```

## 🔧 Quiz Service (`src/lib/services/quiz.ts`)

### Core Methods

| Method | Description | Parameters | Return Type |
|--------|-------------|------------|-------------|
| `generateQuiz` | Generates a quiz based on criteria | `QuizCriteria` | `Quiz` |
| `startQuizSession` | Starts a new quiz session | `Quiz` | `QuizSession` |
| `submitAnswer` | Submits an answer to a question | `QuizSession`, `number`, `string` | `QuizSession` |

### Quiz Generation Process

1. **Input Validation**: Validate quiz generation criteria
2. **Vocabulary Query**: Retrieve vocabulary items matching criteria
3. **Question Generation**: Create questions from vocabulary items
4. **Question Storage**: Store generated questions in memory
5. **Quiz Creation**: Create quiz object with metadata
6. **Return Quiz**: Return validated quiz object

```typescript
// Example: Generate a quiz with 10 A1 level vocabulary questions
const quiz = quizService.generateQuiz({
  difficulty: 'A1',
  limit: 10
});
```

## 🖼️ UI Components

### QuizCard (`src/lib/components/QuizCard.svelte`)

**Purpose**: Interactive quiz interface that displays questions and handles user interactions.

**Features**:
- Question display with multiple choice options
- Answer selection and submission
- Immediate feedback with correct/incorrect indicators
- Navigation between questions
- Progress tracking
- Score display

**Usage**:
```svelte
<QuizCard quiz={quiz} session={session} />
```

### Quiz Page (`src/routes/quiz/+page.svelte`)

**Purpose**: Quiz landing page that allows users to start new quizzes.

**Features**:
- Quiz generation interface
- Loading states
- Error handling
- Quiz initialization

## 🎯 Key Features

1. **Dynamic Quiz Generation**: Quizzes are generated on-demand based on user criteria
2. **Multiple Choice Questions**: Interactive multiple choice format
3. **Immediate Feedback**: Users see correct/incorrect results immediately
4. **Progress Tracking**: Visual progress indicator
5. **Score Calculation**: Automatic score calculation
6. **Navigation**: Ability to move between questions
7. **Responsive Design**: Mobile-friendly interface

## 🔄 Data Flow

```
┌─────────┐       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  User   │──────>│  Quiz Page  │──────>│ Quiz Service│──────>│ Vocabulary  │
└─────────┘       └─────────────┘       └─────────────┘       │   Database  │
      ▲                   │                                      └─────────────┘
      │                   ▼                                            │
      │           ┌─────────────┐                                     │
      │           │ QuizCard     │◄────────────────────────────────────┘
      │           │ Component    │
      │           └─────────────┘
      │                   │
      │                   ▼
      └───────────┐  User Input  │
                  └─────────────┘
```

## 🧪 Testing Strategy

### Unit Tests
- Quiz generation logic
- Answer validation
- Score calculation
- Session management

### Component Tests
- QuizCard rendering and interactions
- Answer selection and feedback
- Navigation functionality

### Integration Tests
- Quiz generation flow
- Session persistence
- End-to-end quiz completion

## 🚀 Future Enhancements

1. **Additional Question Types**: True/false, fill in the blank, matching
2. **Grammar Questions**: Questions based on grammar rules
3. **Mixed Quizzes**: Combine vocabulary and grammar questions
4. **Question Difficulty**: Adaptive difficulty based on user performance
5. **Time Limits**: Timed quizzes for added challenge
6. **Question Bank**: Persistent storage of generated questions
7. **Quiz History**: Track completed quizzes and performance over time

## 📈 Performance Considerations

1. **Question Generation**: Optimized to generate questions in <100ms
2. **Memory Management**: Questions stored in memory for current session only
3. **Efficient Rendering**: Virtualized lists for large quizzes
4. **State Management**: Minimal re-renders using Svelte 5 Runes

## 🔒 Security Considerations

1. **Client-Side Only**: Quiz data is generated and stored client-side
2. **No Sensitive Data**: No user data is stored in quiz sessions
3. **Input Validation**: All user inputs are validated
4. **Type Safety**: Strict TypeScript types for all quiz data

## 🎨 Accessibility

- Keyboard navigation support
- ARIA labels for interactive elements
- Sufficient color contrast
- Screen reader support
- Reduced motion support

## 📝 Usage Examples

### Generate and Start a Quiz

```typescript
// Generate a quiz
const quiz = quizService.generateQuiz({
  difficulty: 'A1',
  limit: 5
});

// Start a quiz session
const session = quizService.startQuizSession(quiz);
```

### Submit an Answer

```typescript
// Submit answer to first question
const updatedSession = quizService.submitAnswer(session, 0, 'Berlin');
```

### Display Quiz in UI

```svelte
<script lang="ts">
  import QuizCard from '$lib/components/QuizCard.svelte';
  import { quizService } from '$lib/services/quiz';

  let quiz = quizService.generateQuiz({ difficulty: 'A1', limit: 5 });
  let session = quizService.startQuizSession(quiz);
</script>

<QuizCard {quiz} {session} />
```

## 🔧 Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Quiz generation fails | No vocabulary items match criteria | Check vocabulary database and criteria |
| Questions not displaying | Missing question data | Ensure questions are stored in memory |
| Answer submission fails | Invalid session state | Verify session object integrity |
| Score calculation incorrect | Session state corrupted | Reset session and try again |
| UI not updating | State management issue | Check Svelte reactivity bindings |

## 📊 Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Quiz generation time | <100ms | Performance testing |
| Question generation success rate | 100% | Unit testing |
| Answer validation accuracy | 100% | Unit testing |
| UI response time | <200ms | User experience testing |
| Accessibility compliance | WCAG 2.1 AA | Accessibility audits |