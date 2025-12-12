# TypeScript Error Analysis & Fix Plan

**Status**: 277 errors found in 44 files  
**Date**: December 12, 2025  
**Priority**: HIGH - Blocking full validation suite

---

## Summary

TypeScript check (svelte-check) revealed 277 errors across 44 files. Most are pre-existing issues related to:
1. Missing/incorrect field references (e.g., `tags`, `verbs` properties)
2. Type mismatches in vocabulary schema usage
3. Category label mapping issues
4. Implicit `any` types

**Critical Finding**: None of these errors are caused by CEFR field additions. They are pre-existing issues that need separate remediation.

---

## Error Categories

### Category 1: Property Does Not Exist on Type (Most Common)
**Count**: ~150+ errors  
**Root Cause**: Schema changes not reflected in component code  
**Example**:
```
Property 'tags' does not exist on type '{ id: string; ... }'
Property 'verbs' does not exist on categoryLabels.de
```

### Category 2: Type Mismatch
**Count**: ~80+ errors  
**Root Cause**: VocabularyItem type differs from usage  
**Example**:
```
Type 'never' is not assignable to parameter of type 'string'
Property 'toLowerCase' doesn't exist on type 'never'
```

### Category 3: Implicit Any Types
**Count**: ~40+ errors  
**Root Cause**: Missing type annotations  
**Example**:
```
Parameter 'tag' implicitly has an 'any' type
```

### Category 4: Missing Imports/Module Errors
**Count**: ~7 errors  
**Root Cause**: Module resolution or deleted files  
**Example**:
```
Cannot find module '$app/paths'
```

---

## Problem Areas by File

### 1. `src/routes/vocabulary/+page.svelte` (MOST CRITICAL)
**Error Count**: ~120+ errors related to vocabulary schema usage

**Issues**:
- Line 184: `item.tags` property doesn't exist
- Line 184: `categoryLabels.de['verbs']` property doesn't exist
- Searching for `tags` field that isn't in schema
- Using category names like `'verbs'`, `'adjectives'` that don't exist in canonical set

**Root Cause**: Code expects fields/categories that don't exist in current schema

**Required Fix**:
```typescript
// WRONG (current code):
(item.tags || []).some(tag => tag.toLowerCase().includes(q))

// CORRECT (should use):
// Just search: item.german + item.bulgarian + (item.categories)
// Tags don't exist in vocabulary schema
```

### 2. `src/lib/data/DataLoader.svelte.ts`
**Error Count**: ~15+ errors  
**Issues**:
- Type narrowing issues with partOfSpeech
- Categories array type issues
- Type 'never' in conditional logic

**Required Fix**: Update type guards and assertions

### 3. `src/lib/services/progress.ts`
**Error Count**: ~20+ errors  
**Issues**:
- Transaction-related type issues (line 1296)
- Method return types not matching usage
- Error handling type mismatches

**Required Fix**: Ensure TransactionManager types are correct

### 4. `src/routes/+page.svelte` and other routes
**Error Count**: ~50+ errors combined  
**Issues**:
- Similar to vocabulary page - using non-existent properties
- Category label mapping issues

**Required Fix**: Update all references to match schema

---

## Detailed Error List (Sample)

| File | Line | Error | Fix |
|------|------|-------|-----|
| vocabulary/+page.svelte | 184 | Property 'tags' does not exist | Remove tags reference, use categories |
| vocabulary/+page.svelte | 184 | Property 'verbs' does not exist | Use correct category names from canonical set |
| DataLoader.svelte.ts | 45 | Type 'never' is not assignable | Add proper type guard |
| progress.ts | 1296 | Declaration or statement expected | Check syntax at end of method |
| util/locale.ts | 89 | Cannot find module '$app/paths' | Update import statement |

---

## Quick Fix Strategy

### Phase A: Schema Alignment (Priority 1)
**Time**: 1-2 hours  
**Steps**:

1. **Identify all non-existent properties**:
   - Search for `.tags` in codebase → Remove or use `.categories`
   - Search for category labels like `'verbs'`, `'adjectives'` → Replace with canonical categories
   - Search for undefined schema properties → Cross-reference with actual schema

2. **Update vocabulary page component** (`src/routes/vocabulary/+page.svelte`):
   ```typescript
   // Remove tags logic
   - (item.tags || []).some(tag => tag.toLowerCase().includes(q))
   + false // or use categories if needed
   
   // Fix category labels
   - categoryLabels.de['verbs']
   + categoryLabels.de['professions'] // or appropriate category
   ```

3. **Update all components using vocabulary**:
   - Check `DataLoader.svelte.ts` for schema assumptions
   - Update type guards in search/filter logic
   - Verify all vocabulary references

### Phase B: Type System Cleanup (Priority 2)
**Time**: 1-2 hours  
**Steps**:

1. **Fix DataLoader.svelte.ts type issues**:
   - Add proper type narrowing for partOfSpeech
   - Ensure categories array typing is consistent
   - Remove any implicit any types

2. **Fix progress.ts**:
   - Verify TransactionManager type compatibility
   - Check method signatures match usage
   - Fix transaction error handling types

3. **Update utility functions**:
   - Fix locale.ts import issues
   - Update any utility type assertions

### Phase C: Import & Module Fixes (Priority 3)
**Time**: 30 minutes  
**Steps**:

1. **Fix missing module imports**:
   - Check if `$app/paths` is still valid in SvelteKit version
   - Update other missing/broken imports

2. **Verify all relative imports**:
   - Ensure all schema imports use correct paths
   - Check circular dependency issues

---

## Schema Reference (Authoritative)

**These properties DO NOT EXIST in schema** (should be removed from code):
- `item.tags` → Use `item.categories` instead
- `categoryLabels.de['verbs']` → Use canonical categories only
- `categoryLabels.de['adjectives']` → Use canonical categories only
- Any field not in BaseVocabularyItemSchema

**These properties DO EXIST**:
- `item.id`, `item.german`, `item.bulgarian`
- `item.partOfSpeech`, `item.difficulty`, `item.cefrLevel`
- `item.categories` (array of canonical category strings)
- `item.metadata`, `item.enrichment`, `item.definitions`

**Canonical Categories (19 total)**:
```
greetings, numbers, family, food, colors, animals, body, clothing, 
home, nature, transport, technology, time, weather, professions, 
places, grammar, culture, everyday-phrases
```

**DEPRECATED Categories** (no longer used):
- `common_phrases` → Use `everyday-phrases`
- `house` → Use `home`
- `body` → Use `body-parts` OR stay as `body`
- `verbs`, `adjectives`, `adverbs`, `pronouns`, `prepositions`, `conjunctions` → Remove or map to existing categories

---

## Recommended Action Plan

### Immediate (Next 2 hours)
1. **Create comprehensive grep search** for problem patterns:
   ```bash
   grep -r "\.tags" src/
   grep -r "categoryLabels\.de\[" src/
   grep -r "type: 'never'" src/
   ```

2. **Document exact locations** of all property mismatches

3. **Create fix document** per file with specific line numbers

### Short-term (Next 4 hours)
1. **Execute Phase A fixes** (Schema Alignment)
2. **Run TypeScript check** incrementally
3. **Fix Type System issues** (Phase B)
4. **Verify all imports** (Phase C)

### Validation
1. **Run pnpm run check** → Should show < 50 errors remaining
2. **Run pnpm run lint** → Should pass
3. **Run pnpm run test:unit** → Should pass
4. **Manual testing** in dev browser

---

## Important Notes

### These Errors Are NOT CEFR-Related
✓ No errors in vocabulary.ts from cefrLevel additions  
✓ No errors in unified-vocabulary.ts from cefrLevel additions  
✓ Schema files are syntactically correct  

### These Are Pre-Existing Issues
The vocabulary.svelte page was already using non-existent properties (`tags`, deprecated categories) before CEFR work. This suggests the schema was changed at some point without updating all component code.

### CEFR Integration Is Clean
The `cefrLevel` field integrates cleanly with existing schema and types. No cascading type errors from CEFR additions.

---

## Critical Files to Fix (Priority Order)

1. **`src/routes/vocabulary/+page.svelte`** - HIGHEST PRIORITY
   - ~120+ errors
   - Directly impacts vocabulary feature
   - Blocks vocabulary page loading
   - Est. fix time: 1 hour

2. **`src/lib/data/DataLoader.svelte.ts`** - HIGH PRIORITY
   - ~15+ errors
   - Impacts all data loading
   - Central to app functionality
   - Est. fix time: 45 minutes

3. **`src/lib/services/progress.ts`** - MEDIUM PRIORITY
   - ~20+ errors
   - Impacts progress tracking
   - Less critical for current MVP
   - Est. fix time: 30 minutes

4. **Other routes and utilities** - LOW PRIORITY
   - ~50+ errors combined
   - Mostly related to vocabulary fixes
   - Will resolve after main files fixed
   - Est. fix time: 30 minutes

---

## Success Criteria

✅ TypeScript check: < 20 errors (mostly warnings)  
✅ All vocabulary-related errors: 0  
✅ All CEFR schema errors: 0  
✅ pnpm run check passes  
✅ pnpm run lint passes  
✅ pnpm run test:unit passes  

---

**Next Step**: Execute fix plan starting with `src/routes/vocabulary/+page.svelte`

---

**Report Generated**: December 12, 2025  
**Status**: Analysis Complete - Ready for Remediation  
**Blocker for**: Full validation suite, Unit tests, Deployment

