# System Architecture & Technical Guidelines

## 1. Overview
The **Bulgarian-German Learning App** is a modern Single Page Application (SPA) designed to facilitate vocabulary and grammar acquisition through tandem learning (German <-> Bulgarian). It is built for performance, offline capability, and ease of deployment via static hosting (GitHub Pages).

## 2. Technology Stack
- **Framework**: [SvelteKit](https://kit.svelte.dev/) (Static Adapter)
- **UI Library**: [Svelte 5](https://svelte.dev/) (Runes mode enabled)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Validation**: [Zod](https://zod.dev/)
- **Package Manager**: `pnpm`
- **Testing**: [Vitest](https://vitest.dev/) (Unit Testing)
- **Deployment**: GitHub Pages

## 3. Application State Management
We utilize **Svelte 5 Runes** (`$state`, `$derived`, `$effect`) for all reactive state management.

### Global State (`src/lib/state/app.svelte.ts`)
The `AppState` class is a singleton reactive object that manages:
- **User Preferences**: Learning direction (`DE->BG` / `BG->DE`), themes
- **Session State**: Current search queries, active filters
- **Practice State**: Current flashcard, answer visibility, score tracking
- **Lesson State**: Current lesson, progress tracking

### Persistence
- Critical user state (progress, settings) is persisted to `localStorage`
- Data synchronization handles conflict resolution

## 4. Data Architecture
### Source of Truth
- **Static Data**: The core vocabulary database lives in `static/data/vocabulary-unified.json`
- **Schema**: Data follows the `VocabularyItem` interface defined in `src/lib/types/vocabulary.ts`

### Data Loading (`src/lib/data/loader.ts`)
- **Singleton Pattern**: The `DataLoader` class ensures data is fetched only once and cached in memory
- **Performance**: Large datasets are indexed by ID and Category on load
- **Validation**: Zod schema validation ensures data integrity

### Data Validation Pipeline
1. **Schema Validation**: Zod validation of raw JSON data
2. **Deduplication**: Remove duplicate vocabulary items
3. **Cleaning**: Normalize data formats and handle missing fields
4. **Indexing**: Create indexes for fast querying

## 5. Directory Structure
```
/
├── src/
│   ├── lib/
│   │   ├── components/   # UI Components (Atomic Design principles)
│   │   │   ├── ui/       # Atomic components (buttons, dialogs)
│   │   │   ├── flashcard/ # Flashcard components
│   │   │   ├── gamification/ # Gamification components
│   │   │   └── LessonCard.svelte # Lesson display component
│   │   ├── data/         # Data loading & processing logic
│   │   │   ├── db.svelte.ts # Vocabulary database service
│   │   │   └── loader.ts # Data loading service
│   │   ├── schemas/      # Zod validation schemas
│   │   │   ├── vocabulary.ts # Vocabulary schema
│   │   │   ├── voccard.ts # Vocabulary card schema
│   │   │   └── lesson.ts # Lesson schema
│   │   ├── services/     # Business logic services
│   │   │   └── lesson.ts # Lesson generation service
│   │   ├── state/        # Global state managers (Svelte Runes)
│   │   └── types/        # TypeScript interfaces & types
│   └── routes/           # SvelteKit File-based routing
├── static/
│   └── data/             # Static JSON datasets
└── docs/                 # Project documentation
    ├── architecture/     # Technical architecture documentation
    ├── development/      # Development and contribution guides
    ├── roadmap/          # Project roadmap and planning
    ├── design/           # Design and UX documentation
    └── ci-cd/            # CI/CD and deployment documentation
```

## 6. Lesson Planning System
The lesson planning system provides comprehensive lesson generation capabilities:

### Core Components
- **Lesson Schema** (`src/lib/schemas/lesson.ts`): Zod validation schema
- **Lesson Service** (`src/lib/services/lesson.ts`): Business logic for lesson generation
- **LessonCard Component** (`src/lib/components/LessonCard.svelte`): Interactive UI component
- **Lesson Page** (`src/routes/lessons/+page.svelte`): Lesson browsing interface

### Key Features
- **Criteria-Based Generation**: Lessons generated based on difficulty, category, part of speech
- **Learning Objectives**: Automatically generated objectives based on content
- **Interactive UI**: Flip animation, progress tracking, responsive design
- **Accessibility**: WCAG 2.1 AA compliant components
- **Performance**: Optimized data loading and rendering

## 7. Coding Standards
- **Runes First**: Always prefer `$state` over `writable` stores
- **Type Safety**: strict TypeScript configuration. No `any` unless absolutely necessary
- **Components**: Use Svelte 5 Snippets for reusable UI logic
- **CSS**: Utility-first with Tailwind. encapsulate complex styles in `@layer components`
- **Accessibility**: All components must follow WCAG 2.1 AA standards
- **Performance**: Optimize for <100ms response times

## 8. Testing Strategy
### Testing Pyramid
- **Unit Tests (70%)**: Vitest for business logic and services
- **Component Tests (20%)**: Playwright CT for UI components in isolation
- **E2E Tests (10%)**: Playwright for critical user flows

### Key Focus Areas
- **Data Validation**: Comprehensive schema validation tests
- **State Management**: Edge cases and error handling
- **Accessibility**: axe-core integration for WCAG compliance
- **Visual Regression**: Playwright snapshot testing

## 9. CI/CD Pipeline
### Pipeline Stages
1. **Lint & Format**: ESLint and Prettier checks
2. **Unit Tests**: Vitest coverage (95% target)
3. **Component Tests**: Playwright CT (80% target)
4. **E2E Tests**: Critical path testing
5. **Accessibility Audit**: axe-core integration
6. **Build & Deploy**: GitHub Pages deployment

### Quality Gates
- No linting errors
- 95% unit test coverage
- 80% component test coverage
- No critical accessibility violations
- Successful build

## 10. Strategic Roadmap
### Current Status
- **Lesson Planning System**: 100% complete and integrated
- **Data Architecture**: Robust validation pipeline with 541 validated vocabulary items
- **UI Components**: Accessible, responsive components
- **Documentation**: Comprehensive architecture and development guides

### Next Phase Development
1. **Quiz System**: Interactive assessment functionality
2. **User Progress Tracking**: Mastery and completion tracking
3. **Accessibility Testing**: Playwright + axe-core integration
4. **Dependency Management**: Dependabot and Renovate configuration
5. **Enhanced Gamification**: Badges, achievements, and leaderboards

## 11. Documentation Structure
The `/docs` directory follows a structured organization:

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
│   ├── LESSON_SYSTEM.md    # Lesson planning system documentation
│   ├── COMPONENT_GUIDE.md  # Component development guidelines
│   ├── TESTING.md          # Testing strategy and guidelines
│   └── BEST_PRACTICES.md   # Coding best practices
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
└── archive/                # Archived documentation (read-only)
```

## 12. Key Architectural Decisions
1. **Svelte 5 Runes**: Chosen for modern reactive state management
2. **Static Hosting**: GitHub Pages for cost-effective, scalable deployment
3. **Zod Validation**: Runtime data validation for data integrity
4. **Atomic Design**: Component organization for reusability and maintainability
5. **Defensive Programming**: Comprehensive error handling and validation
6. **Accessibility First**: WCAG 2.1 AA compliance from the start
7. **Performance by Default**: Optimized data loading and rendering