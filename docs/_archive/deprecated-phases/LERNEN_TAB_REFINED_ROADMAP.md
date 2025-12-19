# Lernen Tab - Refined Implementation Roadmap

**Date:** 2025-12-13  
**Status:** Ready for Implementation  
**Estimated Total Time:** 4-6 days

---

## Executive Summary

After reviewing the comprehensive malformation analysis, I've refined the implementation roadmap into a more strategic, dependency-aware approach. The key insight: **accessibility and type safety are foundational** - fixing them first prevents cascading issues in later phases.

### Strategic Priorities

1. **Foundation First:** Type safety + accessibility (prevents future bugs)
2. **User Impact:** Progress visualization (immediate UX improvement)
3. **Polish:** UI/performance/design consistency (incremental refinement)

---

## Phase 1: Foundation (Critical - Days 1-2)

**Goal:** Establish type safety and accessibility compliance as the solid foundation for all subsequent work.

### 1.1 Type Safety Overhaul (Day 1, AM - 4 hours)

**Why First:** Type errors cascade into runtime errors. Fixing type safety first makes all subsequent development safer.

#### Implementation Tasks

**File:** `src/routes/learn/[id]/+page.svelte`

```typescript
// Remove all `as any` casts and implement proper type guards
const exampleSentences = $derived.by(() => {
  const metadata = item?.metadata;
  const legacy = item?.exampleSentences;
  
  if (metadata?.examples) {
    return metadata.examples.map(ex => ({
      source: ex.german || ex.source || '',
      target: ex.bulgarian || ex.target || '',
      context: ex.context
    }));
  }
  
  if (legacy) {
    return legacy.map(ex => ({
      source: ex.de || ex.source || '',
      target: ex.bg || ex.target || '',
      context: ex.context
    }));
  }
  
  return [];
});

const breakdown = $derived.by(() => {
  const metadata = item?.metadata;
  if (!metadata?.components) return null;
  
  return metadata.components.map(comp => ({
    part: comp.part || '',
    meaning: comp.meaning || '',
    note: comp.note,
    grammarTag: comp.grammarTag
  }));
});

const culturalNote = $derived(
  item?.metadata?.culturalNote || 
  item?.metadata?.notes || 
  null
);
```

**File:** `src/lib/components/flashcard/Flashcard.svelte`

```typescript
// Add proper type guards for audio player
let audioPlayer = $state<HTMLAudioElement | null>(null);

const hasAudio = $derived(!!vocabularyItem?.audio_url);

function playAudio() {
  if (!hasAudio) return;
  
  if (!audioPlayer) {
    audioPlayer = new Audio(vocabularyItem.audio_url);
  }
  
  audioPlayer.play().catch(err => {
    console.error('Audio playback failed:', err);
  });
}
```

**Success Criteria:**
- ✅ Zero `as any` casts in Learn route
- ✅ Zero TypeScript errors in `pnpm run check`
- ✅ All optional property access properly guarded

**Time:** 4 hours

---

### 1.2 Accessibility Compliance (Day 1, PM - 4 hours)

**Why Second:** With types fixed, we can safely implement accessibility features without runtime errors.

#### Implementation Tasks

**File:** `src/routes/learn/[id]/+page.svelte`

```svelte
<div class="learn-container" role="main" aria-labelledby="learn-title">
  <!-- Screen reader only heading -->
  <h1 id="learn-title" class="sr-only">
    {appState.languageMode === 'DE_BG' ? 'Lernen: ' : 'Учене: '}
    {item?.german} {dirArrow} {item?.bulgarian}
  </h1>

  <!-- Hero with proper landmarks -->
  <header class="hero" aria-label={ui.t('learn.wordInfo')}>
    <div class="hero__main">
      <h2 class="hero__title">{sourceText}</h2>
      <span class="hero__arrow" aria-hidden="true">{dirArrow}</span>
      <p class="hero__subtitle" lang={targetLang}>{targetText}</p>
    </div>

    <div class="hero__badges" role="list" aria-label={ui.t('learn.badges')}>
      {#if cefrLevel}
        <span class="badge" role="listitem" aria-label="CEFR level {cefrLevel}">
          {cefrLevel}
        </span>
      {/if}
      {#if partOfSpeech}
        <span class="badge" role="listitem" aria-label="Part of speech: {partOfSpeech}">
          {partOfSpeech}
        </span>
      {/if}
    </div>
  </header>

  <!-- Action toolbar with proper ARIA -->
  <div class="actions" role="toolbar" aria-label={ui.t('learn.actions')}>
    <a
      class="button"
      href="/practice"
      role="button"
      aria-label={ui.t('learn.practiceButton')}
    >
      {ui.t('learn.practice')}
    </a>
    <a
      class="button"
      href="/vocabulary"
      role="button"
      aria-label={ui.t('learn.backToVocabulary')}
    >
      {ui.t('learn.back')}
    </a>
  </div>
</div>

<style>
  /* Screen reader only utility */
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

  /* Focus visible styles */
  .button:focus-visible {
    outline: 2px solid var(--color-focus-ring, #3b82f6);
    outline-offset: 2px;
  }
</style>
```

**File:** `src/lib/components/flashcard/Flashcard.svelte`

```svelte
<div
  class="scene"
  role="region"
  aria-label={flipped ? ui.flashcardBack : ui.flashcardFront}
>
  <div
    class="card"
    class:is-flipped={flipped}
    role="button"
    tabindex="0"
    onclick={onFlip}
    onkeydown={handleKeydown}
    aria-label={flipped ? ui.showFront : ui.showBack}
    aria-expanded={flipped}
    aria-describedby="flip-hint"
  >
    <div class="flashcard-front">
      <!-- Front content -->
    </div>
    
    <div class="flashcard-back">
      <!-- Back content -->
      <p id="flip-hint" class="flip-hint">{ui.flipHint}</p>
    </div>
  </div>
</div>

<script lang="ts">
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onFlip();
    } else if (event.key === 'Escape' && flipped) {
      event.preventDefault();
      onFlip(); // Return to front
    }
  }
</script>

<style>
  .card:focus-visible {
    outline: 2px solid var(--color-focus-ring, #3b82f6);
    outline-offset: 4px;
  }
</style>
```

**Success Criteria:**
- ✅ All interactive elements keyboard accessible
- ✅ Proper ARIA roles, states, and properties
- ✅ Screen reader announces all content correctly
- ✅ Focus indicators visible on all focusable elements

**Time:** 4 hours

---

### 1.3 Memory Leak Prevention (Day 2, AM - 2 hours)

**Why Third:** With types and ARIA in place, add proper cleanup to prevent runtime degradation.

#### Implementation Tasks

**File:** `src/lib/components/flashcard/Flashcard.svelte`

```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  let audioPlayer = $state<HTMLAudioElement | null>(null);

  onMount(() => {
    // Initialize audio player if needed
    if (vocabularyItem?.audio_url) {
      audioPlayer = new Audio(vocabularyItem.audio_url);
    }

    // Cleanup function
    return () => {
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = '';
        audioPlayer = null;
      }
    };
  });
</script>
```

**File:** `src/routes/learn/[id]/+page.svelte`

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { eventBus } from '$lib/services/event-bus';

  let unsubscribeProgress: (() => void) | null = null;

  onMount(() => {
    // Subscribe to progress events
    unsubscribeProgress = eventBus.subscribe('PROGRESS_UPDATED', () => {
      // Trigger reactivity
      masteryData;
    });

    // Cleanup
    return () => {
      if (unsubscribeProgress) {
        unsubscribeProgress();
        unsubscribeProgress = null;
      }
    };
  });
</script>
```

**Success Criteria:**
- ✅ No memory leaks in Chrome DevTools profiler
- ✅ Proper cleanup on component unmount
- ✅ Event listeners properly unsubscribed

**Time:** 2 hours

---

## Phase 2: User Experience (High Priority - Days 2-3)

**Goal:** Integrate progress tracking and improve responsive design for immediate UX impact.

### 2.1 Progress Visualization Integration (Day 2, PM - 4 hours)

**Why First in Phase 2:** Progress tracking is the highest-impact UX improvement for learners.

#### Implementation Tasks

**File:** `src/routes/learn/[id]/+page.svelte`

```svelte
<script lang="ts">
  import { progressService } from '$lib/services/progress';
  import { diContainer } from '$lib/services/di-container';

  // Get progress data
  const masteryData = $derived(
    item ? progressService.getVocabularyMastery(item.id) : null
  );

  const masteryLevel = $derived(masteryData?.masteryLevel || 0);
  const isMastered = $derived(masteryData?.isMastered || false);
  const totalAttempts = $derived(masteryData?.totalAttempts || 0);
  const correctAttempts = $derived(masteryData?.correctAttempts || 0);

  // Session XP
  const sessionData = $derived(diContainer.getService('learningSession'));
  const sessionXP = $derived(sessionData?.sessionXP || 0);
  const dailyXP = $derived(sessionData?.dailyXP || 0);
</script>

<!-- Add progress panel to content grid -->
<div class="content-grid">
  <!-- Progress Panel -->
  <section class="panel" aria-labelledby="progress-title">
    <h3 id="progress-title" class="panel__title">
      {ui.t('learn.progress')}
    </h3>

    <div class="progress-stats">
      {#if isMastered}
        <div class="mastery-badge mastery-badge--complete">
          <span class="mastery-icon">✓</span>
          <span class="mastery-text">{ui.t('learn.mastered')}</span>
        </div>
      {:else}
        <div class="mastery-meter">
          <div class="mastery-bar" style="width: {masteryLevel}%"></div>
          <span class="mastery-label">{masteryLevel}% {ui.t('learn.mastery')}</span>
        </div>
      {/if}

      <div class="attempt-stats">
        <div class="stat">
          <span class="stat__label">{ui.t('learn.attempts')}</span>
          <span class="stat__value">{totalAttempts}</span>
        </div>
        <div class="stat">
          <span class="stat__label">{ui.t('learn.correct')}</span>
          <span class="stat__value">{correctAttempts}</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Existing panels... -->
</div>

<style>
  .progress-stats {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .mastery-meter {
    position: relative;
    height: 32px;
    background: var(--color-neutral-light);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
  }

  .mastery-bar {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
    transition: width 0.3s ease;
  }

  .mastery-label {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-weight: var(--font-semibold);
    color: var(--color-neutral-dark);
    font-size: var(--text-sm);
  }

  .mastery-badge--complete {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3);
    background: var(--color-success-light);
    border-radius: var(--border-radius-lg);
    color: var(--color-success-dark);
    font-weight: var(--font-semibold);
  }

  .attempt-stats {
    display: flex;
    gap: var(--space-4);
  }

  .stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: var(--space-3);
    background: var(--color-neutral-bg);
    border-radius: var(--border-radius-md);
  }

  .stat__label {
    font-size: var(--text-sm);
    color: var(--color-neutral-text);
    margin-bottom: var(--space-1);
  }

  .stat__value {
    font-size: var(--text-2xl);
    font-weight: var(--font-bold);
    color: var(--color-neutral-dark);
  }
</style>
```

**Success Criteria:**
- ✅ Mastery level displayed accurately
- ✅ Progress updates in real-time during practice
- ✅ Visual distinction between mastered/learning states
- ✅ Attempt statistics visible

**Time:** 4 hours

---

### 2.2 Responsive Layout Improvements (Day 3, AM - 3 hours)

**Why Second:** With progress panel added, ensure all content is responsive.

#### Implementation Tasks

**File:** `src/routes/learn/[id]/+page.svelte`

```svelte
<style>
  .learn-container {
    max-width: var(--container-max-width);
    margin: 0 auto;
    padding: var(--space-7) var(--space-5);
  }

  .content-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--vocabulary-grid-gap);
  }

  /* Tablet */
  @media (min-width: 640px) {
    .hero {
      flex-direction: row;
      justify-content: space-between;
    }
  }

  /* Desktop */
  @media (min-width: 768px) {
    .content-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  /* Mobile optimizations */
  @media (max-width: 639px) {
    .learn-container {
      padding: var(--space-4) var(--space-3);
    }

    .hero__title {
      font-size: var(--text-xl);
    }

    .hero__subtitle {
      font-size: var(--text-lg);
    }

    .panel {
      padding: var(--space-3);
    }

    .button {
      min-height: 48px; /* Touch target size */
      min-width: 48px;
      padding: var(--space-3) var(--space-4);
    }
  }
</style>
```

**Success Criteria:**
- ✅ Layout works on 320px (iPhone SE)
- ✅ Touch targets ≥ 48px on mobile
- ✅ Content readable on all screen sizes
- ✅ No horizontal scroll on any device

**Time:** 3 hours

---

## Phase 3: Polish (Medium Priority - Days 3-4)

**Goal:** Improve performance, design consistency, and code quality.

### 3.1 Design Token Standardization (Day 3, PM - 3 hours)

#### Implementation Tasks

**File:** `src/routes/learn/[id]/+page.svelte`

Replace all hardcoded values:

```svelte
<style>
  .hero__title {
    margin: 0;
    font-size: var(--text-3xl);
    font-weight: var(--font-extrabold);
    color: var(--color-neutral-dark);
  }

  .button {
    padding: var(--space-3) var(--space-4);
    border-radius: var(--border-radius-lg);
    background: var(--color-button-primary);
    color: var(--color-neutral-light);
    font-weight: var(--font-semibold);
  }

  .flip-hint {
    font-size: var(--text-sm);
    color: var(--color-neutral-text);
    opacity: 0.8;
  }
</style>
```

**Success Criteria:**
- ✅ Zero hardcoded colors
- ✅ Zero hardcoded spacing values
- ✅ All typography uses design tokens

**Time:** 3 hours

---

### 3.2 Performance Optimization (Day 4, AM - 3 hours)

#### Implementation Tasks

**File:** `src/lib/components/flashcard/Flashcard.svelte`

```svelte
<script lang="ts">
  // Memoize expensive calculations
  const examples = $derived.by(() => {
    const metadata = vocabularyItem?.metadata;
    if (!metadata?.examples) return [];
    
    return metadata.examples.slice(0, 8); // Limit for performance
  });

  const breakdown = $derived.by(() => {
    if (!vocabularyItem?.metadata?.components) return null;
    
    return vocabularyItem.metadata.components.map(comp => ({
      ...comp,
      displayText: `${comp.part} (${comp.meaning})`
    }));
  });
</script>
```

**Success Criteria:**
- ✅ Flashcard renders in < 16ms (60fps)
- ✅ No unnecessary re-renders
- ✅ Memory usage stable after 100 flips

**Time:** 3 hours

---

## Phase 4: Testing & Validation (Days 4-6)

### 4.1 Automated Testing (Day 4, PM - Day 5)

#### Test Coverage

**File:** `tests/e2e/learn-page.test.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Learn Page', () => {
  test('should display vocabulary item correctly', async ({ page }) => {
    await page.goto('/learn/abend');
    
    await expect(page.locator('h2.hero__title')).toContainText('Abend');
    await expect(page.locator('p.hero__subtitle')).toContainText('Вечер');
  });

  test('should show progress visualization', async ({ page }) => {
    await page.goto('/learn/abend');
    
    const progressPanel = page.locator('section[aria-labelledby="progress-title"]');
    await expect(progressPanel).toBeVisible();
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/learn/abend');
    
    // Tab to flashcard
    await page.keyboard.press('Tab');
    await expect(page.locator('.card')).toBeFocused();
    
    // Flip with Enter
    await page.keyboard.press('Enter');
    await expect(page.locator('.card')).toHaveClass(/is-flipped/);
  });
});
```

**File:** `tests/accessibility/learn-a11y.test.ts`

```typescript
import { test } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test('Learn page passes accessibility audit', async ({ page }) => {
  await page.goto('/learn/abend');
  await injectAxe(page);
  
  await checkA11y(page, {
    axeOptions: {
      rules: {
        'aria-allowed-attr': { enabled: true },
        'aria-required-attr': { enabled: true },
        'color-contrast': { enabled: true },
        'keyboard': { enabled: true }
      }
    }
  });
});
```

**Time:** 1 day

---

### 4.2 Manual Testing (Day 6)

#### Testing Checklist

- [ ] **Keyboard Navigation**
  - Tab through all interactive elements
  - Flip card with Enter/Space
  - Navigate with arrow keys (if applicable)

- [ ] **Screen Reader Testing**
  - VoiceOver (macOS)
  - NVDA (Windows)
  - Verify announcements for all content

- [ ] **Responsive Testing**
  - iPhone SE (320px)
  - iPad (768px)
  - Desktop (1024px+)

- [ ] **Progress Tracking**
  - Start practice session
  - Answer questions
  - Verify progress updates in real-time

- [ ] **Performance**
  - Profile rendering with Chrome DevTools
  - Check memory usage
  - Verify smooth animations

**Time:** 1 day

---

## Success Metrics

### Phase 1 (Foundation)
- ✅ TypeScript check passes with zero errors
- ✅ Axe accessibility audit passes with zero violations
- ✅ No memory leaks in 10-minute profiling session

### Phase 2 (UX)
- ✅ Progress data displays correctly
- ✅ Layout works on all devices (320px-2560px)
- ✅ Touch targets ≥ 48px on mobile

### Phase 3 (Polish)
- ✅ Zero hardcoded design values
- ✅ Flashcard renders at 60fps
- ✅ All interactive elements have proper focus states

### Phase 4 (Testing)
- ✅ Test coverage ≥ 80%
- ✅ All E2E tests pass
- ✅ All accessibility tests pass

---

## Implementation Strategy

### Daily Workflow

```bash
# Start each day
pnpm run dev

# Make changes following the roadmap

# Verify changes
pnpm run check          # TypeScript
pnpm run lint           # Linting
pnpm run test:unit      # Unit tests

# End of day
git add -A
git commit -m "Phase X: [description]"
git push origin main
```

### Commit Strategy

- **Day 1 End:** "Phase 1.1-1.2: Type safety + accessibility foundation"
- **Day 2 End:** "Phase 1.3-2.1: Memory leaks + progress visualization"
- **Day 3 End:** "Phase 2.2-3.1: Responsive layout + design tokens"
- **Day 4 End:** "Phase 3.2-4.1: Performance optimization + automated tests"
- **Day 6 End:** "Phase 4.2: Manual testing complete; all issues resolved"

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing functionality | Run full test suite after each phase |
| Accessibility regression | Keep axe DevTools open during development |
| Performance degradation | Profile after each major change |
| Design inconsistency | Maintain design token checklist |

---

## Next Steps

1. **Review this roadmap** with the team
2. **Set up development environment** (ensure Playwright, axe DevTools installed)
3. **Start Phase 1.1** (Type Safety Overhaul)
4. **Daily standups** to review progress and blockers

---

**Estimated Completion:** 6 working days  
**Ready to Begin:** Yes  
**Blockers:** None identified
