import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TandemPractice from '$lib/components/TandemPractice.svelte';
import { tick } from 'svelte';

describe('TandemPractice Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Mock the loader module
        vi.mock('$lib/data/loader', async (importOriginal) => {
            const actual = await importOriginal();
            return {
                ...actual,
                getRandomVocabulary: vi.fn().mockResolvedValue([
                    {
                        id: '1',
                        german: 'Haus',
                        bulgarian: 'Къща',
                        partOfSpeech: 'noun',
                        difficulty: 1,
                        categories: ['Nouns'],
                        metadata: {
                          examples: [
                            { sentence: 'Das Haus ist groß.', translation: 'Къщата е голяма.' }
                          ]
                        },
                        isCommon: true,
                        isVerified: true,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                ]),
                loadVocabularyBySearch: vi.fn().mockResolvedValue({
                    items: [],
                    total: 0,
                    hasMore: false
                }),
                updateStats: vi.fn().mockResolvedValue(undefined)
            };
        });
    });

    it('should render and load initial item', async () => {
        render(TandemPractice, { global: { ssr: false } });

        // Should show loading initially
        expect(screen.getByText('Loading vocabulary...')).toBeInTheDocument();

        // Wait for item to load
        await waitFor(() => {
            expect(screen.getByText('Haus')).toBeInTheDocument();
        });
    });

    it('should handle answer submission', async () => {
        render(TandemPractice, { global: { ssr: false } });

        await waitFor(() => {
            expect(screen.getByText('Haus')).toBeInTheDocument();
        });

        const input = screen.getByPlaceholderText('Type your answer here...');
        await fireEvent.input(input, { target: { value: 'Къща' } });

        const checkBtn = screen.getByText('Check Answer');
        await fireEvent.click(checkBtn);

        await waitFor(() => {
            expect(screen.getByText('Correct!')).toBeInTheDocument();
        });
    });

    it('should switch directions', async () => {
        render(TandemPractice, { global: { ssr: false } });

        await waitFor(() => {
            expect(screen.getByText('Haus')).toBeInTheDocument();
        });

        // Find direction toggle
        const toggle = screen.getByRole('button', { name: /current direction/i });
        await fireEvent.click(toggle);

        // Wait for direction to switch
        await waitFor(() => {
            expect(screen.getByText('Къща')).toBeInTheDocument();
        });
    });
});