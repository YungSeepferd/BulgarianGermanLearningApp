// Home page functionality
import type { VocabularyItem } from './types';

interface ProgressTracker {
  getDueItems(vocabulary: VocabularyItem[]): VocabularyItem[];
  getStats(): { streak: number };
  data: {
    vocabulary: Record<string, unknown>;
  };
}

declare global {
  interface Window {
    progressTracker?: ProgressTracker;
    HomeApp: typeof HomeApp;
  }
}

class HomeApp {
  private vocabulary: VocabularyItem[];
  
  constructor(options: { vocabulary?: VocabularyItem[] }) {
    this.vocabulary = options.vocabulary || [];
    this.init();
  }

  init(): void {
    this.updateActivityCards();
    this.bindEvents();
  }

  bindEvents(): void {
    // Hero action buttons
    const startLearningBtn = document.querySelector('a[href="/practice/"]');
    if (startLearningBtn) {
      startLearningBtn.addEventListener('click', (): void => {
        // Check if there are items to practice
        const dueItems = window.progressTracker?.getDueItems(this.vocabulary) || [];
        if (dueItems.length === 0 && this.vocabulary.length > 0) {
          // Start with new items if no due items
          const newItems = this.vocabulary.slice(0, 10);
          sessionStorage.setItem('practice-session', JSON.stringify({
            items: newItems,
            type: 'vocabulary',
            timestamp: Date.now()
          }));
        }
      });
    }
  }

  updateActivityCards(): void {
    this.updateDueItemsCard();
    this.updateNewItemsCard();
    this.updateStreakCard();
  }

  updateDueItemsCard(): void {
    const dueCountElement = document.querySelector('#due-count');
    if (!dueCountElement) {
      return;
    }

    const dueItems = window.progressTracker?.getDueItems(this.vocabulary) || [];
    const count = dueItems.length;

    if (count === 0) {
      dueCountElement.textContent = 'All caught up! 🎉';
      const actionElement = dueCountElement.parentElement?.querySelector('.activity-action');
      if (actionElement) {
        actionElement.textContent = 'Browse Vocabulary';
      }
    } else {
      dueCountElement.textContent = `${count} item${count === 1 ? '' : 's'}`;
    }
  }

  updateNewItemsCard(): void {
    const newCountElement = document.querySelector('#new-count');
    if (!newCountElement) {
      return;
    }

    const progress = window.progressTracker?.data.vocabulary || {};
    const studiedWords = Object.keys(progress);
    const newItems = this.vocabulary.filter(item => !studiedWords.includes(item.word));
    const count = newItems.length;

    newCountElement.textContent = `${count} item${count === 1 ? '' : 's'}`;
  }

  updateStreakCard(): void {
    const streakCountElement = document.querySelector('#streak-count');
    if (!streakCountElement) {
      return;
    }

    const stats = window.progressTracker?.getStats() || { streak: 0 };
    const streak = stats.streak;

    streakCountElement.textContent = streak === 0 ? 'Start your streak!' : `${streak} day${streak === 1 ? '' : 's'}`;
  }
}

// Export for use in templates
window.HomeApp = HomeApp;