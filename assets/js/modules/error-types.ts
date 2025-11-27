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
export abstract class VocabularyError extends Error {
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
  constructor(
    message: string,
    userMessage: string = 'An error occurred while processing vocabulary data',
    severity: ErrorSeverity = 'medium',
    recoveryStrategy: RecoveryStrategy = 'retry',
    retryable: boolean = true,
    context: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.severity = severity;
    this.recoveryStrategy = recoveryStrategy;
    this.retryable = retryable;
    this.userMessage = userMessage;
    this.context = context;

    // Ensure the error stack trace is properly captured
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert error to JSON for logging/serialization
   * @returns JSON representation of the error
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      category: this.category,
      message: this.message,
      userMessage: this.userMessage,
      severity: this.severity,
      recoveryStrategy: this.recoveryStrategy,
      retryable: this.retryable,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: this.stack
    };
  }

  /**
   * Get a formatted error string for logging
   * @returns Formatted error string
   */
  toString(): string {
    return `[${this.code}] ${this.category.toUpperCase()}: ${this.message} (${this.userMessage})`;
  }
}

/**
 * Network-related errors for connectivity and HTTP issues
 */
export class NetworkError extends VocabularyError {
  readonly code = 'NETWORK_ERROR';
  readonly category = 'network';

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
  constructor(
    message: string,
    statusCode?: number,
    url?: string,
    method?: string,
    timeout?: number,
    retryable: boolean = true,
    context: Record<string, unknown> = {}
  ) {
    const userMessage = NetworkError.getUserMessage(statusCode, timeout);
    const severity = NetworkError.getSeverity(statusCode, timeout);
    const recoveryStrategy = NetworkError.getRecoveryStrategy(statusCode, timeout);

    super(message, userMessage, severity, recoveryStrategy, retryable, {
      statusCode,
      url,
      method,
      timeout,
      ...context
    });

    this.statusCode = statusCode;
    this.url = url;
    this.method = method;
    this.timeout = timeout;
  }

  /**
   * Get user-friendly message based on status code and timeout
   * @param statusCode - HTTP status code
   * @param timeout - Timeout duration
   * @returns User-friendly message
   */
  private static getUserMessage(statusCode?: number, timeout?: number): string {
    if (timeout) {
      return 'The request timed out. Please check your internet connection and try again.';
    }

    switch (statusCode) {
    case 404: {
      return 'The requested vocabulary data was not found. It may have been moved or deleted.';
    }
    case 403: {
      return 'You do not have permission to access this vocabulary data.';
    }
    case 429: {
      return 'Too many requests were made. Please wait a moment and try again.';
    }
    case 500: {
      return 'The server encountered an error. Please try again later.';
    }
    case 502:
    case 503:
    case 504: {
      return 'The service is temporarily unavailable. Please try again later.';
    }
    default: {
      return 'A network error occurred while loading vocabulary data. Please check your connection.';
    }
    }
  }

  /**
   * Get severity level based on status code and timeout
   * @param statusCode - HTTP status code
   * @param timeout - Timeout duration
   * @returns Severity level
   */
  private static getSeverity(statusCode?: number, timeout?: number): ErrorSeverity {
    if (timeout) return 'medium';
    if (!statusCode) return 'medium';

    if (statusCode >= 500) return 'high';
    if (statusCode === 429) return 'medium';
    if (statusCode >= 400) return 'medium';
    return 'low';
  }

  /**
   * Get recovery strategy based on status code and timeout
   * @param statusCode - HTTP status code
   * @param timeout - Timeout duration
   * @returns Recovery strategy
   */
  private static getRecoveryStrategy(statusCode?: number, timeout?: number): RecoveryStrategy {
    if (timeout) return 'retry';
    if (!statusCode) return 'retry';

    // Client errors (4xx) - some are retryable, some are not
    if (statusCode >= 400 && statusCode < 500) {
      if (statusCode === 429) return 'retry';
      if (statusCode === 408) return 'retry';
      return 'abort';
    }

    // Server errors (5xx) - retry
    if (statusCode >= 500) return 'retry';

    return 'retry';
  }
}

/**
 * Validation errors for data validation failures
 */
export class ValidationError extends VocabularyError {
  readonly code = 'VALIDATION_ERROR';
  readonly category = 'validation';

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
  constructor(
    message: string,
    field?: string,
    value?: unknown,
    rule?: string,
    expected?: string,
    context: Record<string, unknown> = {}
  ) {
    const userMessage = ValidationError.getUserMessage(field, rule);
    const severity = ValidationError.getSeverity(rule);
    const recoveryStrategy = 'abort'; // Validation errors are not retryable

    super(message, userMessage, severity, recoveryStrategy, false, {
      field,
      value,
      rule,
      expected,
      ...context
    });

    this.field = field;
    this.value = value;
    this.rule = rule;
    this.expected = expected;
  }

  /**
   * Get user-friendly message for validation errors
   * @param field - Field that failed
   * @param rule - Validation rule
   * @returns User-friendly message
   */
  private static getUserMessage(field?: string, rule?: string): string {
    if (field && rule) {
      return `The ${field} field is invalid. ${rule}`;
    }
    return 'The provided data is not valid. Please check your input and try again.';
  }

  /**
   * Get severity level for validation errors
   * @param rule - Validation rule
   * @returns Severity level
   */
  private static getSeverity(rule?: string): ErrorSeverity {
    // Required field failures are more severe
    if (rule?.includes('required')) return 'high';
    return 'medium';
  }
}

/**
 * Storage errors for localStorage and cache operations
 */
export class StorageError extends VocabularyError {
  readonly code = 'STORAGE_ERROR';
  readonly category = 'storage';

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
  constructor(
    message: string,
    operation: 'read' | 'write' | 'clear' | 'quota',
    key?: string,
    availableSpace?: number,
    requiredSpace?: number,
    context: Record<string, unknown> = {}
  ) {
    const userMessage = StorageError.getUserMessage(operation, availableSpace, requiredSpace);
    const severity = StorageError.getSeverity(operation);
    const recoveryStrategy = StorageError.getRecoveryStrategy(operation);

    super(message, userMessage, severity, recoveryStrategy, true, {
      operation,
      key,
      availableSpace,
      requiredSpace,
      ...context
    });

    this.operation = operation;
    this.key = key;
    this.availableSpace = availableSpace;
    this.requiredSpace = requiredSpace;
  }

  /**
   * Get user-friendly message for storage errors
   * @param operation - Storage operation
   * @param availableSpace - Available space
   * @param requiredSpace - Required space
   * @returns User-friendly message
   */
  private static getUserMessage(
    operation: string,
    availableSpace?: number,
    requiredSpace?: number
  ): string {
    if (operation === 'quota' && availableSpace && requiredSpace) {
      return `Storage is full. Need ${Math.ceil(requiredSpace / 1024)}KB but only ${Math.ceil(availableSpace / 1024)}KB available.`;
    }
    if (operation === 'write') {
      return 'Unable to save data. Your browser storage may be full.';
    }
    if (operation === 'read') {
      return 'Unable to load saved data. The data may be corrupted.';
    }
    return 'A storage error occurred while managing vocabulary data.';
  }

  /**
   * Get severity level for storage errors
   * @param operation - Storage operation
   * @returns Severity level
   */
  private static getSeverity(operation: string): ErrorSeverity {
    if (operation === 'quota') return 'high';
    if (operation === 'write') return 'medium';
    return 'low';
  }

  /**
   * Get recovery strategy for storage errors
   * @param operation - Storage operation
   * @returns Recovery strategy
   */
  private static getRecoveryStrategy(operation: string): RecoveryStrategy {
    if (operation === 'quota') return 'fallback';
    if (operation === 'write') return 'retry';
    return 'ignore';
  }
}

/**
 * Parsing errors for data format and structure issues
 */
export class ParsingError extends VocabularyError {
  readonly code = 'PARSING_ERROR';
  readonly category = 'parsing';

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
  constructor(
    message: string,
    dataType: string,
    rawData?: string,
    expectedFormat?: string,
    position?: number,
    context: Record<string, unknown> = {}
  ) {
    const userMessage = ParsingError.getUserMessage(dataType, expectedFormat);
    const severity = ParsingError.getSeverity(dataType);
    const recoveryStrategy = 'fallback'; // Parsing errors typically need fallback

    super(message, userMessage, severity, recoveryStrategy, false, {
      dataType,
      rawData: rawData?.slice(0, 500), // Limit raw data for logging
      expectedFormat,
      position,
      ...context
    });

    this.dataType = dataType;
    this.rawData = rawData;
    this.expectedFormat = expectedFormat;
    this.position = position;
  }

  /**
   * Get user-friendly message for parsing errors
   * @param dataType - Data type
   * @param expectedFormat - Expected format
   * @returns User-friendly message
   */
  private static getUserMessage(dataType: string, expectedFormat?: string): string {
    if (expectedFormat) {
      return `The ${dataType} data format is invalid. Expected: ${expectedFormat}`;
    }
    return `The ${dataType} data could not be processed. The file may be corrupted or in an unsupported format.`;
  }

  /**
   * Get severity level for parsing errors
   * @param dataType - Data type
   * @returns Severity level
   */
  private static getSeverity(dataType: string): ErrorSeverity {
    // Core vocabulary data parsing errors are more severe
    if (dataType.includes('vocabulary') || dataType.includes('json')) return 'high';
    return 'medium';
  }
}

/**
 * System errors for unexpected system failures
 */
export class SystemError extends VocabularyError {
  readonly code = 'SYSTEM_ERROR';
  readonly category = 'system';

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
  constructor(
    message: string,
    component: string,
    originalError?: Error,
    systemState?: Record<string, unknown>,
    context: Record<string, unknown> = {}
  ) {
    const userMessage = 'An unexpected system error occurred. Please refresh the page and try again.';
    const severity = 'critical';
    const recoveryStrategy = 'retry';

    super(message, userMessage, severity, recoveryStrategy, true, {
      component,
      originalError: originalError?.message,
      systemState,
      ...context
    });

    this.component = component;
    this.originalError = originalError;
    this.systemState = systemState;
  }
}

/**
 * Error factory for creating appropriate error instances
 */
export const ErrorFactory = {
  /**
   * Create an appropriate error from a generic error
   * @param error - Original error
   * @param context - Additional context
   * @returns Vocabulary error instance
   */
  fromError(error: unknown, context: Record<string, unknown> = {}): VocabularyError {
    if (error instanceof VocabularyError) {
      return error;
    }

    if (error instanceof Error) {
      // Network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return new NetworkError(
          error.message,
          undefined,
          context.url as string,
          context.method as string,
          context.timeout as number,
          true,
          context
        );
      }

      // JSON parsing errors
      if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
        return new ParsingError(
          error.message,
          'JSON',
          context.rawData as string,
          'valid JSON',
          undefined,
          context
        );
      }

      // Storage errors
      if (error.name === 'QuotaExceededError') {
        return new StorageError(
          error.message,
          'quota',
          context.key as string,
          context.availableSpace as number,
          context.requiredSpace as number,
          context
        );
      }

      // Generic system error
      return new SystemError(
        error.message,
        context.component as string || 'unknown',
        error,
        context.systemState as Record<string, unknown>,
        context
      );
    }

    // Unknown error type
    return new SystemError(
      'Unknown error occurred',
      'error-factory',
      undefined,
      { originalError: error },
      context
    );
  },

  /**
   * Create a network error with common parameters
   * @param message - Error message
   * @param context - Context information
   * @returns Network error instance
   */
  network(message: string, context: Record<string, unknown> = {}): NetworkError {
    return new NetworkError(
      message,
      context.statusCode as number,
      context.url as string,
      context.method as string,
      context.timeout as number,
      context.retryable as boolean,
      context
    );
  },

  /**
   * Create a validation error with common parameters
   * @param message - Error message
   * @param context - Context information
   * @returns Validation error instance
   */
  validation(message: string, context: Record<string, unknown> = {}): ValidationError {
    return new ValidationError(
      message,
      context.field as string,
      context.value,
      context.rule as string,
      context.expected as string,
      context
    );
  },

  /**
   * Create a storage error with common parameters
   * @param message - Error message
   * @param operation - Storage operation
   * @param context - Context information
   * @returns Storage error instance
   */
  storage(
    message: string,
    operation: 'read' | 'write' | 'clear' | 'quota',
    context: Record<string, unknown> = {}
  ): StorageError {
    return new StorageError(
      message,
      operation,
      context.key as string,
      context.availableSpace as number,
      context.requiredSpace as number,
      context
    );
  },

  /**
   * Create a parsing error with common parameters
   * @param message - Error message
   * @param dataType - Data type
   * @param context - Context information
   * @returns Parsing error instance
   */
  parsing(message: string, dataType: string, context: Record<string, unknown> = {}): ParsingError {
    return new ParsingError(
      message,
      dataType,
      context.rawData as string,
      context.expectedFormat as string,
      context.position as number,
      context
    );
  }
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
export class RetryStrategy implements ErrorRecoveryStrategy {
  constructor(
    private maxRetries: number = 3,
    private baseDelay: number = 1000,
    private maxDelay: number = 30_000
  ) {}

  /**
   * Check if error is retryable
   * @param error - Error to check
   * @returns Whether error can be retried
   */
  canRecover(error: VocabularyError): boolean {
    return error.retryable && error.recoveryStrategy === 'retry';
  }

  /**
   * Execute retry with exponential backoff
   * @param error - Error to retry
   * @param context - Recovery context
   * @returns Retry result
   */
  async recover(error: VocabularyError, context?: Record<string, unknown>): Promise<unknown> {
    const retryFunction = context?.retryFunction as () => Promise<unknown>;
    if (!retryFunction) {
      throw new Error('No retry function provided in context');
    }

    let lastError: VocabularyError = error;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const delay = Math.min(this.baseDelay * Math.pow(2, attempt - 1), this.maxDelay);
        await this.delay(delay);
        
        return await retryFunction();
      } catch (retryError) {
        lastError = ErrorFactory.fromError(retryError, context);
        
        if (attempt === this.maxRetries || !lastError.retryable) {
          throw lastError;
        }
      }
    }

    throw lastError;
  }

  /**
   * Delay execution for specified milliseconds
   * @param ms - Milliseconds to delay
   * @returns Promise that resolves after delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Fallback strategy for when primary operations fail
 */
export class FallbackStrategy implements ErrorRecoveryStrategy {
  constructor(private fallbackFunction: () => Promise<unknown>) {}

  /**
   * Check if fallback is available
   * @param error - Error to check
   * @returns Whether fallback is available
   */
  canRecover(error: VocabularyError): boolean {
    return error.recoveryStrategy === 'fallback' && !!this.fallbackFunction;
  }

  /**
   * Execute fallback function
   * @param error - Error that triggered fallback
   * @param context - Recovery context
   * @returns Fallback result
   */
  async recover(error: VocabularyError): Promise<unknown> {
    try {
      return await this.fallbackFunction();
    } catch (fallbackError) {
      throw ErrorFactory.fromError(fallbackError, {
        originalError: error,
        fallbackError,
        operation: 'fallback'
      });
    }
  }
}