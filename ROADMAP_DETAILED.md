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

## ✅ Epic 2: The Learning Interface (UI/UX)
**Goal**: Replace the current list-based practice with an immersive "Card-First" experience.

- [x] **Task 2.1: FlashCard Component**
    - Created `src/lib/components/flashcard/FlashCard.svelte` with 3D flip animation and rich content display.
- [x] **Task 2.2: Quiz Controller**
    - Created `src/lib/components/flashcard/QuizController.svelte` for input handling and validation.
- [x] **Task 2.3: Study Session Layout**
    - Implemented `src/routes/learn/+page.svelte` integrating session logic, progress bar, and streak display.
- [x] **Task 2.4: Visual Feedback System**
    - Integrated confetti animation and smooth transitions.

## 🏆 Epic 3: Engagement & Gamification
**Goal**: Make learning addictive through immediate positive reinforcement and long-term progression.

### Technical Design & Architecture
-   **State Management**: Expand `LearningSession` (`src/lib/state/session.svelte.ts`) to manage:
    -   `totalXP`: Accumulated over time (persisted).
    -   `level`: Derived from `totalXP` (e.g., Level 1 = 0-100 XP, Level 2 = 101-300 XP).
    -   `levelProgress`: Percentage to next level.
-   **Components**:
    -   `LevelUpModal.svelte`: A celebratory modal triggered when `level` changes.
    -   `StreakWidget.svelte`: A reusable component for displaying streak status (for Dashboard).
-   **Integration**:
    -   `Dashboard (+page.svelte)`: Subscribe to `learningSession` to show "Total Words Learned" and "Current Level".
    -   `QuizController`: Trigger level-up check after awarding XP.

### Implementation Tasks
- [ ] **Task 3.1: Enhance Session State**
    - Update `src/lib/state/session.svelte.ts`:
        - Add `totalXP` persistence.
        - Add `calculateLevel(xp)` helper.
        - Add `checkLevelUp()` method to be called after XP gain.
- [ ] **Task 3.2: Create LevelUpModal Component**
    - Create `src/lib/components/gamification/LevelUpModal.svelte`.
    - Use `dialog` element or overlay.
    - Animation: Scale up + Confetti burst.
- [ ] **Task 3.3: Dashboard Refinement**
    - Refactor `src/routes/+page.svelte` to replace static content with dynamic user stats:
        - Current Level & Progress Bar.
        - Total Words Learned (from `DataLoader.getStats()`).
        - Quick "Continue Learning" button.

## 📚 Epic 4: Content Enrichment
**Goal**: Fill the app with high-quality, contextual data.

- [ ] **Task 4.1: Data Entry Strategy**
    - Plan for populating remaining A1-A2 words.
- [ ] **Task 4.2: Audio Integration**
    - Add Audio player helper in `FlashCard`.

---
**Status**: In Progress (Epic 3)