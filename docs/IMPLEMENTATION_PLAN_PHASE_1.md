# 🚀 Implementation Plan - Phase 1 (Critical Fixes)

**Goal**: Fix critical performance, race condition, and error handling issues
**Estimated Time**: 2-3 days
**Priority**: Critical

---

## 📋 Task Breakdown

### Task 1: Fix Search Service Performance
**File**: `src/lib/services/search.ts`
**Time**: 4 hours

**Current Problem**:
```typescript
// Loads ALL vocabulary (~2MB) for every search
async function getVocabularyData() {
  await vocabularyRepository.loadAll(); // ⚠️ Expensive!
  return vocabularyRepository.getAll();
}
```

**Solution**:
1. Use pre-computed mini-index for initial results
2. Load full items only when needed (lazy loading)
3. Add search result caching

**Implementation Steps**:
- [ ] Refactor `getVocabularyData()` to use chunked loading
- [ ] Add search cache with TTL (5 minutes)
- [ ] Update `searchVocabulary()` to use repository.search()
- [ ] Add unit tests for search performance

---

### Task 2: Fix Race Condition in Daily Vocabulary
**File**: `src/lib/services/daily-vocabulary.svelte.ts`
**Time**: 3 hours

**Current Problem**:
```typescript
// Multiple calls can start multiple initializations
async initialize() {
  if (this._initialized) return; // Not enough protection
  // Race condition here!
}
```

**Solution**:
1. Add initialization lock flag
2. Add error state
3. Add retry mechanism

**Implementation Steps**:
- [ ] Add `_initializing` lock state
- [ ] Add `error` state with $state()
- [ ] Add retry() method
- [ ] Add loading timeout protection
- [ ] Test concurrent initialization calls

---

### Task 3: Add Error States to Vocabulary Repository
**File**: `src/lib/data/vocabulary-repository.svelte.ts`
**Time**: 4 hours

**Current Problem**:
- Users see infinite loading spinner on errors
- No way to recover from failures
- Silent failures on chunk loading

**Solution**:
```typescript
class VocabularyRepository {
  error = $state<Error | null>(null);  // NEW
  loading = $state<boolean>(false);    // NEW

  async initialize() {
    this.loading = true;
    this.error = null;
    try {
      // ... initialization
    } catch (e) {
      this.error = e;
    } finally {
      this.loading = false;
    }
  }

  retry() {  // NEW
    this.invalidate();
    return this.initialize();
  }
}
```

**Implementation Steps**:
- [ ] Add `error` reactive state
- [ ] Add `loading` state
- [ ] Wrap all async operations with try-catch
- [ ] Add `retry()` method
- [ ] Update components to show error UI
- [ ] Add exponential backoff for retries

---

### Task 4: Add Global Error Boundary
**File**: New component `src/lib/components/ErrorBoundary.svelte`
**Time**: 3 hours

**Purpose**: Catch unhandled errors and show user-friendly messages

**Implementation Steps**:
- [ ] Create ErrorBoundary component using Svelte error boundaries
- [ ] Add fallback UI with retry button
- [ ] Add error reporting/logging
- [ ] Wrap main layout routes
- [ ] Add tests for error scenarios

---

### Task 5: Add Loading Skeletons
**Files**: Route pages
**Time**: 4 hours

**Current Problem**: Users see blank screens during loading

**Solution**:
- Add skeleton components for:
  - Vocabulary cards
  - Search results
  - Learning paths
  - Daily carousel

**Implementation Steps**:
- [ ] Create `SkeletonCard.svelte`
- [ ] Create `SkeletonList.svelte`
- [ ] Add to vocabulary page
- [ ] Add to learn page
- [ ] Add to dashboard
- [ ] Add animation (pulse)

---

### Task 6: Fix Unsafe Type Casts
**Files**: `src/lib/services/search.ts`, data layer
**Time**: 3 hours

**Current Problem**:
```typescript
const phase = (item as unknown as VocabularyItem).learningPhase ?? 0;
```

**Solution**:
1. Use proper type guards
2. Add runtime validation with Zod
3. Remove unnecessary casts

**Implementation Steps**:
- [ ] Audit all type casts
- [ ] Replace with type guards
- [ ] Add Zod validation for external data
- [ ] Add TypeScript strict checks

---

## 📁 Files to Modify

| File | Changes |
|------|---------|
| `src/lib/services/search.ts` | Use chunked search, add caching |
| `src/lib/services/daily-vocabulary.svelte.ts` | Add locks, error states |
| `src/lib/data/vocabulary-repository.svelte.ts` | Add error states |
| `src/lib/components/ErrorBoundary.svelte` | New component |
| `src/lib/components/ui/Skeleton*.svelte` | New components |
| `src/routes/+layout.svelte` | Wrap with ErrorBoundary |
| `src/routes/+page.svelte` | Add skeleton states |
| `src/routes/vocabulary/+page.svelte` | Add skeleton states |

---

## 🧪 Testing Plan

### Unit Tests
- [ ] Search service with mocked repository
- [ ] Race condition scenarios
- [ ] Error state transitions
- [ ] Retry mechanisms

### Integration Tests
- [ ] Full search flow
- [ ] Daily vocabulary initialization
- [ ] Error recovery

### Performance Tests
- [ ] Search response time < 100ms
- [ ] Memory usage stable after 10 searches
- [ ] Initial load < 500KB

---

## 🎯 Success Criteria

1. **Search Performance**
   - Initial results in < 50ms
   - No full vocabulary load for search
   - Cache hit rate > 80%

2. **Race Conditions**
   - 10 concurrent initialize() calls = 1 initialization
   - No duplicate daily items

3. **Error Handling**
   - All errors show user-friendly message
   - Retry succeeds on transient failures
   - No infinite loading spinners

4. **UX**
   - Skeletons visible during all async ops
   - Error boundary catches all unhandled errors
   - Accessibility score > 90

---

## ⏱️ Timeline

| Day | Tasks |
|-----|-------|
| Day 1 | Tasks 1-2 (Search + Race Condition) |
| Day 2 | Tasks 3-4 (Error States + Boundary) |
| Day 3 | Tasks 5-6 (Skeletons + Type Safety) + Testing |

---

## 📝 Notes

- All changes must maintain Svelte 5 runes compatibility
- Ensure SSR safety (check `browser` before localStorage)
- Maintain backward compatibility where possible
- Add comprehensive JSDoc comments

---

**Next Phase**: Code Quality Improvements (Type safety, memory leaks, accessibility)
