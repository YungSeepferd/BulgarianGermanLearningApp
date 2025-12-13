# GitHub Copilot Space: Vocabulary Feature

**Last Updated**: 13 December 2025
**Status**: Active
**Feature**: Vocabulary Management and Search
**Context Scope**: High - Contains comprehensive context for vocabulary-related tasks

---

## 🎯 Purpose

This GitHub Copilot Space provides targeted, comprehensive context for working with the vocabulary feature of the Bulgarian-German Learning App. It enables Copilot to:

1. **Understand feature boundaries**: Contain context within the vocabulary domain
2. **Provide accurate suggestions**: Generate code that follows project patterns
3. **Answer feature-specific questions**: Respond to queries about vocabulary implementation
4. **Maintain consistency**: Ensure suggestions align with established patterns
5. **Reduce context pollution**: Focus on vocabulary-specific concerns

---

## 📚 Context Layers

### 1. Global Project Context
- Project overview and architecture
- Global coding standards
- State management principles
- Testing strategy

**Source**: [.github/copilot-instructions.md](/.github/copilot-instructions.md)

### 2. Feature-Specific Context
- Vocabulary feature architecture
- Data flow patterns
- Component structure
- State management patterns

**Source**: [.github/instructions/vocabulary-feature.md](/.github/instructions/vocabulary-feature.md)

### 3. Implementation Context
- Current code implementation
- Recent changes and updates
- Known issues and workarounds
- Future enhancement plans

**Source**: Files listed in [Key Files](#key-files) section

---

## 🗂️ Key Files

### Core Implementation Files
- [`src/lib/components/vocabulary/VocabularyCard.svelte`](src/lib/components/vocabulary/VocabularyCard.svelte) - Individual vocabulary item display
- [`src/lib/components/vocabulary/WordDetailModal.svelte`](src/lib/components/vocabulary/WordDetailModal.svelte) - Detailed word view
- [`src/lib/components/vocabulary/DefinitionLink.svelte`](src/lib/components/vocabulary/DefinitionLink.svelte) - Interactive definition display
- [`src/lib/components/vocabulary/EnrichmentBadge.svelte`](src/lib/components/vocabulary/EnrichmentBadge.svelte) - Enriched content indicator
- [`src/lib/state/vocabulary-state.svelte.ts`](src/lib/state/vocabulary-state.svelte.ts) - Vocabulary state management
- [`src/lib/data/vocabulary.ts`](src/lib/data/vocabulary.ts) - Vocabulary data loader
- [`src/lib/schemas/vocabulary.ts`](src/lib/schemas/vocabulary.ts) - Vocabulary schema validation

### Supporting Files
- [`src/lib/services/search.ts`](src/lib/services/search.ts) - Search functionality
- [`src/lib/utils/string-utils.ts`](src/lib/utils/string-utils.ts) - String normalization utilities
- [`tests/unit/vocabulary-state.test.ts`](tests/unit/vocabulary-state.test.ts) - State unit tests
- [`tests/components/VocabularyCard.test.ts`](tests/components/VocabularyCard.test.ts) - Component tests
- [`tests/e2e/vocabulary.test.ts`](tests/e2e/vocabulary.test.ts) - E2E tests

### Data Files
- [`data/unified-vocabulary.json`](data/unified-vocabulary.json) - Main vocabulary data
- [`data/category-whitelist.json`](data/category-whitelist.json) - Allowed categories
- [`enrichment-output/`](enrichment-output/) - Enrichment system output

---

## 🧩 Key Patterns and Examples

### 1. Direction-Aware Display Pattern

```svelte
<script lang="ts">
  // ✅ CORRECT: Direction-aware display pattern
  let { item, languageMode = 'DE_BG' } = $props();

  // Derived state for direction-aware display
  let sourceText = $derived(languageMode === 'DE_BG' ? item.german : item.bulgarian);
  let targetText = $derived(languageMode === 'DE_BG' ? item.bulgarian : item.german);
  let directionArrow = $derived(languageMode === 'DE_BG' ? '→' : '←');
</script>

<div class="vocabulary-item">
  <span class="source-text">{sourceText}</span>
  <span class="direction-arrow">{directionArrow}</span>
  <span class="target-text">{targetText}</span>
</div>
```

### 2. State Management Pattern

```typescript
// ✅ CORRECT: State management pattern
import { vocabularyState } from '$lib/state/vocabulary-state.svelte';

// Use state methods
vocabularyState.setSearchQuery('Hallo');
vocabularyState.toggleFavorite('123');

// Access state values
let filteredVocabulary = $derived(
  vocabularyState.vocabulary.filter(item =>
    item.german.toLowerCase().includes(vocabularyState.searchQuery.toLowerCase()) ||
    item.bulgarian.toLowerCase().includes(vocabularyState.searchQuery.toLowerCase())
  )
);
```

### 3. Search Implementation Pattern

```typescript
// ✅ CORRECT: Debounced search pattern
export function createDebouncedSearch() {
  let timeoutId: number | null = $state(null);

  return (query: string) => {
    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = window.setTimeout(() => {
      vocabularyState.setSearchQuery(query);
    }, 300);
  };
}
```

### 4. Data Validation Pattern

```typescript
// ✅ CORRECT: Data validation pattern
import { VocabularyItemSchema } from '$lib/schemas/vocabulary';

function processVocabularyItem(item: unknown) {
  try {
    return VocabularyItemSchema.parse(item);
  } catch (error) {
    ErrorHandler.handleError(error, 'vocabulary-validation', { item });
    return null;
  }
}
```

---

## 🚫 Anti-Patterns (What NOT to Do)

### 1. Hardcoded Language Direction

```svelte
<!-- ❌ WRONG: Hardcoded direction -->
<div class="vocabulary-item">
  <span>{item.german} → {item.bulgarian}</span>
</div>
```

### 2. Direct State Mutation

```typescript
// ❌ WRONG: Direct state mutation
vocabularyState.searchQuery = 'Hallo'; // Bypasses reactivity!
```

### 3. Missing Data Validation

```typescript
// ❌ WRONG: No data validation
function addVocabularyItem(item: any) {
  vocabularyState.addItem(item); // Unsafe!
}
```

### 4. Inefficient Search

```typescript
// ❌ WRONG: Inefficient search
function handleSearchInput(query: string) {
  // No debouncing - performance issues!
  vocabularyState.setSearchQuery(query);
}
```

### 5. Missing Error Handling

```typescript
// ❌ WRONG: No error handling
function loadVocabulary() {
  const data = JSON.parse(rawData); // No try/catch!
  vocabularyState.setVocabulary(data);
}
```

---

## 🔍 Common Issues and Solutions

| Issue | Root Cause | Solution |
|-------|------------|----------|
| Search not working with Cyrillic | Missing locale-aware normalization | Use `toLocaleLowerCase('bg')` and normalize diacritics |
| Language direction not persisting | Missing localStorage update | Update both `appState` and `localStorage` |
| Missing translations | Incomplete enrichment | Run `pnpm run enrich:vocabulary` |
| Performance issues with large datasets | No virtual scrolling | Implement `VirtualList` component |
| State not updating | Direct property assignment | Use state methods (`setSearchQuery`, etc.) |
| Schema validation errors | Data format mismatch | Run `pnpm run verify:vocabulary` and fix data |
| Accessibility issues | Missing ARIA attributes | Add proper ARIA attributes and screen reader text |

---

## 🧪 Testing Patterns

### Unit Test Example

```typescript
// tests/unit/vocabulary-state.test.ts
import { vocabularyState } from '$lib/state/vocabulary-state.svelte';
import { describe, it, expect } from 'vitest';

describe('Vocabulary State', () => {
  it('should initialize with empty search query', () => {
    expect(vocabularyState.searchQuery).toBe('');
  });

  it('should update search query', () => {
    vocabularyState.setSearchQuery('Hallo');
    expect(vocabularyState.searchQuery).toBe('Hallo');
  });

  it('should toggle favorite status', () => {
    vocabularyState.toggleFavorite('123');
    expect(vocabularyState.favorites.has('123')).toBe(true);

    vocabularyState.toggleFavorite('123');
    expect(vocabularyState.favorites.has('123')).toBe(false);
  });
});
```

### Component Test Example

```typescript
// tests/components/VocabularyCard.test.ts
import { test, expect } from '@playwright/experimental-ct-svelte';
import VocabularyCard from '$lib/components/vocabulary/VocabularyCard.svelte';

test('VocabularyCard displays content in correct direction', async ({ mount }) => {
  const component = await mount(VocabularyCard, {
    props: {
      item: {
        id: '1',
        german: 'Hallo',
        bulgarian: 'Здравей',
        partOfSpeech: 'noun',
        difficulty: 1,
        categories: ['greeting']
      },
      languageMode: 'DE_BG'
    }
  });

  // Verify DE→BG direction
  await expect(component).toContainText('Hallo → Здравей');

  // Change direction
  await component.update({
    props: {
      languageMode: 'BG_DE'
    }
  });

  // Verify BG→DE direction
  await expect(component).toContainText('Здравей ← Hallo');
});
```

### E2E Test Example

```typescript
// tests/e2e/vocabulary.test.ts
import { test, expect } from '@playwright/test';

test('Vocabulary search works in both languages', async ({ page }) => {
  await page.goto('/vocabulary');

  // Search in German
  await page.fill('input[placeholder="Suche nach Wörtern..."]', 'Hallo');
  await expect(page.locator('.vocabulary-item:first-child')).toContainText('Hallo → Здравей');

  // Switch to Bulgarian
  await page.click('button:has-text("BG")');

  // Verify search still works in Bulgarian
  await expect(page.locator('input[placeholder="Търсене на думи..."]')).toHaveValue('Hallo');
  await expect(page.locator('.vocabulary-item:first-child')).toContainText('Здравей ← Hallo');
});
```

---

## 🔗 Integration Points

### 1. Event Bus Integration

```typescript
// Subscribe to vocabulary events
import { eventBus } from '$lib/services/event-bus';

const unsubscribe = eventBus.subscribe('vocabulary-practice', (data) => {
  console.log(`Practicing word: ${data.itemId}`);
  // Update practice statistics or UI
});

// Emit vocabulary events
function startPractice(itemId: string) {
  eventBus.emit('vocabulary-practice', {
    itemId,
    timestamp: Date.now()
  });
}

// Cleanup
onDestroy(unsubscribe);
```

### 2. Global State Integration

```typescript
// src/lib/state/app-state.ts
import { vocabularyState } from './vocabulary-state.svelte';

class AppState {
  // ... other state

  get vocabulary() {
    return vocabularyState;
  }

  // Sync language mode with vocabulary state
  setLanguageMode(mode: 'DE_BG' | 'BG_DE') {
    this.languageMode = mode;
    vocabularyState.setLanguageMode(mode);
    localStorage.setItem('app-language-mode', mode);
  }
}
```

### 3. Enrichment System Integration

```typescript
// ✅ CORRECT: Enrichment integration
import { enrichVocabulary } from '$lib/services/enrichment-pipeline';

async function loadAndEnrichVocabulary() {
  const rawVocabulary = await loadVocabulary();
  const enrichedVocabulary = await enrichVocabulary(rawVocabulary);
  vocabularyState.setVocabulary(enrichedVocabulary);
}
```

---

## 🛠️ Enrichment System Commands

```bash
# Run full enrichment pipeline
pnpm run enrich:vocabulary

# Validate vocabulary without scraping
pnpm run enrich:vocabulary:validate

# Use cached enrichment data
pnpm run enrich:vocabulary:cache

# Dry run (preview changes)
pnpm run enrich:vocabulary:dry

# Test on single batch
pnpm run enrich:vocabulary:pilot
```

**Enrichment Workflow**:
1. **Scrape**: Fetch definitions and examples from Langenscheidt
2. **Validate**: Check for duplicates and format issues
3. **Merge**: Combine with existing vocabulary
4. **Report**: Generate markdown and JSON reports

---

## 🎨 UI Patterns

### 1. Vocabulary Card Design

```svelte
<div class="vocabulary-card" on:click={() => openDetail(item.id)}>
  <div class="main-content">
    <span class="source-text">{sourceText}</span>
    <span class="direction-arrow">{directionArrow}</span>
    <span class="target-text">{targetText}</span>
  </div>

  <div class="meta-info">
    <span class="part-of-speech">{item.partOfSpeech}</span>
    <span class="difficulty">
      {#each Array(item.difficulty) as _, i}
        ⭐
      {/each}
    </span>
    {#if item.isEnriched}
      <EnrichmentBadge />
    {/if}
  </div>
</div>

<style>
  .vocabulary-card {
    padding: 1rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .vocabulary-card:hover {
    background-color: var(--hover-bg);
    transform: translateY(-2px);
  }

  .main-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .source-text {
    font-weight: bold;
    font-size: 1.2rem;
  }

  .target-text {
    color: var(--secondary-text);
  }

  .meta-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: var(--muted-text);
  }
</style>
```

### 2. Accessible Vocabulary Item

```svelte
<div
  class="vocabulary-item"
  role="article"
  aria-label={`Vocabulary item: ${sourceText} ${directionArrow} ${targetText}`}
>
  <span class="source-text" aria-hidden="true">{sourceText}</span>
  <span class="direction-arrow" aria-hidden="true">{directionArrow}</span>
  <span class="target-text" aria-hidden="true">{targetText}</span>

  <!-- Screen reader-only text -->
  <span class="sr-only">
    {sourceText} in {languageMode === 'DE_BG' ? 'German' : 'Bulgarian'},
    {targetText} in {languageMode === 'DE_BG' ? 'Bulgarian' : 'German'}
  </span>
</div>

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
```

---

## 📈 Performance Optimization

### 1. Virtual Scrolling

```svelte
<script lang="ts">
  import { VirtualList } from '$lib/components/VirtualList.svelte';

  let filteredVocabulary = $derived(
    vocabularyState.vocabulary.filter(item =>
      normalizeForSearch(item.german).includes(normalizeForSearch(vocabularyState.searchQuery)) ||
      normalizeForSearch(item.bulgarian).includes(normalizeForSearch(vocabularyState.searchQuery))
    )
  );

  const getItemKey = (item: VocabularyItem) => item.id;
</script>

<VirtualList
  items={filteredVocabulary}
  itemSize={80}
  height={600}
  getKey={getItemKey}
>
  {#snippet renderItem({ item })}
    <VocabularyCard {item} languageMode={vocabularyState.languageMode} />
  {/snippet}
</VirtualList>
```

### 2. Memoization

```typescript
// ✅ CORRECT: Memoize expensive computations
import { memoize } from '$lib/utils/memoize';

const normalizeForSearch = memoize((text: string): string => {
  return text
    .toLocaleLowerCase('bg')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
});
```

### 3. Derived State

```svelte
<script lang="ts">
  // ✅ CORRECT: Use derived state for efficient filtering
  let filteredVocabulary = $derived(
    vocabularyState.vocabulary.filter(item =>
      normalizeForSearch(item.german).includes(normalizeForSearch(vocabularyState.searchQuery)) ||
      normalizeForSearch(item.bulgarian).includes(normalizeForSearch(vocabularyState.searchQuery))
    )
  );
</script>
```

---

## 🔮 Future Enhancements

1. **Advanced Search Features**:
   - Fuzzy search with Levenshtein distance
   - Category filtering
   - Difficulty level filtering
   - Part of speech filtering

2. **Personalization**:
   - User-specific difficulty ratings
   - Adaptive learning paths
   - Spaced repetition integration
   - Personal vocabulary lists

3. **Collaboration**:
   - Shared vocabulary lists
   - User-contributed examples
   - Community ratings and feedback
   - Crowdsourced definitions

4. **Multimedia Integration**:
   - Audio pronunciation
   - Image associations
   - Video examples
   - Interactive exercises

5. **Analytics and Insights**:
   - Learning progress tracking
   - Common mistakes analysis
   - Personalized recommendations
   - Mastery level assessment

---

## 💡 Copilot Interaction Examples

### 1. Feature Implementation

```
Copilot, implement a vocabulary search feature with these requirements:
- Debounced search with 300ms delay
- Support for both German and Bulgarian search terms
- Display results with direction-aware formatting (DE→BG or BG→DE)
- Handle Cyrillic characters properly
- Include loading state
- Follow the patterns in .github/instructions/vocabulary-feature.md
- Use the VirtualList component for performance with large datasets
- Ensure WCAG 2.1 AA accessibility compliance

Here's the current component structure:
src/lib/components/vocabulary/
├── VocabularyCard.svelte
└── VocabularySearch.svelte (to be created)
```

### 2. Bug Fix

```
Copilot, help me fix this issue with vocabulary search:
The search functionality doesn't work properly with Cyrillic characters.
When I search for "здравей", it doesn't match the word "Здравей" in the vocabulary.

Current search implementation:
```typescript
function normalizeForSearch(text: string): string {
  return text.toLowerCase();
}
```

Requirements:
- Handle Cyrillic characters properly
- Normalize diacritics and accents
- Maintain performance
- Follow the patterns in .github/instructions/vocabulary-feature.md
```

### 3. Test Generation

```
Copilot, generate comprehensive tests for the VocabularyCard component:
- Test direction-aware display (DE→BG and BG→DE)
- Test accessibility attributes
- Test click handler functionality
- Test with enriched and non-enriched vocabulary items
- Test with different difficulty levels
- Follow the testing patterns in .github/instructions/vocabulary-feature.md
- Use Playwright component testing
```

### 4. Code Review

```
Copilot, review this VocabularyCard implementation for:
- Adherence to project patterns
- Accessibility compliance
- Performance considerations
- Error handling
- Code organization
- Type safety
- Follow the guidelines in .github/instructions/vocabulary-feature.md

```svelte
<script lang="ts">
  let { item } = $props();
</script>

<div class="vocabulary-card">
  <span>{item.german} → {item.bulgarian}</span>
</div>
```

### 5. Documentation

```
Copilot, generate documentation for the vocabulary feature:
- Feature overview
- Architecture diagram
- Key patterns and conventions
- Data schema
- Integration points
- Common issues and solutions
- Follow the documentation patterns in the project
- Use Markdown format
```

---

## 🔄 Living Document Maintenance

**Update Frequency**: Weekly or after significant changes
**Responsible**: Feature owner (Vocabulary Team)
**Review Process**:
1. **Before PR**: Update relevant instruction files
2. **During Code Review**: Verify instruction adherence
3. **After Deployment**: Update based on feedback
4. **Quarterly**: Comprehensive review

**Update Checklist**:
- [ ] Update patterns and examples
- [ ] Add new gotchas and solutions
- [ ] Update key files list
- [ ] Add new integration points
- [ ] Update future enhancements
- [ ] Verify all links are working
- [ ] Update last updated date

---

## 📅 Next Steps

1. **Implement vocabulary search** ([Issue #123](https://github.com/username/BulgarianApp-Fresh/issues/123))
2. **Add virtual scrolling** for large vocabulary sets
3. **Enhance accessibility** with comprehensive ARIA attributes
4. **Implement advanced search** features (fuzzy search, filters)
5. **Add personalization** features (favorites, difficulty tracking)

**Current Priority**: Vocabulary search implementation (Estimated: 2-3 days)