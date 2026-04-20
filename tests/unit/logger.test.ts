/**
 * LoggerService Unit Tests
 *
 * Tests for the centralized logging service including:
 * - Log level filtering (console and buffer)
 * - Ring buffer behavior
 * - Structured log entry format
 * - Subscribe/notify mechanism
 * - Stats computation
 * - Export functionality
 * - EventBus integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// We need to mock import.meta.env since it's a SvelteKit compile-time variable
vi.mock('import.meta.env', () => ({
  DEV: true,
}));

// Import after the mock
import { logger, type LogEntry, type LogLevel } from '$lib/services/logger';
import { eventBus } from '$lib/services/event-bus';

describe('LoggerService', () => {
  beforeEach(() => {
    logger.clear();
    logger.setConsoleLevel('debug');
    logger.setBufferLevel('debug');
  });

  describe('basic logging', () => {
    it('should log debug messages', () => {
      logger.debug('TestContext', 'Debug message');
      const entries = logger.getEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].level).toBe('debug');
      expect(entries[0].context).toBe('TestContext');
      expect(entries[0].message).toBe('Debug message');
    });

    it('should log info messages', () => {
      logger.info('InfoContext', 'Info message');
      const entries = logger.getEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].level).toBe('info');
    });

    it('should log warn messages', () => {
      logger.warn('WarnContext', 'Warning message');
      const entries = logger.getEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].level).toBe('warn');
    });

    it('should log error messages with Error objects', () => {
      const error = new Error('Something broke');
      logger.error('ErrorContext', 'Error occurred', error);
      const entries = logger.getEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].level).toBe('error');
      expect(entries[0].error).toBeDefined();
      expect(entries[0].error?.name).toBe('Error');
      expect(entries[0].error?.message).toBe('Something broke');
    });

    it('should log error messages without Error objects', () => {
      logger.error('ErrorContext', 'Error without stack');
      const entries = logger.getEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].error).toBeUndefined();
    });

    it('should include optional data in log entries', () => {
      const data = { userId: 123, action: 'click' };
      logger.info('DataContext', 'Message with data', data);
      const entries = logger.getEntries();
      expect(entries[0].data).toEqual(data);
    });
  });

  describe('log entry format', () => {
    it('should generate unique IDs for each entry', () => {
      logger.debug('Ctx', 'Msg1');
      logger.debug('Ctx', 'Msg2');
      const entries = logger.getEntries();
      expect(entries[0].id).not.toBe(entries[1].id);
    });

    it('should include ISO timestamp', () => {
      logger.info('Ctx', 'Msg');
      const entries = logger.getEntries();
      expect(entries[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should include error stack traces', () => {
      const error = new Error('Stack test');
      error.stack = 'Error: Stack test\n    at test.ts:1:1';
      logger.error('Ctx', 'With stack', error);
      const entries = logger.getEntries();
      expect(entries[0].error?.stack).toBe('Error: Stack test\n    at test.ts:1:1');
    });
  });

  describe('buffer behavior', () => {
    it('should evict oldest entries when buffer exceeds max size', () => {
      // Buffer max is 500 entries
      for (let i = 0; i < 510; i++) {
        logger.debug('BufferTest', `Message ${i}`);
      }
      const entries = logger.getEntries();
      expect(entries.length).toBeLessThanOrEqual(500);
      // The oldest entries should have been evicted
      expect(entries[0].message).not.toBe('Message 0');
      expect(entries[0].message).not.toBe('Message 9');
    });

    it('should clear all entries', () => {
      logger.info('Ctx', 'Msg1');
      logger.info('Ctx', 'Msg2');
      expect(logger.getEntries()).toHaveLength(2);

      logger.clear();
      expect(logger.getEntries()).toHaveLength(0);
    });
  });

  describe('level filtering', () => {
    it('should filter buffer entries by level', () => {
      logger.setBufferLevel('warn');
      logger.debug('Ctx', 'Debug msg'); // Should NOT be buffered
      logger.info('Ctx', 'Info msg'); // Should NOT be buffered
      logger.warn('Ctx', 'Warning msg'); // Should be buffered
      logger.error('Ctx', 'Error msg'); // Should be buffered

      // Reset to see what's in buffer
      logger.setBufferLevel('debug');
      const entries = logger.getEntries();
      expect(entries.filter(e => e.level === 'debug')).toHaveLength(0);
      expect(entries.filter(e => e.level === 'info')).toHaveLength(0);
      expect(entries.filter(e => e.level === 'warn')).toHaveLength(1);
      expect(entries.filter(e => e.level === 'error')).toHaveLength(1);

      // Clean up
      logger.clear();
    });

    it('should always capture errors regardless of buffer level', () => {
      logger.setBufferLevel('error');
      logger.error('Ctx', 'Error msg');
      const entries = logger.getEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].level).toBe('error');
      logger.clear();
    });

    it('should get entries by level', () => {
      logger.debug('Ctx', 'Debug');
      logger.info('Ctx', 'Info');
      logger.warn('Ctx', 'Warn');
      logger.error('Ctx', 'Error');

      expect(logger.getEntriesByLevel('error')).toHaveLength(1);
      expect(logger.getEntriesByLevel('warn')).toHaveLength(1);
      expect(logger.getEntriesByLevel('info')).toHaveLength(1);
      expect(logger.getEntriesByLevel('debug')).toHaveLength(1);
    });

    it('should get entries by context', () => {
      logger.info('AuthService', 'User logged in');
      logger.info('DataService', 'Data loaded');
      logger.info('AuthService', 'Token refreshed');

      const authEntries = logger.getEntriesByContext('Auth');
      expect(authEntries).toHaveLength(2);
      expect(authEntries.every(e => e.context === 'AuthService')).toBe(true);
    });
  });

  describe('statistics', () => {
    it('should compute accurate stats', () => {
      logger.debug('Ctx', 'Debug');
      logger.info('Ctx', 'Info');
      logger.info('Ctx', 'Info2');
      logger.warn('Ctx', 'Warn');
      logger.warn('Ctx', 'Warn2');
      logger.warn('Ctx', 'Warn3');
      logger.error('Ctx', 'Error');

      const stats = logger.getStats();
      expect(stats.debug).toBe(1);
      expect(stats.info).toBe(2);
      expect(stats.warn).toBe(3);
      expect(stats.error).toBe(1);
      expect(stats.total).toBe(7);
    });
  });

  describe('subscription', () => {
    /** Flush the microtask queue so batched subscriber notifications fire */
    async function flushNotifications(): Promise<void> {
      // queueMicrotask batches notifications — wait for them to fire
      await new Promise<void>((resolve) => queueMicrotask(resolve));
    }

    it('should notify subscribers on new log entries', async () => {
      const callback = vi.fn();
      const unsub = logger.subscribe(callback);

      logger.info('Ctx', 'Msg1');
      logger.info('Ctx', 'Msg2');
      // Microtask batching coalesces both into a single notification
      await flushNotifications();
      expect(callback).toHaveBeenCalled();

      unsub();
    });

    it('should stop notifying after unsubscribe', async () => {
      const callback = vi.fn();
      const unsub = logger.subscribe(callback);

      logger.info('Ctx', 'Before unsub');
      await flushNotifications();
      expect(callback).toHaveBeenCalled();

      unsub();

      const callCountBefore = callback.mock.calls.length;
      logger.info('Ctx', 'After unsub');
      await flushNotifications();
      expect(callback.mock.calls.length).toBe(callCountBefore); // Not called again
    });

    it('should not break when subscriber throws', async () => {
      const badCallback = () => { throw new Error('Subscriber error'); };
      const goodCallback = vi.fn();

      logger.subscribe(badCallback);
      logger.subscribe(goodCallback);

      // Should not throw, good callback should still be called after flush
      expect(() => logger.info('Ctx', 'Msg')).not.toThrow();
      await flushNotifications();
      expect(goodCallback).toHaveBeenCalled();
    });
  });

  describe('export', () => {
    it('should export logs as JSON', () => {
      logger.info('Ctx', 'Test message');

      const json = logger.exportAsJson();
      const parsed = JSON.parse(json);

      expect(parsed).toHaveProperty('exportedAt');
      expect(parsed).toHaveProperty('stats');
      expect(parsed).toHaveProperty('entries');
      expect(parsed.entries).toHaveLength(1);
      expect(parsed.entries[0].message).toBe('Test message');
    });
  });

  describe('initialization', () => {
    it('should initialize without error', () => {
      expect(() => logger.init()).not.toThrow();
    });

    it('should be idempotent', () => {
      logger.init();
      logger.init();
      // Should not produce duplicate init messages or throw
    });
  });
});

describe('EventBus', () => {
  beforeEach(() => {
    eventBus.clear();
  });

  describe('on/emit', () => {
    it('should subscribe to and emit events', async () => {
      const handler = vi.fn();
      eventBus.on('test-event', handler);

      await eventBus.emit('test-event', { foo: 'bar' });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ foo: 'bar' });
    });

    it('should support multiple subscribers', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.on('multi-event', handler1);
      eventBus.on('multi-event', handler2);

      await eventBus.emit('multi-event', 'payload');

      expect(handler1).toHaveBeenCalledWith('payload');
      expect(handler2).toHaveBeenCalledWith('payload');
    });

    it('should handle events with no subscribers', async () => {
      await expect(eventBus.emit('no-listeners', null)).resolves.not.toThrow();
    });
  });

  describe('once', () => {
    it('should fire handler only once', async () => {
      const handler = vi.fn();
      eventBus.once('once-event', handler);

      await eventBus.emit('once-event', 'first');
      await eventBus.emit('once-event', 'second');

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith('first');
    });
  });

  describe('off', () => {
    it('should remove all listeners for an event', () => {
      const handler = vi.fn();
      eventBus.on('remove-event', handler);
      eventBus.off('remove-event');

      eventBus.emit('remove-event', null);

      // Should not call since all listeners removed
      // Note: emit is async, but handler would have been called synchronously if still subscribed
      expect(handler).not.toHaveBeenCalled();
    });

    it('should remove a specific handler when provided', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      eventBus.on('specific-remove', handler1);
      eventBus.on('specific-remove', handler2);

      eventBus.off('specific-remove', handler1);

      await eventBus.emit('specific-remove', 'payload');

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledWith('payload');
    });
  });

  describe('unsubscribe', () => {
    it('should support unsubscribing via returned function', async () => {
      const handler = vi.fn();
      const unsub = eventBus.on('unsub-event', handler);

      await eventBus.emit('unsub-event', 'before');
      expect(handler).toHaveBeenCalledTimes(1);

      unsub();

      await eventBus.emit('unsub-event', 'after');
      expect(handler).toHaveBeenCalledTimes(1); // Still 1, unsubscribed
    });
  });

  describe('listenerCount', () => {
    it('should return the number of listeners', () => {
      expect(eventBus.listenerCount('count-event')).toBe(0);

      const unsub1 = eventBus.on('count-event', vi.fn());
      eventBus.on('count-event', vi.fn());

      expect(eventBus.listenerCount('count-event')).toBe(2);

      unsub1();
      expect(eventBus.listenerCount('count-event')).toBe(1);
    });
  });

  describe('error handling', () => {
    it('should not break when a subscriber throws', async () => {
      const badHandler = () => { throw new Error('Handler error'); };
      const goodHandler = vi.fn();

      eventBus.on('error-event', badHandler);
      eventBus.on('error-event', goodHandler);

      await expect(eventBus.emit('error-event', null)).resolves.not.toThrow();
      expect(goodHandler).toHaveBeenCalled();
    });
  });
});