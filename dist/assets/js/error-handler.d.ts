/**
 * Global Error Handler for Bulgarian-German Learning App
 *
 * Provides centralized error handling, logging, and user notifications
 * for production-ready error management.
 */
interface ErrorInfo {
    message: string;
    stack?: string;
    type: string;
    timestamp: string;
    filename?: string;
    lineno?: number;
    colno?: number;
}
interface ErrorStats {
    total: number;
    byType: Record<string, number>;
    recent: ErrorInfo[];
}
declare class ErrorHandler {
    private errors;
    private maxErrors;
    isProduction: boolean;
    constructor();
    /**
     * Setup global error handlers
     */
    private setupGlobalHandlers;
    /**
     * Handle and log errors
     * @param error - Error object
     */
    handleError(error: ErrorInfo): void;
    /**
     * Show user-friendly error notification
     * @param error - Error object
     */
    private showUserNotification;
    /**
     * Get user-friendly error message
     * @param error - Error object
     * @returns User-friendly message
     */
    private getUserFriendlyMessage;
    /**
     * Get error statistics
     * @returns Error statistics
     */
    getStats(): ErrorStats;
    /**
     * Clear error log
     */
    clearErrors(): void;
    /**
     * Export errors for debugging
     * @returns JSON string of errors
     */
    exportErrors(): string;
}
declare const errorHandler: ErrorHandler;
export default errorHandler;
//# sourceMappingURL=error-handler.d.ts.map