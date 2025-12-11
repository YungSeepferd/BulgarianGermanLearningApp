# MVP Transformation Plan: Bulgarian-German Learning App

**Target**: Personal-use MVP with zero commercial dependencies
**Timeline**: 3 phases (Critical Fixes → Core Functionality → Production Ready)
**Success Criteria**: CI passing, translations working, <5 type warnings, all core features functional

---

## PHASE 1: CRITICAL FIXES (Days 1-2)
### Immediate blockers that prevent build/testing

### 1.1 Fix TypeScript Errors in `src/lib/data/db.svelte.ts`
**Issue**: `items` array typed as `never[]`, breaking all item operations
**File**: [src/lib/data/db.svelte.ts](src/lib/data/db.svelte.ts#L12)
**Commands**:
```bash
# Check errors
pnpm run check

# Fix will be applied via code changes below
```

**Exact Changes**:
```typescript
// BEFORE (line 12-13):
items = $state([]);
initialized = $state(false);

// AFTER:
items = $state<VocabularyItem[]>([]);
initialized = $state<boolean>(false);
```

**Impact**: Resolves 25+ TypeScript errors in db.svelte.ts, unblocks vocabulary loading

---

### 1.2 Re-enable Translation Plugin in `vite.config.ts`
**Issue**: Translation plugin is already enabled (line 7)
**File**: [vite.config.ts](vite.config.ts#L7)
**Status**: ✅ Already enabled - no change needed
**Verify**: 
```bash
grep "translationPlugin()" vite.config.ts
```

---

### 1.3 Remove Unused Function from `src/lib/data/loader.ts`
**Issue**: Lint warning for unused `loadVocabulary` function
**Commands**:
```bash
pnpm run lint --fix
```
**Manual check**: The unused function should be auto-removed by ESLint

---

### 1.4 Fix Remaining `any` Types in Schema Files

**Target Files** (6 critical locations):
1. `src/lib/schemas/localStorage.d.ts` - lines 110, 113, 118
2. `src/lib/schemas/lesson.d.ts` - lines 3, 6, 8, 9

**Exact Replacements**:

**File 1**: `src/lib/schemas/localStorage.d.ts`
```typescript
// REPLACE (line 110):
session: any;

// WITH:
session: SessionData | undefined;
```

**File 2**: `src/lib/schemas/lesson.d.ts`
```typescript
// REPLACE (lines 3-9):
id: any;
// ...
partOfSpeech: any;
// ...
categories: z.ZodDefault<z.ZodArray<any, "many">>;
metadata: any;

// WITH:
id: string;
// ...
partOfSpeech: PartOfSpeech;
// ...
categories: z.ZodDefault<z.ZodArray<VocabularyCategory, "many">>;
metadata: Record<string, unknown>;
```

---

## PHASE 2: SCOPE REDUCTION (Days 3-5)
### Remove commercial/non-essential features, keep core learning

### 2.1 Identify Features to KEEP (Core Learning MVP)
✅ **KEEP**:
- Vocabulary practice (bilingual flashcards)
- Grammar reference with examples
- Lesson generation (basic curriculum)
- Local storage for progress (no sync)
- Bilingual UI (German ↔ Bulgarian)
- Search & filtering
- Basic progress counter

❌ **REMOVE**:
- User accounts / authentication
- Cloud sync
- Leaderboards / social features
- Achievements / badges
- XP system (gamification)
- Level progression
- Daily goals / streaks
- Confetti animations
- Complex progress dashboard
- Quiz system (incomplete)
- User profiles

### 2.2 Files to DELETE (by category)

**Authentication/User Management**:
```bash
rm -f src/lib/state/user.svelte.ts
rm -f src/routes/profile/+page.svelte
rm -f src/routes/auth/+page.svelte
rm -rf src/routes/account/
```

**Gamification/Social**:
```bash
rm -f src/lib/components/gamification/
rm -f src/lib/components/ProgressDashboard.svelte
rm -f src/lib/components/LevelUpModal.svelte
rm -f src/lib/services/achievement-service.ts
rm -f src/lib/services/social-service.ts
rm -f src/lib/schemas/progress.ts (→ simplify to minimal)
```

**Non-Essential Routes**:
```bash
rm -rf src/routes/progress/
rm -rf src/routes/leaderboard/
rm -rf src/routes/achievements/
rm -rf src/routes/social/
rm -rf src/routes/quiz/  # Incomplete feature
```

### 2.3 Simplify ProgressDashboard → SimpleProgressCounter

**New Component**: `src/lib/components/SimpleProgressCounter.svelte`
```svelte
<script lang="ts">
  import { appState } from '$lib/state/app';

  let stats = $derived.by(() => {
    const allItems = appState.getAllVocabularyItems?.() ?? [];
    const favorited = appState.favorites?.size ?? 0;
    const recentSearches = appState.recentSearches?.length ?? 0;
    
    return {
      totalVocabItems: allItems.length,
      favorited,
      recentSearches
    };
  });
</script>

<div class="progress-counter">
  <div class="stat">
    <span class="label">Vocabulary Items</span>
    <span class="value">{stats.totalVocabItems}</span>
  </div>
  <div class="stat">
    <span class="label">Favorited</span>
    <span class="value">{stats.favorited}</span>
  </div>
  <div class="stat">
    <span class="label">Recent Searches</span>
    <span class="value">{stats.recentSearches}</span>
  </div>
</div>

<style>
  .progress-counter {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: #f3f4f6;
    border-radius: 0.5rem;
  }
  .stat {
    text-align: center;
  }
  .label {
    display: block;
    font-size: 0.875rem;
    color: #6b7280;
  }
  .value {
    display: block;
    font-size: 1.5rem;
    font-weight: bold;
    color: #1f2937;
  }
</style>
```

**Delete**: `src/lib/components/ProgressDashboard.svelte` (867 lines → 50 lines equivalent)

### 2.4 Simplify State Management

**Keep in `src/lib/state/app.svelte.ts`**:
- `languageMode` (DE_BG / BG_DE)
- `searchQuery`
- `filteredItems`
- `favorites`
- `recentSearches`
- Basic practice stats (correct/incorrect counts per item)

**Remove from state**:
- `currentLevel`, `totalXP`, `currentStreak`, `longestStreak`
- `dailyGoals`, `achievements`, `leaderboardRank`
- `userProfile`, `userId`, `email`
- All gamification-related derived states

### 2.5 Simplify Schema Files

**File**: `src/lib/schemas/progress.ts` → `src/lib/schemas/practice-stats.ts`
```typescript
import { z } from 'zod';

export const PracticeStatSchema = z.object({
  itemId: z.string(),
  correct: z.number().int().nonnegative().default(0),
  incorrect: z.number().int().nonnegative().default(0),
  lastPracticed: z.string().datetime().nullable().default(null),
  totalAttempts: z.number().int().nonnegative().default(0)
});

export type PracticeStat = z.infer<typeof PracticeStatSchema>;

export const PracticeStatsCollectionSchema = z.record(
  z.string(),
  PracticeStatSchema
);

export type PracticeStatsCollection = z.infer<typeof PracticeStatsCollectionSchema>;
```

**Delete**: `src/lib/schemas/progress.d.ts` (generated, no longer needed)

### 2.6 Update Routes

**Keep**:
- `src/routes/+page.svelte` (dashboard with SimpleProgressCounter)
- `src/routes/vocabulary/+page.svelte` (vocabulary list & search)
- `src/routes/learn/+page.svelte` (flashcard practice)
- `src/routes/grammar/+page.svelte` (grammar reference)
- `src/routes/lessons/+page.svelte` (lesson generation)

**Delete**: 
- Progress, quiz, achievements, leaderboard, social, profile routes

---

## PHASE 3: VALIDATION & OPTIMIZATION (Days 6-7)

### 3.1 Validate Core Functionality

**Test Command Sequence**:
```bash
# Type checking
pnpm run check

# Linting
pnpm run lint:check

# Unit tests
pnpm run test:unit

# Build for GitHub Pages
pnpm run build:gh-pages

# CI simulation (if not deleted)
pnpm run simulate-ci
```

**Success Criteria**:
- ✅ `pnpm run check` passes with 0 errors
- ✅ `pnpm run lint` shows <5 remaining warnings
- ✅ Unit tests pass
- ✅ Build succeeds without errors
- ✅ Translation plugin outputs files

### 3.2 Minimal CI/CD Workflow

**New File**: `.github/workflows/mvp-ci.yml`
```yaml
name: MVP CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm run check
      - run: pnpm run lint:check
      - run: pnpm run test:unit
      - run: pnpm run build

  deploy:
    needs: check
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm run build:gh-pages
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build
          cname: bulgarian-learning-app.local
```

### 3.3 Documentation Updates

**Files to CREATE/UPDATE**:

1. **`docs/SIMPLIFICATION.md`** (NEW) - Explain MVP philosophy
```markdown
# MVP Simplification Strategy

This document explains what was removed and why for the personal-use MVP.

## What Was Removed
- **User Accounts**: No authentication needed for personal device
- **Cloud Sync**: Local storage only (faster, no server costs)
- **Gamification**: XP/levels remove focus from learning
- **Social Features**: Not needed for single-user offline app
- **Leaderboards**: Meaningless without multiple users

## Core Value Prop
Free, offline-capable vocabulary & grammar practice tool.
No accounts, no tracking, no distractions.

## Data Persistence
All progress stored in browser localStorage (survives page reloads, survives browser restarts on same device).
```

2. **`README.md`** - Update to reflect MVP scope
```markdown
# Bulgarian-German Learning App (MVP)

A free, offline-capable personal vocabulary and grammar practice tool.

**Features**:
- 💾 Offline-first (works without internet)
- 🔄 Bilingual practice (DE ↔ BG)
- 📚 Vocabulary flashcards
- 📖 Grammar reference
- 🎯 Lesson generation
- 📊 Local progress tracking

**Not included**:
- User accounts
- Cloud sync
- Gamification (XP/levels)
- Social features
```

3. **`docs/ARCHITECTURE.md`** - Simplify architecture section
   - Remove sections on: user management, cloud sync, achievements
   - Focus on: data loading, local storage, lesson generation, UI components

4. **`docs/roadmap/ROADMAP.md`** - Delete phases 5-11 (commercial features)
   - Keep phase 1-4 (core learning)

---

## PHASE 4: CLEANUP & FINALIZATION

### 4.1 Dependency Cleanup

**Remove unused packages** (if any became unused):
```bash
pnpm prune
```

**Verify no security vulnerabilities**:
```bash
pnpm audit
```

### 4.2 Build Artifacts

Ensure these build successfully:
```bash
pnpm run build          # Regular build
pnpm run build:gh-pages # GitHub Pages build
```

### 4.3 Final Checks

```bash
# Type safety
pnpm run check

# Code quality
pnpm run lint:check

# Tests
pnpm run test:unit
pnpm run test:accessibility  # Important for MVPs

# Production build
pnpm run build:gh-pages

# Verify translations work
ls -la build/translations/
```

---

## FILES TO MODIFY (Exact Locations)

### Priority 1 (MUST FIX for build)
| File | Line(s) | Change | Impact |
|------|---------|--------|--------|
| `src/lib/data/db.svelte.ts` | 12-13 | Add type annotations | Fixes 25+ TS errors |
| `src/lib/schemas/localStorage.d.ts` | 110 | Remove `any` | Fixes type errors |
| `src/lib/schemas/lesson.d.ts` | 3-9 | Remove `any` types | Fixes type errors |

### Priority 2 (SHOULD DELETE)
```
src/lib/components/ProgressDashboard.svelte (867 lines)
src/lib/components/gamification/ (entire folder)
src/lib/components/LevelUpModal.svelte
src/lib/services/achievement-service.ts
src/lib/schemas/progress.ts
src/routes/progress/ (entire folder)
src/routes/quiz/ (entire folder)
src/routes/achievements/ (entire folder)
src/routes/leaderboard/ (entire folder)
src/routes/social/ (entire folder)
```

### Priority 3 (SHOULD SIMPLIFY)
- `src/lib/state/app.svelte.ts` - remove XP/level/streak state
- `src/lib/services/progress.ts` - reduce to simple stats
- `docs/ARCHITECTURE.md` - remove commercial sections
- `docs/roadmap/ROADMAP.md` - remove phases 5-11

---

## SUCCESS METRICS

### Before MVP
```
Build status: ❌ FAILS
Type warnings: 30+
Lint warnings: 10+
Bundle size: ~500KB
Lines of code: ~50K+
```

### After MVP
```
Build status: ✅ PASSES
Type warnings: <5
Lint warnings: <5
Bundle size: ~250KB
Lines of code: ~25K
Features: Core learning only
Deployable: ✅ GitHub Pages ready
```

---

## ESTIMATED TIME BREAKDOWN

| Phase | Task | Time | Priority |
|-------|------|------|----------|
| 1 | Fix TS errors | 30 min | Critical |
| 1 | Fix schema `any` types | 30 min | Critical |
| 1 | ESLint fixes | 15 min | Critical |
| 2 | Delete feature files | 45 min | High |
| 2 | Simplify state/schemas | 1.5 hrs | High |
| 2 | Create SimpleProgressCounter | 30 min | High |
| 2 | Update routes | 45 min | High |
| 2 | Update docs | 1 hr | Medium |
| 3 | Validation & testing | 1 hr | Critical |
| 3 | CI/CD setup | 30 min | High |
| **Total** | | **7-8 hours** | |

---

## ROLLBACK STRATEGY

If needed to revert:
```bash
git log --oneline     # Find MVP commit
git reset --hard <commit-hash>  # Revert to stable
```

All changes are git-tracked. No permanent deletion.

---

**Last Updated**: 11 December 2025
**Status**: Ready for implementation
**Dependencies**: None (all changes are file-based)
