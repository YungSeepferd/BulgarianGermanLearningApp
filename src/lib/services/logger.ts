/**
 * LoggerService - Centralized logging and error collection
 *
 * Collects all logs/errors in memory with a ring buffer for dev debugging.
 * Replaces raw console calls with structured, level-aware logging.
 * Provides a DevTools-compatible log store for in-browser inspection.
 *
 * - Dev mode: Rich console output + in-memory buffer
 * - Production: Minimal console output + in-memory error buffer only
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  readonly id: string;
  readonly timestamp: string;
  readonly level: LogLevel;
  readonly context: string;
  readonly message: string;
  readonly data?: unknown;
  readonly error?: {
    readonly name: string;
    readonly message: string;
    readonly stack: string | undefined;
  };
}

const MAX_BUFFER_SIZE = 500;
const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

class LoggerService {
  /** Ring buffer of recent log entries */
  private buffer: LogEntry[] = [];
  private idCounter = 0;

  /** Minimum level for console output (configurable) */
  private consoleLevel: LogLevel = import.meta.env.DEV ? 'debug' : 'error';

  /** Minimum level for in-memory buffer (always captures errors) */
  private bufferLevel: LogLevel = import.meta.env.DEV ? 'debug' : 'warn';

  /** Reactive subscribers (for DevTools panel) */
  private subscribers = new Set<() => void>();

  /** Whether the service is initialized */
  private initialized = false;

  /** Whether a microtask notification is pending */
  private pendingNotification = false;

  /**
   * Initialize the logger. Auto-enabled in dev mode.
   * Sets up global error handlers. Call once during app startup.
   */
  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    // Capture uncaught errors and unhandled rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        if (event.error === null || event.error === undefined) return;
        this.error('Global', 'Uncaught error', event.error instanceof Error ? event.error : new Error(String(event.error)));
      });
      window.addEventListener('unhandledrejection', (event) => {
        if (event.reason === null || event.reason === undefined) return;
        const err = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
        this.error('Global', 'Unhandled promise rejection', err);
      });
    }

    if (import.meta.env.DEV) {
      this.info('Logger', 'LoggerService initialized (dev mode)');
    }
  }

  /**
   * Log at debug level - dev only, no-ops in production
   */
  debug(context: string, message: string, data?: unknown): void {
    this.log('debug', context, message, data);
  }

  /**
   * Log at info level
   */
  info(context: string, message: string, data?: unknown): void {
    this.log('info', context, message, data);
  }

  /**
   * Log at warning level
   */
  warn(context: string, message: string, data?: unknown): void {
    this.log('warn', context, message, data);
  }

  /**
   * Log at error level - ALWAYS captured regardless of mode
   */
  error(context: string, message: string, error?: Error, data?: unknown): void {
    this.log('error', context, message, data, error);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    context: string,
    message: string,
    data?: unknown,
    error?: Error
  ): void {
    const now = Date.now();
    const entry: LogEntry = {
      id: `log-${++this.idCounter}-${now}`,
      timestamp: new Date(now).toISOString(),
      level,
      context,
      message,
      ...(data !== undefined && { data }),
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      })
    };

    // Add to buffer if level meets threshold
    if (LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[this.bufferLevel]) {
      this.addToBuffer(entry);
    }

    // Console output if level meets threshold
    if (LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[this.consoleLevel]) {
      this.writeToConsole(entry, error);
    }
  }

  /**
   * Add entry to ring buffer, evicting oldest when full
   */
  private addToBuffer(entry: LogEntry): void {
    if (this.buffer.length >= MAX_BUFFER_SIZE) {
      this.buffer.shift();
    }
    this.buffer.push(entry);
    this.notifySubscribers();
  }

  /**
   * Write structured output to console
   */
  private writeToConsole(entry: LogEntry, error?: Error): void {
    if (typeof console === 'undefined') return;

    const prefix = `[TandemLog] [${entry.level.toUpperCase()}] [${entry.context}]`;
    const timestamp = entry.timestamp.split('T')[1]?.split('.')[0] ?? '';

    const consoleFn = {
      debug: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error
    }[entry.level];

    const arg = entry.level === 'error' ? error : entry.data;
    if (arg !== undefined && arg !== null) {
      consoleFn(`${prefix} ${timestamp} ${entry.message}`, arg);
    } else {
      consoleFn(`${prefix} ${timestamp} ${entry.message}`);
    }
  }

  /**
   * Dispose of the logger — clear subscribers and buffer.
   * Useful for HMR cleanup in development.
   */
  dispose(): void {
    this.subscribers.clear();
    this.buffer = [];
    this.idCounter = 0;
    this.pendingNotification = false;
  }

  // ── Buffer access ───────────────────────────────────────────────

  /**
   * Get all buffered entries (snapshot)
   */
  getEntries(): LogEntry[] {
    return [...this.buffer];
  }

  /**
   * Get entries filtered by level
   */
  getEntriesByLevel(level: LogLevel): LogEntry[] {
    return this.buffer.filter((e) => e.level === level);
  }

  /**
   * Get entries filtered by context (substring match)
   */
  getEntriesByContext(context: string): LogEntry[] {
    return this.buffer.filter((e) => e.context.includes(context));
  }

  /**
   * Get count of entries by level
   */
  getStats(): Record<LogLevel, number> & { total: number } {
    const stats = { debug: 0, info: 0, warn: 0, error: 0, total: this.buffer.length };
    for (const entry of this.buffer) {
      stats[entry.level]++;
    }
    return stats;
  }

  /**
   * Clear the buffer
   */
  clear(): void {
    this.buffer = [];
    this.idCounter = 0;
    this.notifySubscribers();
  }

  // ── Reactivity (for DevTools panel) ──────────────────────────────

  /**
   * Subscribe to buffer changes. Returns unsubscribe function.
   */
  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(): void {
    if (!this.pendingNotification) {
      this.pendingNotification = true;
      queueMicrotask(() => {
        this.pendingNotification = false;
        const callbacks = [...this.subscribers];
        for (const cb of callbacks) {
          try {
            cb();
          } catch {
            // Prevent subscriber errors from breaking the logger
          }
        }
      });
    }
  }

  // ── Configuration ───────────────────────────────────────────────

  /**
   * Set minimum console output level
   */
  setConsoleLevel(level: LogLevel): void {
    this.consoleLevel = level;
  }

  /**
   * Set minimum buffer capture level
   */
  setBufferLevel(level: LogLevel): void {
    this.bufferLevel = level;
  }

  // ── Export ────────────────────────────────────────────────────────

  /**
   * Export log buffer as JSON string for bug reports
   */
  exportAsJson(): string {
    const seen = new WeakSet();
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        stats: this.getStats(),
        entries: this.buffer
      },
      (_key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) return '[Circular]';
          seen.add(value);
        }
        return value;
      },
      2
    );
  }

  /**
   * Download log buffer as a JSON file
   */
  downloadLogs(): void {
    if (typeof window === 'undefined') return;

    const json = this.exportAsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tandem-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Delay revocation to ensure download completes
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
}

/** Singleton instance */
export const logger = new LoggerService();

/** Convenience aliases */
export const log = logger.info.bind(logger);
export const logInfo = logger.info.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logError = logger.error.bind(logger);