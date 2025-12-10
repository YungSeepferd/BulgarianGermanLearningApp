/**
 * Custom error types for the application
 *
 * This module defines custom error classes for different types of errors that can occur
 * in the application, enabling better error handling and propagation.
 */

export class AppError extends Error {
    constructor(message: string, public context?: any) {
        super(message);
        this.name = 'AppError';
    }
}

export class ProgressError extends AppError {
    constructor(message: string, context?: any) {
        super(message, context);
        this.name = 'ProgressError';
    }
}

export class StateError extends AppError {
    constructor(message: string, context?: any) {
        super(message, context);
        this.name = 'StateError';
    }
}

export class ServiceError extends AppError {
    constructor(message: string, context?: any) {
        super(message, context);
        this.name = 'ServiceError';
    }
}

export class DataError extends AppError {
    constructor(message: string, context?: any) {
        super(message, context);
        this.name = 'DataError';
    }
}

export class ValidationError extends AppError {
    constructor(message: string, context?: any) {
        super(message, context);
        this.name = 'ValidationError';
    }
}

export class StorageError extends AppError {
    constructor(message: string, context?: any) {
        super(message, context);
        this.name = 'StorageError';
    }
}

/**
 * Error handler utility for consistent error handling
 */
export class ErrorHandler {
    /**
     * Handle an error by logging it and emitting an error event
     * @param error The error to handle
     * @param context Additional context about the error
     * @param eventBus Optional event bus for emitting error events
     */
    static handleError(error: Error, context?: string, eventBus?: { emit: (type: string, data: any) => Promise<void> }): void {
        // Log the error
        console.error(`[${error.name}] ${context || 'Error'}:`, error.message, error.stack);

        // Emit error event if event bus is available
        if (eventBus) {
            eventBus.emit('error', {
                error,
                context,
                timestamp: new Date()
            }).catch(emitError => {
                console.error('Failed to emit error event:', emitError);
            });
        }
    }
}

// Type import for ErrorEvent (used in JSDoc)
type ErrorEvent = {
    error: Error;
    context?: string;
    timestamp: Date;
};