/**
 * Loading State Manager Unit Tests
 * Tests the loading state tracking and progress reporting system
 * @since 1.0.0
 */

import { LoadingStateManager, LoadingState, LoadingEvent } from '../../assets/js/modules/loading-state-manager.js';

describe('LoadingStateManager', () => {
  let manager: LoadingStateManager;

  beforeEach(() => {
    manager = new LoadingStateManager();
  });

  afterEach(() => {
    // Clean up any active loading states
    const activeStates = manager.getActiveLoadingStates();
    for (const state of activeStates) {
      manager.completeLoading(state.operationId);
    }
  });

  describe('Basic Loading State Management', () => {
    it('should start loading with basic parameters', () => {
      const operationId = manager.startLoading(1, 'Test operation');
      
      expect(operationId).toBeDefined();
      expect(typeof operationId).toBe('string');
      
      const state = manager.getLoadingState(operationId);
      expect(state).toBeDefined();
      expect(state!.operationId).toBe(operationId);
      expect(state!.totalItems).toBe(1);
      expect(state!.description).toBe('Test operation');
      expect(state!.status).toBe('loading');
      expect(state!.progress).toBe(0);
      expect(state!.startTime).toBeInstanceOf(Date);
    });

    it('should start loading with detailed options', () => {
      const options = {
        totalItems: 10,
        description: 'Complex operation',
        metadata: { type: 'vocabulary-load', level: 'A1' }
      };
      
      const operationId = manager.startLoading(options.totalItems, options.description, options.metadata);
      
      const state = manager.getLoadingState(operationId);
      expect(state!.totalItems).toBe(10);
      expect(state!.description).toBe('Complex operation');
      expect(state!.metadata).toEqual({ type: 'vocabulary-load', level: 'A1' });
    });

    it('should update loading progress', () => {
      const operationId = manager.startLoading(10, 'Test operation');
      
      manager.updateProgress(operationId, {
        loadedItems: 5,
        progress: 50,
        currentStage: 'Processing items'
      });
      
      const state = manager.getLoadingState(operationId);
      expect(state!.loadedItems).toBe(5);
      expect(state!.progress).toBe(50);
      expect(state!.stage).toBe('Processing items');
    });

    it('should complete loading successfully', () => {
      const operationId = manager.startLoading(5, 'Test operation');
      
      manager.completeLoading(operationId, {
        result: 'success',
        totalProcessed: 5
      });
      
      const state = manager.getLoadingState(operationId);
      expect(state!.status).toBe('completed');
      expect(state!.progress).toBe(100);
      expect(state!.endTime).toBeInstanceOf(Date);
      expect(state!.duration).toBeGreaterThan(0);
      expect(state!.result).toEqual({ result: 'success', totalProcessed: 5 });
    });

    it('should fail loading with error', () => {
      const operationId = manager.startLoading(5, 'Test operation');
      const error = new Error('Test error');
      
      manager.failLoading(operationId, {
        error,
        failedAt: 3
      });
      
      const state = manager.getLoadingState(operationId);
      expect(state!.status).toBe('failed');
      expect(state!.error).toBe(error);
      expect(state!.endTime).toBeInstanceOf(Date);
      expect(state!.duration).toBeGreaterThan(0);
    });

    it('should cancel loading', () => {
      const operationId = manager.startLoading(5, 'Test operation');
      
      manager.cancelLoading(operationId, {
        reason: 'User cancelled'
      });
      
      const state = manager.getLoadingState(operationId);
      expect(state!.status).toBe('cancelled');
      expect(state!.endTime).toBeInstanceOf(Date);
      expect(state!.reason).toBe('User cancelled');
    });
  });

  describe('Chunk-based Loading', () => {
    it('should manage chunk loading', () => {
      const operationId = manager.startLoading(3, 'Loading chunks');
      
      manager.startChunk(operationId, 'chunk1.json');
      manager.updateChunkProgress(operationId, 'chunk1.json', 50);
      manager.completeChunk(operationId, 'chunk1.json');
      
      const state = manager.getLoadingState(operationId);
      expect(state!.chunks).toEqual({
        'chunk1.json': {
          status: 'completed',
          progress: 100,
          startTime: expect.any(Date),
          endTime: expect.any(Date)
        }
      });
    });

    it('should handle chunk failures', () => {
      const operationId = manager.startLoading(2, 'Loading chunks');
      const error = new Error('Chunk failed');
      
      manager.startChunk(operationId, 'chunk1.json');
      manager.failChunk(operationId, 'chunk1.json', error);
      
      const state = manager.getLoadingState(operationId);
      expect(state!.chunks!['chunk1.json'].status).toBe('failed');
      expect(state!.chunks!['chunk1.json'].error).toBe(error);
    });

    it('should calculate overall progress from chunks', () => {
      const operationId = manager.startLoading(4, 'Loading chunks');
      
      manager.startChunk(operationId, 'chunk1.json');
      manager.updateChunkProgress(operationId, 'chunk1.json', 50);
      
      manager.startChunk(operationId, 'chunk2.json');
      manager.updateChunkProgress(operationId, 'chunk2.json', 100);
      
      const state = manager.getLoadingState(operationId);
      // Overall progress should be average of chunk progress
      expect(state!.progress).toBe(75); // (50 + 100) / 2
    });
  });

  describe('Event System', () => {
    it('should emit loading started event', (done) => {
      const listener = (event: LoadingEvent) => {
        expect(event.type).toBe('loading-started');
        expect(event.operationId).toBeDefined();
        expect(event.state).toBeDefined();
        expect(event.state!.status).toBe('loading');
        done();
      };
      
      manager.subscribe(listener);
      manager.startLoading(1, 'Test operation');
    });

    it('should emit progress updated event', (done) => {
      const listener = jest.fn();
      manager.subscribe(listener);
      
      const operationId = manager.startLoading(10, 'Test operation');
      
      manager.updateProgress(operationId, { progress: 50 });
      
      expect(listener).toHaveBeenCalledTimes(2); // start + progress
      expect(listener).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: 'progress-updated',
          operationId,
          state: expect.objectContaining({
            progress: 50
          })
        })
      );
    });

    it('should emit loading completed event', (done) => {
      const listener = (event: LoadingEvent) => {
        if (event.type === 'loading-completed') {
          expect(event.operationId).toBeDefined();
          expect(event.state!.status).toBe('completed');
          expect(event.state!.progress).toBe(100);
          done();
        }
      };
      
      manager.subscribe(listener);
      const operationId = manager.startLoading(1, 'Test operation');
      manager.completeLoading(operationId);
    });

    it('should emit loading failed event', (done) => {
      const listener = (event: LoadingEvent) => {
        if (event.type === 'loading-failed') {
          expect(event.operationId).toBeDefined();
          expect(event.state!.status).toBe('failed');
          expect(event.error).toBeDefined();
          done();
        }
      };
      
      manager.subscribe(listener);
      const operationId = manager.startLoading(1, 'Test operation');
      manager.failLoading(operationId, { error: new Error('Test error') });
    });

    it('should unsubscribe from events', () => {
      const listener = jest.fn();
      manager.subscribe(listener);
      
      const operationId = manager.startLoading(1, 'Test operation');
      manager.updateProgress(operationId, { progress: 50 });
      
      expect(listener).toHaveBeenCalledTimes(2);
      
      manager.unsubscribe(listener);
      manager.updateProgress(operationId, { progress: 75 });
      
      expect(listener).toHaveBeenCalledTimes(2); // Should not be called again
    });
  });

  describe('Active Loading States', () => {
    it('should track active loading states', () => {
      const operationId1 = manager.startLoading(5, 'Operation 1');
      const operationId2 = manager.startLoading(3, 'Operation 2');
      
      const activeStates = manager.getActiveLoadingStates();
      expect(activeStates).toHaveLength(2);
      expect(activeStates.map(s => s.operationId)).toContain(operationId1);
      expect(activeStates.map(s => s.operationId)).toContain(operationId2);
    });

    it('should remove completed states from active list', () => {
      const operationId = manager.startLoading(5, 'Test operation');
      
      expect(manager.getActiveLoadingStates()).toHaveLength(1);
      
      manager.completeLoading(operationId);
      
      expect(manager.getActiveLoadingStates()).toHaveLength(0);
    });

    it('should remove failed states from active list', () => {
      const operationId = manager.startLoading(5, 'Test operation');
      
      expect(manager.getActiveLoadingStates()).toHaveLength(1);
      
      manager.failLoading(operationId, { error: new Error('Test error') });
      
      expect(manager.getActiveLoadingStates()).toHaveLength(0);
    });
  });

  describe('Statistics and Monitoring', () => {
    it('should provide loading statistics', () => {
      const operationId1 = manager.startLoading(10, 'Operation 1');
      const operationId2 = manager.startLoading(5, 'Operation 2');
      
      manager.updateProgress(operationId1, { progress: 50 });
      manager.completeLoading(operationId2);
      
      const stats = manager.getStatistics();
      
      expect(stats.totalOperations).toBe(2);
      expect(stats.activeOperations).toBe(1);
      expect(stats.completedOperations).toBe(1);
      expect(stats.failedOperations).toBe(0);
      expect(stats.averageDuration).toBeGreaterThanOrEqual(0);
    });

    it('should calculate average duration correctly', () => {
      const operationId1 = manager.startLoading(5, 'Operation 1');
      const operationId2 = manager.startLoading(3, 'Operation 2');
      
      // Complete operations
      manager.completeLoading(operationId1);
      manager.completeLoading(operationId2);
      
      const stats = manager.getStatistics();
      
      expect(stats.completedOperations).toBe(2);
      expect(stats.averageDuration).toBeGreaterThan(0);
    });

    it('should track failed operations', () => {
      const operationId = manager.startLoading(5, 'Test operation');
      
      manager.failLoading(operationId, { error: new Error('Test error') });
      
      const stats = manager.getStatistics();
      
      expect(stats.failedOperations).toBe(1);
      expect(stats.activeOperations).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid operation IDs gracefully', () => {
      expect(() => {
        manager.updateProgress('invalid-id', { progress: 50 });
      }).not.toThrow();
      
      expect(() => {
        manager.completeLoading('invalid-id');
      }).not.toThrow();
      
      expect(() => {
        manager.failLoading('invalid-id', { error: new Error('Test') });
      }).not.toThrow();
    });

    it('should handle progress out of bounds', () => {
      const operationId = manager.startLoading(10, 'Test operation');
      
      manager.updateProgress(operationId, { progress: -10 });
      let state = manager.getLoadingState(operationId);
      expect(state!.progress).toBe(0);
      
      manager.updateProgress(operationId, { progress: 150 });
      state = manager.getLoadingState(operationId);
      expect(state!.progress).toBe(100);
    });

    it('should handle loaded items exceeding total', () => {
      const operationId = manager.startLoading(5, 'Test operation');
      
      manager.updateProgress(operationId, { loadedItems: 10 });
      const state = manager.getLoadingState(operationId);
      expect(state!.loadedItems).toBe(10); // Allow exceeding total for flexibility
    });
  });

  describe('Stage Management', () => {
    it('should update loading stage', () => {
      const operationId = manager.startLoading(10, 'Test operation');
      
      manager.updateStage(operationId, 'Processing data');
      
      const state = manager.getLoadingState(operationId);
      expect(state!.stage).toBe('Processing data');
    });

    it('should include stage in progress updates', () => {
      const operationId = manager.startLoading(10, 'Test operation');
      
      manager.updateProgress(operationId, {
        progress: 25,
        currentStage: 'Initial setup'
      });
      
      const state = manager.getLoadingState(operationId);
      expect(state!.stage).toBe('Initial setup');
      expect(state!.progress).toBe(25);
    });
  });

  describe('Time Estimation', () => {
    it('should estimate time remaining', (done) => {
      const operationId = manager.startLoading(10, 'Test operation');
      
      // Simulate some progress after a delay
      setTimeout(() => {
        manager.updateProgress(operationId, { progress: 50 });
        
        const state = manager.getLoadingState(operationId);
        expect(state!.estimatedTimeRemaining).toBeGreaterThan(0);
        done();
      }, 10);
    });

    it('should update time remaining as progress changes', (done) => {
      const operationId = manager.startLoading(10, 'Test operation');
      
      setTimeout(() => {
        manager.updateProgress(operationId, { progress: 25 });
        const state1 = manager.getLoadingState(operationId);
        const time1 = state1!.estimatedTimeRemaining;
        
        setTimeout(() => {
          manager.updateProgress(operationId, { progress: 75 });
          const state2 = manager.getLoadingState(operationId);
          const time2 = state2!.estimatedTimeRemaining;
          
          expect(time2).toBeLessThan(time1);
          done();
        }, 10);
      }, 10);
    });
  });

  describe('Cleanup and Memory Management', () => {
    it('should clean up old completed states', () => {
      const operationId = manager.startLoading(1, 'Test operation');
      
      manager.completeLoading(operationId);
      
      // Clean up states older than 0ms (immediate cleanup for testing)
      manager.cleanup(0);
      
      expect(manager.getLoadingState(operationId)).toBeNull();
    });

    it('should preserve recent states during cleanup', () => {
      const operationId = manager.startLoading(1, 'Test operation');
      
      manager.completeLoading(operationId);
      
      // Clean up states older than 1000ms (should preserve recent state)
      manager.cleanup(1000);
      
      expect(manager.getLoadingState(operationId)).not.toBeNull();
    });

    it('should not clean up active states', () => {
      const operationId = manager.startLoading(1, 'Test operation');
      
      manager.cleanup(0);
      
      expect(manager.getLoadingState(operationId)).not.toBeNull();
      expect(manager.getActiveLoadingStates()).toHaveLength(1);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple concurrent loading operations', () => {
      const operationId1 = manager.startLoading(5, 'Operation 1');
      const operationId2 = manager.startLoading(10, 'Operation 2');
      const operationId3 = manager.startLoading(3, 'Operation 3');
      
      manager.updateProgress(operationId1, { progress: 20 });
      manager.updateProgress(operationId2, { progress: 50 });
      manager.updateProgress(operationId3, { progress: 80 });
      
      const state1 = manager.getLoadingState(operationId1);
      const state2 = manager.getLoadingState(operationId2);
      const state3 = manager.getLoadingState(operationId3);
      
      expect(state1!.progress).toBe(20);
      expect(state2!.progress).toBe(50);
      expect(state3!.progress).toBe(80);
      
      expect(manager.getActiveLoadingStates()).toHaveLength(3);
    });

    it('should complete operations independently', () => {
      const operationId1 = manager.startLoading(5, 'Operation 1');
      const operationId2 = manager.startLoading(3, 'Operation 2');
      
      manager.completeLoading(operationId1);
      
      expect(manager.getLoadingState(operationId1)!.status).toBe('completed');
      expect(manager.getLoadingState(operationId2)!.status).toBe('loading');
      expect(manager.getActiveLoadingStates()).toHaveLength(1);
    });
  });
});