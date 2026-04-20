/**
 * EventBus - Lightweight pub/sub event system
 *
 * Enables decoupled communication between services.
 * Used by ErrorHandler to emit error events, and by
 * other services for cross-cutting concerns.
 */

type EventHandler = (data: unknown) => void | Promise<void>;

interface EventSubscription {
  handler: EventHandler;
  once: boolean;
}

class EventBusService {
  private listeners = new Map<string, Set<EventSubscription>>();

  /**
   * Subscribe to an event
   */
  on(event: string, handler: EventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const subscription: EventSubscription = { handler, once: false };
    this.listeners.get(event)!.add(subscription);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(subscription);
    };
  }

  /**
   * Subscribe to an event, but only fire once
   */
  once(event: string, handler: EventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const subscription: EventSubscription = { handler, once: true };
    this.listeners.get(event)!.add(subscription);

    return () => {
      this.listeners.get(event)?.delete(subscription);
    };
  }

  /**
   * Emit an event to all subscribers
   */
  async emit(event: string, data: unknown): Promise<void> {
    const subscriptions = this.listeners.get(event);
    if (!subscriptions || subscriptions.size === 0) return;

    // Snapshot subscriptions to avoid mutation during iteration
    const snapshot = [...subscriptions];
    const toRemove: EventSubscription[] = [];
    const promises: (void | Promise<void>)[] = [];

    for (const subscription of snapshot) {
      // Mark once subscriptions for removal before calling handler
      if (subscription.once) {
        toRemove.push(subscription);
      }

      try {
        const result = subscription.handler(data);
        if (result instanceof Promise) {
          promises.push(result);
        }
      } catch (err) {
        // Prevent subscriber errors from breaking the bus
        if (typeof console !== 'undefined') {
          console.error(`[EventBus] Error in handler for "${event}":`, err);
        }
      }
    }

    // Remove spent once-subscriptions after iteration
    for (const sub of toRemove) {
      subscriptions.delete(sub);
    }

    // Wait for async handlers and log any rejections
    if (promises.length > 0) {
      const results = await Promise.allSettled(promises);
      for (const result of results) {
        if (result.status === 'rejected') {
          if (typeof console !== 'undefined') {
            console.error(`[EventBus] Async error in handler for "${event}":`, result.reason);
          }
        }
      }
    }
  }

  /**
   * Remove all listeners for a specific event (backward compat)
   */
  off(event: string): void;

  /**
   * Remove a specific handler for an event
   */
  off(event: string, handler: EventHandler): void;

  /**
   * Implementation
   */
  off(event: string, handler?: EventHandler): void {
    if (handler === undefined) {
      // No handler specified — remove all listeners for this event (backward compat)
      this.listeners.delete(event);
      return;
    }

    const subscriptions = this.listeners.get(event);
    if (!subscriptions) return;

    // Remove all subscriptions matching this handler
    for (const sub of subscriptions) {
      if (sub.handler === handler) {
        subscriptions.delete(sub);
      }
    }
  }

  /**
   * Get all event names that have listeners
   */
  getEventNames(): string[] {
    return [...this.listeners.keys()];
  }

  /**
   * Remove all listeners for all events
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * Get the number of listeners for an event
   */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}

export { EventBusService };

/** Singleton instance */
export const eventBus = new EventBusService();
