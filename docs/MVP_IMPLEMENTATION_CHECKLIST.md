# MVP Implementation Checklist

## PHASE 1: CRITICAL FIXES (Do First)

### [ ] 1.1 Fix TypeScript Errors in db.svelte.ts

**File**: `src/lib/data/db.svelte.ts`

**Change Line 12-13**:
```typescript
// From:
items = $state([]);

// To:
items = $state<VocabularyItem[]>([]);
```

**Verify**: `pnpm run check` should eliminate 25+ errors

---

### [ ] 1.2 Fix `any` Types in localStorage.d.ts

**File**: `src/lib/schemas/localStorage.d.ts`

**Change Line 110**:
```typescript
// From:
session: any;

// To (add to imports first):
import type { SessionData } from './session';
session: SessionData | undefined;
```

**Verify**: No `any` type warnings on this file

---

### [ ] 1.3 Fix `any` Types in lesson.d.ts

**File**: `src/lib/schemas/lesson.d.ts`

**Changes** (add imports first):
```typescript
import type { PartOfSpeech, VocabularyCategory } from './vocabulary';

// Line 3: id: any; → id: string;
// Line 6: partOfSpeech: any; → partOfSpeech: PartOfSpeech;
// Line 8: categories: z.ZodDefault<z.ZodArray<any, "many">>; 
//     → categories: z.ZodDefault<z.ZodArray<VocabularyCategory, "many">>;
// Line 9: metadata: any; → metadata: Record<string, unknown>;
```

**Verify**: `pnpm run lint:check` reports <5 warnings total

---

### [ ] 1.4 Run Initial Validation

```bash
pnpm run check        # Should pass
pnpm run lint:check   # Should show <10 warnings
pnpm run test:unit    # Should pass
```

**Expected**: All critical errors resolved

---

## PHASE 2: SCOPE REDUCTION (Delete Non-Essential)

### [ ] 2.1 Delete Gamification Components

```bash
# Delete entire gamification folder
rm -rf src/lib/components/gamification/

# Delete individual gamification components
rm -f src/lib/components/ProgressDashboard.svelte
rm -f src/lib/components/LevelUpModal.svelte
rm -f src/lib/components/confetti.ts
```

**Verify**: No import errors for deleted files

---

### [ ] 2.2 Delete Gamification Services

```bash
rm -f src/lib/services/achievement-service.ts
rm -f src/lib/services/leaderboard-service.ts
rm -f src/lib/services/social-service.ts
```

---

### [ ] 2.3 Delete Feature Routes

```bash
# Authentication/User Management
rm -f src/routes/auth/+page.svelte
rm -f src/routes/profile/+page.svelte
rm -rf src/routes/account/

# Gamification Routes
rm -rf src/routes/progress/
rm -rf src/routes/achievements/
rm -rf src/routes/leaderboard/
rm -rf src/routes/social/

# Incomplete Features
rm -rf src/routes/quiz/
```

---

### [ ] 2.4 Delete Unused State Files

```bash
rm -f src/lib/state/user.svelte.ts
rm -f src/lib/state/gamification.svelte.ts
```

---

### [ ] 2.5 Clean Up Schema Files

**Delete**:
```bash
rm -f src/lib/schemas/progress.ts
rm -f src/lib/schemas/progress.d.ts
rm -f src/lib/schemas/achievement.ts
```

**Keep only**:
- `src/lib/schemas/vocabulary.ts`
- `src/lib/schemas/lesson.ts`
- `src/lib/schemas/localStorage.ts` (minimal)
- `src/lib/schemas/unified-vocabulary.ts`

---

### [ ] 2.6 Simplify localStorage Schema

**File**: `src/lib/schemas/localStorage.ts`

**New minimal version**:
```typescript
import { z } from 'zod';

export const PracticeStatSchema = z.object({
  itemId: z.string(),
  correct: z.number().int().nonnegative().default(0),
  incorrect: z.number().int().nonnegative().default(0),
  lastPracticed: z.string().datetime().nullable().default(null)
});

export type PracticeStat = z.infer<typeof PracticeStatSchema>;

export const UserProgressStorageSchema = z.object({
  stats: z.record(z.string(), PracticeStatSchema),
  favorites: z.array(z.string()).default([]),
  recentSearches: z.array(z.string()).default([]),
  lastUpdated: z.string().datetime().default(new Date().toISOString())
});

export type UserProgressStorage = z.infer<typeof UserProgressStorageSchema>;
```

---

### [ ] 2.7 Create SimpleProgressCounter Component

**New File**: `src/lib/components/SimpleProgressCounter.svelte`

```svelte
<script lang="ts">
  import { appState } from '$lib/state/app';

  let stats = $derived.by(() => {
    try {
      const totalItems = appState.getAllVocabularyItems?.()?.length ?? 0;
      const favorites = appState.favorites?.size ?? 0;
      const recentSearches = appState.recentSearches?.length ?? 0;
      
      return { totalItems, favorites, recentSearches };
    } catch (error) {
      return { totalItems: 0, favorites: 0, recentSearches: 0 };
    }
  });
</script>

<div class="stats-container">
  <div class="stat">
    <span class="label">Total Vocabulary</span>
    <span class="value">{stats.totalItems}</span>
  </div>
  <div class="stat">
    <span class="label">Favorited</span>
    <span class="value">{stats.favorites}</span>
  </div>
  <div class="stat">
    <span class="label">Recent Searches</span>
    <span class="value">{stats.recentSearches}</span>
  </div>
</div>

<style>
  .stats-container {
    display: flex;
    gap: 1.5rem;
    padding: 1rem;
    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    border-radius: 0.5rem;
    margin: 1rem 0;
  }

  .stat {
    text-align: center;
    flex: 1;
  }

  .label {
    display: block;
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
  }

  .value {
    display: block;
    font-size: 1.75rem;
    font-weight: 700;
    color: #1f2937;
  }
</style>
```

---

### [ ] 2.8 Update Dashboard (src/routes/+page.svelte)

**Replace ProgressDashboard with SimpleProgressCounter**:

```svelte
<script lang="ts">
  import SimpleProgressCounter from '$lib/components/SimpleProgressCounter.svelte';
  import { appState } from '$lib/state/app';
</script>

<h1>Bulgarian-German Learning</h1>

<SimpleProgressCounter />

<div class="quick-links">
  <a href="/vocabulary">📚 Vocabulary Practice</a>
  <a href="/learn">🎯 Flashcards</a>
  <a href="/grammar">📖 Grammar Reference</a>
  <a href="/lessons">📚 Lessons</a>
</div>

<style>
  h1 {
    margin-bottom: 1.5rem;
  }

  .quick-links {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 2rem;
  }

  a {
    padding: 1rem;
    background: #dbeafe;
    border-radius: 0.5rem;
    text-decoration: none;
    color: #1e40af;
    font-weight: 500;
    transition: background 0.2s;
  }

  a:hover {
    background: #bfdbfe;
  }
</style>
```

---

### [ ] 2.9 Simplify State (src/lib/state/app.svelte.ts)

**Remove these properties** (if present):
- `currentLevel`
- `totalXP`
- `currentStreak`
- `longestStreak`
- `dailyXPTarget`
- `achievements`
- `leaderboardRank`

**Keep only**:
- `languageMode` (DE_BG / BG_DE)
- `searchQuery`
- `filteredItems`
- `favorites`
- `recentSearches`
- `practiceStats` (simple: { itemId → { correct, incorrect, lastPracticed } })

---

### [ ] 2.10 Update Main Layout

**File**: `src/routes/+layout.svelte`

**Remove**:
- ProgressDashboard import/usage
- Gamification modules
- LevelUpModal
- Confetti animations

**Keep**:
- Header with language toggle
- Navigation (Vocabulary, Learn, Grammar, Lessons)
- Footer

---

## PHASE 3: VALIDATION & TESTING

### [ ] 3.1 Type Safety

```bash
pnpm run check
```

**Checklist**:
- [ ] 0 errors (not warnings)
- [ ] All imports resolve
- [ ] No circular dependencies

---

### [ ] 3.2 Linting

```bash
pnpm run lint:check
```

**Target**: <5 warnings total
- [ ] No `any` types
- [ ] No unused imports
- [ ] No console.log in production code

---

### [ ] 3.3 Unit Tests

```bash
pnpm run test:unit
```

**Target**: All tests pass
- [ ] Vocabulary loading tests pass
- [ ] State management tests pass
- [ ] Component rendering tests pass

---

### [ ] 3.4 Build Test

```bash
pnpm run build
pnpm run build:gh-pages
```

**Target**: Build succeeds
- [ ] No build errors
- [ ] `build/` directory created
- [ ] `build/data/unified-vocabulary.json` exists
- [ ] `build/translations/` exists

---

### [ ] 3.5 Accessibility Check

```bash
pnpm run test:accessibility
```

**Target**: No critical a11y violations
- [ ] All buttons keyboard-accessible
- [ ] All images have alt text
- [ ] Color contrast adequate

---

## PHASE 4: DOCUMENTATION

### [ ] 4.1 Create docs/SIMPLIFICATION.md

**File**: `docs/SIMPLIFICATION.md`

```markdown
# MVP Simplification

This document explains the personal-use MVP philosophy.

## Removed Features
- User accounts (no server needed)
- Cloud sync (localStorage only)
- Gamification (XP/levels/achievements)
- Social features (single-user focus)
- Leaderboards (meaningless without multiplayer)
- Quiz system (incomplete)

## Why?
Focus on core learning value:
1. Learn vocabulary
2. Practice grammar
3. Track personal progress locally

## Data Storage
All progress persists in browser localStorage:
- Practice stats per vocabulary item
- Favorites list
- Recent searches
- Last session date

No server, no account, no login.
```

---

### [ ] 4.2 Update docs/ARCHITECTURE.md

**Changes**:
1. Delete sections on:
   - User management
   - Cloud sync
   - Achievement system
   - Leaderboards
   - Social features

2. Keep sections on:
   - Data loading pipeline
   - Local storage schema
   - Vocabulary schema
   - Lesson generation
   - UI component architecture
   - Bilingual state management

---

### [ ] 4.3 Update README.md

**New structure**:
```markdown
# Bulgarian-German Learning App

Free, offline-first personal vocabulary practice tool.

## Features
- 💾 Works offline
- 🔄 DE ↔ BG practice
- 📚 Vocabulary cards
- 📖 Grammar reference
- 🎯 Lesson generator
- 📊 Local progress tracking

## Quick Start
```bash
pnpm install
pnpm run dev
# Open http://localhost:5173
```

## Not Included
- User accounts
- Cloud sync
- Gamification
- Social features
```

---

### [ ] 4.4 Update docs/roadmap/ROADMAP.md

**Changes**:
- Remove phases 5-11 (commercial features)
- Rename to `ROADMAP_MVP.md`
- Keep only phases 1-4 (core learning)
- Focus on offline improvements, not social features

---

## PHASE 5: CI/CD

### [ ] 5.1 Create Minimal GitHub Actions Workflow

**New File**: `.github/workflows/mvp-ci.yml`

```yaml
name: MVP Build & Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
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
      - run: pnpm run build:gh-pages
      
      - name: Deploy to GitHub Pages
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build
```

---

## FINAL VALIDATION

### [ ] Run Complete Test Suite

```bash
pnpm run check && \
pnpm run lint:check && \
pnpm run test:unit && \
pnpm run build:gh-pages && \
echo "✅ MVP Ready!"
```

---

### [ ] Git Commit

```bash
git add -A
git commit -m "chore: mvp transformation - core learning focus only"
git push origin main
```

---

## SUCCESS INDICATORS

✅ **When Done**:
- Type checking: 0 errors
- Linting: <5 warnings
- Build: Succeeds
- Tests: All pass
- Bundle: ~250KB (down from 500KB)
- Features: Vocabulary, Grammar, Lessons, Practice
- Deployment: GitHub Pages ready
- No external dependencies (no server, no accounts, no sync)

---

**Estimated Total Time**: 7-8 hours
**Priority**: Critical fixes first (2 hours), then scope reduction (4 hours), then validation (2 hours)
