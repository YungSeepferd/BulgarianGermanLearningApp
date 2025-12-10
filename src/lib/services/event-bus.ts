/**
 * Event Bus for application-wide event communication
 *
 * This provides a decoupled way for services to communicate without direct dependencies,
 * breaking circular dependencies and enabling better testability.
 */

import { Debug } from '../utils';

export type EventCallback<T = any> = (data: T) => void | Promise<void>;

export class EventBus {
    private listeners: Map<string, Set<EventCallback>> = new Map();

    /**
     * Subscribe to an event type
     * @param eventType The event type to subscribe to
     * @param callback The callback to invoke when the event is emitted
     */
    subscribe<T = any>(eventType: string, callback: EventCallback<T>): () => void {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }

        const listeners = this.listeners.get(eventType)!;
        listeners.add(callback);

        // Return unsubscribe function
        return () => {
            listeners.delete(callback);
            if (listeners.size === 0) {
                this.listeners.delete(eventType);
            }
        };
    }

    /**
     * Emit an event to all subscribers
     * @param eventType The event type to emit
     * @param data The data to pass to subscribers
     */
    async emit<T = any>(eventType: string, data: T): Promise<void> {
        const listeners = this.listeners.get(eventType);
        if (listeners) {
            // Create a copy to avoid issues if listeners are modified during iteration
            const listenersCopy = Array.from(listeners);
            for (const listener of listenersCopy) {
                try {
                    await listener(data);
                } catch (error) {
                    console.error(`Error in event listener for ${eventType}:`, error);
                }
            }
        }
    }

    /**
     * Clear all listeners for a specific event type or all events
     * @param eventType Optional event type to clear. If not provided, clears all listeners.
     */
    clear(eventType?: string): void {
        if (eventType) {
            Debug.log('EventBus', 'Clearing listeners for event type', { eventType });
            this.listeners.delete(eventType);
        } else {
            Debug.log('EventBus', 'Clearing all event listeners');
            this.listeners.clear();
        }
    }
}

// Define event types
export const EventTypes = {
    XP_EARNED: 'xp_earned',
    LEVEL_UP: 'level_up',
    PRACTICE_RESULT: 'practice_result',
    LESSON_COMPLETED: 'lesson_completed',
    QUIZ_COMPLETED: 'quiz_completed',
    STATE_CHANGED: 'state_changed',
    ERROR: 'error'
} as const;

// Define event data types
export interface XPEvent {
    amount: number;
    reason: string;
    timestamp: Date;
}

export interface LevelUpEvent {
    oldLevel: number;
    newLevel: number;
    totalXP: number;
    timestamp: Date;
}

export interface PracticeResultEvent {
    itemId: string;
    correct: boolean;
    responseTime?: number;
    timestamp: Date;
}

export interface LessonCompletedEvent {
    lessonId: string;
    completionPercentage: number;
    timestamp: Date;
}

export interface QuizCompletedEvent {
    quizId: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeTaken: number;
    timestamp: Date;
}

export interface ErrorEvent {
    error: Error;
    context?: string;
    timestamp: Date;
}