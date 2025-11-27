/**
 * Error Logger Unit Tests
 * Tests the comprehensive error logging and debugging system
 * @since 1.0.0
 */

import { ErrorLogger, errorLogger } from '../../assets/js/modules/error-logger.js';
import { VocabularyError, ErrorCategory, ErrorSeverity } from '../../assets/js/modules/error-types.js';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('ErrorLogger', () => {
  let logger: ErrorLogger;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    
    // Create new logger instance for testing
    logger = new ErrorLogger({
      maxLogEntries: 100,
      enableConsoleLogging: false, // Disable console logging for tests
      enablePersistentStorage: true,
      storageKey: 'test-error-logs'
    });
  });

  afterEach(() => {
    // Clean up after each test
    logger.clearLogs();
  });

  describe('Basic Logging', () => {
    it('should log debug messages', () => {
      logger.debug('Debug message', { key: 'value' }, 'test-component');
      
      const logs = logger.getRecentLogs('debug');
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('debug');
      expect(logs[0].message).toBe('Debug message');
      expect(logs[0].context).toEqual({ key: 'value' });
      expect(logs[0].component).toBe('test-component');
    });

    it('should log info messages', () => {
      logger.info('Info message', {}, 'test-component');
      
      const logs = logger.getRecentLogs('info');
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('info');
      expect(logs[0].message).toBe('Info message');
    });

    it('should log warning messages', () => {
      logger.warn('Warning message', { warning: 'true' }, 'test-component');
      
      const logs = logger.getRecentLogs('warn');
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('warn');
      expect(logs[0].message).toBe('Warning message');
      expect(logs[0].context).toEqual({ warning: 'true' });
    });

    it('should log error messages', () => {
      const error = new VocabularyError('Test error', ErrorCategory.VALIDATION, ErrorSeverity.MEDIUM);
      logger.error('Error message', error, { context: 'data' }, 'test-component');
      
      const logs = logger.getRecentLogs('error');
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('error');
      expect(logs[0].message).toBe('Error message');
      expect(logs[0].error).toBe(error);
      expect(logs[0].context).toEqual({ context: 'data' });
    });

    it('should log critical messages', () => {
      const error = new VocabularyError('Critical error', ErrorCategory.SYSTEM, ErrorSeverity.CRITICAL);
      logger.critical('Critical message', error, {}, 'test-component');
      
      const logs = logger.getRecentLogs('critical');
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('critical');
      expect(logs[0].message).toBe('Critical message');
      expect(logs[0].error).toBe(error);
    });
  });

  describe('Vocabulary Error Logging', () => {
    it('should log vocabulary errors with enhanced context', () => {
      const error = new VocabularyError(
        'Network failure',
        ErrorCategory.NETWORK,
        ErrorSeverity.HIGH,
        'NETWORK_ERROR',
        { url: 'test.com' }
      );
      
      logger.logVocabularyError(error, 'loadVocabulary', { level: 'A1' });
      
      const logs = logger.getRecentLogs('error');
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Vocabulary error in loadVocabulary: Network failure');
      expect(logs[0].error).toBe(error);
      expect(logs[0].context).toEqual({
        operation: 'loadVocabulary',
        errorCode: 'NETWORK_ERROR',
        errorCategory: 'network',
        errorSeverity: 'high',
        retryable: true,
        recoveryStrategy: 'retry',
        userMessage: 'Network connection failed. Please check your internet connection and try again.',
        level: 'A1'
      });
    });
  });

  describe('Specialized Logging Methods', () => {
    it('should log network operations', () => {
      logger.logNetworkOperation('fetchChunk', '/data/vocab/test.json', 'GET', {
        timeout: 10000,
        retryAttempts: 3
      });
      
      const logs = logger.getRecentLogs('info');
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Network operation: fetchChunk GET /data/vocab/test.json');
      expect(logs[0].context).toEqual({
        operation: 'fetchChunk',
        url: '/data/vocab/test.json',
        method: 'GET',
        timeout: 10000,
        retryAttempts: 3
      });
      expect(logs[0].component).toBe('network-manager');
    });

    it('should log loading state changes', () => {
      logger.logLoadingState('loadVocabulary', 'loading', 25, {
        chunkName: 'A1.json'
      });
      
      const logs = logger.getRecentLogs('info');
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Loading loadVocabulary: loading (25%)');
      expect(logs[0].context).toEqual({
        operation: 'loadVocabulary',
        state: 'loading',
        progress: 25,
        chunkName: 'A1.json'
      });
      expect(logs[0].component).toBe('loading-manager');
    });

    it('should log loading state without progress', () => {
      logger.logLoadingState('loadVocabulary', 'completed');
      
      const logs = logger.getRecentLogs('info');
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Loading loadVocabulary: completed');
      expect(logs[0].context).toEqual({
        operation: 'loadVocabulary',
        state: 'completed'
      });
    });

    it('should log performance metrics', () => {
      logger.logPerformance('loadChunk', 1500, {
        responseSize: 1024,
        status: 200
      }, { chunkName: 'test.json' });
      
      const logs = logger.getRecentLogs('info');
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Performance: loadChunk completed in 1500ms');
      expect(logs[0].context).toEqual({
        operation: 'loadChunk',
        duration: 1500,
        metrics: {
          responseSize: 1024,
          status: 200
        },
        chunkName: 'test.json'
      });
      expect(logs[0].component).toBe('performance-monitor');
    });

    it('should log user actions', () => {
      logger.logUserAction('click-flashcard', {
        cardId: 'card-123',
        direction: 'bg-to-de'
      }, 'flashcard-component');
      
      const logs = logger.getRecentLogs('debug');
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('User action: click-flashcard');
      expect(logs[0].context).toEqual({
        action: 'click-flashcard',
        cardId: 'card-123',
        direction: 'bg-to-de'
      });
      expect(logs[0].component).toBe('flashcard-component');
    });
  });

  describe('Log Management', () => {
    it('should maintain maximum log entries', () => {
      const smallLogger = new ErrorLogger({
        maxLogEntries: 5,
        enableConsoleLogging: false,
        enablePersistentStorage: false
      });
      
      // Add more logs than the maximum
      for (let i = 0; i < 10; i++) {
        smallLogger.info(`Log entry ${i}`);
      }
      
      const logs = smallLogger.getRecentLogs();
      expect(logs).toHaveLength(5);
      expect(logs[0].message).toBe('Log entry 5'); // Should start from entry 5
      expect(logs[4].message).toBe('Log entry 9');
    });

    it('should clear all logs', () => {
      logger.info('Test message 1');
      logger.info('Test message 2');
      logger.error('Error message');
      
      expect(logger.getRecentLogs()).toHaveLength(3);
      
      logger.clearLogs();
      
      expect(logger.getRecentLogs()).toHaveLength(0);
    });

    it('should get logs by component', () => {
      logger.info('Message 1', {}, 'component-a');
      logger.info('Message 2', {}, 'component-b');
      logger.error('Error 1', undefined, {}, 'component-a');
      
      const componentALogs = logger.getLogsByComponent('component-a');
      const componentBLogs = logger.getLogsByComponent('component-b');
      
      expect(componentALogs).toHaveLength(2);
      expect(componentBLogs).toHaveLength(1);
      expect(componentALogs[0].component).toBe('component-a');
      expect(componentBLogs[0].component).toBe('component-b');
    });

    it('should get logs by level', () => {
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');
      
      const errorLogs = logger.getRecentLogs('error');
      const infoLogs = logger.getRecentLogs('info');
      
      expect(errorLogs).toHaveLength(1);
      expect(infoLogs).toHaveLength(1);
      expect(errorLogs[0].level).toBe('error');
      expect(infoLogs[0].level).toBe('info');
    });

    it('should limit recent logs', () => {
      for (let i = 0; i < 10; i++) {
        logger.info(`Message ${i}`);
      }
      
      const recentLogs = logger.getRecentLogs(undefined, 5);
      expect(recentLogs).toHaveLength(5);
      expect(recentLogs[0].message).toBe('Message 5');
      expect(recentLogs[4].message).toBe('Message 9');
    });
  });

  describe('Error Statistics', () => {
    it('should calculate error statistics', () => {
      const networkError = new VocabularyError('Network error', ErrorCategory.NETWORK, ErrorSeverity.HIGH);
      const validationError = new VocabularyError('Validation error', ErrorCategory.VALIDATION, ErrorSeverity.MEDIUM);
      const systemError = new VocabularyError('System error', ErrorCategory.SYSTEM, ErrorSeverity.CRITICAL);
      
      logger.error('Network failure', networkError, {}, 'network-component');
      logger.error('Validation failed', validationError, {}, 'validation-component');
      logger.error('System crash', systemError, {}, 'system-component');
      logger.info('Info message');
      logger.debug('Debug message');
      
      const stats = logger.getErrorStatistics();
      
      expect(stats.totalErrors).toBe(3);
      expect(stats.errorsByCategory).toEqual({
        network: 1,
        validation: 1,
        system: 1
      });
      expect(stats.errorsByComponent).toEqual({
        'network-component': 1,
        'validation-component': 1,
        'system-component': 1
      });
      expect(stats.recentErrors).toHaveLength(3);
      expect(stats.errorRate).toBeGreaterThan(0);
    });

    it('should handle no errors gracefully', () => {
      logger.info('Info message only');
      
      const stats = logger.getErrorStatistics();
      
      expect(stats.totalErrors).toBe(0);
      expect(stats.errorsByCategory).toEqual({});
      expect(stats.errorsByComponent).toEqual({});
      expect(stats.recentErrors).toHaveLength(0);
      expect(stats.errorRate).toBe(0);
    });
  });

  describe('Session Management', () => {
    it('should generate unique session IDs', () => {
      const logger1 = new ErrorLogger({ enableConsoleLogging: false, enablePersistentStorage: false });
      const logger2 = new ErrorLogger({ enableConsoleLogging: false, enablePersistentStorage: false });
      
      const session1 = logger1.getSessionInfo();
      const session2 = logger2.getSessionInfo();
      
      expect(session1.sessionId).not.toBe(session2.sessionId);
      expect(session1.startTime).toBeInstanceOf(Date);
      expect(session2.startTime).toBeInstanceOf(Date);
    });

    it('should track session duration', () => {
      const sessionStart = logger.getSessionInfo();
      
      // Wait a bit (in real tests, you'd use timers)
      setTimeout(() => {
        const sessionEnd = logger.getSessionInfo();
        expect(sessionEnd.duration).toBeGreaterThan(sessionStart.duration);
      }, 10);
    });

    it('should refresh session', () => {
      const originalSession = logger.getSessionInfo();
      const originalSessionId = originalSession.sessionId;
      
      logger.refreshSession();
      
      const newSession = logger.getSessionInfo();
      expect(newSession.sessionId).not.toBe(originalSessionId);
      expect(newSession.startTime).not.toBe(originalSession.startTime);
    });

    it('should check session expiration', () => {
      const shortSessionLogger = new ErrorLogger({
        sessionTimeout: 1, // 1ms timeout
        enableConsoleLogging: false,
        enablePersistentStorage: false
      });
      
      expect(shortSessionLogger.isSessionExpired()).toBe(false);
      
      // Wait for session to expire
      setTimeout(() => {
        expect(shortSessionLogger.isSessionExpired()).toBe(true);
      }, 5);
    });
  });

  describe('Log Export', () => {
    it('should export logs to JSON', () => {
      logger.info('Info message', {}, 'test-component');
      logger.error('Error message', undefined, {}, 'test-component');
      
      const exported = logger.exportLogs();
      const parsed = JSON.parse(exported);
      
      expect(parsed.sessionId).toBeDefined();
      expect(parsed.sessionStartTime).toBeDefined();
      expect(parsed.exportTime).toBeDefined();
      expect(parsed.totalEntries).toBe(2);
      expect(parsed.logs).toHaveLength(2);
      expect(parsed.logs[0].message).toBe('Info message');
      expect(parsed.logs[1].message).toBe('Error message');
    });

    it('should export logs filtered by level', () => {
      logger.info('Info message');
      logger.error('Error message');
      logger.debug('Debug message');
      
      const errorExported = logger.exportLogs('error');
      const parsed = JSON.parse(errorExported);
      
      expect(parsed.totalEntries).toBe(1);
      expect(parsed.logs[0].level).toBe('error');
    });
  });

  describe('Persistent Storage', () => {
    it('should persist error logs to localStorage', () => {
      const error = new VocabularyError('Test error', ErrorCategory.SYSTEM, ErrorSeverity.MEDIUM);
      logger.error('Critical error', error, {}, 'test-component');
      
      // Check localStorage
      const stored = localStorageMock.getItem('test-error-logs');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].level).toBe('error');
      expect(parsed[0].message).toBe('Critical error');
    });

    it('should not persist non-error logs by default', () => {
      logger.info('Info message');
      logger.debug('Debug message');
      
      const stored = localStorageMock.getItem('test-error-logs');
      expect(stored).toBeNull();
    });

    it('should load persisted logs on initialization', () => {
      // Pre-populate localStorage
      const existingLogs = [
        {
          id: 'existing-log-1',
          level: 'error',
          message: 'Existing error',
          timestamp: new Date().toISOString(),
          component: 'test-component',
          sessionId: 'existing-session'
        }
      ];
      localStorageMock.setItem('test-error-logs', JSON.stringify(existingLogs));
      
      const newLogger = new ErrorLogger({
        enableConsoleLogging: false,
        enablePersistentStorage: true,
        storageKey: 'test-error-logs'
      });
      
      const logs = newLogger.getRecentLogs('error');
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Existing error');
    });
  });

  describe('Singleton Instance', () => {
    it('should provide a singleton instance', () => {
      expect(errorLogger).toBeInstanceOf(ErrorLogger);
      expect(errorLogger).toBe(errorLogger); // Same instance
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined context gracefully', () => {
      expect(() => {
        logger.info('Test message', undefined as any, 'test-component');
      }).not.toThrow();
      
      const logs = logger.getRecentLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].context).toEqual({});
    });

    it('should handle null error gracefully', () => {
      expect(() => {
        logger.error('Error with null error', null as any, {}, 'test-component');
      }).not.toThrow();
      
      const logs = logger.getRecentLogs('error');
      expect(logs).toHaveLength(1);
      expect(logs[0].error).toBeUndefined();
    });

    it('should handle circular objects in context', () => {
      const circular: any = { name: 'test' };
      circular.self = circular;
      
      expect(() => {
        logger.info('Circular context test', circular, 'test-component');
      }).not.toThrow();
    });
  });
});