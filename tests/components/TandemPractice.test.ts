import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TandemPractice from '$lib/components/TandemPractice.svelte';
import { tick } from 'svelte';

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
        // No need to mock loader here if component uses vocabularyDb
    });

    it('should render and load initial item', async () => {
        render(TandemPractice, { global: { ssr: false } });

        // Should show loading initially
        expect(screen.getByText('practice.loading_vocabulary')).toBeInTheDocument();

        // Wait for item to load
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'das Haus' })).toBeInTheDocument();
        });
    });

    it('should handle answer submission', async () => {
        render(TandemPractice, { global: { ssr: false } });

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'das Haus' })).toBeInTheDocument();
        });

        const input = screen.getByPlaceholderText('practice.type_answer_placeholder');
        await fireEvent.input(input, { target: { value: 'Къща' } });

        const checkBtn = screen.getByText('practice.check_answer');
        await fireEvent.click(checkBtn);

        await waitFor(() => {
            expect(screen.getByText('practice.correct_answer')).toBeInTheDocument();
        });
    });

    it('should switch directions', async () => {
        render(TandemPractice, { global: { ssr: false } });

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