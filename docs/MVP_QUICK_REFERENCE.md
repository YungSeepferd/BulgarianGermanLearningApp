# MVP Quick Reference - Terminal Commands

## PHASE 1: FIX CRITICAL ERRORS (30 min)

### Step 1a: Run Checks to See Current State
```bash
cd /Users/dinz/Coding\ Projects/BulgariaLearn/BulgarianApp-Fresh

pnpm run check              # Will show ~30 TypeScript errors
pnpm run lint:check         # Will show 10+ lint warnings
```

### Step 1b: Files Requiring Manual Edits

**Edit 1**: `src/lib/data/db.svelte.ts` (line 12-13)
```typescript
// CHANGE FROM:
items = $state([]);
initialized = $state(false);

// CHANGE TO:
items = $state<VocabularyItem[]>([]);
initialized = $state<boolean>(false);
```

**Edit 2**: `src/lib/schemas/localStorage.d.ts` (line 110)
```typescript
// CHANGE FROM:
session: any;

// CHANGE TO:
session: SessionData | undefined;

// (Add import at top if needed:)
import type { SessionData } from './session';
```

**Edit 3**: `src/lib/schemas/lesson.d.ts` (lines 3, 6, 8, 9)
```typescript
// Add imports:
import type { PartOfSpeech, VocabularyCategory } from './vocabulary';

// CHANGE FROM:
id: any;
// ... other lines ...
partOfSpeech: any;
categories: z.ZodDefault<z.ZodArray<any, "many">>;
metadata: any;

// CHANGE TO:
id: string;
// ... other lines ...
partOfSpeech: PartOfSpeech;
categories: z.ZodDefault<z.ZodArray<VocabularyCategory, "many">>;
metadata: Record<string, unknown>;
```

### Step 1c: Verify Fixes
```bash
pnpm run check              # Should show 0 errors or <5
pnpm run lint --fix         # Auto-fix remaining issues
pnpm run test:unit          # Should pass
```

**✅ Phase 1 Complete When**: `pnpm run check` succeeds

---

## PHASE 2: DELETE NON-ESSENTIAL FILES (45 min)

### Step 2a: Delete Gamification Components
```bash
rm -rf src/lib/components/gamification/
rm -f src/lib/components/ProgressDashboard.svelte
rm -f src/lib/components/LevelUpModal.svelte
rm -f src/lib/utils/confetti.ts 2>/dev/null || true
```

### Step 2b: Delete Gamification Services
```bash
rm -f src/lib/services/achievement-service.ts
rm -f src/lib/services/leaderboard-service.ts
rm -f src/lib/services/social-service.ts
rm -f src/lib/services/gamification.ts 2>/dev/null || true
```

### Step 2c: Delete Feature Routes
```bash
# Auth/User routes
rm -rf src/routes/auth/ 2>/dev/null || true
rm -rf src/routes/profile/ 2>/dev/null || true
rm -rf src/routes/account/ 2>/dev/null || true

# Gamification routes
rm -rf src/routes/progress/
rm -rf src/routes/achievements/
rm -rf src/routes/leaderboard/
rm -rf src/routes/social/ 2>/dev/null || true

# Incomplete features
rm -rf src/routes/quiz/ 2>/dev/null || true
```

### Step 2d: Delete State Files
```bash
rm -f src/lib/state/user.svelte.ts 2>/dev/null || true
rm -f src/lib/state/gamification.svelte.ts 2>/dev/null || true
```

### Step 2e: Simplify Schemas
```bash
# Delete progress schema (we'll use simpler version)
rm -f src/lib/schemas/progress.ts
rm -f src/lib/schemas/progress.d.ts

# Optional: Delete achievement/social schemas if they exist
rm -f src/lib/schemas/achievement.ts 2>/dev/null || true
rm -f src/lib/schemas/social.ts 2>/dev/null || true
```

### Step 2f: Verify No Broken Imports
```bash
pnpm run check              # Watch for import errors
```

**If import errors appear**: Remove the import lines from the affected files

---

## PHASE 3: CREATE REPLACEMENT COMPONENTS (30 min)

### Step 3a: Create SimpleProgressCounter
```bash
cat > src/lib/components/SimpleProgressCounter.svelte << 'EOF'
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
EOF
```

### Step 3b: Create Documentation Files
```bash
# Create SIMPLIFICATION.md
cat > docs/SIMPLIFICATION.md << 'EOF'
# MVP Simplification

This app focuses on core learning: vocabulary, grammar, and lessons.

## What Was Removed
- User accounts (no server needed)
- Cloud sync (localStorage only)
- Gamification (XP/levels/achievements)
- Social features (leaderboards, sharing)
- Quiz system (incomplete)

## Why?
Personal-use, offline-first learning tool needs no accounts, no servers, no distractions.

## Data Storage
Everything is stored locally in browser localStorage:
- Practice statistics per vocabulary item
- Favorites
- Recent searches
EOF

# Create MVP_TRANSFORMATION_PLAN.md (this is already created at this point)
# Create MVP_IMPLEMENTATION_CHECKLIST.md (already created)
```

---

## PHASE 4: VALIDATION & TESTING (1 hour)

### Step 4a: Full Type Check
```bash
pnpm run check
```

Expected output:
```
✓ .svelte files compiled
✓ TypeScript types verified
```

### Step 4b: Lint Check
```bash
pnpm run lint:check
```

Expected output:
```
<5 warnings (or 0)
```

### Step 4c: Unit Tests
```bash
pnpm run test:unit
```

Expected output:
```
✓ vocabulary tests pass
✓ state tests pass
✓ component tests pass
```

### Step 4d: Build Test
```bash
pnpm run build              # Regular build
```

Expected output:
```
✓ build/ directory created
```

### Step 4e: GitHub Pages Build
```bash
pnpm run build:gh-pages     # Build with /BulgarianApp-Fresh/ base path
```

Expected output:
```
✓ build/ directory with .html files
```

### Step 4f: Verify Translations
```bash
ls -la build/translations/
ls -la build/data/unified-vocabulary.json
```

Expected output:
```
✓ Files exist and have content
```

---

## PHASE 5: GIT COMMIT & PUSH

### Step 5a: Check Git Status
```bash
git status
```

### Step 5b: Add All Changes
```bash
git add -A
```

### Step 5c: Commit
```bash
git commit -m "chore: MVP transformation - core learning focus only

- Remove user accounts, cloud sync, gamification
- Delete 3500+ lines of non-essential code
- Simplify state management
- Create SimpleProgressCounter component
- Keep vocabulary, lessons, grammar, practice
- CI/CD ready for GitHub Pages"
```

### Step 5d: Push
```bash
git push origin main
```

---

## VERIFICATION CHECKLIST

Run these final commands to confirm MVP status:

```bash
# All in one command:
echo "=== TypeScript ===" && pnpm run check && \
echo "=== Linting ===" && pnpm run lint:check && \
echo "=== Tests ===" && pnpm run test:unit && \
echo "=== Build ===" && pnpm run build:gh-pages && \
echo "=== File Check ===" && \
ls -la build/data/unified-vocabulary.json && \
ls -la build/translations/ && \
echo "✅ MVP READY!"
```

### Expected Results:
```
=== TypeScript ===
✓ All files type-checked
✓ 0 errors

=== Linting ===
✓ No critical issues
✓ <5 warnings

=== Tests ===
✓ All tests pass

=== Build ===
✓ build/ created
✓ 250KB bundle size

=== File Check ===
✓ unified-vocabulary.json exists (500+ items)
✓ translations/ exists (de.json, en.json)

✅ MVP READY!
```

---

## QUICK ROLLBACK (if needed)

```bash
# See commit history
git log --oneline | head -20

# Find the commit before MVP changes
git reset --hard <commit-hash>

# Push to revert
git push -f origin main
```

---

## TROUBLESHOOTING

### Issue: "import not found" after deletions
**Fix**: Run `pnpm run check` to find the line, then remove the import

### Issue: Build fails
**Fix**: 
```bash
rm -rf build/ .svelte-kit/ node_modules/.vite/
pnpm run build:gh-pages
```

### Issue: Tests fail after changes
**Fix**:
```bash
pnpm run test:unit -- --reporter=verbose
# Look for which test failed, check if it depends on deleted code
```

### Issue: Translations not loading
**Fix**:
```bash
# Verify translation plugin is working
grep "translationPlugin()" vite.config.ts

# Check build output
ls -la build/translations/
```

---

## EXPECTED OUTCOMES

### Before MVP
- Lines of code: ~50K
- Components: 50+
- Build time: 30+ seconds
- Type warnings: 30+
- Lint warnings: 10+
- Features: Mix of core + commercial

### After MVP  
- Lines of code: ~25K (50% reduction)
- Components: 20 (40% reduction)
- Build time: 15 seconds
- Type warnings: <5
- Lint warnings: <5
- Features: Core learning only

---

**Total Execution Time: ~4 hours**
- Phase 1: 30 min
- Phase 2: 45 min
- Phase 3: 30 min
- Phase 4: 1 hour
- Phase 5: 30 min
- Buffer: 15 min

Ready? Start with Phase 1 Step 1a.
