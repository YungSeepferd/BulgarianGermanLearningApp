# Data Migration Strategy for SvelteKit Optimization

## Overview

This document outlines the comprehensive strategy for migrating and centralizing all data files into the optimized SvelteKit structure. The migration preserves Git history while consolidating data for easy `$lib` imports.

## Data Categories and Migration Paths

### 1. Vocabulary Data Migration

#### Current Locations:
- `data/vocabulary.json` (main vocabulary dataset)
- `data/vocab/*.json` (categorized vocabulary files)
- `svelte-frontend/data/vocabulary.json` (frontend copy)

#### Target Location:
- `src/lib/data/vocabulary/vocabulary.json` (consolidated main dataset)
- `src/lib/data/vocabulary/vocab/*.json` (categorized files)

#### Migration Commands:
```bash
# Create target directory structure
mkdir -p src/lib/data/vocabulary/vocab

# Move main vocabulary dataset
git mv data/vocabulary.json src/lib/data/vocabulary/

# Move categorized vocabulary files
git mv data/vocab/*.json src/lib/data/vocabulary/vocab/

# Remove duplicate frontend copy
git rm svelte-frontend/data/vocabulary.json
```

#### Import Path Updates:
```typescript
// Before (relative imports)
import vocabularyData from '../../../data/vocabulary.json';

// After ($lib imports)
import vocabularyData from '$lib/data/vocabulary/vocabulary.json';
```

### 2. Grammar Data Migration

#### Current Locations:
- `content/grammar/*.md` (grammar lesson content)
- `data/cultural-grammar.json` (grammar analysis data)
- `data/grammar-analysis/grammar-analysis-2025-11-13.json`

#### Target Locations:
- `src/lib/data/grammar/content/*.md` (grammar lessons)
- `src/lib/data/grammar/analysis/grammar-analysis-2025-11-13.json`

#### Migration Commands:
```bash
# Create target directory structure
mkdir -p src/lib/data/grammar/content
mkdir -p src/lib/data/grammar/analysis

# Move grammar content
git mv content/grammar/*.md src/lib/data/grammar/content/

# Move grammar analysis data
git mv data/cultural-grammar.json src/lib/data/grammar/
git mv data/grammar-analysis/grammar-analysis-2025-11-13.json src/lib/data/grammar/analysis/
```

### 3. General Content Migration

#### Current Locations:
- `content/*.md` (general content files)
- `content/api/vocabulary.md` (API documentation)

#### Target Locations:
- `src/lib/data/content/*.md` (general content)
- `src/lib/data/content/api/vocabulary.md` (API docs)

#### Migration Commands:
```bash
# Create target directory structure
mkdir -p src/lib/data/content/api

# Move general content
git mv content/*.md src/lib/data/content/

# Move API documentation
git mv content/api/vocabulary.md src/lib/data/content/api/
```

### 4. Practice Content Migration

#### Current Locations:
- `content/practice/*.md` (practice content)
- `practice/` directory (practice-related files)

#### Target Locations:
- `src/lib/data/practice/*.md` (practice content)

#### Migration Commands:
```bash
# Create target directory
mkdir -p src/lib/data/practice

# Move practice content
git mv content/practice/*.md src/lib/data/practice/
```

### 5. Vocabulary Content Migration

#### Current Locations:
- `content/vocabulary/*.md` (vocabulary lessons)

#### Target Locations:
- `src/lib/data/vocabulary/content/*.md` (vocabulary content)

#### Migration Commands:
```bash
# Create target directory
mkdir -p src/lib/data/vocabulary/content

# Move vocabulary content
git mv content/vocabulary/*.md src/lib/data/vocabulary/content/
```

## Data Consolidation Strategy

### 1. Duplicate Detection and Removal

Before migration, identify and consolidate duplicate files:

```bash
# Find potential duplicates
find data/ -name "*.json" -exec basename {} \; | sort | uniq -d
find content/ -name "*.md" -exec basename {} \; | sort | uniq -d

# Compare file contents for actual duplicates
fdupes -r data/ content/
```

### 2. Data Validation During Migration

Implement validation checks during migration:

```bash
# Validate JSON structure
for file in data/*.json; do
    jq empty "$file" || echo "Invalid JSON: $file"
done

# Validate markdown structure
for file in content/**/*.md; do
    markdownlint "$file" || echo "Markdown issues: $file"
done
```

### 3. Data Integrity Verification

Post-migration verification steps:

```bash
# Count files before and after
find data/ content/ -type f | wc -l
find src/lib/data/ -type f | wc -l

# Verify file sizes match
du -sh data/ content/
du -sh src/lib/data/

# Test data loading
npm run test:data-loading
```

## Import Path Standardization

### 1. Create Import Utilities

Create utility functions for consistent data access:

```typescript
// src/lib/utils/data-access.ts
export async function loadVocabularyData() {
  return import('$lib/data/vocabulary/vocabulary.json');
}

export async function loadGrammarContent(slug: string) {
  return import(`$lib/data/grammar/content/${slug}.md`);
}

export async function loadVocabularyCategory(category: string) {
  return import(`$lib/data/vocabulary/vocab/${category}.json`);
}
```

### 2. Update Component Imports

Systematically update all component imports:

```typescript
// Before
import vocabData from '../../../../data/vocabulary.json';

// After
import { loadVocabularyData } from '$lib/utils/data-access';
```

### 3. API Route Updates

Update API routes to use centralized data:

```typescript
// src/routes/api/vocabulary/+server.ts
import { loadVocabularyData } from '$lib/utils/data-access';

export async function GET() {
  const vocabulary = await loadVocabularyData();
  return json(vocabulary);
}
```

## Rollback Strategy

### 1. Pre-Migration Backup

Create comprehensive backups before migration:

```bash
# Create backup branch
git checkout -b pre-migration-backup

# Create archive of current state
tar -czf pre-migration-backup.tar.gz \
  data/ content/ svelte-frontend/src/lib/content/ \
  --exclude=data/archive-data-cleanup/ \
  --exclude=data/backups/
```

### 2. Staged Migration Approach

Implement migration in stages for easier rollback:

1. **Stage 1**: Vocabulary data only
2. **Stage 2**: Grammar content
3. **Stage 3**: General content
4. **Stage 4**: Practice content
5. **Stage 5**: Vocabulary content

### 3. Validation Checkpoints

Establish validation checkpoints after each stage:

```bash
# After each stage, run validation
npm run test:unit
npm run test:integration
npm run build
npm run check
```

## Performance Optimization

### 1. Data Chunking Strategy

For large datasets, implement chunking:

```typescript
// src/lib/utils/data-chunking.ts
export function chunkVocabularyData(data: any[], chunkSize: number = 1000) {
  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
}
```

### 2. Lazy Loading Implementation

Implement lazy loading for large content files:

```typescript
// src/lib/utils/lazy-loading.ts
export async function lazyLoadContent(path: string) {
  const module = await import(/* @vite-ignore */ `$lib/data/${path}`);
  return module.default;
}
```

### 3. Caching Strategy

Implement data caching for frequently accessed content:

```typescript
// src/lib/stores/data-cache.ts
import { writable } from 'svelte/store';

export const dataCache = writable(new Map());

export function cacheData(key: string, data: any) {
  dataCache.update(cache => {
    cache.set(key, data);
    return cache;
  });
}
```

## Testing Strategy

### 1. Data Loading Tests

Create comprehensive data loading tests:

```typescript
// tests/data-loading.test.ts
import { describe, it, expect } from 'vitest';

describe('Data Loading', () => {
  it('should load vocabulary data', async () => {
    const vocab = await import('$lib/data/vocabulary/vocabulary.json');
    expect(vocab.default).toBeDefined();
    expect(Array.isArray(vocab.default)).toBe(true);
  });

  it('should load grammar content', async () => {
    const grammar = await import('$lib/data/grammar/content/definite-article.md');
    expect(grammar.default).toBeDefined();
    expect(typeof grammar.default).toBe('string');
  });
});
```

### 2. Import Path Tests

Verify all import paths work correctly:

```typescript
// tests/import-paths.test.ts
import { loadVocabularyData, loadGrammarContent } from '$lib/utils/data-access';

describe('Import Paths', () => {
  it('should access vocabulary data via utility', async () => {
    const data = await loadVocabularyData();
    expect(data).toBeDefined();
  });

  it('should access grammar content via utility', async () => {
    const content = await loadGrammarContent('definite-article');
    expect(content).toBeDefined();
  });
});
```

## Timeline and Milestones

### Phase 1: Preparation (1 day)
- [ ] Create backup branch
- [ ] Validate current data integrity
- [ ] Set up migration scripts
- [ ] Test rollback procedures

### Phase 2: Vocabulary Migration (1 day)
- [ ] Migrate main vocabulary dataset
- [ ] Migrate categorized vocabulary files
- [ ] Update vocabulary-related imports
- [ ] Test vocabulary functionality

### Phase 3: Content Migration (1 day)
- [ ] Migrate grammar content
- [ ] Migrate general content
- [ ] Migrate practice content
- [ ] Migrate vocabulary content

### Phase 4: Validation and Testing (1 day)
- [ ] Run comprehensive tests
- [ ] Validate all import paths
- [ ] Test build process
- [ ] Verify deployment

### Phase 5: Cleanup and Optimization (1 day)
- [ ] Remove old data directories
- [ ] Optimize import utilities
- [ ] Update documentation
- [ ] Final validation

## Risk Mitigation

### 1. Data Loss Prevention
- Multiple backup strategies
- Staged migration approach
- Validation at each step

### 2. Import Path Issues
- Comprehensive testing
- Utility function abstraction
- Fallback mechanisms

### 3. Performance Impact
- Lazy loading implementation
- Data chunking for large files
- Caching strategies

### 4. Build Process Disruption
- Parallel build testing
- Configuration validation
- Rollback procedures

This migration strategy ensures a smooth transition to the optimized SvelteKit structure while preserving data integrity and maintaining application functionality.