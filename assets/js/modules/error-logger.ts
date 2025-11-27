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
export class ErrorLogger {
  private options: Required<ErrorLoggerOptions>;
  private logEntries: LogEntry[] = [];
  private sessionId: string;
  private sessionStartTime: Date;
  private errorCounts: Map<string, number> = new Map();
  private componentCounts: Map<string, number> = new Map();

  /**
   * Create a new error logger
   * @param options - Configuration options
   */
  constructor(options: ErrorLoggerOptions = {}) {
    this.options = {
      maxLogEntries: 1000,
      enableConsoleLogging: true,
      enablePersistentStorage: true,
      storageKey: 'bgde:error_logs',
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      enableErrorTracking: true,
      ...options
    };

    this.sessionId = this.generateSessionId();
    this.sessionStartTime = new Date();
    this.loadPersistedLogs();
  }

  /**
   * Log a debug message
   * @param message - Log message
   * @param context - Additional context
   * @param component - Component name
   */
  debug(message: string, context: Record<string, unknown> = {}, component = 'unknown'): void {
    this.log('debug', message, context, component);
  }

  /**
   * Log an info message
   * @param message - Log message
   * @param context - Additional context
   * @param component - Component name
   */
  info(message: string, context: Record<string, unknown> = {}, component = 'unknown'): void {
    this.log('info', message, context, component);
  }

  /**
   * Log a warning message
   * @param message - Log message
   * @param context - Additional context
   * @param component - Component name
   */
  warn(message: string, context: Record<string, unknown> = {}, component = 'unknown'): void {
    this.log('warn', message, context, component);
  }

  /**
   * Log an error message
   * @param message - Log message
   * @param error - Error object
   * @param context - Additional context
   * @param component - Component name
   */
  error(message: string, error?: VocabularyError, context: Record<string, unknown> = {}, component = 'unknown'): void {
    this.log('error', message, context, component, error);
  }

  /**
   * Log a critical error message
   * @param message - Log message
   * @param error - Error object
   * @param context - Additional context
   * @param component - Component name
   */
  critical(message: string, error?: VocabularyError, context: Record<string, unknown> = {}, component = 'unknown'): void {
    this.log('critical', message, context, component, error);
  }

  /**
   * Log a vocabulary error with enhanced context
   * @param error - Vocabulary error
   * @param operation - Operation being performed
   * @param context - Additional context
   */
  logVocabularyError(error: VocabularyError, operation: string, context: Record<string, unknown> = {}): void {
    const enhancedContext = {
      operation,
      errorCode: error.code,
      errorCategory: error.category,
      errorSeverity: error.severity,
      retryable: error.retryable,
      recoveryStrategy: error.recoveryStrategy,
      userMessage: error.userMessage,
      ...context
    };

    this.error(`Vocabulary error in ${operation}: ${error.message}`, error, enhancedContext, 'vocabulary-api');
  }

  /**
   * Log a network operation
   * @param operation - Network operation
   * @param url - Request URL
   * @param method - HTTP method
   * @param context - Additional context
   */
  logNetworkOperation(operation: string, url: string, method: string, context: Record<string, unknown> = {}): void {
    this.info(`Network operation: ${operation} ${method} ${url}`, {
      operation,
      url,
      method,
      ...context
    }, 'network-manager');
  }

  /**
   * Log a loading state change
   * @param operation - Loading operation
   * @param state - Loading state
   * @param progress - Progress percentage
   * @param context - Additional context
   */
  logLoadingState(operation: string, state: string, progress?: number, context: Record<string, unknown> = {}): void {
    const logContext = {
      operation,
      state,
      progress,
      ...context
    };

    if (progress === undefined) {
      this.info(`Loading ${operation}: ${state}`, logContext, 'loading-manager');
    } else {
      this.info(`Loading ${operation}: ${state} (${progress}%)`, logContext, 'loading-manager');
    }
  }

  /**
   * Log performance metrics
   * @param operation - Operation being measured
   * @param duration - Duration in milliseconds
   * @param metrics - Additional metrics
   * @param context - Additional context
   */
  logPerformance(operation: string, duration: number, metrics: Record<string, number> = {}, context: Record<string, unknown> = {}): void {
    this.info(`Performance: ${operation} completed in ${duration}ms`, {
      operation,
      duration,
      metrics,
      ...context
    }, 'performance-monitor');
  }

  /**
   * Log user interaction
   * @param action - User action
   * @param context - Additional context
   * @param component - Component name
   */
  logUserAction(action: string, context: Record<string, unknown> = {}, component = 'unknown'): void {
    this.debug(`User action: ${action}`, {
      action,
      ...context
    }, component);
  }

  /**
   * Get error statistics
   * @returns Error statistics
   */
  getErrorStatistics(): ErrorStatistics {
    const errorEntries = this.logEntries.filter(entry => entry.level === 'error' || entry.level === 'critical');
    const totalErrors = errorEntries.length;
    
    // Count errors by category
    const errorsByCategory: Record<string, number> = {};
    const errorsByComponent: Record<string, number> = {};
    
    for (const entry of errorEntries) {
      if (entry.error?.category) {
        errorsByCategory[entry.error.category] = (errorsByCategory[entry.error.category] || 0) + 1;
      }
      errorsByComponent[entry.component] = (errorsByComponent[entry.component] || 0) + 1;
    }

    // Calculate error rate (errors per minute)
    const sessionDuration = Date.now() - this.sessionStartTime.getTime();
    const errorRate = sessionDuration > 0 ? (totalErrors / sessionDuration) * 60_000 : 0;

    return {
      totalErrors,
      errorsByCategory,
      errorsByComponent,
      recentErrors: errorEntries.slice(-10),
      errorRate
    };
  }

  /**
   * Get recent log entries
   * @param level - Filter by log level (optional)
   * @param limit - Maximum number of entries to return
   * @returns Array of log entries
   */
  getRecentLogs(level?: LogLevel, limit: number = 100): LogEntry[] {
    let entries = this.logEntries;
    
    if (level) {
      entries = entries.filter(entry => entry.level === level);
    }
    
    return entries.slice(-limit);
  }

  /**
   * Get logs by component
   * @param component - Component name
   * @param level - Filter by log level (optional)
   * @returns Array of log entries
   */
  getLogsByComponent(component: string, level?: LogLevel): LogEntry[] {
    let entries = this.logEntries.filter(entry => entry.component === component);
    
    if (level) {
      entries = entries.filter(entry => entry.level === level);
    }
    
    return entries;
  }

  /**
   * Clear all log entries
   */
  clearLogs(): void {
    this.logEntries = [];
    this.errorCounts.clear();
    this.componentCounts.clear();
    
    if (this.options.enablePersistentStorage) {
      try {
        localStorage.removeItem(this.options.storageKey);
      } catch (error) {
        console.warn('Failed to clear persisted logs:', error);
      }
    }
  }

  /**
   * Export logs to JSON
   * @param level - Filter by log level (optional)
   * @returns JSON string of logs
   */
  exportLogs(level?: LogLevel): string {
    let entries = this.logEntries;
    
    if (level) {
      entries = entries.filter(entry => entry.level === level);
    }
    
    const exportData = {
      sessionId: this.sessionId,
      sessionStartTime: this.sessionStartTime,
      exportTime: new Date(),
      totalEntries: entries.length,
      logs: entries
    };
    
    return JSON.stringify(exportData, null, 2);
  }

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
    } {
    const duration = Date.now() - this.sessionStartTime.getTime();
    const errorCount = this.logEntries.filter(entry => entry.level === 'error' || entry.level === 'critical').length;
    
    return {
      sessionId: this.sessionId,
      startTime: this.sessionStartTime,
      duration,
      totalLogs: this.logEntries.length,
      errorCount
    };
  }

  /**
   * Check if session has expired
   * @returns Whether session has expired
   */
  isSessionExpired(): boolean {
    const duration = Date.now() - this.sessionStartTime.getTime();
    return duration > this.options.sessionTimeout;
  }

  /**
   * Refresh the session
   */
  refreshSession(): void {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = new Date();
    this.info('Session refreshed', {}, 'error-logger');
  }

  /**
   * Core logging method
   * @param level - Log level
   * @param message - Log message
   * @param context - Additional context
   * @param component - Component name
   * @param error - Error object
   */
  private log(level: LogLevel, message: string, context: Record<string, unknown>, component: string, error?: VocabularyError): void {
    const entry: LogEntry = {
      id: this.generateLogId(),
      level,
      message,
      timestamp: new Date(),
      error,
      context,
      component,
      sessionId: this.sessionId,
      stack: error?.stack
    };

    // Add to memory logs
    this.logEntries.push(entry);
    
    // Maintain maximum size
    if (this.logEntries.length > this.options.maxLogEntries) {
      this.logEntries = this.logEntries.slice(-this.options.maxLogEntries);
    }

    // Update counts
    if (level === 'error' || level === 'critical') {
      this.errorCounts.set(component, (this.errorCounts.get(component) || 0) + 1);
    }
    this.componentCounts.set(component, (this.componentCounts.get(component) || 0) + 1);

    // Console logging
    if (this.options.enableConsoleLogging) {
      this.logToConsole(entry);
    }

    // Persistent storage
    if (this.options.enablePersistentStorage && (level === 'error' || level === 'critical')) {
      this.persistLog(entry);
    }
  }

  /**
   * Log to console with appropriate formatting
   * @param entry - Log entry
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const component = entry.component;
    const sessionId = entry.sessionId.slice(0, 8);
    
    let message = `[${timestamp}] [${sessionId}] [${component}] ${entry.message}`;
    
    if (entry.context && Object.keys(entry.context).length > 0) {
      message += ` ${JSON.stringify(entry.context)}`;
    }
    
    switch (entry.level) {
    case 'debug': {
      console.debug(message);
      break;
    }
    case 'info': {
      console.info(message);
      break;
    }
    case 'warn': {
      console.warn(message);
      break;
    }
    case 'error': {
      console.error(message);
      if (entry.error) {
        console.error(entry.error);
      }
      break;
    }
    case 'critical': {
      console.error(`🚨 CRITICAL: ${message}`);
      if (entry.error) {
        console.error(entry.error);
      }
      break;
    }
    }
  }

  /**
   * Persist log entry to localStorage
   * @param entry - Log entry to persist
   */
  private persistLog(entry: LogEntry): void {
    try {
      const existingLogs = localStorage.getItem(this.options.storageKey);
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      
      logs.push(entry);
      
      // Keep only recent logs in storage
      if (logs.length > 500) {
        logs.splice(0, logs.length - 500);
      }
      
      localStorage.setItem(this.options.storageKey, JSON.stringify(logs));
    } catch (error) {
      console.warn('Failed to persist log entry:', error);
    }
  }

  /**
   * Load persisted logs from localStorage
   */
  private loadPersistedLogs(): void {
    if (!this.options.enablePersistentStorage) return;
    
    try {
      const existingLogs = localStorage.getItem(this.options.storageKey);
      if (existingLogs) {
        const logs = JSON.parse(existingLogs);
        this.logEntries = logs.slice(-this.options.maxLogEntries);
      }
    } catch (error) {
      console.warn('Failed to load persisted logs:', error);
    }
  }

  /**
   * Generate unique log ID
   * @returns Unique log ID
   */
  private generateLogId(): string {
    return `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  /**
   * Generate unique session ID
   * @returns Unique session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

// Create singleton instance
export const errorLogger = new ErrorLogger({
  enableConsoleLogging: process.env.NODE_ENV === 'development',
  enablePersistentStorage: true
});

export default errorLogger;