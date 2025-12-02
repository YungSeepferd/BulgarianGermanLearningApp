# Path Mapping Strategy for SvelteKit Optimization

## Overview

This document outlines the comprehensive path mapping strategy for migrating existing imports to the optimized SvelteKit structure, ensuring backward compatibility while leveraging SvelteKit's `$lib` alias system.

## Current Import Path Analysis

### Existing Import Patterns

#### Root Level Imports (Current)
```typescript
// From root package.json scripts
import { someUtility } from './scripts/utils.js';
import vocabularyData from './data/vocabulary.json';
import grammarContent from './content/grammar/definite-article.md';
```

#### Svelte-Frontend Imports (Current)
```typescript
// From svelte-frontend/src/
import { apiCall } from '../../../data/api.js';
import { vocabularyService } from '../../lib/api/vocabulary.js';
import content from '../../lib/content/about.md';
```

#### Cross-Directory Imports (Current)
```typescript
// Navigating between directories
import { validateData } from '../../../../scripts/validation.js';
import config from '../../../data/config.json';
```

## Target Import Path Strategy

### 1. SvelteKit $lib Alias System

#### Centralized Data Imports
```typescript
// Vocabulary data imports
import vocabularyData from '$lib/data/vocabulary/vocabulary.json';
import categoryData from '$lib/data/vocabulary/vocab/essen.json';

// Grammar content imports
import grammarLesson from '$lib/data/grammar/content/definite-article.md';
import grammarAnalysis from '$lib/data/grammar/analysis/grammar-analysis-2025-11-13.json';

// General content imports
import aboutContent from '$lib/data/content/about.md';
import methodologyContent from '$lib/data/content/methodology.md';

// Practice content imports
import practiceGuide from '$lib/data/practice/markdown-flashcards.md';

// Vocabulary content imports
import vocabLesson from '$lib/data/vocabulary/content/food-dining-a2.md';
```

#### Utility and Service Imports
```typescript
// API utilities
import { vocabularyApi } from '$lib/api/vocabulary.js';

// Store imports
import { flashcardStore } from '$lib/stores/flashcard.js';
import { runeStore } from '$lib/stores/rune-based-flashcard.js';

// Utility imports
import { spacedRepetition } from '$lib/utils/spaced-repetition.js';
import { errorHandler } from '$lib/utils/error-handling.js';
import { performanceMonitor } from '$lib/utils/performance.js';
```

#### Component Imports
```typescript
// Component imports
import Flashcard from '$lib/components/Flashcard.svelte';
import EnhancedFlashcard from '$lib/components/EnhancedFlashcard.svelte';
import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
```

### 2. Import Utility Functions

#### Data Access Utilities
```typescript
// src/lib/utils/data-access.ts
export async function loadVocabularyData() {
  const module = await import('$lib/data/vocabulary/vocabulary.json');
  return module.default;
}

export async function loadVocabularyCategory(category: string) {
  const module = await import(`$lib/data/vocabulary/vocab/${category}.json`);
  return module.default;
}

export async function loadGrammarContent(slug: string) {
  const module = await import(`$lib/data/grammar/content/${slug}.md`);
  return module.default;
}

export async function loadContent(type: 'about' | 'methodology' | 'principles') {
  const module = await import(`$lib/data/content/${type}.md`);
  return module.default;
}

export async function loadPracticeContent(slug: string) {
  const module = await import(`$lib/data/practice/${slug}.md`);
  return module.default;
}

export async function loadVocabularyLesson(slug: string) {
  const module = await import(`$lib/data/vocabulary/content/${slug}.md`);
  return module.default;
}
```

#### Batch Data Loading
```typescript
// src/lib/utils/batch-data-loader.ts
export async function loadMultipleVocabularyCategories(categories: string[]) {
  const promises = categories.map(category => 
    import(`$lib/data/vocabulary/vocab/${category}.json`)
  );
  const results = await Promise.all(promises);
  return results.map(r => r.default);
}

export async function loadMultipleGrammarLessons(slugs: string[]) {
  const promises = slugs.map(slug => 
    import(`$lib/data/grammar/content/${slug}.md`)
  );
  const results = await Promise.all(promises);
  return results.map(r => r.default);
}
```

### 3. Type-Safe Import Wrappers

#### Typed Data Access
```typescript
// src/lib/types/data-imports.ts
import type { VocabularyItem } from '$lib/types/vocabulary.js';
import type { GrammarLesson } from '$lib/types/grammar.js';

export interface DataImportResult<T> {
  data: T;
  metadata: {
    loadedAt: Date;
    source: string;
    size: number;
  };
}

// Typed import functions
export async function loadVocabularyDataTyped(): Promise<DataImportResult<VocabularyItem[]>> {
  const module = await import('$lib/data/vocabulary/vocabulary.json');
  return {
    data: module.default as VocabularyItem[],
    metadata: {
      loadedAt: new Date(),
      source: 'vocabulary.json',
      size: JSON.stringify(module.default).length
    }
  };
}
```

## Migration Strategy by File Type

### 1. Route Files Migration

#### API Routes
```typescript
// Before: src/routes/api/vocabulary/+server.ts
import vocabularyData from '../../../../data/vocabulary.json';

// After: src/routes/api/vocabulary/+server.ts
import vocabularyData from '$lib/data/vocabulary/vocabulary.json';
// Or using utility:
import { loadVocabularyData } from '$lib/utils/data-access.js';
```

#### Page Routes
```typescript
// Before: src/routes/lessons/[slug]/+page.ts
import content from '../../../lib/content/grammar/definite-article.md';

// After: src/routes/lessons/[slug]/+page.ts
import { loadGrammarContent } from '$lib/utils/data-access.js';

export async function load({ params }) {
  const content = await loadGrammarContent(params.slug);
  return { content };
}
```

### 2. Component Files Migration

#### Svelte Components
```typescript
// Before: src/lib/components/Flashcard.svelte
import { spacedRepetition } from '../../utils/spaced-repetition.js';
import vocabularyData from '../../../data/vocabulary.json';

// After: src/lib/components/Flashcard.svelte
import { spacedRepetition } from '$lib/utils/spaced-repetition.js';
import vocabularyData from '$lib/data/vocabulary/vocabulary.json';
```

#### Store Files
```typescript
// Before: src/lib/stores/flashcard.ts
import { calculateNextReview } from '../../utils/spaced-repetition.js';

// After: src/lib/stores/flashcard.ts
import { calculateNextReview } from '$lib/utils/spaced-repetition.js';
```

### 3. Test Files Migration

#### Unit Tests
```typescript
// Before: tests/components/Flashcard.test.ts
import Flashcard from '../../svelte-frontend/src/lib/components/Flashcard.svelte';
import { vocabularyService } from '../../svelte-frontend/src/lib/api/vocabulary.js';

// After: tests/components/Flashcard.test.ts
import Flashcard from '$lib/components/Flashcard.svelte';
import { vocabularyService } from '$lib/api/vocabulary.js';
```

#### Integration Tests
```typescript
// Before: tests/integration/vocabulary-api.test.ts
import { loadVocabulary } from '../../../svelte-frontend/src/lib/api/vocabulary.js';

// After: tests/integration/vocabulary-api.test.ts
import { loadVocabulary } from '$lib/api/vocabulary.js';
```

## Backward Compatibility Strategy

### 1. Legacy Import Shims

#### Temporary Compatibility Layer
```typescript
// src/lib/compat/legacy-imports.ts
// Temporary shims for backward compatibility during migration

// Shim for old data imports
export { default as vocabularyData } from '$lib/data/vocabulary/vocabulary.json';
export { default as culturalGrammar } from '$lib/data/grammar/cultural-grammar.json';

// Shim for old content imports
export { default as aboutContent } from '$lib/data/content/about.md';
export { default as methodologyContent } from '$lib/data/content/methodology.md';

// Shim for old utility imports
export { spacedRepetition } from '$lib/utils/spaced-repetition.js';
export { errorHandler } from '$lib/utils/error-handling.js';
```

#### Migration Warning System
```typescript
// src/lib/compat/migration-warnings.ts
const migrationWarnings = new Set<string>();

export function warnLegacyImport(importPath: string, suggestedPath: string) {
  const warning = `Legacy import detected: ${importPath}. Please migrate to: ${suggestedPath}`;
  
  if (!migrationWarnings.has(warning)) {
    console.warn(`[MIGRATION WARNING] ${warning}`);
    migrationWarnings.add(warning);
  }
}
```

### 2. Gradual Migration Approach

#### Phase 1: Dual Import Support
```typescript
// Support both old and new import styles
// Old style (still works during transition)
import vocabData from '../../../data/vocabulary.json';

// New style (recommended)
import vocabData from '$lib/data/vocabulary/vocabulary.json';
```

#### Phase 2: Deprecation Notices
```typescript
// Add deprecation warnings for old imports
import { warnLegacyImport } from '$lib/compat/migration-warnings.js';

// In legacy import locations
warnLegacyImport(
  '../../../data/vocabulary.json',
  '$lib/data/vocabulary/vocabulary.json'
);
```

#### Phase 3: Complete Migration
```typescript
// Remove legacy import paths
// Update all imports to use $lib alias
// Remove compatibility shims
```

## Import Path Validation

### 1. Automated Import Checking

#### Import Path Validator
```typescript
// scripts/validate-imports.js
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

const IMPORT_REGEX = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
const DYNAMIC_IMPORT_REGEX = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

async function validateImports() {
  const files = await glob('src/**/*.{js,ts,svelte}');
  const issues = [];
  
  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const imports = [...content.matchAll(IMPORT_REGEX)];
    const dynamicImports = [...content.matchAll(DYNAMIC_IMPORT_REGEX)];
    
    for (const [_, importPath] of [...imports, ...dynamicImports]) {
      if (importPath.startsWith('..') && importPath.includes('data/')) {
        issues.push({
          file,
          importPath,
          suggestion: importPath.replace(/^\.\.\/.*data\//, '$lib/data/'),
          severity: 'error'
        });
      }
      
      if (importPath.startsWith('..') && importPath.includes('content/')) {
        issues.push({
          file,
          importPath,
          suggestion: importPath.replace(/^\.\.\/.*content\//, '$lib/data/'),
          severity: 'error'
        });
      }
    }
  }
  
  return issues;
}
```

### 2. TypeScript Path Mapping Validation

#### TypeScript Configuration Check
```typescript
// scripts/validate-tsconfig.js
import tsconfig from './tsconfig.json' assert { type: 'json' };

function validatePathMappings() {
  const paths = tsconfig.compilerOptions.paths;
  const requiredPaths = [
    '$lib',
    '$lib/*',
    '$app/*'
  ];
  
  const missingPaths = requiredPaths.filter(path => !paths[path]);
  
  if (missingPaths.length > 0) {
    console.error('Missing TypeScript path mappings:', missingPaths);
    return false;
  }
  
  return true;
}
```

## Performance Optimization

### 1. Dynamic Import Strategy

#### Code Splitting for Large Data
```typescript
// Optimized dynamic imports
export async function loadVocabularyDataLazy() {
  const { default: data } = await import(
    /* webpackChunkName: "vocabulary-data" */
    '$lib/data/vocabulary/vocabulary.json'
  );
  return data;
}

export async function loadGrammarContentLazy(slug: string) {
  const { default: content } = await import(
    /* webpackChunkName: "grammar-content" */
    `$lib/data/grammar/content/${slug}.md`
  );
  return content;
}
```

#### Route-Based Code Splitting
```typescript
// src/routes/lessons/[slug]/+page.ts
export async function load({ params }) {
  // Dynamic import based on route parameter
  const contentModule = await import(
    /* webpackChunkName: "lesson-[slug]" */
    `$lib/data/grammar/content/${params.slug}.md`
  );
  
  return {
    content: contentModule.default,
    slug: params.slug
  };
}
```

### 2. Preloading Strategy

#### Critical Data Preloading
```typescript
// src/lib/utils/preload-data.ts
export function preloadCriticalData() {
  // Preload essential data for initial render
  Promise.all([
    import('$lib/data/vocabulary/vocabulary.json'),
    import('$lib/data/content/about.md'),
    import('$lib/data/grammar/content/_index.md')
  ]).then(() => {
    console.log('Critical data preloaded');
  });
}
```

#### Component-Level Preloading
```typescript
// src/lib/components/PreloadWrapper.svelte
import { onMount } from 'svelte';

onMount(() => {
  // Preload data for likely next navigation
  import('$lib/data/vocabulary/vocab/essen.json');
  import('$lib/data/grammar/content/past-tenses.md');
});
```

## Error Handling and Fallbacks

### 1. Graceful Import Failures

#### Import Error Handling
```typescript
// src/lib/utils/safe-imports.ts
export async function safeImport<T>(
  importFn: () => Promise<any>,
  fallback: T
): Promise<T> {
  try {
    const module = await importFn();
    return module.default || module;
  } catch (error) {
    console.error('Import failed:', error);
    return fallback;
  }
}

// Usage
const vocabularyData = await safeImport(
  () => import('$lib/data/vocabulary/vocabulary.json'),
  { vocabulary: [], metadata: {} }
);
```

### 2. Fallback Data Strategy

#### Default Data Providers
```typescript
// src/lib/utils/fallback-data.ts
const FALLBACK_VOCABULARY = {
  vocabulary: [],
  metadata: {
    version: '1.0.0',
    lastUpdated: new Date().toISOString()
  }
};

const FALLBACK_GRAMMAR_CONTENT = `# Grammar Lesson
This content is temporarily unavailable.
`;

export function getFallbackVocabulary() {
  return FALLBACK_VOCABULARY;
}

export function getFallbackGrammarContent() {
  return FALLBACK_GRAMMAR_CONTENT;
}
```

## Testing Import Paths

### 1. Import Path Test Suite

#### Comprehensive Import Tests
```typescript
// tests/import-paths.test.ts
import { describe, it, expect } from 'vitest';

describe('Import Paths', () => {
  it('should import vocabulary data via $lib', async () => {
    const module = await import('$lib/data/vocabulary/vocabulary.json');
    expect(module.default).toBeDefined();
    expect(Array.isArray(module.default.vocabulary)).toBe(true);
  });

  it('should import grammar content via $lib', async () => {
    const module = await import('$lib/data/grammar/content/definite-article.md');
    expect(module.default).toBeDefined();
    expect(typeof module.default).toBe('string');
  });

  it('should import utilities via $lib', async () => {
    const { spacedRepetition } = await import('$lib/utils/spaced-repetition.js');
    expect(spacedRepetition).toBeDefined();
    expect(typeof spacedRepetition).toBe('function');
  });

  it('should import components via $lib', async () => {
    const { default: Flashcard } = await import('$lib/components/Flashcard.svelte');
    expect(Flashcard).toBeDefined();
  });
});
```

### 2. Performance Testing

#### Import Performance Benchmarks
```typescript
// tests/import-performance.test.ts
import { describe, it, expect } from 'vitest';

describe('Import Performance', () => {
  it('should load vocabulary data within 100ms', async () => {
    const start = performance.now();
    const module = await import('$lib/data/vocabulary/vocabulary.json');
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(100);
    expect(module.default).toBeDefined();
  });

  it('should load grammar content within 50ms', async () => {
    const start = performance.now();
    const module = await import('$lib/data/grammar/content/definite-article.md');
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(50);
    expect(module.default).toBeDefined();
  });
});
```

## Migration Timeline

### Phase 1: Setup (Day 1)
- [ ] Create import utility functions
- [ ] Set up TypeScript path mappings
- [ ] Create compatibility shims
- [ ] Write import validation scripts

### Phase 2: Core Migration (Day 2-3)
- [ ] Migrate API routes
- [ ] Migrate main page routes
- [ ] Migrate core components
- [ ] Update utility imports

### Phase 3: Content Migration (Day 4-5)
- [ ] Migrate all data imports
- [ ] Migrate content imports
- [ ] Update test imports
- [ ] Validate all import paths

### Phase 4: Optimization (Day 6)
- [ ] Implement dynamic imports
- [ ] Add preloading strategies
- [ ] Optimize performance
- [ ] Remove compatibility shims

### Phase 5: Validation (Day 7)
- [ ] Run comprehensive tests
- [ ] Validate performance metrics
- [ ] Test deployment
- [ ] Update documentation

This path mapping strategy ensures a smooth transition to the optimized SvelteKit structure while maintaining code quality and performance.