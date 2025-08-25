// Home page functionality
class HomeApp {
    constructor(options) {
        this.vocabulary = options.vocabulary || [];
        this.init();
    }

    init() {
        this.updateActivityCards();
        this.bindEvents();
    }

    bindEvents() {
        // Hero action buttons
        const startLearningBtn = document.querySelector('a[href="/practice/"]');
        if (startLearningBtn) {
            startLearningBtn.addEventListener('click', (e) => {
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

    updateActivityCards() {
        this.updateDueItemsCard();
        this.updateNewItemsCard();
        this.updateStreakCard();
    }

    updateDueItemsCard() {
        const dueCountElement = document.getElementById('due-count');
        if (!dueCountElement) return;

        const dueItems = window.progressTracker?.getDueItems(this.vocabulary) || [];
        const count = dueItems.length;

        if (count === 0) {
            dueCountElement.textContent = 'All caught up! 🎉';
            dueCountElement.parentElement.querySelector('.activity-action').textContent = 'Browse Vocabulary';
        } else {
            dueCountElement.textContent = `${count} item${count === 1 ? '' : 's'}`;
        }
    }

    updateNewItemsCard() {
        const newCountElement = document.getElementById('new-count');
        if (!newCountElement) return;

        const progress = window.progressTracker?.data.vocabulary || {};
        const studiedWords = Object.keys(progress);
        const newItems = this.vocabulary.filter(item => !studiedWords.includes(item.word));
        const count = newItems.length;

        newCountElement.textContent = `${count} item${count === 1 ? '' : 's'}`;
    }

    updateStreakCard() {
        const streakCountElement = document.getElementById('streak-count');
        if (!streakCountElement) return;

        const stats = window.progressTracker?.getStats() || { streak: 0 };
        const streak = stats.streak;

        if (streak === 0) {
            streakCountElement.textContent = 'Start your streak!';
        } else {
            streakCountElement.textContent = `${streak} day${streak === 1 ? '' : 's'}`;
        }
    }
}

// Export for use in templates
window.HomeApp = HomeApp;
