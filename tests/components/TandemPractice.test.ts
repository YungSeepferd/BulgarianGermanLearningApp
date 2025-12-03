import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TandemPractice from '$lib/components/TandemPractice.svelte';
import { DataLoader } from '$lib/data/loader';
import { tick } from 'svelte';

// Mock DataLoader
vi.mock('$lib/data/loader', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        DataLoader: {
            getInstance: vi.fn(),
            setFetchFunction: vi.fn()
        }
    };
});

const mockItems = [
    {
        id: '1',
        german: 'Haus',
        bulgarian: 'Къща',
        category: 'Nouns',
        level: 'A1',
        tags: [],
        type: 'word'
    }
];

describe.skip('TandemPractice Component', () => {
    let mockDataLoader;

    beforeEach(() => {
        vi.clearAllMocks();
        
        mockDataLoader = {
            getRandomItems: vi.fn().mockResolvedValue(mockItems),
            updateStats: vi.fn().mockResolvedValue(undefined),
            setFetchFunction: vi.fn(),
            search: vi.fn().mockResolvedValue([])
        };

        (DataLoader.getInstance as any).mockReturnValue(mockDataLoader);
    });

    it('should render and load initial item', async () => {
        render(TandemPractice);

        // Should show loading initially
        expect(screen.getByText('Loading vocabulary...')).toBeInTheDocument();

        // Wait for item to load
        await waitFor(() => {
            expect(screen.getByText('Haus')).toBeInTheDocument();
        });
    });

    it('should handle answer submission', async () => {
        render(TandemPractice);

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
        render(TandemPractice);

        await waitFor(() => {
            expect(screen.getByText('Haus')).toBeInTheDocument();
        });

        // Find direction toggle (might need a better selector or role)
        // Assuming the toggle button has a specific class or text
        const toggle = screen.getByRole('button', { name: /switch direction/i }); 
        // Note: The actual button text/aria-label in component needs to match
    });
});