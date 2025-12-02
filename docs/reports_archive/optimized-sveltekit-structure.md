# Optimized SvelteKit Directory Structure Design

## Target Structure Overview

The optimized structure flattens the repository by moving the SvelteKit application to the root level while centralizing all data and maintaining clean separation of concerns.

## Complete Target Directory Tree

```
bulgarian-german-learning-app/
├── .github/                          # GitHub workflows and templates
├── .svelte-kit/                      # SvelteKit generated files
├── build/                            # Build output (GitHub Pages)
├── coverage/                         # Test coverage reports
├── docs/
│   ├── reports_archive/              # Loose report files archive
│   │   ├── audit/
│   │   │   ├── data-schema.md
│   │   │   ├── documentation-inventory.md
│   │   │   ├── javascript-inventory.md
│   │   │   ├── phase-3-cleanup-status.md
│   │   │   ├── refactoring-roadmap.md
│   │   │   ├── scss-inventory.md
│   │   │   ├── security-dependency.md
│   │   │   ├── static-assets-inventory.md
│   │   │   ├── templates-inventory.md
│   │   │   └── test-coverage.md
│   │   ├── deployment/
│   │   │   └── GITHUB_PAGES_SETUP.md
│   │   ├── development/
│   │   │   └── BEST_PRACTICES.md
│   │   ├── frameworks/
│   │   │   └── HUGO_COMPLETE_GUIDE.md
│   │   ├── guides/
│   │   │   └── AI_DEVELOPMENT.md
│   │   ├── sources/
│   │   │   ├── content-sources.md
│   │   │   └── verified-sources.md
│   │   ├── testing/
│   │   │   ├── ACCESSIBILITY_REMEDIATION_PLAN.md
│   │   │   ├── ACCESSIBILITY_TESTING_GUIDE.md
│   │   │   ├── MCP_FUNCTIONAL_TESTING_PLAN.md
│   │   │   └── SVELTE5_TESTING_ROADMAP.md
│   │   └── vocabulary/
│   │       ├── CONTENT_ENRICHMENT_STRATEGY.md
│   │       ├── DEDUPLICATION_REPORT.md
│   │       ├── EXTRA_NOTES_OPTIMIZATION_GUIDE.md
│   │       ├── German Bulgarian A1-C2 Research.md
│   │       ├── IMPLEMENTATION_CHECKLIST.md
│   │       ├── PROGRESS_TRACKER.md
│   │       ├── README.md
│   │       ├── ROADMAP_SUMMARY.md
│   │       ├── VOCABULARY_API_ARCHITECTURE.md
│   │       ├── VOCABULARY_API_ENHANCEMENT_PLAN.md
│   │       ├── VOCABULARY_AUDIT_2025.md
│   │       ├── VOCABULARY_COMPLETE_GUIDE.md
│   │       ├── VOCABULARY_IMPROVEMENT_ROADMAP.md
│   │       └── vocabulary-splitting-summary.md
│   ├── API_DOCUMENTATION.md
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── ci-cd-optimization.md
│   ├── ci-pipeline-svelte5-fix.md
│   ├── COMPREHENSIVE_AUDIT_SUMMARY_2025.md
│   ├── content-development-plan-A2-B2.md
│   ├── IMPLEMENTATION_ACHIEVEMENT_BADGES.md
│   ├── IMPLEMENTATION_AUDIO_PRONUNCIATION.md
│   ├── IMPLEMENTATION_DAILY_STREAKS.md
│   ├── IMPLEMENTATION_ONBOARDING_TUTORIAL.md
│   ├── IMPLEMENTATION_ROADMAP_2025.md
│   ├── IMPLEMENTATION_STATISTICS_DASHBOARD.md
│   ├── MIGRATION_TO_SVELTEKIT.md
│   ├── NEXT_PHASE_PLAN.md
│   ├── PHASE1_CRITICAL_FIXES_PLAN.md
│   ├── PHASE1_IMPLEMENTATION_GUIDE.md
│   ├── phase1-test-results.md
│   ├── PROGRAMMING_LINKS.md
│   ├── PROJECT_OVERVIEW.md
│   ├── README.md
│   ├── SESSION_COMPLETION_SUMMARY.md
│   ├── TECH_DEBT.md
│   ├── TECHNICAL_DEBT_REMEDIATION_STRATEGY.md
│   ├── text-to-speech-implementation.md
│   ├── THEME_MIGRATION_GUIDE.md
│   ├── UX_EVALUATION_LANGUAGE_LEARNING.md
│   └── workbox-implementation.md
├── node_modules/                     # Dependencies
├── playwright-report/                # Playwright test reports
├── pseudocode/                       # Algorithm pseudocode
│   ├── IMPLEMENTATION_GUIDE.md
│   ├── README.md
│   ├── core/
│   │   ├── enhanced-models.pseudo
│   │   ├── enhanced-services.pseudo
│   │   ├── models.pseudo
│   │   └── services.pseudo
│   └── hugo/
│       ├── architecture.pseudo
│       ├── deployment.pseudo
│       ├── go-backend.pseudo
│       └── templates.pseudo
├── scripts/                          # Build and utility scripts
├── src/                              # SvelteKit source code
│   ├── app.d.ts                      # App-level type definitions
│   ├── app.html                      # HTML template
│   ├── lib/                          # Shared library code
│   │   ├── data/                     # Centralized data storage
│   │   │   ├── vocabulary/           # Vocabulary data files
│   │   │   │   ├── vocabulary.json   # Main vocabulary dataset
│   │   │   │   ├── vocab/
│   │   │   │   │   ├── A1-A1.json
│   │   │   │   │   ├── adjektive-A1.json
│   │   │   │   │   ├── adverbien.json
│   │   │   │   │   ├── aktivitäten.json
│   │   │   │   │   ├── ausdruck.json
│   │   │   │   │   ├── begrüßung.json
│   │   │   │   │   ├── berufe.json
│   │   │   │   │   ├── bildung.json
│   │   │   │   │   ├── einkauf.json
│   │   │   │   │   ├── essen.json
│   │   │   │   │   ├── familie.json
│   │   │   │   │   ├── farben.json
│   │   │   │   │   ├── fragewörter.json
│   │   │   │   │   ├── gegenstände-A1.json
│   │   │   │   │   ├── gesundheit.json
│   │   │   │   │   ├── grammatik.json
│   │   │   │   │   ├── haus.json
│   │   │   │   │   ├── kleidung.json
│   │   │   │   │   ├── körper.json
│   │   │   │   │   ├── lebensmittel.json
│   │   │   │   │   ├── natur.json
│   │   │   │   │   ├── orte.json
│   │   │   │   │   ├── pronomen.json
│   │   │   │   │   ├── quantor.json
│   │   │   │   │   ├── substantiv.json
│   │   │   │   │   ├── substantive-A1.json
│   │   │   │   │   ├── technologie.json
│   │   │   │   │   ├── tiere.json
│   │   │   │   │   ├── transport.json
│   │   │   │   │   ├── unterhaltung.json
│   │   │   │   │   ├── verb.json
│   │   │   │   │   ├── verben-A1.json
│   │   │   │   │   ├── wetter.json
│   │   │   │   │   ├── zahl.json
│   │   │   │   │   ├── zahlen-A1.json
│   │   │   │   │   └── zeit-A1.json
│   │   │   │   └── cultural-grammar.json
│   │   │   ├── grammar/              # Grammar content and data
│   │   │   │   ├── content/          # Grammar lesson content
│   │   │   │   │   ├── _index.md
│   │   │   │   │   ├── comparative-superlative.md
│   │   │   │   │   ├── definite-article.md
│   │   │   │   │   ├── food-and-shopping-vocabulary.md
│   │   │   │   │   ├── future-tenses-intentions.md
│   │   │   │   │   ├── gender-of-nouns.md
│   │   │   │   │   ├── modal-verbs-comparison.md
│   │   │   │   │   ├── past-tenses-detailed.md
│   │   │   │   │   ├── past-tenses.md
│   │   │   │   │   ├── present-and-future-tenses.md
│   │   │   │   │   ├── pronouns-and-cases.md
│   │   │   │   │   ├── quantifiers-and-numbers.md
│   │   │   │   │   ├── reflexive-verbs-comparison.md
│   │   │   │   │   ├── singular-and-plural.md
│   │   │   │   │   ├── time-expressions.md
│   │   │   │   │   ├── travel-and-directions.md
│   │   │   │   │   ├── verb-aspects-and-tenses.md
│   │   │   │   │   └── word-order.md
│   │   │   │   └── analysis/          # Grammar analysis data
│   │   │   │       └── grammar-analysis-2025-11-13.json
│   │   │   ├── content/                # General content
│   │   │   │   ├── _index.md
│   │   │   │   ├── about.md
│   │   │   │   ├── methodology.md
│   │   │   │   ├── offline.md
│   │   │   │   ├── practice.md
│   │   │   │   ├── principles.md
│   │   │   │   ├── progress.md
│   │   │   │   ├── test-flashcards.md
│   │   │   │   ├── test-hugo-go.md
│   │   │   │   ├── test-vocab-inline.md
│   │   │   │   ├── vocab-tools.md
│   │   │   │   └── Vocabulary_Resources_Research_Plan.md
│   │   │   ├── practice/               # Practice content
│   │   │   │   ├── _index.md
│   │   │   │   ├── markdown-flashcards.md
│   │   │   │   └── test-shortcode.md
│   │   │   └── vocabulary/             # Vocabulary content
│   │   │       ├── _index.md
│   │   │       ├── communication-tech-a2.md
│   │   │       ├── daily-routines-time-a2.md
│   │   │       ├── food-dining-a2.md
│   │ │   │       ├── health-wellness-a2.md
│   │   │       ├── housing-living-a2.md
│   │   │       ├── shopping-money-a2.md
│   │   │       ├── travel-transportation-a2.md
│   │   │       └── work-education-a2.md
│   │   ├── api/                        # API utilities
│   │   │   └── vocabulary.ts
│   │   ├── assets/                     # Static assets
│   │   │   └── favicon.svg
│   │   ├── components/                 # Reusable Svelte components
│   │   │   ├── EnhancedFlashcard.svelte
│   │   │   ├── ErrorBoundary.svelte
│   │   │   ├── Flashcard.svelte
│   │   │   ├── GradeControls.svelte
│   │   │   ├── LoadingSpinner.svelte
│   │   │   ├── MarkdownLayout.svelte
│   │   │   ├── ProgressIndicator.svelte
│   │   │   ├── SessionStats.svelte
│   │   │   └── VirtualList.svelte
│   │   ├── stores/                     # Svelte stores
│   │   │   ├── flashcard.ts
│   │   │   └── rune-based-flashcard.ts
│   │   ├── types/                      # TypeScript type definitions
│   │   │   └── index.ts
│   │   └── utils/                      # Utility functions
│   │       ├── common.ts
│   │       ├── error-handling.ts
│   │       ├── performance.ts
│   │       ├── posts.ts
│   │       ├── spaced-repetition.ts
│   │       ├── validation.ts
│   │       ├── virtual-scrolling.ts
│   │       └── vocabulary-performance.ts
│   └── routes/                         # SvelteKit routes
│       ├── api/                        # API routes
│       │   └── vocabulary/             # Vocabulary API endpoints
│       │       ├── +server.ts
│       │       ├── chunk/
│       │       │   └── [chunkName]/
│       │       │       └── +server.ts
│       │       ├── due/
│       │       │   └── +server.ts
│       │       ├── filtered/
│       │       │   └── +server.ts
│       │       ├── metadata/
│       │       │   └── +server.ts
│       │       └── search/
│       │           └── +server.ts
│       ├── lessons/                    # Lessons routes
│       │   ├── +page.svelte
│       │   ├── +page.ts
│       │   └── [slug]/
│       │       ├── +page.svelte
│       │       └── +page.ts
│       ├── practice/                   # Practice routes
│       │   ├── +page.svelte
│       │   └── +page.ts
│       ├── +layout.js                  # Root layout configuration
│       ├── +layout.svelte              # Root layout component
│       └── +page.svelte                # Home page
├── static/                             # Static assets
│   └── robots.txt
├── tests/                              # Test files
│   ├── accessibility/                  # Accessibility tests
│   ├── components/                     # Component tests
│   ├── e2e/                           # End-to-end tests
│   ├── integration/                    # Integration tests
│   ├── unit/                          # Unit tests
│   ├── visual/                        # Visual regression tests
│   ├── debug-*.test.ts                # Debug test files
│   └── setup.ts                       # Test setup
├── .env.example                        # Environment variables template
├── .eslintrc.json                      # ESLint configuration
├── .gitignore                          # Git ignore rules
├── .npmrc                              # NPM configuration
├── .prettierignore                     # Prettier ignore rules
├── .prettierrc.json                    # Prettier configuration
├── build-config.cjs                    # Build configuration
├── coverage.config.js                  # Coverage configuration
├── DEPLOYMENT.md                       # Deployment documentation
├── package-lock.json                   # NPM lock file
├── package.json                        # NPM package configuration
├── playwright-ct-simple.config.ts      # Playwright component test config
├── playwright-ct.config.ts             # Playwright component test config
├── playwright.config.ts                # Playwright configuration
├── README.md                           # Project documentation
├── SECURITY.md                         # Security documentation
├── svelte.config.js                    # SvelteKit configuration
├── tsconfig.json                       # TypeScript configuration
├── vite.component-test.config.ts       # Vite component test config
├── vite.config.ts                      # Vite configuration
└── vitest.config.ts                    # Vitest configuration
```

## Key Design Decisions

### 1. Data Centralization Strategy

All data files are consolidated under `src/lib/data/` for easy access via SvelteKit's `$lib` alias:

- **Vocabulary Data**: `src/lib/data/vocabulary/` - Contains all vocabulary JSON files
- **Grammar Content**: `src/lib/data/grammar/content/` - Grammar lesson markdown files
- **General Content**: `src/lib/data/content/` - General content markdown files
- **Practice Content**: `src/lib/data/practice/` - Practice-related content
- **Vocabulary Content**: `src/lib/data/vocabulary/` - Vocabulary lesson content

### 2. Archive Strategy

Loose report files are organized in `docs/reports_archive/` with logical categorization:

- **Audit Reports**: Technical audits and analysis
- **Deployment Guides**: Deployment-related documentation
- **Development Guides**: Development best practices
- **Framework Documentation**: Framework-specific guides
- **Testing Documentation**: Testing strategies and plans
- **Vocabulary Documentation**: Vocabulary-related reports

### 3. Configuration Updates

The structure maintains all necessary configuration files at the root level:

- **SvelteKit Config**: `svelte.config.js` - Already optimized for static deployment
- **Vite Config**: `vite.config.ts` - Comprehensive build and test configuration
- **TypeScript Config**: `tsconfig.json` - TypeScript compilation settings
- **Testing Configs**: Multiple Playwright and Vitest configurations
- **Code Quality**: ESLint, Prettier, and Stylelint configurations

### 4. Build Process Optimization

The structure supports streamlined build processes:

- **Static Deployment**: Configured for GitHub Pages with adapter-static
- **Test Coverage**: Comprehensive testing with multiple test types
- **Code Quality**: Automated linting and formatting
- **Performance**: Optimized for client-side performance

### 5. Import Path Optimization

All data imports use SvelteKit's `$lib` alias for clean, consistent imports:

```typescript
// Vocabulary data
import vocabularyData from '$lib/data/vocabulary/vocabulary.json';

// Grammar content
import grammarContent from '$lib/data/grammar/content/definite-article.md';

// Utilities
import { spacedRepetition } from '$lib/utils/spaced-repetition';
```

## Migration Benefits

1. **Flattened Structure**: Eliminates the nested `svelte-frontend/` directory
2. **Centralized Data**: All data accessible via `$lib` imports
3. **Clean Separation**: Logical organization of code, data, and documentation
4. **AI-Friendly**: Optimized structure for AI coding assistants
5. **Developer Experience**: Standard SvelteKit conventions
6. **Git History**: Preserved through `git mv` operations
7. **Backward Compatibility**: Maintained import paths and functionality

## Migration Strategy

1. Use `git mv` to preserve history during file moves
2. Update import paths to use `$lib` alias
3. Consolidate configuration files at root level
4. Archive loose documentation files
5. Update build scripts and CI/CD pipelines
6. Test all functionality post-migration