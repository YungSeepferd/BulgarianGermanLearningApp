import { browser } from '$app/environment';

// Type definitions for our vocabulary items
export interface VocabularyItem {
  id: string;
  german: string;
  bulgarian: string;
  category: string;
  tags: string[];
  global_stats?: {
    correct_count: number;
    incorrect_count: number;
    success_rate: number;
  };
}

// Global state using Svelte 5 runes
export class AppState {
  // Current learning direction: 'DE->BG' or 'BG->DE'
  currentDirection = $state<'DE->BG' | 'BG->DE'>('DE->BG');

  // Computed direction for display
  displayDirection = $derived(
    this.currentDirection === 'DE->BG' ? 'German → Bulgarian' : 'Bulgarian → German'
  );

  // Search query for filtering vocabulary
  searchQuery = $state('');
  
  // Currently selected vocabulary item for practice
  currentItem = $state<VocabularyItem | null>(null);
  
  // Practice session state
  practiceMode = $state<boolean>(false);
  showAnswer = $state<boolean>(false);
  
  // UI state
  isLoading = $state<boolean>(false);
  error = $state<string | null>(null);
  
  // Methods to update state
  toggleDirection() {
    this.currentDirection = this.currentDirection === 'DE->BG' ? 'BG->DE' : 'DE->BG';

    // Save to localStorage for persistence with error handling
    if (browser) {
      try {
        localStorage.setItem('tandem-direction', this.currentDirection);
      } catch (error) {
        console.error('Failed to save direction to localStorage:', error);
        this.setError('Failed to save preferences. Please check storage permissions.');
      }
    }
  }
  
  setSearchQuery(query: string) {
    this.searchQuery = query;
  }
  
  setCurrentItem(item: VocabularyItem | null) {
    // Validate item if not null
    if (item) {
      const requiredFields = ['id', 'german', 'bulgarian', 'category'];
      const missingFields = requiredFields.filter(field => !(field in item));

      if (missingFields.length > 0) {
        console.error(`Invalid vocabulary item: missing fields ${missingFields.join(', ')}`);
        this.setError(`Invalid vocabulary item: missing ${missingFields.join(', ')}`);
        return;
      }
    }

    this.currentItem = item;
    this.showAnswer = false;
  }
  
  togglePracticeMode() {
    this.practiceMode = !this.practiceMode;
    if (!this.practiceMode) {
      this.currentItem = null;
      this.showAnswer = false;
    }
  }
  
  toggleShowAnswer() {
    this.showAnswer = !this.showAnswer;
  }
  
  setLoading(loading: boolean) {
    this.isLoading = loading;
  }
  
  setError(error: string | null) {
    this.error = error;
  }
  
  // Initialize state from localStorage with validation
  init() {
    if (browser) {
      try {
        const savedDirection = localStorage.getItem('tandem-direction');
        if (savedDirection && (savedDirection === 'DE->BG' || savedDirection === 'BG->DE')) {
          this.currentDirection = savedDirection;
        }

        // Initialize other state from localStorage if needed
        // Example: const savedSearch = localStorage.getItem('tandem-search');
      } catch (error) {
        console.error('Failed to initialize state from localStorage:', error);
        this.setError('Failed to load preferences. Using default settings.');
      }
    }
  }
}

// Create a singleton instance
export const appState = new AppState();

// Initialize the app state
appState.init();