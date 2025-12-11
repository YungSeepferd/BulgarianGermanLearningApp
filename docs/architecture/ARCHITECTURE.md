# System Architecture & Technical Guidelines

## 1. Overview
The **Bulgarian-German Learning App** is a modern Single Page Application (SPA) designed to facilitate vocabulary and grammar acquisition through tandem learning (German <-> Bulgarian). It is built for performance, offline capability, and ease of deployment via static hosting (GitHub Pages).

## 2. Technology Stack
## Framework & Syntax

- SvelteKit 2 + Svelte 5 (latest syntax across components, runes, and APIs)

## 3. Application State Management
We utilize **Svelte 5 Runes** (`$state`, `$derived`, `$effect`) for all reactive state management with a focus on **separation of concerns** and **modular architecture**.

### State Architecture Overview
The application state follows a **clean architecture pattern** with clear separation between:

1. **UI State** (`AppUIState`) - Manages user interface and session state
2. **Data State** (`AppDataState`) - Manages persistent application data
3. **Service Layer** - Business logic and external service integration
4. **Dependency Injection Container** - Manages service dependencies
5. **Event Bus** - Decoupled communication between components and services

### State Responsibility Separation
## Tooling & Documentation Access

- Svelte MCP server enabled (local via `@sveltejs/mcp`): use `list-sections` → `get-documentation` for latest Svelte 5/SvelteKit docs, and `svelte-autofixer` to validate components before merge.
- Context7 MCP is configured for broader library docs when needed.
#### 3.1 UI State (`src/lib/state/app-ui.svelte.ts`)
The `AppUIState` class manages **ephemeral, UI-specific state** that doesn't need persistence:

- **User Preferences**: Learning direction (`DE_BG` / `BG_DE`)
- **Session State**: Current search queries, active filters
- **Practice State**: Current flashcard, answer visibility, practice mode
- **Derived State**: Computed values like filtered items and practice recommendations
- **Loading States**: UI loading indicators and error states

#### 3.2 Data State (`src/lib/state/app-data.svelte.ts`)
The `AppDataState` class manages **persistent application data** that needs to be saved:

- **User Progress**: Practice statistics, mastery tracking
- **User Data**: Favorites, recent searches
- **Application Data**: Access to vocabulary items through the database service

#### 3.3 Backward Compatibility (`src/lib/state/app.svelte.ts`)
The `AppState` class provides a **backward-compatible facade** that combines both UI and Data state for existing components:

```typescript
// Combined interface for backward compatibility
export class AppState {
    // UI State accessors
    get languageMode() { return appUIState.languageMode; }
    get searchQuery() { return appUIState.searchQuery; }
    // ... other UI state accessors

    // Data State accessors
    get practiceStats() { return appDataState.practiceStats; }
    get favorites() { return appDataState.favorites; }
    // ... other data state accessors

    // Method accessors
    toggleDirection() { return appUIState.toggleDirection(); }
    recordPracticeResult(itemId: string, correct: boolean) {
        return appDataState.recordPracticeResult(itemId, correct);
    }
    // ... other method accessors
}
```

### 3.4 Dependency Injection System
The application uses a **centralized dependency injection container** to manage service dependencies:

```typescript
// Dependency Injection Container (src/lib/services/di-container.ts)
export const diContainer = {
    initialize(): Promise<void> {
        // Initialize all services in the correct order
    },

    getService(serviceName: keyof ServiceTypes): any {
        // Get a service instance
    },

    registerService<T extends keyof ServiceTypes>(serviceName: T, instance: ServiceTypes[T]): void {
        // Register a service instance
    }
};
```

**Key Services in the DI Container:**
- `progressService`: Progress tracking and gamification
- `vocabularyService`: Vocabulary data management
- `lessonGenerationEngine`: Dynamic lesson generation
- `appDataState`: Data state management
- `eventBus`: Event-based communication

### 3.5 Event-Based Communication Pattern
The application implements a **decoupled event bus system** to eliminate circular dependencies and enable better testability:

```typescript
// Event Bus Implementation (src/lib/services/event-bus.ts)
export class EventBus {
    subscribe<T = any>(eventType: string, callback: EventCallback<T>): () => void {
        // Subscribe to events
    }

    async emit<T = any>(eventType: string, data: T): Promise<void> {
        // Emit events to subscribers
    }

    clear(eventType?: string): void {
        // Clear event listeners
    }
}
```

**Key Event Types:**
- `XP_EARNED`: When user earns experience points
- `LEVEL_UP`: When user levels up
- `PRACTICE_RESULT`: When a practice result is recorded
- `LESSON_COMPLETED`: When a lesson is completed
- `QUIZ_COMPLETED`: When a quiz is completed
- `STATE_CHANGED`: When application state changes
- `ERROR`: When errors occur

### 3.6 Error Handling Improvements
The application implements **consistent error handling** across all services with custom error classes and a centralized error handler:

```typescript
// Custom error classes (src/lib/services/errors.ts)
export class StateError extends Error {
    constructor(message: string, public context?: any) {
        super(message);
        this.name = 'StateError';
    }
}

export class StorageError extends Error {
    constructor(message: string, public context?: any) {
        super(message);
        this.name = 'StorageError';
    }
}

// Centralized error handler
export class ErrorHandler {
    static handleError(error: unknown, context?: string, details?: any) {
        // Handle errors consistently
    }
}
```

**Error Handling Strategy:**
- **Custom Error Classes**: Specific error types for different domains
- **Centralized Error Handler**: Consistent error logging and reporting
- **Event-Based Error Reporting**: Errors are emitted through the event bus
- **Defensive Programming**: Comprehensive validation and error boundaries

### 3.7 State Persistence Strategy
The application implements a **robust persistence strategy** with:

- **LocalStorage Integration**: For user progress and preferences
- **Data Validation**: Zod schemas for all persisted data
- **Migration System**: For handling data format changes
- **Error Recovery**: Graceful fallback to default states

```typescript
// LocalStorage Manager (src/lib/utils/localStorage.ts)
export class LocalStorageManager {
    static saveUserProgress(data: UserProgressData): void {
        // Save progress with validation
    }

    static loadUserProgress(): UserProgressData | null {
        // Load and validate progress
    }
}
```

### 3.8 Architectural Testing Strategy
The application includes **dedicated architectural tests** to ensure the integrity of the state management system:

```typescript
// tests/unit/appState.arch.test.ts
describe('Architectural Improvements', () => {
    describe('State Responsibility Separation', () => {
        it('should provide backward compatibility through combined appState', () => {
            // Test backward compatibility
        });
    });

    describe('Dependency Injection', () => {
        it('should allow service access through DI container', () => {
            // Test DI container functionality
        });
    });

    describe('Circular Dependency Elimination', () => {
        it('should break circular dependency between ProgressService and LearningSession', () => {
            // Test event-based communication
        });
    });

    describe('State Duplication Elimination', () => {
        it('should eliminate XP state duplication between ProgressService and LearningSession', () => {
            // Test single source of truth
        });
    });

    describe('Error Handling Improvements', () => {
        it('should provide consistent error handling across services', () => {
            // Test error handling
        });
    });
});
```

## 4. Data Architecture

### 4.1 Source of Truth
- **Static Data**: The core vocabulary database lives in `src/lib/data/unified-vocabulary.json`
- **Schema**: Data follows the `VocabularyItem` interface defined in `src/lib/types/vocabulary.ts`
- **Validation**: Zod schema validation ensures data integrity

### 4.2 Data Loading Pipeline
1. **Schema Validation**: Zod validation of raw JSON data
2. **Deduplication**: Remove duplicate vocabulary items
3. **Cleaning**: Normalize data formats and handle missing fields
4. **Indexing**: Create indexes for fast querying
5. **Caching**: In-memory caching for performance

### 4.3 Database Service (`src/lib/data/db.svelte.ts`)
- **Singleton Pattern**: Ensures data is loaded only once
- **Reactive Interface**: Uses Svelte 5 Runes for reactivity
- **Query Methods**: Provides filtered queries for vocabulary items

## 5. Service Architecture

### 5.1 Progress Service (`src/lib/services/progress.ts`)
- **Vocabulary Mastery Tracking**: Tracks correct/incorrect attempts
- **Lesson Progress Tracking**: Records lesson completion status
- **Quiz Performance Tracking**: Records quiz results and question performance
- **Daily Progress Tracking**: Tracks daily activity and streaks
- **Overall Progress**: Manages XP, levels, and achievements

### 5.2 Lesson Service (`src/lib/services/lesson.ts`)
- **Lesson Generation**: Creates lessons from vocabulary criteria
- **Lesson Management**: CRUD operations for lessons
- **Lesson Recommendations**: Provides personalized lesson suggestions
- **Validation**: Ensures lessons conform to schema requirements

### 5.3 Lesson Generation Engine (`src/lib/services/lesson-generation/lesson-generator.ts`)
- **Template-Based Generation**: Uses lesson templates for consistent structure
- **Cultural Grammar Integration**: Incorporates cultural context into lessons
- **Dynamic Content**: Generates lessons based on user progress and preferences

### 5.4 Search Service (`src/lib/services/search.ts`)
- **Vocabulary Search**: Searches vocabulary by various criteria
- **Fuzzy Matching**: Provides flexible search capabilities
- **Performance Optimized**: Uses indexing for fast search results

## 6. Directory Structure

```
/Users/dinz/Coding Projects/BulgariaLearn/BulgarianApp-Fresh
├── src/
│   ├── lib/
│   │   ├── components/       # UI Components (Atomic Design principles)
│   │   │   ├── ui/           # Atomic components (buttons, dialogs)
│   │   │   ├── flashcard/    # Flashcard components
│   │   │   ├── gamification/ # Gamification components
│   │   │   └── LessonCard.svelte # Lesson display component
│   │   ├── data/             # Data loading & processing logic
│   │   │   ├── db.svelte.ts  # Vocabulary database service
│   │   │   └── loader.ts     # Data loading service
│   │   ├── schemas/          # Zod validation schemas
│   │   │   ├── vocabulary.ts # Vocabulary schema
│   │   │   ├── lesson.ts     # Lesson schema
│   │   │   └── progress.ts   # Progress tracking schemas
│   │   ├── services/         # Business logic services
│   │   │   ├── di-container.ts # Dependency Injection Container
│   │   │   ├── event-bus.ts  # Event Bus implementation
│   │   │   ├── errors.ts     # Error handling utilities
│   │   │   ├── progress.ts   # Progress tracking service
│   │   │   ├── lesson.ts     # Lesson service
│   │   │   ├── search.ts     # Search service
│   │   │   └── lesson-generation/ # Lesson generation system
│   │   ├── state/            # Global state managers (Svelte 5 Runes)
│   │   │   ├── app-ui.svelte.ts # UI state management
│   │   │   ├── app-data.svelte.ts # Data state management
│   │   │   └── app.svelte.ts # Backward-compatible facade
│   │   ├── types/            # TypeScript interfaces & types
│   │   └── utils/            # Utility functions
│   ├── routes/               # SvelteKit File-based routing
│   └── app.html              # Root HTML template
├── static/                   # Static assets
│   └── data/                 # Static JSON datasets
├── tests/                    # Test files
│   ├── unit/                 # Unit tests
│   ├── components/           # Component tests
│   ├── e2e/                  # End-to-end tests
│   └── architecture/         # Architectural tests
└── docs/                     # Project documentation
```

## 7. Coding Standards

### 7.1 Svelte 5 Runes
- **$state**: For reactive state management
- **$derived**: For derived/computed values
- **$effect**: For side effects and lifecycle management
- **$props**: For component props

```svelte
<script lang="ts">
    // Reactive state
    let count = $state(0);

    // Derived value
    let double = $derived(count * 2);

    // Side effect
    $effect(() => {
        console.log(`Count changed to: ${count}`);
    });
</script>
```

### 7.2 Type Safety
- **Strict TypeScript**: No `any` types allowed
- **Zod Validation**: Runtime validation for all external data
- **Type Guards**: Safe type narrowing

### 7.3 Component Design
- **Atomic Design**: Components organized by complexity
- **Accessibility**: WCAG 2.1 AA compliant
- **Performance**: Optimized for fast rendering

### 7.4 Error Handling
- **Custom Error Classes**: Domain-specific error types
- **Centralized Error Handler**: Consistent error reporting
- **Defensive Programming**: Comprehensive validation

## 8. Testing Strategy

### 8.1 Testing Pyramid
- **Unit Tests (70%)**: Vitest for business logic and services
- **Component Tests (20%)**: Playwright CT for UI components in isolation
- **E2E Tests (10%)**: Playwright for critical user flows
- **Architectural Tests**: Ensure architectural integrity

### 8.2 Key Focus Areas
- **Data Validation**: Comprehensive schema validation tests
- **State Management**: Edge cases, error handling, and architectural compliance
- **Accessibility**: axe-core integration for WCAG compliance
- **Performance**: Load and rendering performance tests
- **Architectural Integrity**: Tests for dependency injection, event bus, and state separation

### 8.3 Architectural Testing
The application includes dedicated tests to ensure architectural patterns are maintained:

```typescript
// tests/architecture/state-separation.test.ts
describe('State Separation Architecture', () => {
    it('should maintain separation between UI and Data state', () => {
        // Verify UI state doesn't contain persistent data
        // Verify Data state doesn't contain UI-specific state
    });

    it('should provide backward compatibility through AppState facade', () => {
        // Test that AppState provides access to both UI and Data state
    });
});

// tests/architecture/dependency-injection.test.ts
describe('Dependency Injection Architecture', () => {
    it('should initialize services in the correct order', () => {
        // Test service initialization sequence
    });

    it('should allow service access through DI container', () => {
        // Test service retrieval
    });
});

// tests/architecture/event-bus.test.ts
describe('Event Bus Architecture', () => {
    it('should break circular dependencies through event-based communication', () => {
        // Test that services can communicate without direct dependencies
    });

    it('should handle event subscription and emission correctly', () => {
        // Test event bus functionality
    });
});
```

## 9. CI/CD Pipeline

### 9.1 Pipeline Stages
1. **Lint & Format**: ESLint and Prettier checks
2. **Unit Tests**: Vitest coverage (95% target)
3. **Component Tests**: Playwright CT (80% target)
4. **E2E Tests**: Critical path testing
5. **Accessibility Audit**: axe-core integration
6. **Architectural Tests**: Ensure architectural integrity
7. **Build & Deploy**: GitHub Pages deployment

### 9.2 Quality Gates
- No linting errors
- 95% unit test coverage
- 80% component test coverage
- No critical accessibility violations
- All architectural tests pass
- Successful build

## 10. Strategic Roadmap

### 10.1 Current Status
- **State Management**: Clean architecture with separation of concerns
- **Dependency Injection**: Centralized DI container for service management
- **Event-Based Communication**: Decoupled event bus system
- **Error Handling**: Comprehensive error handling strategy
- **Data Architecture**: Robust validation pipeline with 541 validated vocabulary items
- **UI Components**: Accessible, responsive components
- **Documentation**: Comprehensive architecture and development guides

### 10.2 Next Phase Development
1. **Enhanced Gamification**: Badges, achievements, and leaderboards
2. **Advanced Progress Analytics**: Detailed progress visualization
3. **Adaptive Learning**: Personalized learning paths
4. **Audio Integration**: Pronunciation guides and listening exercises
5. **Social Features**: Progress sharing and community features
6. **Offline Mode**: Full offline functionality with sync

## 11. Documentation Structure

```
docs/
├── architecture/           # Technical architecture documentation
│   ├── ARCHITECTURE.md     # System architecture overview (this file)
│   ├── DATA_ARCHITECTURE.md # Data architecture and schemas
│   ├── UI_ARCHITECTURE.md  # UI component architecture
│   └── STRATEGIC_ARCHITECTURE.md # Strategic roadmap and future vision
│
├── development/            # Development and contribution guides
│   ├── DEVELOPER_ONBOARDING.md # Developer onboarding guide
│   ├── COMPONENT_GUIDE.md  # Component development guidelines
│   ├── TESTING.md          # Testing strategy and guidelines
│   ├── BEST_PRACTICES.md   # Coding best practices
│   └── KNOWN_ISSUES.md     # Known issues and technical debt
│
├── roadmap/                # Project roadmap and planning
│   ├── ROADMAP.md          # High-level project roadmap
│   ├── DETAILED_ROADMAP.md # Detailed implementation roadmap
│   └── NEXT_STEPS.md       # Immediate action items
│
├── design/                 # Design and UX documentation
│   ├── DESIGN_CONCEPT.md   # Design concept and strategy
│   └── ACCESSIBILITY.md    # Accessibility guidelines
│
├── ci-cd/                  # CI/CD and deployment documentation
│   ├── CI_WORKFLOW.md      # CI workflow design
│   ├── QUALITY_GATES.md    # CI quality gates
│   └── DEPLOYMENT.md       # Deployment guide
│
└── CHANGELOG.md            # Project changelog and release notes
```

## 12. Key Architectural Decisions

1. **Svelte 5 Runes**: Chosen for modern reactive state management
2. **State Separation**: UI and Data state separation for better maintainability
3. **Dependency Injection**: Service dependency management for testability
4. **Event-Driven Architecture**: Event-based communication to eliminate circular dependencies
5. **Single Source of Truth**: Consolidated state management to eliminate duplication
6. **Consistent Error Handling**: Standardized error handling across all services
7. **Static Hosting**: GitHub Pages for cost-effective, scalable deployment
8. **Zod Validation**: Runtime data validation for data integrity
9. **Atomic Design**: Component organization for reusability and maintainability
10. **Defensive Programming**: Comprehensive error handling and validation
11. **Accessibility First**: WCAG 2.1 AA compliance from the start
12. **Performance by Default**: Optimized data loading and rendering
13. **Clean Architecture**: Separation of concerns for maintainability
14. **Modular Services**: Business logic encapsulated in services
15. **Robust Persistence**: LocalStorage with validation and migration