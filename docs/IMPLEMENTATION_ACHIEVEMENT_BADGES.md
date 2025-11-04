# Implementation Guide: Achievement Badges System

## Overview

Create a gamification system with achievement badges that unlock based on learning milestones. Badges motivate users by recognizing progress and providing rewards for consistency, mastery, and engagement.

**Estimated Effort**: 3 days
**Priority**: MEDIUM (Nice-to-have, enhances engagement)
**Dependencies**: Statistics collector module

---

## Feature Requirements

### Badge Categories

**Consistency Badges**
- 🔥 Streak Starter: 3-day streak
- 🔥 Streaker: 7-day streak  
- 🏆 Unstoppable: 30-day streak
- 👑 Legendary: 100-day streak

**Learning Milestones**
- 📚 First Step: Practice 1 item
- 🎓 Scholar: Learn 50 items
- 📖 Bookworm: Master 200 items
- 🧠 Expert: Achieve 300+ items learned

**Accuracy Achievements**
- 🎯 Accurate: 80%+ accuracy in session
- 💯 Flawless: 10+ correct in a row
- ⚡ Perfect Run: 100% accuracy in session

**Speed & Efficiency**
- ⚡ Quick Learner: Complete 20 items in 5 mins
- 🚀 Speed Demon: Average <30s per item

**Dedication**
- ☀️ Early Riser: Practice before 8am
- 🌙 Night Owl: Practice after 8pm
- 📅 Dedicated: Practice every day for week

---

## Implementation Steps

### Step 1: Create Badge Manager Module

**File**: `assets/js/modules/badge-manager.js`

```javascript
/**
 * Achievement Badge Manager
 * Manages badge unlocking and tracking
 */

class BadgeManager {
  constructor(statisticsCollector) {
    this.BADGES_KEY = 'bgde:badges';
    this.UNLOCK_LOG_KEY = 'bgde:badge_unlocks';
    this.stats = statisticsCollector;
    this.initializeBadges();
  }

  /**
   * Define all available badges
   */
  getAvailableBadges() {
    return {
      // Consistency
      'streak_3': {
        id: 'streak_3',
        name: 'Streak Starter',
        description: 'Maintain a 3-day learning streak',
        icon: '🔥',
        category: 'consistency',
        requirement: { streakDays: 3 },
        points: 10
      },
      'streak_7': {
        id: 'streak_7',
        name: 'Streaker',
        description: 'Maintain a 7-day learning streak',
        icon: '🔥',
        category: 'consistency',
        requirement: { streakDays: 7 },
        points: 25
      },
      'streak_30': {
        id: 'streak_30',
        name: 'Unstoppable',
        description: 'Maintain a 30-day learning streak',
        icon: '🏆',
        category: 'consistency',
        requirement: { streakDays: 30 },
        points: 75
      },
      'streak_100': {
        id: 'streak_100',
        name: 'Legendary',
        description: 'Maintain a 100-day learning streak',
        icon: '👑',
        category: 'consistency',
        requirement: { streakDays: 100 },
        points: 200
      },

      // Learning milestones
      'items_1': {
        id: 'items_1',
        name: 'First Step',
        description: 'Practice your first item',
        icon: '📚',
        category: 'milestones',
        requirement: { totalItemsPracticed: 1 },
        points: 5
      },
      'items_50': {
        id: 'items_50',
        name: 'Scholar',
        description: 'Learn 50 items',
        icon: '🎓',
        category: 'milestones',
        requirement: { totalItemsPracticed: 50 },
        points: 20
      },
      'items_200': {
        id: 'items_200',
        name: 'Bookworm',
        description: 'Master 200 items',
        icon: '📖',
        category: 'milestones',
        requirement: { totalItemsPracticed: 200 },
        points: 60
      },
      'items_300': {
        id: 'items_300',
        name: 'Expert',
        description: 'Practice 300+ items',
        icon: '🧠',
        category: 'milestones',
        requirement: { totalItemsPracticed: 300 },
        points: 150
      },

      // Accuracy
      'accuracy_80': {
        id: 'accuracy_80',
        name: 'Accurate',
        description: 'Achieve 80%+ accuracy in a session',
        icon: '🎯',
        category: 'accuracy',
        requirement: { sessionAccuracy: 80 },
        points: 15,
        perSession: true
      },
      'perfect_streak_10': {
        id: 'perfect_streak_10',
        name: 'Flawless',
        description: 'Get 10 correct answers in a row',
        icon: '💯',
        category: 'accuracy',
        requirement: { correctStreak: 10 },
        points: 30,
        perSession: true
      },
      'perfect_session': {
        id: 'perfect_session',
        name: 'Perfect Run',
        description: 'Complete a session with 100% accuracy',
        icon: '⚡',
        category: 'accuracy',
        requirement: { sessionAccuracy: 100, minItems: 5 },
        points: 40,
        perSession: true
      },

      // Speed
      'quick_learner': {
        id: 'quick_learner',
        name: 'Quick Learner',
        description: 'Complete 20 items in under 5 minutes',
        icon: '⚡',
        category: 'speed',
        requirement: { itemsPerMinute: 20 / 5 },
        points: 20,
        perSession: true
      },

      // Dedication
      'early_riser': {
        id: 'early_riser',
        name: 'Early Riser',
        description: 'Practice before 8am',
        icon: '☀️',
        category: 'dedication',
        requirement: { timeBefore: 8 },
        points: 10,
        perSession: true
      },
      'night_owl': {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Practice after 8pm',
        icon: '🌙',
        category: 'dedication',
        requirement: { timeAfter: 20 },
        points: 10,
        perSession: true
      }
    };
  }

  /**
   * Initialize badge state
   */
  initializeBadges() {
    const existing = localStorage.getItem(this.BADGES_KEY);
    if (!existing) {
      const badges = {};
      Object.keys(this.getAvailableBadges()).forEach(badgeId => {
        badges[badgeId] = { unlocked: false, unlockedAt: null };
      });
      localStorage.setItem(this.BADGES_KEY, JSON.stringify(badges));
    }
  }

  /**
   * Check and unlock badges after session
   */
  checkBadgesAfterSession(sessionData) {
    const badges = this.getAvailableBadges();
    const newBadges = [];
    const state = JSON.parse(localStorage.getItem(this.BADGES_KEY));

    Object.entries(badges).forEach(([badgeId, badge]) => {
      // Skip if already unlocked
      if (state[badgeId]?.unlocked) return;

      // Check if requirements met
      if (this.checkBadgeRequirement(badge, sessionData)) {
        // Mark as unlocked
        state[badgeId] = {
          unlocked: true,
          unlockedAt: new Date().toISOString()
        };
        newBadges.push(badge);
        this.logBadgeUnlock(badgeId);
      }
    });

    localStorage.setItem(this.BADGES_KEY, JSON.stringify(state));
    return newBadges;
  }

  /**
   * Check if badge requirement is met
   */
  checkBadgeRequirement(badge, sessionData) {
    const req = badge.requirement;
    const stats = this.stats.getOverallStats();
    const dailyStats = this.stats.getDailyStats(1)[0];

    // Streak requirements
    if (req.streakDays) {
      // Would need to integrate with StreakManager
      // Placeholder for now
      return false;
    }

    // Item count requirements
    if (req.totalItemsPracticed) {
      return stats.totalItems >= req.totalItemsPracticed;
    }

    // Accuracy requirements
    if (req.sessionAccuracy !== undefined) {
      const sessionAccuracy = sessionData.correct / sessionData.total * 100;
      const meetsAccuracy = sessionAccuracy >= req.sessionAccuracy;
      const meetsMinItems = !req.minItems || sessionData.total >= req.minItems;
      return meetsAccuracy && meetsMinItems;
    }

    // Correct streak
    if (req.correctStreak) {
      return sessionData.maxCorrectStreak >= req.correctStreak;
    }

    // Speed requirements
    if (req.itemsPerMinute) {
      const duration = sessionData.durationMinutes || 1;
      const itemsPerMin = sessionData.total / duration;
      return itemsPerMin >= req.itemsPerMinute;
    }

    // Time requirements
    if (req.timeBefore || req.timeAfter) {
      const now = new Date();
      const hour = now.getHours();
      if (req.timeBefore) return hour < req.timeBefore;
      if (req.timeAfter) return hour >= req.timeAfter;
    }

    return false;
  }

  /**
   * Log badge unlock
   */
  logBadgeUnlock(badgeId) {
    let log = JSON.parse(localStorage.getItem(this.UNLOCK_LOG_KEY) || '[]');
    log.push({
      badgeId,
      unlockedAt: new Date().toISOString()
    });
    localStorage.setItem(this.UNLOCK_LOG_KEY, JSON.stringify(log));
  }

  /**
   * Get all badges with unlock status
   */
  getAllBadges() {
    const badges = this.getAvailableBadges();
    const state = JSON.parse(localStorage.getItem(this.BADGES_KEY));

    return Object.entries(badges).map(([id, badge]) => ({
      ...badge,
      unlocked: state[id]?.unlocked || false,
      unlockedAt: state[id]?.unlockedAt || null
    }));
  }

  /**
   * Get unlocked badges
   */
  getUnlockedBadges() {
    return this.getAllBadges().filter(b => b.unlocked);
  }

  /**
   * Get badges by category
   */
  getBadgesByCategory(category) {
    return this.getAllBadges().filter(b => b.category === category);
  }

  /**
   * Calculate total points
   */
  getTotalPoints() {
    return this.getUnlockedBadges().reduce((sum, badge) => sum + badge.points, 0);
  }

  /**
   * Get achievement progress
   */
  getAchievementProgress() {
    const all = this.getAllBadges();
    const unlocked = this.getUnlockedBadges();
    
    return {
      total: all.length,
      unlocked: unlocked.length,
      percentage: Math.round((unlocked.length / all.length) * 100),
      points: this.getTotalPoints()
    };
  }

  /**
   * Reset badges (for testing)
   */
  reset() {
    localStorage.removeItem(this.BADGES_KEY);
    localStorage.removeItem(this.UNLOCK_LOG_KEY);
    this.initializeBadges();
  }
}

export default BadgeManager;
```

### Step 2: Create Badge UI Component

**File**: `assets/js/modules/badge-ui.js`

```javascript
/**
 * Badge UI Component
 * Renders achievement badges display
 */

import BadgeManager from './badge-manager.js';

class BadgeUI {
  constructor(badgeManager, containerSelector = '#badges-container') {
    this.badgeManager = badgeManager;
    this.container = document.querySelector(containerSelector);
  }

  /**
   * Initialize badge display
   */
  init() {
    if (!this.container) return;
    this.render();
  }

  /**
   * Render badges display
   */
  render() {
    const progress = this.badgeManager.getAchievementProgress();
    const badgesByCategory = this.groupBadgesByCategory();

    let html = `
      <div class="badges-display">
        <div class="badges-header">
          <h2>Achievements</h2>
          <div class="achievement-stats">
            <div class="stat">
              <span class="stat-label">Badges Earned</span>
              <span class="stat-value">${progress.unlocked}/${progress.total}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Points</span>
              <span class="stat-value">${progress.points}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Completion</span>
              <span class="stat-value">${progress.percentage}%</span>
            </div>
          </div>
        </div>

        <div class="progress-bar-container">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress.percentage}%"></div>
          </div>
          <span class="progress-text">${progress.unlocked} of ${progress.total} badges</span>
        </div>
    `;

    // Render badges by category
    Object.entries(badgesByCategory).forEach(([category, badges]) => {
      html += `<div class="badge-category">
        <h3 class="category-name">${this.getCategoryName(category)}</h3>
        <div class="badge-grid">`;

      badges.forEach(badge => {
        html += this.renderBadge(badge);
      });

      html += '</div></div>';
    });

    html += '</div>';
    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  /**
   * Group badges by category
   */
  groupBadgesByCategory() {
    const badges = this.badgeManager.getAllBadges();
    const grouped = {};

    badges.forEach(badge => {
      if (!grouped[badge.category]) {
        grouped[badge.category] = [];
      }
      grouped[badge.category].push(badge);
    });

    return grouped;
  }

  /**
   * Render single badge
   */
  renderBadge(badge) {
    const className = badge.unlocked ? 'badge unlocked' : 'badge locked';
    const title = badge.unlocked 
      ? `${badge.name} - Unlocked ${new Date(badge.unlockedAt).toLocaleDateString()}`
      : badge.description;

    return `
      <div class="${className}" title="${title}">
        <div class="badge-icon">${badge.icon}</div>
        <div class="badge-name">${badge.name}</div>
        <div class="badge-description">${badge.description}</div>
        <div class="badge-points">${badge.points}pts</div>
        ${badge.unlocked ? '<div class="badge-unlocked-mark">✓</div>' : ''}
      </div>
    `;
  }

  /**
   * Show unlock notification
   */
  showUnlockNotification(badges) {
    if (!badges || badges.length === 0) return;

    badges.forEach((badge, index) => {
      setTimeout(() => {
        const notification = document.createElement('div');
        notification.className = 'badge-unlock-notification';
        notification.innerHTML = `
          <div class="notification-content">
            <div class="notification-icon">${badge.icon}</div>
            <div class="notification-text">
              <h4>Achievement Unlocked!</h4>
              <p>${badge.name}</p>
              <span class="notification-points">+${badge.points} points</span>
            </div>
          </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
          notification.classList.add('show');
        }, 100);

        setTimeout(() => {
          notification.classList.remove('show');
          setTimeout(() => notification.remove(), 300);
        }, 3000);
      }, index * 500);
    });
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const badges = this.container.querySelectorAll('.badge');
    badges.forEach(badgeEl => {
      badgeEl.addEventListener('click', () => {
        badgeEl.classList.toggle('expanded');
      });
    });
  }

  /**
   * Get category display name
   */
  getCategoryName(category) {
    const names = {
      consistency: '🔥 Consistency',
      milestones: '📚 Learning Milestones',
      accuracy: '🎯 Accuracy',
      speed: '⚡ Speed & Efficiency',
      dedication: '📅 Dedication'
    };
    return names[category] || category;
  }
}

export default BadgeUI;
```

### Step 3: Add CSS Styling

**File**: `assets/scss/components/_badges.scss`

```scss
.badges-display {
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .badges-header {
    margin-bottom: 2rem;

    h2 {
      margin: 0 0 1rem 0;
      font-size: 1.8rem;
      color: #333;
    }

    .achievement-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;

      .stat {
        display: flex;
        flex-direction: column;
        padding: 1rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 8px;
        text-align: center;

        .stat-label {
          font-size: 0.85rem;
          opacity: 0.9;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
        }
      }
    }
  }

  .progress-bar-container {
    margin-bottom: 2rem;

    .progress-bar {
      width: 100%;
      height: 12px;
      background: #e9ecef;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 0.5rem;

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        border-radius: 6px;
        transition: width 0.3s ease;
      }
    }

    .progress-text {
      display: block;
      text-align: center;
      font-size: 0.9rem;
      color: #666;
    }
  }

  .badge-category {
    margin-bottom: 2rem;

    .category-name {
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      color: #333;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #f0f0f0;
    }

    .badge-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
    }
  }

  .badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem 1rem;
    background: #f8f9fa;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    text-align: center;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &.unlocked {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      border-color: #667eea;

      .badge-icon {
        animation: badge-pulse 1s ease-out;
      }
    }

    &.locked {
      opacity: 0.6;

      .badge-icon {
        opacity: 0.5;
      }

      .badge-name,
      .badge-points {
        opacity: 0.7;
      }
    }

    .badge-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .badge-name {
      font-weight: 700;
      color: #333;
      margin-bottom: 0.5rem;
      font-size: 0.95rem;
    }

    .badge-description {
      font-size: 0.75rem;
      color: #999;
      margin-bottom: 0.75rem;
      line-height: 1.3;
      height: 2.1em;
      overflow: hidden;
    }

    .badge-points {
      font-size: 0.85rem;
      font-weight: 600;
      color: #667eea;
    }

    .badge-unlocked-mark {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 24px;
      height: 24px;
      background: #4ade80;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    &.expanded {
      grid-column: span 2;

      .badge-description {
        height: auto;
      }
    }
  }
}

// Badge unlock notification
.badge-unlock-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  max-width: 350px;
  opacity: 0;
  transform: translateX(400px);
  transition: all 0.3s ease;

  &.show {
    opacity: 1;
    transform: translateX(0);
  }

  .notification-content {
    display: flex;
    align-items: center;
    gap: 1rem;

    .notification-icon {
      font-size: 2.5rem;
      flex-shrink: 0;
    }

    .notification-text {
      h4 {
        margin: 0;
        color: #333;
        font-size: 1rem;
      }

      p {
        margin: 0.25rem 0;
        color: #667eea;
        font-weight: 600;
      }

      .notification-points {
        display: block;
        margin-top: 0.5rem;
        font-size: 0.85rem;
        color: #4ade80;
        font-weight: 600;
      }
    }
  }
}

@keyframes badge-pulse {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

// Mobile responsive
@media (max-width: 640px) {
  .badges-display {
    padding: 1rem;

    .achievement-stats {
      grid-template-columns: 1fr;
    }

    .badge-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)) !important;
      gap: 0.75rem;
    }

    .badge {
      padding: 1rem 0.75rem;
      font-size: 0.9rem;

      .badge-icon {
        font-size: 2rem;
      }
    }
  }

  .badge-unlock-notification {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
```

---

## Integration with Practice Sessions

In `unified-practice-session.js`, after session completes:

```javascript
import BadgeManager from './modules/badge-manager.js';
import BadgeUI from './modules/badge-ui.js';

async completeSession() {
  // ... existing completion code ...

  const badgeManager = new BadgeManager(statisticsCollector);
  const newBadges = badgeManager.checkBadgesAfterSession(sessionData);
  
  const badgeUI = new BadgeUI(badgeManager);
  badgeUI.showUnlockNotification(newBadges);
}
```

---

## Testing Strategy

- [ ] Badges unlock correctly based on requirements
- [ ] Unlock notifications display
- [ ] Badge state persists across sessions
- [ ] Points calculation accurate
- [ ] UI responsive on mobile
- [ ] Unlock animations smooth

---

## Deployment Checklist

- [ ] Add badge-manager.js
- [ ] Add badge-ui.js
- [ ] Add _badges.scss
- [ ] Import _badges.scss in main.scss
- [ ] Create badges display page/widget
- [ ] Integrate with practice session
- [ ] Test unlock detection
- [ ] Verify localStorage persistence
- [ ] Mobile responsive testing
- [ ] Accessibility compliance

---

## Future Enhancements

1. **Badge Collections**: Series of badges (e.g., "Streak Master" for all streak badges)
2. **Special Events**: Limited-time badges
3. **Leaderboards**: Rank users by points
4. **Shareable Badges**: Social media sharing
5. **Badge Trading**: Exchange points for badges
