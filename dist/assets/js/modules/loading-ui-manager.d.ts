/**
 * Loading UI Manager
 * Provides UI components and event system for loading state management
 * Integrates with loading state manager to display progress and status to users
 * @since 1.0.0
 */
import { LoadingState } from './loading-state-manager.js';
/**
 * Loading UI component types
 */
export type LoadingComponentType = 'progress-bar' | 'spinner' | 'status-text' | 'toast' | 'modal';
/**
 * Loading UI configuration options
 */
export interface LoadingUIOptions {
    /** Default component type to use */
    defaultComponent?: LoadingComponentType;
    /** Whether to show percentage progress */
    showPercentage?: boolean;
    /** Whether to show time remaining estimates */
    showTimeRemaining?: boolean;
    /** Whether to show error details */
    showErrorDetails?: boolean;
    /** Animation duration in milliseconds */
    animationDuration?: number;
    /** Whether to enable sound effects */
    enableSound?: boolean;
    /** Custom CSS classes for components */
    customClasses?: Record<string, string>;
}
/**
 * Loading UI component interface
 */
export interface LoadingUIComponent {
    /** Component ID */
    id: string;
    /** Component type */
    type: LoadingComponentType;
    /** Component element */
    element: HTMLElement;
    /** Operation ID this component is tracking */
    operationId: string;
    /** Whether component is visible */
    visible: boolean;
    /** Show the component */
    show(): void;
    /** Hide the component */
    hide(): void;
    /** Update component state */
    update(state: LoadingState): void;
    /** Destroy the component */
    destroy(): void;
}
/**
 * Loading UI event types
 */
export type LoadingUIEventType = 'component-created' | 'component-shown' | 'component-hidden' | 'component-updated' | 'component-destroyed' | 'ui-error';
/**
 * Loading UI event interface
 */
export interface LoadingUIEvent {
    /** Event type */
    type: LoadingUIEventType;
    /** Component ID */
    componentId?: string;
    /** Operation ID */
    operationId?: string;
    /** Event data */
    data?: any;
    /** Timestamp */
    timestamp: Date;
}
/**
 * Loading UI Manager Class
 * Manages UI components for loading states with event-driven updates
 */
export declare class LoadingUIManager {
    private options;
    private components;
    private loadingStateManager;
    private eventListeners;
    private soundEnabled;
    private activeOperations;
    /**
     * Create a new loading UI manager
     * @param options - Configuration options
     */
    constructor(options?: LoadingUIOptions);
    /**
     * Create a loading UI component for an operation
     * @param operationId - Operation ID to track
     * @param type - Component type
     * @param container - Container element (optional)
     * @returns Loading UI component
     */
    createComponent(operationId: string, type?: LoadingComponentType, container?: HTMLElement): LoadingUIComponent;
    /**
     * Show a loading component
     * @param componentId - Component ID
     */
    showComponent(componentId: string): void;
    /**
     * Hide a loading component
     * @param componentId - Component ID
     */
    hideComponent(componentId: string): void;
    /**
     * Destroy a loading component
     * @param componentId - Component ID
     */
    destroyComponent(componentId: string): void;
    /**
     * Get all active components for an operation
     * @param operationId - Operation ID
     * @returns Array of component IDs
     */
    getComponentsForOperation(operationId: string): string[];
    /**
     * Show a toast notification for loading status
     * @param message - Toast message
     * @param type - Toast type
     * @param duration - Duration in milliseconds
     * @returns Toast element
     */
    showToast(message: string, type?: 'info' | 'success' | 'warning' | 'error', duration?: number): HTMLElement;
    /**
     * Show a modal loading overlay
     * @param message - Loading message
     * @param options - Modal options
     * @returns Modal element
     */
    showModal(message: string, options?: {
        showProgress?: boolean;
        allowCancel?: boolean;
        onCancel?: () => void;
    }): HTMLElement;
    /**
     * Hide a modal loading overlay
     * @param modal - Modal element
     */
    hideModal(modal: HTMLElement): void;
    /**
     * Subscribe to loading UI events
     * @param eventType - Event type to subscribe to
     * @param listener - Event listener function
     */
    subscribe(eventType: LoadingUIEventType, listener: EventListener): void;
    /**
     * Unsubscribe from loading UI events
     * @param eventType - Event type to unsubscribe from
     * @param listener - Event listener function
     */
    unsubscribe(eventType: LoadingUIEventType, listener: EventListener): void;
    /**
     * Get statistics about loading UI components
     * @returns Loading UI statistics
     */
    getStatistics(): {
        totalComponents: number;
        activeOperations: number;
        componentTypes: Record<LoadingComponentType, number>;
        averageComponentLifetime: number;
    };
    /**
     * Clean up all components and event listeners
     */
    destroy(): void;
    /**
     * Initialize event listeners for loading state manager
     */
    private initializeEventListeners;
    /**
     * Handle loading state events
     * @param event - Loading event
     * @param targetComponent - Specific component to update (optional)
     */
    private handleLoadingEvent;
    /**
     * Create a loading component internally
     * @param componentId - Component ID
     * @param operationId - Operation ID
     * @param type - Component type
     * @param container - Container element
     * @returns Loading UI component
     */
    private createComponentInternal;
    /**
     * Create component element based on type
     * @param type - Component type
     * @param container - Container element
     * @returns Component element
     */
    private createComponentElement;
    /**
     * Update component element with loading state
     * @param element - Component element
     * @param type - Component type
     * @param state - Loading state
     */
    private updateComponentElement;
    /**
     * Create toast element
     * @param message - Toast message
     * @param type - Toast type
     * @returns Toast element
     */
    private createToastElement;
    /**
     * Create modal element
     * @param message - Modal message
     * @param options - Modal options
     * @returns Modal element
     */
    private createModalElement;
    /**
     * Play sound effect for event
     * @param eventType - Event type
     */
    private playEventSound;
    /**
     * Emit loading UI event
     * @param eventType - Event type
     * @param data - Event data
     */
    private emitEvent;
    /**
     * Generate unique component ID
     * @returns Unique component ID
     */
    private generateComponentId;
    /**
     * Create global CSS styles for loading components
     */
    private createGlobalStyles;
}
export declare const loadingUIManager: LoadingUIManager;
export default loadingUIManager;
//# sourceMappingURL=loading-ui-manager.d.ts.map