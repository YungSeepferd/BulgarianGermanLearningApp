/**
 * Comprehensive Error Logging and Debugging System
 * Provides structured logging, error tracking, and debugging capabilities
 * @since 1.0.0
 */
import { VocabularyError } from './error-types.js';
/**
 * Log level types
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';
/**
 * Log entry structure
 */
export interface LogEntry {
    /** Unique log entry ID */
    id: string;
    /** Log level */
    level: LogLevel;
    /** Log message */
    message: string;
    /** Timestamp */
    timestamp: Date;
    /** Error information if applicable */
    error?: VocabularyError;
    /** Additional context */
    context?: Record<string, unknown>;
    /** Component that generated the log */
    component: string;
    /** User session ID */
    sessionId: string;
    /** Stack trace if available */
    stack?: string;
}
/**
 * Error statistics
 */
export interface ErrorStatistics {
    /** Total number of errors logged */
    totalErrors: number;
    /** Error count by category */
    errorsByCategory: Record<string, number>;
    /** Error count by component */
    errorsByComponent: Record<string, number>;
    /** Most recent errors */
    recentErrors: LogEntry[];
    /** Error rate over time */
    errorRate: number;
    /** Average error resolution time */
    averageResolutionTime?: number;
}
/**
 * Logger configuration options
 */
export interface ErrorLoggerOptions {
    /** Maximum number of log entries to keep in memory */
    maxLogEntries?: number;
    /** Whether to enable console logging */
    enableConsoleLogging?: boolean;
    /** Whether to enable persistent storage */
    enablePersistentStorage?: boolean;
    /** Storage key for persistent logs */
    storageKey?: string;
    /** Session timeout in milliseconds */
    sessionTimeout?: number;
    /** Whether to enable error tracking */
    enableErrorTracking?: boolean;
}
/**
 * Error Logger Class
 * Provides comprehensive error logging and debugging capabilities
 */
export declare class ErrorLogger {
    private options;
    private logEntries;
    private sessionId;
    private sessionStartTime;
    private errorCounts;
    private componentCounts;
    /**
     * Create a new error logger
     * @param options - Configuration options
     */
    constructor(options?: ErrorLoggerOptions);
    /**
     * Log a debug message
     * @param message - Log message
     * @param context - Additional context
     * @param component - Component name
     */
    debug(message: string, context?: Record<string, unknown>, component?: string): void;
    /**
     * Log an info message
     * @param message - Log message
     * @param context - Additional context
     * @param component - Component name
     */
    info(message: string, context?: Record<string, unknown>, component?: string): void;
    /**
     * Log a warning message
     * @param message - Log message
     * @param context - Additional context
     * @param component - Component name
     */
    warn(message: string, context?: Record<string, unknown>, component?: string): void;
    /**
     * Log an error message
     * @param message - Log message
     * @param error - Error object
     * @param context - Additional context
     * @param component - Component name
     */
    error(message: string, error?: VocabularyError, context?: Record<string, unknown>, component?: string): void;
    /**
     * Log a critical error message
     * @param message - Log message
     * @param error - Error object
     * @param context - Additional context
     * @param component - Component name
     */
    critical(message: string, error?: VocabularyError, context?: Record<string, unknown>, component?: string): void;
    /**
     * Log a vocabulary error with enhanced context
     * @param error - Vocabulary error
     * @param operation - Operation being performed
     * @param context - Additional context
     */
    logVocabularyError(error: VocabularyError, operation: string, context?: Record<string, unknown>): void;
    /**
     * Log a network operation
     * @param operation - Network operation
     * @param url - Request URL
     * @param method - HTTP method
     * @param context - Additional context
     */
    logNetworkOperation(operation: string, url: string, method: string, context?: Record<string, unknown>): void;
    /**
     * Log a loading state change
     * @param operation - Loading operation
     * @param state - Loading state
     * @param progress - Progress percentage
     * @param context - Additional context
     */
    logLoadingState(operation: string, state: string, progress?: number, context?: Record<string, unknown>): void;
    /**
     * Log performance metrics
     * @param operation - Operation being measured
     * @param duration - Duration in milliseconds
     * @param metrics - Additional metrics
     * @param context - Additional context
     */
    logPerformance(operation: string, duration: number, metrics?: Record<string, number>, context?: Record<string, unknown>): void;
    /**
     * Log user interaction
     * @param action - User action
     * @param context - Additional context
     * @param component - Component name
     */
    logUserAction(action: string, context?: Record<string, unknown>, component?: string): void;
    /**
     * Get error statistics
     * @returns Error statistics
     */
    getErrorStatistics(): ErrorStatistics;
    /**
     * Get recent log entries
     * @param level - Filter by log level (optional)
     * @param limit - Maximum number of entries to return
     * @returns Array of log entries
     */
    getRecentLogs(level?: LogLevel, limit?: number): LogEntry[];
    /**
     * Get logs by component
     * @param component - Component name
     * @param level - Filter by log level (optional)
     * @returns Array of log entries
     */
    getLogsByComponent(component: string, level?: LogLevel): LogEntry[];
    /**
     * Clear all log entries
     */
    clearLogs(): void;
    /**
     * Export logs to JSON
     * @param level - Filter by log level (optional)
     * @returns JSON string of logs
     */
    exportLogs(level?: LogLevel): string;
    /**
     * Get session information
     * @returns Session information
     */
    getSessionInfo(): {
        sessionId: string;
        startTime: Date;
        duration: number;
        totalLogs: number;
        errorCount: number;
    };
    /**
     * Check if session has expired
     * @returns Whether session has expired
     */
    isSessionExpired(): boolean;
    /**
     * Refresh the session
     */
    refreshSession(): void;
    /**
     * Core logging method
     * @param level - Log level
     * @param message - Log message
     * @param context - Additional context
     * @param component - Component name
     * @param error - Error object
     */
    private log;
    /**
     * Log to console with appropriate formatting
     * @param entry - Log entry
     */
    private logToConsole;
    /**
     * Persist log entry to localStorage
     * @param entry - Log entry to persist
     */
    private persistLog;
    /**
     * Load persisted logs from localStorage
     */
    private loadPersistedLogs;
    /**
     * Generate unique log ID
     * @returns Unique log ID
     */
    private generateLogId;
    /**
     * Generate unique session ID
     * @returns Unique session ID
     */
    private generateSessionId;
}
export declare const errorLogger: ErrorLogger;
export default errorLogger;
//# sourceMappingURL=error-logger.d.ts.map