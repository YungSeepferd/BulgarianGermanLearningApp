# Implementation Guide: Daily Streaks & Goals Feature

## Overview

This guide details implementing a daily streak tracking system with goals/targets to increase user engagement and motivation through gamification.

**Estimated Effort**: 2-3 days
**Priority**: HIGH (Quick wins for engagement)
**Dependencies**: None (localStorage-based)

---

## Architecture & Data Model

### LocalStorage Schema

```javascript
// Daily streak data structure
{
  "bgde:streak": {
    "currentStreak": 5,           // Days in a row (resets on 0 practice)
    "longestStreak": 23,           // Best streak ever
    "lastPracticeDate": "2025-11-04",  // ISO date string
    "practiceHistory": {
      "2025-11-04": true,
      "2025-11-03": true,
      "2025-11-02": false,          // Missed day
      "2025-11-01": true
    }
  },
  
  "bgde:daily_goal": {
    "target": 20,                  // Items per day
    "unit": "items",               // or "minutes"
    "completedToday": 15,          // Count for today
    "goalHistoryLastWeek": [20, 18, 15, 20, 20, 0, 10]
  }
}
```

### Data Flow

1. **Session Start** → Check last practice date
2. **Practice Completion** → Update streak & goal progress
3. **Daily Reset** → Reset `completedToday` at midnight (UTC)
4. **Display** → Show in UI with animation/celebration

---

## Implementation Steps

### Step 1: Create Streak Management Module

**File**: `assets/js/modules/streak-manager.js`

```javascript
/**
 * Daily Streak & Goals Manager
 * Handles streak tracking, goal management, and motivational updates
 */

class StreakManager {
  constructor() {
    this.STORAGE_KEY = 'bgde:streak';
    this.GOAL_KEY = 'bgde:daily_goal';
    this.initializeData();
  }

  /**
   * Initialize streak data if not exists
   */
  initializeData() {
    const existing = localStorage.getItem(this.STORAGE_KEY);
    if (!existing) {
      const today = this.getTodayDate();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        currentStreak: 0,
        longestStreak: 0,
        lastPracticeDate: null,
        practiceHistory: {}
      }));
    }

    const goalExisting = localStorage.getItem(this.GOAL_KEY);
    if (!goalExisting) {
      localStorage.setItem(this.GOAL_KEY, JSON.stringify({
        target: 20,
        unit: 'items',
        completedToday: 0,
        goalHistoryLastWeek: []
      }));
    }
  }

  /**
   * Get today's date in YYYY-MM-DD format (UTC)
   */
  getTodayDate() {
    const date = new Date();
    return date.toISOString().split('T')[0];
  }

  /**
   * Check if date is today
   */
  isToday(dateString) {
    return dateString === this.getTodayDate();
  }

  /**
   * Check if date is yesterday
   */
  isYesterday(dateString) {
    const today = new Date(this.getTodayDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    return dateString === yesterdayStr;
  }

  /**
   * Record a practice session completion
   */
  recordPracticeSession(itemsCompleted = 1) {
    const streak = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
    const today = this.getTodayDate();

    // Initialize today's history if not exists
    if (!streak.practiceHistory[today]) {
      streak.practiceHistory[today] = true;
    }

    // Update streak logic
    if (streak.lastPracticeDate === null) {
      // First practice ever
      streak.currentStreak = 1;
      streak.longestStreak = 1;
    } else if (this.isYesterday(streak.lastPracticeDate)) {
      // Consecutive day - continue streak
      streak.currentStreak += 1;
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }
    } else if (!this.isToday(streak.lastPracticeDate)) {
      // Missed days - reset streak
      streak.currentStreak = 1;
    }
    // else: practicing again today (no change)

    streak.lastPracticeDate = today;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(streak));

    // Update daily goal
    this.updateDailyGoalProgress(itemsCompleted);

    return this.getStreakData();
  }

  /**
   * Update daily goal progress
   */
  updateDailyGoalProgress(itemsCompleted) {
    const goal = JSON.parse(localStorage.getItem(this.GOAL_KEY));
    const today = this.getTodayDate();

    // Reset goal if new day
    if (goal.lastResetDate !== today) {
      goal.completedToday = 0;
      goal.lastResetDate = today;
    }

    goal.completedToday += itemsCompleted;
    localStorage.setItem(this.GOAL_KEY, JSON.stringify(goal));
  }

  /**
   * Get current streak data
   */
  getStreakData() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY));
  }

  /**
   * Get daily goal data
   */
  getGoalData() {
    return JSON.parse(localStorage.getItem(this.GOAL_KEY));
  }

  /**
   * Update daily goal target
   */
  setDailyGoal(target, unit = 'items') {
    const goal = JSON.parse(localStorage.getItem(this.GOAL_KEY));
    goal.target = target;
    goal.unit = unit;
    localStorage.setItem(this.GOAL_KEY, JSON.stringify(goal));
  }

  /**
   * Get streak status for display
   */
  getStreakStatus() {
    const streak = this.getStreakData();
    const today = this.getTodayDate();
    const practiceToday = streak.practiceHistory[today] === true;

    return {
      current: streak.currentStreak,
      longest: streak.longestStreak,
      practiceToday,
      lastPracticeDate: streak.lastPracticeDate,
      message: this.getStreakMessage(streak.currentStreak, practiceToday)
    };
  }

  /**
   * Generate motivational message
   */
  getStreakMessage(streakCount, practiceToday) {
    if (!practiceToday) {
      return `Keep your ${streakCount}-day streak going!`;
    }

    if (streakCount === 1) return 'Great start! Keep it going!';
    if (streakCount === 3) return '🔥 Amazing! 3-day streak!';
    if (streakCount === 7) return '🏆 One week streak! You\'re a champion!';
    if (streakCount === 30) return '🎯 30-day streak! Incredible dedication!';
    if (streakCount % 10 === 0) return `🚀 ${streakCount}-day streak! Outstanding!`;
    
    return `You're on a ${streakCount}-day streak!`;
  }

  /**
   * Get goal progress percentage
   */
  getGoalProgress() {
    const goal = this.getGoalData();
    const percentage = Math.min(100, Math.round((goal.completedToday / goal.target) * 100));
    return {
      completed: goal.completedToday,
      target: goal.target,
      percentage,
      unit: goal.unit,
      completed: goal.completedToday >= goal.target
    };
  }
}

// Export as module
export default StreakManager;
```

### Step 2: Create UI Component for Streak Display

**File**: `assets/js/modules/streak-ui.js`

```javascript
/**
 * Streak & Goals UI Component
 * Renders streak display and goal progress bar
 */

import StreakManager from './streak-manager.js';

class StreakUI {
  constructor(containerSelector = '#streak-container') {
    this.streakManager = new StreakManager();
    this.container = document.querySelector(containerSelector);
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
    this.attachEventListeners();
    this.setupDailyReset();
  }

  /**
   * Render streak and goal UI
   */
  render() {
    const streakStatus = this.streakManager.getStreakStatus();
    const goalProgress = this.streakManager.getGoalProgress();

    const html = `
      <div class="streak-container" role="region" aria-label="Daily streak and goals">
        <!-- Streak Display -->
        <div class="streak-display">
          <div class="streak-current">
            <div class="flame-icon">🔥</div>
            <div class="streak-info">
              <div class="streak-number">${streakStatus.current}</div>
              <div class="streak-label">Day Streak</div>
            </div>
            <div class="streak-best">
              Best: <strong>${streakStatus.longest}</strong>
            </div>
          </div>
          
          <div class="streak-message">
            ${streakStatus.message}
          </div>
        </div>

        <!-- Daily Goal Display -->
        <div class="daily-goal">
          <div class="goal-header">
            <span>Today's Goal</span>
            <span class="goal-target">${goalProgress.completed}/${goalProgress.target} ${goalProgress.unit}</span>
          </div>
          
          <div class="goal-progress-bar">
            <div class="goal-progress-fill" style="width: ${goalProgress.percentage}%"></div>
          </div>
          
          <div class="goal-status">
            ${goalProgress.completed >= goalProgress.target 
              ? '<span class="goal-complete">✅ Goal achieved! Great work!</span>'
              : `<span class="goal-remaining">${goalProgress.target - goalProgress.completed} more to go</span>`
            }
          </div>
        </div>

        <!-- Settings Button -->
        <button class="streak-settings-btn" aria-label="Streak settings">⚙️</button>
      </div>
    `;

    this.container.innerHTML = html;
  }

  /**
   * Update display after practice session
   */
  updateAfterSession(itemsCompleted) {
    const updatedStreak = this.streakManager.recordPracticeSession(itemsCompleted);
    this.showCelebration(updatedStreak.currentStreak);
    this.render();
  }

  /**
   * Show celebration animation
   */
  showCelebration(streakCount) {
    if (streakCount % 5 !== 0) return; // Celebrate every 5 days

    const celebration = document.createElement('div');
    celebration.className = 'streak-celebration';
    celebration.innerHTML = `
      <div class="celebration-message">
        🎉 ${streakCount}-Day Streak! 🎉
      </div>
    `;
    
    document.body.appendChild(celebration);
    
    setTimeout(() => celebration.remove(), 3000);
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const settingsBtn = this.container?.querySelector('.streak-settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.showSettings());
    }
  }

  /**
   * Show settings dialog
   */
  showSettings() {
    const goal = this.streakManager.getGoalData();
    const newTarget = prompt('Set your daily goal (items):', goal.target);
    
    if (newTarget && !isNaN(newTarget)) {
      this.streakManager.setDailyGoal(parseInt(newTarget));
      this.render();
    }
  }

  /**
   * Setup daily reset check
   */
  setupDailyReset() {
    // Check every minute if we've crossed into a new day
    setInterval(() => {
      const today = new Date();
      const midnightUTC = new Date(today);
      midnightUTC.setUTCHours(0, 0, 0, 0);
      
      const timeUntilMidnight = midnightUTC.getTime() - today.getTime();
      if (timeUntilMidnight > 0 && timeUntilMidnight < 60000) {
        // New day approaching, re-render to reset daily goal
        this.render();
      }
    }, 60000); // Check every minute
  }
}

export default StreakUI;
```

### Step 3: Add CSS Styling

**File**: `assets/scss/components/_streak.scss`

```scss
.streak-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

  .streak-display {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;

    .streak-current {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .flame-icon {
        font-size: 2.5rem;
        animation: flame-flicker 0.6s infinite alternate;
      }

      .streak-info {
        .streak-number {
          font-size: 1.75rem;
          font-weight: 700;
          line-height: 1;
        }

        .streak-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          opacity: 0.9;
        }
      }

      .streak-best {
        margin-left: auto;
        font-size: 0.9rem;
        opacity: 0.9;
      }
    }

    .streak-message {
      font-size: 0.95rem;
      font-weight: 500;
      margin-top: 0.5rem;
      text-align: center;
      width: 100%;
    }
  }

  .daily-goal {
    .goal-header {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;

      .goal-target {
        font-weight: 600;
      }
    }

    .goal-progress-bar {
      width: 100%;
      height: 8px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 4px;
      overflow: hidden;

      .goal-progress-fill {
        height: 100%;
        background: #4ade80;
        border-radius: 4px;
        transition: width 0.3s ease;
      }
    }

    .goal-status {
      font-size: 0.85rem;
      margin-top: 0.5rem;
      text-align: center;

      .goal-complete {
        color: #4ade80;
        font-weight: 600;
      }

      .goal-remaining {
        opacity: 0.9;
      }
    }
  }

  .streak-settings-btn {
    align-self: flex-end;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.5);
    }
  }
}

.streak-celebration {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;

  .celebration-message {
    background: white;
    color: #667eea;
    padding: 2rem 3rem;
    border-radius: 16px;
    font-size: 1.5rem;
    font-weight: 700;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    animation: pop-in 0.3s ease;
  }
}

@keyframes flame-flicker {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.1);
  }
}

@keyframes pop-in {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.05);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

// Mobile responsive
@media (max-width: 640px) {
  .streak-container {
    padding: 1rem;

    .streak-display {
      flex-direction: column;
      align-items: center;

      .streak-current {
        flex-direction: column;
        text-align: center;

        .streak-best {
          margin-left: 0;
        }
      }
    }
  }
}
```

### Step 4: Integration Points

**In `unified-practice-session.js` (after session completion)**:

```javascript
// Import streak manager
import StreakManager from './modules/streak-manager.js';

// After practice session completes
async completeSession() {
  // ... existing session completion code ...
  
  // Update streak
  const streakManager = new StreakManager();
  streakManager.recordPracticeSession(this.session.correct);
  
  // Dispatch custom event for UI update
  window.dispatchEvent(new CustomEvent('streak-updated', {
    detail: streakManager.getStreakStatus()
  }));
}
```

### Step 5: Add to HTML Template

**In `layouts/shortcodes/flashcards.html` or practice page template**:

```html
<!-- Add streak container to practice page header -->
<div id="streak-container"></div>

<script type="module">
  import StreakUI from '/BulgarianGermanLearningApp/js/modules/streak-ui.js';
  
  document.addEventListener('DOMContentLoaded', () => {
    const streakUI = new StreakUI('#streak-container');
    
    // Update streak after practice session
    window.addEventListener('practice-complete', (e) => {
      streakUI.updateAfterSession(e.detail.correct);
    });
  });
</script>
```

---

## Testing Strategy

### Unit Tests

```javascript
// Test streak calculation
describe('StreakManager', () => {
  let manager;

  beforeEach(() => {
    localStorage.clear();
    manager = new StreakManager();
  });

  test('first practice creates 1-day streak', () => {
    manager.recordPracticeSession(10);
    const status = manager.getStreakStatus();
    expect(status.current).toBe(1);
    expect(status.longest).toBe(1);
  });

  test('consecutive days increment streak', () => {
    manager.recordPracticeSession(10);
    // Simulate next day
    localStorage.setItem('bgde:streak', JSON.stringify({
      ...manager.getStreakData(),
      lastPracticeDate: new Date(new Date().getTime() - 86400000).toISOString().split('T')[0]
    }));
    manager.recordPracticeSession(10);
    expect(manager.getStreakStatus().current).toBe(2);
  });

  test('missed day resets streak', () => {
    manager.recordPracticeSession(10);
    // Simulate 2 days ago
    localStorage.setItem('bgde:streak', JSON.stringify({
      ...manager.getStreakData(),
      lastPracticeDate: new Date(new Date().getTime() - 172800000).toISOString().split('T')[0]
    }));
    manager.recordPracticeSession(10);
    expect(manager.getStreakStatus().current).toBe(1);
  });

  test('daily goal tracks progress', () => {
    manager.updateDailyGoalProgress(5);
    manager.updateDailyGoalProgress(8);
    const progress = manager.getGoalProgress();
    expect(progress.completed).toBe(13);
  });
});
```

### Manual Testing

- [ ] Verify streak increments on consecutive days
- [ ] Verify streak resets after missed day
- [ ] Verify celebration animation on 5-day milestones
- [ ] Verify goal progress bar updates
- [ ] Verify goal settings dialog works
- [ ] Verify display persists after page refresh
- [ ] Test on mobile (responsive design)

---

## Deployment Checklist

- [ ] Add streak-manager.js to assets/js/modules/
- [ ] Add streak-ui.js to assets/js/modules/
- [ ] Add _streak.scss to assets/scss/components/
- [ ] Import _streak.scss in main.scss
- [ ] Add streak container div to practice page template
- [ ] Update unified-practice-session.js with streak integration
- [ ] Test localStorage persistence
- [ ] Verify no console errors
- [ ] Test on different browsers/devices
- [ ] Create unit tests
- [ ] Performance test with 100+ days of history

---

## Future Enhancements

1. **Streak Freezing**: Buy "streak freeze" with accumulated points
2. **Weekly Challenges**: Special goals for specific weeks
3. **Social Sharing**: Share streak achievements
4. **Reminders**: Push notifications for daily practice
5. **Streak Leaderboards**: Compare with other learners
6. **Streak History Graph**: Visual representation of consistency
