import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TandemPractice from '$lib/components/TandemPractice.svelte';
import { tick } from 'svelte';

// Mock gameState first since session.svelte depends on it
vi.mock('$lib/state/game-state.svelte', () => ({
  gameState: {
    isActive: false,
    currentStreak: 0,
    sessionXP: 0,
    dailyXP: 0,
    lastPracticeDate: null,
    totalXP: 0,
    level: 1,
    nextLevelXP: 100,
    currentLevelStartXP: 0,
    levelProgress: 0,
    progressPercentage: 0,
    isDailyGoalReached: false,
    startSession: vi.fn(),
    endSession: vi.fn(),
    awardXP: vi.fn().mockReturnValue(false),
    recordPracticeResult: vi.fn(),
    getTotalXP: vi.fn().mockReturnValue(0),
  }
}));

// Mock session.svelte
vi.mock('$lib/state/session.svelte', () => ({
  LearningSession: class LearningSession {
    isActive = false;
    currentStreak = 0;
    sessionXP = 0;
    dailyXP = 0;
    lastPracticeDate = null;
    totalXP = 0;
    level = 1;
    nextLevelXP = 100;
    currentLevelStartXP = 0;
    levelProgress = 0;
    progressPercentage = 0;
    isDailyGoalReached = false;
    dailyTarget = 50;
    startSession = vi.fn();
    endSession = vi.fn();
    awardXP = vi.fn().mockReturnValue(false);
    getTotalXP = vi.fn().mockReturnValue(0);
  },
  learningSession: {
    isActive: false,
    currentStreak: 0,
    sessionXP: 0,
    dailyXP: 0,
    lastPracticeDate: null,
    totalXP: 0,
    level: 1,
    nextLevelXP: 100,
    currentLevelStartXP: 0,
    levelProgress: 0,
    progressPercentage: 0,
    isDailyGoalReached: false,
    dailyTarget: 50,
    startSession: vi.fn(),
    endSession: vi.fn(),
    awardXP: vi.fn().mockReturnValue(false),
    getTotalXP: vi.fn().mockReturnValue(0),
  }
}));

// Mock logger
vi.mock('$lib/services/logger', () => ({
  logger: {
    init: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
  },
  log: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
}));

// Mock vocabularyDb
vi.mock('$lib/data/db.svelte', () => {
    const mockItem = {
        id: '1',
        german: 'Haus',
        bulgarian: 'Къща',
        partOfSpeech: 'noun',
        difficulty: 1,
        categories: ['Nouns'],
        grammar: { gender: 'neuter' },
        examples: [
            { german: 'Das Haus ist groß.', bulgarian: 'Къщата е голяма.' }
        ],
        isCommon: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    return {
        vocabularyDb: {
            items: [mockItem],
            initialize: vi.fn().mockResolvedValue(undefined),
            getRandomVocabulary: vi.fn().mockReturnValue([mockItem]),
            searchVocabulary: vi.fn().mockReturnValue([]),
            getVocabulary: vi.fn().mockReturnValue([mockItem])
        }
    };
});

describe('TandemPractice Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should render and load initial item', async () => {
        render(TandemPractice, { global: { ssr: false } });

        // Should show loading initially (using translated text from mock)
        expect(screen.getByText('Vokabular wird geladen…')).toBeInTheDocument();

        // Advance timers to complete the loading delay
        vi.advanceTimersByTime(600);
        await tick();

        // Wait for item to load
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'das Haus' })).toBeInTheDocument();
        });
    });

    it('should handle answer submission', async () => {
        render(TandemPractice, { global: { ssr: false } });

        // Advance timers to complete the loading delay
        vi.advanceTimersByTime(600);
        await tick();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'das Haus' })).toBeInTheDocument();
        });

        const input = screen.getByPlaceholderText('Antwort eingeben…');
        await fireEvent.input(input, { target: { value: 'Къща' } });

        const checkBtn = screen.getByText('Antwort prüfen');
        await fireEvent.click(checkBtn);

        await waitFor(() => {
            expect(screen.getByText('Korrekte Antwort')).toBeInTheDocument();
        });
    });

    it('should switch directions', async () => {
        render(TandemPractice, { global: { ssr: false } });

        // Advance timers to complete the loading delay
        vi.advanceTimersByTime(600);
        await tick();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'das Haus' })).toBeInTheDocument();
        });

        // Find direction toggle
        const toggle = screen.getByRole('button', { name: /Aktuelle Richtung/i });
        await fireEvent.click(toggle);

        // Wait for direction to switch
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Къща' })).toBeInTheDocument();
        });
    });
});