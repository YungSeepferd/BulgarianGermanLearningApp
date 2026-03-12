/**
 * App State - Backward Compatibility Layer
 * 
 * This file re-exports all state from app.svelte.ts for backward compatibility.
 * New code should import directly from app.svelte.ts
 */

// Re-export everything from the new module
export { 
    appState, 
    appUIState, 
    appDataState, 
    initializeAppState,
    getAllVocabularyItems 
} from './app.svelte';

// Re-export types
export type { LanguageMode } from './app.svelte';

// For backward compatibility, also export individual properties and methods
// These are re-exported from the singleton
import { appState } from './app.svelte';

// Re-export properties as getters
export const languageMode = appState.languageMode;
export const searchQuery = appState.searchQuery;
export const currentItem = appState.currentItem;
export const showAnswer = appState.showAnswer;
export const practiceMode = appState.practiceMode;
export const isLoading = appState.isLoading;
export const error = appState.error;
export const displayDirection = appState.displayDirection;
export const filteredItems = appState.filteredItems;
export const practiceRecommendations = appState.practiceRecommendations;
export const practiceStats = appState.practiceStats;
export const recentSearches = appState.recentSearches;
export const favorites = appState.favorites;
export const lastError = appState.lastError;
export const isError = appState.isError;

// Re-export methods
export const toggleLanguageMode = appState.toggleLanguageMode;
export const toggleDirection = appState.toggleDirection;
export const setSearchQuery = appState.setSearchQuery;
export const setCurrentItem = appState.setCurrentItem;
export const togglePracticeMode = appState.togglePracticeMode;
export const startPracticeSession = appState.startPracticeSession;
export const toggleShowAnswer = appState.toggleShowAnswer;
export const setError = appState.setError;
export const recordPracticeResult = appState.recordPracticeResult;
export const toggleFavorite = appState.toggleFavorite;
export const isFavorite = appState.isFavorite;
export const clearAllData = appState.clearAllData;
export const exportData = appState.exportData;
export const importData = appState.importData;
export const recordVocabularyPractice = appState.recordVocabularyPractice;
export const getVocabularyMastery = appState.getVocabularyMastery;
export const getOverallProgress = appState.getOverallProgress;
export const clearError = appState.clearError;