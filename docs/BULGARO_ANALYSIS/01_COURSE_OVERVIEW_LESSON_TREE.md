# Bulgaro.io Analysis: Course Overview & Lesson Tree Structure

## Screenshot Identification
**Source**: Bulgaro.io Course Structure  
**Language**: Bulgarian English Learning App  
**Purpose**: Main navigation showing lesson progression (Levels 1-25)

## Key Observations

### Course Structure
- **Linear Progression**: 25 levels organized sequentially (Level 1 → Level 25)
- **Lesson Groupings**: Multiple lessons per level (e.g., Level 2 has "Basics 1" and "Politeness")
- **Completion Status**: Checkmarks indicate completed lessons ✓
- **Status Indicators**:
  - Green with checkmark = Completed
  - Green (no checkmark) = In progress
  - Gray/Faded = Locked (not yet available)

### Level Progression (Observed)
- **Level 1**: Cyrillic (language introduction)
- **Level 2**: Basics 1, Politeness (fundamental grammar)
- **Level 3**: Basics 2 (grammar continuation)
- **Level 4**: Basics 3, Counting to 10 (numbers)
- **Level 5**: Definite Articles (grammar concept)
- **Levels 6-25**: Progressive topics (Articles, Prepositions, Questions, Clauses, etc.)

### Right Panel: User Progress Dashboard
- **Level**: Current level indicator (e.g., "LEVEL 5")
- **Statistics**:
  - XP/Experience points: 404
  - Words learned: 74
  - Study streak: 0 days
- **Call-to-Action**: "Practice Lesson" red button
- **Progress Tracking**: Visual streak counter and word count

### Design Patterns
- **Progressive Disclosure**: Users unlock lessons by completing prerequisites
- **Color Coding**: Green (done/active), Gray (locked), Red (calls-to-action)
- **Gamification**: XP, streak counter, word tracking
- **Visual Hierarchy**: Level groupings make progression clear

## Architectural Insights

1. **Structured Course Design**: Linear progression ensures logical grammar buildup
2. **Lesson Bundling**: Related topics grouped (Basics 1, 2, 3) provide cohesion
3. **Progress Visibility**: Real-time stats motivate continued learning
4. **Unlock Mechanism**: Prevents users from tackling advanced content unprepared
5. **Completion Tracking**: Visual feedback (checkmarks) reinforces accomplishment

## Application to BulgarianGermanLearningApp

### What to Replicate
- [ ] Linear lesson progression (Beginner → Advanced)
- [ ] Lesson grouping/nesting (e.g., "Basics Part 1, 2, 3")
- [ ] Completion status tracking with visual indicators
- [ ] User progress dashboard with stats (words learned, streaks, XP)
- [ ] Level-based progression visualization

### Technical Implementation Considerations
- Use JSON-based course structure for easy expansion
- Implement local progress tracking via IndexedDB
- Create LessonTree.svelte component for visualization
- Add unlock/prerequisite logic for lessons
- Track completion state and statistics

## Grammar Progression Theory
The 25-level structure suggests gradual complexity:
- **Levels 1-5**: Foundations (alphabet, basic sentences, articles)
- **Levels 6-15**: Intermediate (prepositions, verb tenses, questions)
- **Levels 16-25**: Advanced (subjunctive, clauses, complex structures)

This aligns with CEFR B1 (Intermediate) progression.
