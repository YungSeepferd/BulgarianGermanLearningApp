# 🚀 Implementation Plan - Phase 2 (Code Quality Improvements)

**Goal**: Fix code quality issues - memory leaks, magic numbers, accessibility, error handling
**Estimated Time**: 2-3 days
**Priority**: High
**Status**: Ready to implement

---

## 📋 Task Breakdown

### Task 1: Fix Memory Leaks in onMount
**Files**: Multiple route components
**Time**: 4 hours

**Current Problem**:
```typescript
// PROBLEM: Event listeners and subscriptions not cleaned up
onMount(async () => {
  window.addEventListener('resize', handler); // Never removed!
  const unsub = store.subscribe(...); // Never unsubscribed!
});
```

**Solution**:
1. Use onMount cleanup return function
2. Use $effect with cleanup for reactive subscriptions
3. Audit all components for uncleaned resources

**Implementation Steps**:
- [ ] Audit all routes for onMount usage
- [ ] Add cleanup functions for event listeners
- [ ] Add cleanup for store subscriptions
- [ ] Add cleanup for intersection observers
- [ ] Test with heap snapshots

**Files to Check**:
- `src/routes/+page.svelte`
- `src/routes/vocabulary/+page.svelte`
- `src/routes/learn/+page.svelte`
- `src/lib/components/learning/CurationPanel.svelte`

---

### Task 2: Extract Magic Numbers to Constants
**Files**: Various
**Time**: 3 hours

**Current Problem**:
```typescript
// Magic numbers scattered throughout
const MAX_RETRIES = 3; // In multiple files
const threshold = 0.4; // Fuse search threshold
const limit = 20; // Default pagination
const dailyItems = 10; // Daily vocabulary count
```

**Solution**:
Create centralized constants file

**Implementation Steps**:
- [ ] Create `src/lib/constants/app.ts` for app-level constants
- [ ] Create `src/lib/constants/search.ts` for search constants
- [ ] Create `src/lib/constants/learning.ts` for learning constants
- [ ] Replace all magic numbers with named constants
- [ ] Add JSDoc comments explaining each constant

**Constants to Extract**:
| Current Value | Location | Constant Name |
|--------------|----------|---------------|
| `10` | Daily vocabulary | `DAILY_VOCABULARY_COUNT` |
| `0.4` | Fuse threshold | `DEFAULT_FUSE_THRESHOLD` |
| `20` | Pagination | `DEFAULT_PAGE_SIZE` |
| `3` | Max retries | `MAX_RETRY_ATTEMPTS` |
| `5` | Cache TTL minutes | `SEARCH_CACHE_TTL_MINUTES` |
| `1000` | Search limit | `MAX_SEARCH_RESULTS` |
| `400` | Card height | `SWIPEABLE_CARD_HEIGHT` |
| `50` | Swipe threshold | `SWIPE_THRESHOLD_PX` |

---

### Task 3: Add localStorage Error Handling
**Files**: `src/lib/services/daily-vocabulary.svelte.ts`, `src/lib/services/localization.ts`
**Time**: 3 hours

**Current Problem**:
```typescript
// Inconsistent error handling
localStorage.setItem('key', value); // No try-catch!
```

**Solution**:
1. Create safe localStorage wrapper
2. Add consistent error handling
3. Add quota exceeded handling

**Implementation Steps**:
- [ ] Create `src/lib/utils/storage.ts` with safe wrappers
- [ ] Wrap all localStorage calls with try-catch
- [ ] Handle Storage quota exceeded errors
- [ ] Add fallback to memory storage if localStorage fails
- [ ] Add error reporting for storage failures

**Storage Wrapper API**:
```typescript
export function safeSetItem(key: string, value: string): boolean;
export function safeGetItem(key: string): string | null;
export function safeRemoveItem(key: string): boolean;
export function isStorageAvailable(): boolean;
```

---

### Task 4: Add Accessibility Improvements
**Files**: UI components
**Time**: 4 hours

**Current Problem**:
- Button components missing `aria-pressed` for toggle states
- No `aria-live` regions for dynamic content updates
- Icons missing `aria-label`

**Solution**:
1. Add ARIA attributes to interactive components
2. Add live regions for dynamic content
3. Ensure keyboard navigation

**Implementation Steps**:
- [ ] Add `aria-pressed` to toggle buttons
- [ ] Add `aria-live="polite"` to search results
- [ ] Add `aria-label` to all icon-only buttons
- [ ] Add `aria-describedby` to form inputs
- [ ] Ensure focus indicators are visible
- [ ] Add skip links for navigation
- [ ] Test with screen reader

**Components to Update**:
- `ActionButton.svelte` - Add aria-pressed for toggle state
- `TandemToggle.svelte` - Add aria-pressed
- `MasteryGauge.svelte` - Add aria-valuenow, aria-valuemax
- `SwipeableCard.svelte` - Add swipe instructions for SR
- `VocabularyCard.svelte` - Add aria-label for actions
- `Search` components - Add aria-live for results

---

### Task 5: Add User-Facing Error Notifications
**Files**: Error handling throughout
**Time**: 3 hours

**Current Problem**:
```typescript
} catch (error) {
  console.error('Error:', error); // User sees nothing!
}
```

**Solution**:
1. Use ErrorHandler consistently
2. Add toast notification system
3. Show user-friendly error messages

**Implementation Steps**:
- [ ] Install `shadcn-svelte` toast component (or create custom)
- [ ] Create `src/lib/services/toast.ts` service
- [ ] Update ErrorHandler to show toast notifications
- [ ] Replace console.error with ErrorHandler calls
- [ ] Add error boundaries with toast integration
- [ ] Create error message localization

**Toast API**:
```typescript
export function showError(message: string, duration?: number): void;
export function showSuccess(message: string, duration?: number): void;
export function showWarning(message: string, duration?: number): void;
export function showInfo(message: string, duration?: number): void;
```

---

## 📁 Files to Create/Modify

| File | Purpose |
|------|---------|
| `src/lib/constants/app.ts` | App-level constants |
| `src/lib/constants/search.ts` | Search-related constants |
| `src/lib/constants/learning.ts` | Learning constants |
| `src/lib/utils/storage.ts` | Safe localStorage wrapper |
| `src/lib/services/toast.ts` | Toast notification service |
| `src/lib/components/ui/Toast.svelte` | Toast component |
| `src/lib/components/ui/Toaster.svelte` | Toast container |

---

## 🧪 Testing Plan

### Unit Tests
- [ ] Constants are correctly imported and used
- [ ] Safe storage wrapper handles errors
- [ ] Toast service shows/hides correctly

### Integration Tests
- [ ] No memory leaks after 10 page navigations (heap snapshot)
- [ ] localStorage errors show toast notifications
- [ ] Accessibility score 90+ on Lighthouse

### Manual Tests
- [ ] Screen reader can navigate all interactive elements
- [ ] Keyboard-only navigation works
- [ ] Error messages are user-friendly

---

## 🎯 Success Criteria

1. **Memory Management**
   - No memory leaks detected in heap snapshots
   - Event listeners cleaned up properly

2. **Code Quality**
   - Zero magic numbers in source code
   - All constants documented
   - localStorage errors handled gracefully

3. **Accessibility**
   - Lighthouse a11y score 90+
   - All interactive elements keyboard accessible
   - Screen reader friendly

4. **User Experience**
   - All errors show user-friendly toast notifications
   - No silent failures
   - Clear error messages with recovery actions

---

## ⏱️ Timeline

| Day | Tasks |
|-----|-------|
| Day 1 | Tasks 1-2 (Memory leaks + Constants) |
| Day 2 | Tasks 3-4 (Storage + Accessibility) |
| Day 3 | Task 5 (Toast notifications) + Testing |

---

## 📝 Notes

- Maintain Svelte 5 runes compatibility
- Use existing error handling patterns
- Ensure SSR safety
- Add comprehensive JSDoc comments

---

## 📚 Package Research Notes (Future Sprints)

Based on research, these packages could enhance future sprints:

| Sprint | Package | Purpose |
|--------|---------|---------|
| UI Sprint | `shadcn-svelte` | Replace custom UI components |
| Forms Sprint | `sveltekit-superforms` | Typed form handling |
| Data Sprint | `@tanstack/svelte-query` | Data caching & sync |
| UX Sprint | `svelte-motion` | Smooth animations |
| PWA Sprint | `vite-plugin-pwa` | Offline-first capability |

**Note**: Package integration is planned for Phase 3+, after code quality improvements are complete.

---

**Next Phase**: Package Integration & Advanced Features
