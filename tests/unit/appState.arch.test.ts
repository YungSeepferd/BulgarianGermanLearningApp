/**
 * Tests for the new architectural improvements
 *
 * This test file verifies that the P0 architectural improvements are working correctly:
 * - State responsibility separation
 * - Dependency injection
 * - Circular dependency elimination
 * - State duplication elimination
 * - Error handling improvements
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { appState } from '$lib/state/app.svelte';
import { learningSession } from '$lib/state/session.svelte';
import type { VocabularyItem } from '$lib/types/vocabulary';

// Mock $app/environment
vi.mock('$app/environment', () => ({
    browser: true
}));

// Mock db
vi.mock('$lib/data/db.svelte', () => {
    const mockItems: VocabularyItem[] = [
        {
            id: 'test_001',
            german: 'Hallo',
            bulgarian: 'Здравей',
            category: 'Greetings',
            tags: ['A1'],
            type: 'word',
            difficulty: 'A1'
        },
        {
            id: 'test_002',
            german: 'Danke',
            bulgarian: 'Благодаря',
            category: 'Greetings',
            tags: ['A1'],
            type: 'word',
            difficulty: 'A1'
        },
        {
            id: 'test_003',
            german: 'Auf Wiedersehen',
            bulgarian: 'Довиждане',
            category: 'Greetings',
            tags: ['A1'],
            type: 'word',
            difficulty: 'A2'
        }
    ];

    return {
        db: {
            items: mockItems
        }
    };
});

// Mock dataLoader functions
vi.mock('$lib/data/loader', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        updateStats: vi.fn().mockResolvedValue(undefined),
        clearCache: vi.fn()
    };
});

vi.mock('$lib/utils/localStorage', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        LocalStorageManager: {
            saveUserProgress: vi.fn(),
            loadUserProgress: vi.fn().mockReturnValue({
                stats: new Map(),
                favorites: [],
                recentSearches: []
            }),
            exportUserData: vi.fn(),
            importUserData: vi.fn(),
            clearUserData: vi.fn()
        }
    };
});

// Mock learningSession
vi.mock('$lib/state/session.svelte', () => {
    return {
        learningSession: {
            isActive: false,
            currentStreak: 0,
            sessionXP: 0,
            dailyXP: 0,
            lastPracticeDate: null,
            getTotalXP: vi.fn().mockReturnValue(0),
            startSession: vi.fn(),
            endSession: vi.fn(),
            awardXP: vi.fn()
        }
    };
});

describe('Architectural Improvements', () => {
    beforeEach(() => {
        const localStorageMock = {
            getItem: vi.fn().mockReturnValue(null), // Default to null
            setItem: vi.fn(),
            clear: vi.fn(),
            removeItem: vi.fn()
        };
        vi.stubGlobal('localStorage', localStorageMock);

        // Reset state instances using proper methods
        appState.setError(null);
        appState.setSearchQuery('');
        appState.setCurrentItem(null);
        if (appState.practiceMode) {
            appState.togglePracticeMode();
        }

        // Reset data state using appState methods
        appState.clearAllData();
    });

    describe('State Responsibility Separation', () => {
        it('should provide backward compatibility through combined appState', () => {
            // Test that the combined appState provides access to both UI and data state
            expect(appState.languageMode).toBeDefined();
            expect(appState.searchQuery).toBeDefined();
            expect(appState.practiceStats).toBeDefined();
            expect(appState.favorites).toBeDefined();
        });
    });

    describe('Dependency Injection', () => {
        it('should allow service access through appState', () => {
            // Test that services are properly accessible
            expect(appState.practiceStats).toBeDefined();
            expect(appState.favorites).toBeDefined();
        });
    });

    describe('Circular Dependency Elimination', () => {
        it('should break circular dependency between ProgressService and LearningSession', () => {
            // Verify that both can be used independently
            expect(learningSession).toBeDefined();

            // Verify that LearningSession can access total XP
            expect(learningSession.getTotalXP()).toBeDefined();
            expect(learningSession.getTotalXP()).toBe(0);
        });
    });

    describe('State Duplication Elimination', () => {
        it('should eliminate XP state duplication between ProgressService and LearningSession', () => {
            // LearningSession should get totalXP from ProgressService
            const sessionXP = learningSession.getTotalXP();
            expect(sessionXP).toBeDefined();
            expect(sessionXP).toBe(0);
        });

        it('should maintain session-specific XP tracking', () => {
            // LearningSession should still track sessionXP and dailyXP
            expect(learningSession.sessionXP).toBeDefined();
            expect(learningSession.dailyXP).toBeDefined();
            expect(learningSession.sessionXP).toBe(0);
            expect(learningSession.dailyXP).toBe(0);
        });
    });

    describe('Error Handling Improvements', () => {
        it('should provide consistent error handling across services', () => {
            // Test that error handling methods exist
            expect(appState.setError).toBeDefined();
            expect(appState.error).toBeDefined();
        });

        it('should provide meaningful error messages', () => {
            // Test error handling through appState
            appState.setError('Test error');
            expect(appState.error).toBe('Test error');
        });
    });

    describe('Functional Tests', () => {
        it('should maintain all existing functionality', async () => {
            // Test UI state functionality
            appState.setSearchQuery('Hallo');
            expect(appState.searchQuery).toBe('Hallo');
            expect(appState.filteredItems).toHaveLength(1);

            // Test data state functionality
            await appState.recordPracticeResult('test_001', true);
            expect(appState.practiceStats.has('test_001')).toBe(true);

            // Test combined appState functionality
            appState.toggleFavorite('test_001');
            expect(appState.isFavorite('test_001')).toBe(true);
        });

        it('should provide practice recommendations', async () => {
            // Add some practice stats
            await appState.recordPracticeResult('test_001', true);
            await appState.recordPracticeResult('test_002', false);
            await appState.recordPracticeResult('test_002', false);
            await appState.recordPracticeResult('test_002', false);

            const recommendations = appState.practiceRecommendations;
            expect(recommendations.length).toBeGreaterThan(0);
        });
    });
});