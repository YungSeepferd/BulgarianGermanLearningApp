/**
 * Structured Error System for Vocabulary Operations
 * Provides comprehensive error classification and handling capabilities
 * @since 1.0.0
 */
/**
 * Base error category for classification
 */
export type ErrorCategory = 'network' | 'validation' | 'storage' | 'parsing' | 'system';
/**
 * Error severity levels for prioritization
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
/**
 * Error recovery strategy types
 */
export type RecoveryStrategy = 'retry' | 'fallback' | 'ignore' | 'abort';
/**
 * Base error class for all vocabulary operations
 * Provides structured error information and context
 */
export declare abstract class VocabularyError extends Error {
    /**
     * Unique error code for identification
     */
    abstract readonly code: string;
    /**
     * Error category for classification and handling
     */
    abstract readonly category: ErrorCategory;
    /**
     * Error severity level for prioritization
     */
    readonly severity: ErrorSeverity;
    /**
     * Timestamp when error occurred
     */
    readonly timestamp: Date;
    /**
     * Additional context information for debugging
     */
    readonly context: Record<string, unknown>;
    /**
     * Suggested recovery strategy
     */
    readonly recoveryStrategy: RecoveryStrategy;
    /**
     * Whether the error is retryable
     */
    readonly retryable: boolean;
    /**
     * User-friendly error message
     */
    readonly userMessage: string;
    /**
     * Create a new vocabulary error
     * @param message - Technical error message
     * @param userMessage - User-friendly error message
     * @param severity - Error severity level
     * @param recoveryStrategy - Suggested recovery approach
     * @param retryable - Whether the operation can be retried
     * @param context - Additional context information
     */
    constructor(message: string, userMessage?: string, severity?: ErrorSeverity, recoveryStrategy?: RecoveryStrategy, retryable?: boolean, context?: Record<string, unknown>);
    /**
     * Convert error to JSON for logging/serialization
     * @returns JSON representation of the error
     */
    toJSON(): Record<string, unknown>;
    /**
     * Get a formatted error string for logging
     * @returns Formatted error string
     */
    toString(): string;
}
/**
 * Network-related errors for connectivity and HTTP issues
 */
export declare class NetworkError extends VocabularyError {
    readonly code = "NETWORK_ERROR";
    readonly category = "network";
    /**
     * HTTP status code if available
     */
    readonly statusCode?: number;
    /**
     * Request URL that failed
     */
    readonly url?: string;
    /**
     * Request method that failed
     */
    readonly method?: string;
    /**
     * Timeout duration in milliseconds
     */
    readonly timeout?: number;
    /**
     * Create a new network error
     * @param message - Error message
     * @param statusCode - HTTP status code
     * @param url - Request URL
     * @param method - HTTP method
     * @param timeout - Request timeout
     * @param retryable - Whether the request can be retried
     * @param context - Additional context
     */
    constructor(message: string, statusCode?: number, url?: string, method?: string, timeout?: number, retryable?: boolean, context?: Record<string, unknown>);
    /**
     * Get user-friendly message based on status code and timeout
     * @param statusCode - HTTP status code
     * @param timeout - Timeout duration
     * @returns User-friendly message
     */
    private static getUserMessage;
    /**
     * Get severity level based on status code and timeout
     * @param statusCode - HTTP status code
     * @param timeout - Timeout duration
     * @returns Severity level
     */
    private static getSeverity;
    /**
     * Get recovery strategy based on status code and timeout
     * @param statusCode - HTTP status code
     * @param timeout - Timeout duration
     * @returns Recovery strategy
     */
    private static getRecoveryStrategy;
}
/**
 * Validation errors for data validation failures
 */
export declare class ValidationError extends VocabularyError {
    readonly code = "VALIDATION_ERROR";
    readonly category = "validation";
    /**
     * Field that failed validation
     */
    readonly field?: string;
    /**
     * Value that failed validation
     */
    readonly value?: unknown;
    /**
     * Validation rule that failed
     */
    readonly rule?: string;
    /**
     * Expected value or format
     */
    readonly expected?: string;
    /**
     * Create a new validation error
     * @param message - Error message
     * @param field - Field that failed validation
     * @param value - Value that failed
     * @param rule - Validation rule
     * @param expected - Expected value
     * @param context - Additional context
     */
    constructor(message: string, field?: string, value?: unknown, rule?: string, expected?: string, context?: Record<string, unknown>);
    /**
     * Get user-friendly message for validation errors
     * @param field - Field that failed
     * @param rule - Validation rule
     * @returns User-friendly message
     */
    private static getUserMessage;
    /**
     * Get severity level for validation errors
     * @param rule - Validation rule
     * @returns Severity level
     */
    private static getSeverity;
}
/**
 * Storage errors for localStorage and cache operations
 */
export declare class StorageError extends VocabularyError {
    readonly code = "STORAGE_ERROR";
    readonly category = "storage";
    /**
     * Storage operation type
     */
    readonly operation: 'read' | 'write' | 'clear' | 'quota';
    /**
     * Storage key being accessed
     */
    readonly key?: string;
    /**
     * Available storage space in bytes
     */
    readonly availableSpace?: number;
    /**
     * Required storage space in bytes
     */
    readonly requiredSpace?: number;
    /**
     * Create a new storage error
     * @param message - Error message
     * @param operation - Storage operation
     * @param key - Storage key
     * @param availableSpace - Available space
     * @param requiredSpace - Required space
     * @param context - Additional context
     */
    constructor(message: string, operation: 'read' | 'write' | 'clear' | 'quota', key?: string, availableSpace?: number, requiredSpace?: number, context?: Record<string, unknown>);
    /**
     * Get user-friendly message for storage errors
     * @param operation - Storage operation
     * @param availableSpace - Available space
     * @param requiredSpace - Required space
     * @returns User-friendly message
     */
    private static getUserMessage;
    /**
     * Get severity level for storage errors
     * @param operation - Storage operation
     * @returns Severity level
     */
    private static getSeverity;
    /**
     * Get recovery strategy for storage errors
     * @param operation - Storage operation
     * @returns Recovery strategy
     */
    private static getRecoveryStrategy;
}
/**
 * Parsing errors for data format and structure issues
 */
export declare class ParsingError extends VocabularyError {
    readonly code = "PARSING_ERROR";
    readonly category = "parsing";
    /**
     * Data type being parsed
     */
    readonly dataType: string;
    /**
     * Raw data that failed to parse
     */
    readonly rawData?: string;
    /**
     * Expected format or structure
     */
    readonly expectedFormat?: string;
    /**
     * Parse error position if available
     */
    readonly position?: number;
    /**
     * Create a new parsing error
     * @param message - Error message
     * @param dataType - Data type
     * @param rawData - Raw data
     * @param expectedFormat - Expected format
     * @param position - Error position
     * @param context - Additional context
     */
    constructor(message: string, dataType: string, rawData?: string, expectedFormat?: string, position?: number, context?: Record<string, unknown>);
    /**
     * Get user-friendly message for parsing errors
     * @param dataType - Data type
     * @param expectedFormat - Expected format
     * @returns User-friendly message
     */
    private static getUserMessage;
    /**
     * Get severity level for parsing errors
     * @param dataType - Data type
     * @returns Severity level
     */
    private static getSeverity;
}
/**
 * System errors for unexpected system failures
 */
export declare class SystemError extends VocabularyError {
    readonly code = "SYSTEM_ERROR";
    readonly category = "system";
    /**
     * System component that failed
     */
    readonly component: string;
    /**
     * Original error that caused the system error
     */
    readonly originalError?: Error;
    /**
     * System state at time of error
     */
    readonly systemState?: Record<string, unknown>;
    /**
     * Create a new system error
     * @param message - Error message
     * @param component - System component
     * @param originalError - Original error
     * @param systemState - System state
     * @param context - Additional context
     */
    constructor(message: string, component: string, originalError?: Error, systemState?: Record<string, unknown>, context?: Record<string, unknown>);
}
/**
 * Error factory for creating appropriate error instances
 */
export declare const ErrorFactory: {
    /**
     * Create an appropriate error from a generic error
     * @param error - Original error
     * @param context - Additional context
     * @returns Vocabulary error instance
     */
    fromError(error: unknown, context?: Record<string, unknown>): VocabularyError;
    /**
     * Create a network error with common parameters
     * @param message - Error message
     * @param context - Context information
     * @returns Network error instance
     */
    network(message: string, context?: Record<string, unknown>): NetworkError;
    /**
     * Create a validation error with common parameters
     * @param message - Error message
     * @param context - Context information
     * @returns Validation error instance
     */
    validation(message: string, context?: Record<string, unknown>): ValidationError;
    /**
     * Create a storage error with common parameters
     * @param message - Error message
     * @param operation - Storage operation
     * @param context - Context information
     * @returns Storage error instance
     */
    storage(message: string, operation: 'read' | 'write' | 'clear' | 'quota', context?: Record<string, unknown>): StorageError;
    /**
     * Create a parsing error with common parameters
     * @param message - Error message
     * @param dataType - Data type
     * @param context - Context information
     * @returns Parsing error instance
     */
    parsing(message: string, dataType: string, context?: Record<string, unknown>): ParsingError;
};
/**
 * Error recovery strategy interface
 */
export interface ErrorRecoveryStrategy {
    /**
     * Check if this strategy can recover from the given error
     * @param error - Error to check
     * @returns Whether recovery is possible
     */
    canRecover(error: VocabularyError): boolean;
    /**
     * Attempt to recover from the error
     * @param error - Error to recover from
     * @param context - Recovery context
     * @returns Recovery result
     */
    recover(error: VocabularyError, context?: Record<string, unknown>): Promise<unknown>;
}
/**
 * Retry strategy with exponential backoff
 */
export declare class RetryStrategy implements ErrorRecoveryStrategy {
    private maxRetries;
    private baseDelay;
    private maxDelay;
    constructor(maxRetries?: number, baseDelay?: number, maxDelay?: number);
    /**
     * Check if error is retryable
     * @param error - Error to check
     * @returns Whether error can be retried
     */
    canRecover(error: VocabularyError): boolean;
    /**
     * Execute retry with exponential backoff
     * @param error - Error to retry
     * @param context - Recovery context
     * @returns Retry result
     */
    recover(error: VocabularyError, context?: Record<string, unknown>): Promise<unknown>;
    /**
     * Delay execution for specified milliseconds
     * @param ms - Milliseconds to delay
     * @returns Promise that resolves after delay
     */
    private delay;
}
/**
 * Fallback strategy for when primary operations fail
 */
export declare class FallbackStrategy implements ErrorRecoveryStrategy {
    private fallbackFunction;
    constructor(fallbackFunction: () => Promise<unknown>);
    /**
     * Check if fallback is available
     * @param error - Error to check
     * @returns Whether fallback is available
     */
    canRecover(error: VocabularyError): boolean;
    /**
     * Execute fallback function
     * @param error - Error that triggered fallback
     * @param context - Recovery context
     * @returns Fallback result
     */
    recover(error: VocabularyError): Promise<unknown>;
}
//# sourceMappingURL=error-types.d.ts.map