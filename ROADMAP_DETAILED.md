# Detailed Implementation Roadmap: Bulgarian-German Learning App

This roadmap outlines the step-by-step transformation of the application into a rich, gamified learning platform.

## ✅ Epic 1: Foundation & Data Refactoring
**Goal**: Establish the robust data structures and global state management needed for the new features.

- [x] **Task 1.1: Define Rich Types**
    - Updated `src/lib/schemas/vocabulary.ts` to include `RichVocabularyItem` extensions.
- [x] **Task 1.2: Refactor Vocabulary Data**
    - Migrated `vocabulary-unified.json` to new structure.
- [x] **Task 1.3: Global Session State**
    - Created `src/lib/state/session.svelte.ts` with Streak and XP tracking.
- [x] **Task 1.4: High-Fidelity Data Population**
    - Populated A1-B1 words with rich context (mnemonics, nuances, grammar).

## 🎨 Epic 2: The Learning Interface (UI/UX)
**Goal**: Replace the current list-based practice with an immersive "Card-First" experience.

- [ ] **Task 2.1: FlashCard Component (`src/lib/components/flashcard/FlashCard.svelte`)**
    - **Props**: `item: VocabularyItem`, `flipped: boolean`.
    - **Front**: Large German word + Emoji/Image.
    - **Back**: Bulgarian word + Contextual Nuance + Grammar Details (Pills) + Audio Button.
    - **Animation**: CSS `transform-style: preserve-3d` with a smooth 0.6s transition.
    - **Accessibility**: Ensure keyboard focus and screen reader announcements for card flip.

- [ ] **Task 2.2: Quiz Controller (`src/lib/components/flashcard/QuizController.svelte`)**
    - **State**: Manage `userAnswer` and `feedbackStatus` ('idle', 'correct', 'incorrect') locally.
    - **Logic**: 
        - Normalize input (trim, lowercase).
        - Compare with `item.bulgarian`.
        - Emit events: `success`, `failure`, `next`.
    - **Integration**: Call `learningSession.awardXP(item.xp_value)` on success.

- [ ] **Task 2.3: Study Session Layout (`src/routes/learn/+page.svelte`)**
    - **Data Loading**: Fetch random set of 10 items via `DataLoader`.
    - **Session Logic**: 
        - Call `learningSession.startSession()` on mount.
        - Track `currentIndex` and `sessionComplete` state.
    - **Layout**:
        - **Header**: Tweened Progress Bar (`learningSession.progressPercentage`) + Fire Streak Counter (`learningSession.currentStreak`).
        - **Main**: Centered `FlashCard` container.
        - **Footer**: Sticky `QuizController` area.

- [ ] **Task 2.4: Visual Feedback System**
    - **Animations**: 
        - Shake effect for errors (`svelte/motion`).
        - Scale/Pop effect for success.
        - Floating XP indicators ("+10 XP").
    - **Confetti**: Trigger simple particle burst on session completion.

## 🏆 Epic 3: Engagement & Gamification
**Goal**: Make learning addictive through immediate positive reinforcement.

- [ ] **Task 3.1: Streak System UI**
    - Visual indicator in `Header`: Fire emoji 🔥 with animating counter.
- [ ] **Task 3.2: Leveling Notifications**
    - Toast/Modal when leveling up based on total XP.
- [ ] **Task 3.3: Dashboard Refinement**
    - Update home page to show "Words Learned" vs "Words to Review".

## 📚 Epic 4: Content Enrichment
**Goal**: Fill the app with high-quality, contextual data.

- [ ] **Task 4.1: Data Entry Strategy**
    - Plan for populating remaining A1-A2 words.
- [ ] **Task 4.2: Audio Integration**
    - Add Audio player helper in `FlashCard`.

---
**Status**: In Progress (Epic 2)