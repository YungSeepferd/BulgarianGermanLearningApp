/**
 * Loading UI Manager
 * Provides UI components and event system for loading state management
 * Integrates with loading state manager to display progress and status to users
 * @since 1.0.0
 */
import { LoadingStateManager } from './loading-state-manager.js';
import { errorLogger } from './error-logger.js';
/**
 * Loading UI Manager Class
 * Manages UI components for loading states with event-driven updates
 */
export class LoadingUIManager {
    /**
     * Create a new loading UI manager
     * @param options - Configuration options
     */
    constructor(options = {}) {
        this.components = new Map();
        this.eventListeners = new Map();
        this.activeOperations = new Set();
        this.options = {
            defaultComponent: 'progress-bar',
            showPercentage: true,
            showTimeRemaining: true,
            showErrorDetails: false,
            animationDuration: 300,
            enableSound: false,
            customClasses: {},
            ...options
        };
        this.loadingStateManager = new LoadingStateManager();
        this.soundEnabled = this.options.enableSound;
        this.initializeEventListeners();
        this.createGlobalStyles();
        errorLogger.info('LoadingUIManager initialized', {
            component: 'loading-ui-manager',
            options: this.options
        });
    }
    /**
     * Create a loading UI component for an operation
     * @param operationId - Operation ID to track
     * @param type - Component type
     * @param container - Container element (optional)
     * @returns Loading UI component
     */
    createComponent(operationId, type = this.options.defaultComponent, container) {
        try {
            errorLogger.debug('Creating loading UI component', {
                operationId,
                componentType: type
            }, 'loading-ui-manager');
            const componentId = this.generateComponentId();
            const component = this.createComponentInternal(componentId, operationId, type, container);
            this.components.set(componentId, component);
            this.activeOperations.add(operationId);
            // Subscribe to loading state updates
            this.loadingStateManager.subscribe((event) => {
                if (event.operationId === operationId) {
                    this.handleLoadingEvent(event, component);
                }
            });
            this.emitEvent('component-created', {
                componentId,
                operationId,
                componentType: type
            });
            return component;
        }
        catch (error) {
            const errorMessage = `Failed to create loading component: ${error instanceof Error ? error.message : 'Unknown error'}`;
            errorLogger.error('Failed to create loading UI component', error instanceof Error ? error : undefined, {
                operationId,
                componentType: type
            }, 'loading-ui-manager');
            this.emitEvent('ui-error', { error: errorMessage, operationId });
            throw new Error(errorMessage);
        }
    }
    /**
     * Show a loading component
     * @param componentId - Component ID
     */
    showComponent(componentId) {
        const component = this.components.get(componentId);
        if (!component) {
            errorLogger.warn('Attempted to show non-existent component', {
                componentId
            }, 'loading-ui-manager');
            return;
        }
        try {
            component.show();
            this.emitEvent('component-shown', { componentId, operationId: component.operationId });
            errorLogger.debug('Loading component shown', {
                componentId,
                operationId: component.operationId
            }, 'loading-ui-manager');
        }
        catch (error) {
            errorLogger.error('Failed to show loading component', error instanceof Error ? error : undefined, {
                componentId
            }, 'loading-ui-manager');
        }
    }
    /**
     * Hide a loading component
     * @param componentId - Component ID
     */
    hideComponent(componentId) {
        const component = this.components.get(componentId);
        if (!component) {
            errorLogger.warn('Attempted to hide non-existent component', {
                componentId
            }, 'loading-ui-manager');
            return;
        }
        try {
            component.hide();
            this.emitEvent('component-hidden', { componentId, operationId: component.operationId });
            errorLogger.debug('Loading component hidden', {
                componentId,
                operationId: component.operationId
            }, 'loading-ui-manager');
        }
        catch (error) {
            errorLogger.error('Failed to hide loading component', error instanceof Error ? error : undefined, {
                componentId
            }, 'loading-ui-manager');
        }
    }
    /**
     * Destroy a loading component
     * @param componentId - Component ID
     */
    destroyComponent(componentId) {
        const component = this.components.get(componentId);
        if (!component) {
            errorLogger.warn('Attempted to destroy non-existent component', {
                componentId
            }, 'loading-ui-manager');
            return;
        }
        try {
            component.destroy();
            this.components.delete(componentId);
            this.activeOperations.delete(component.operationId);
            this.emitEvent('component-destroyed', {
                componentId,
                operationId: component.operationId
            });
            errorLogger.debug('Loading component destroyed', {
                componentId,
                operationId: component.operationId
            }, 'loading-ui-manager');
        }
        catch (error) {
            errorLogger.error('Failed to destroy loading component', error instanceof Error ? error : undefined, {
                componentId
            }, 'loading-ui-manager');
        }
    }
    /**
     * Get all active components for an operation
     * @param operationId - Operation ID
     * @returns Array of component IDs
     */
    getComponentsForOperation(operationId) {
        const componentIds = [];
        for (const [componentId, component] of this.components) {
            if (component.operationId === operationId) {
                componentIds.push(componentId);
            }
        }
        return componentIds;
    }
    /**
     * Show a toast notification for loading status
     * @param message - Toast message
     * @param type - Toast type
     * @param duration - Duration in milliseconds
     * @returns Toast element
     */
    showToast(message, type = 'info', duration = 3000) {
        try {
            const toast = this.createToastElement(message, type);
            document.body.append(toast);
            // Show toast with animation
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });
            // Auto-hide after duration
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, this.options.animationDuration);
            }, duration);
            errorLogger.debug('Toast notification shown', {
                message,
                type,
                duration
            }, 'loading-ui-manager');
            return toast;
        }
        catch (error) {
            errorLogger.error('Failed to show toast notification', error instanceof Error ? error : undefined, {
                message,
                type
            }, 'loading-ui-manager');
            // Fallback: create simple alert
            const fallbackToast = document.createElement('div');
            fallbackToast.textContent = message;
            fallbackToast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #333;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 10000;
      `;
            document.body.append(fallbackToast);
            setTimeout(() => {
                if (fallbackToast.parentNode) {
                    fallbackToast.remove();
                }
            }, duration);
            return fallbackToast;
        }
    }
    /**
     * Show a modal loading overlay
     * @param message - Loading message
     * @param options - Modal options
     * @returns Modal element
     */
    showModal(message, options = {}) {
        try {
            const modal = this.createModalElement(message, options);
            document.body.append(modal);
            // Show modal with animation
            requestAnimationFrame(() => {
                modal.classList.add('show');
            });
            errorLogger.debug('Modal loading overlay shown', {
                message,
                options
            }, 'loading-ui-manager');
            return modal;
        }
        catch (error) {
            errorLogger.error('Failed to show modal loading overlay', error instanceof Error ? error : undefined, {
                message
            }, 'loading-ui-manager');
            // Fallback: create simple overlay
            const fallbackModal = document.createElement('div');
            fallbackModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      `;
            const content = document.createElement('div');
            content.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
      `;
            content.textContent = message;
            fallbackModal.append(content);
            document.body.append(fallbackModal);
            return fallbackModal;
        }
    }
    /**
     * Hide a modal loading overlay
     * @param modal - Modal element
     */
    hideModal(modal) {
        try {
            modal.classList.remove('show');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
            }, this.options.animationDuration);
            errorLogger.debug('Modal loading overlay hidden', {}, 'loading-ui-manager');
        }
        catch (error) {
            errorLogger.error('Failed to hide modal loading overlay', error instanceof Error ? error : undefined, {}, 'loading-ui-manager');
        }
    }
    /**
     * Subscribe to loading UI events
     * @param eventType - Event type to subscribe to
     * @param listener - Event listener function
     */
    subscribe(eventType, listener) {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, new Set());
        }
        this.eventListeners.get(eventType).add(listener);
        errorLogger.debug('Event listener subscribed', {
            eventType,
            listenerCount: this.eventListeners.get(eventType).size
        }, 'loading-ui-manager');
    }
    /**
     * Unsubscribe from loading UI events
     * @param eventType - Event type to unsubscribe from
     * @param listener - Event listener function
     */
    unsubscribe(eventType, listener) {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            listeners.delete(listener);
            errorLogger.debug('Event listener unsubscribed', {
                eventType,
                listenerCount: listeners.size
            }, 'loading-ui-manager');
        }
    }
    /**
     * Get statistics about loading UI components
     * @returns Loading UI statistics
     */
    getStatistics() {
        const componentTypes = {
            'progress-bar': 0,
            'spinner': 0,
            'status-text': 0,
            'toast': 0,
            'modal': 0
        };
        for (const component of this.components.values()) {
            componentTypes[component.type]++;
        }
        return {
            totalComponents: this.components.size,
            activeOperations: this.activeOperations.size,
            componentTypes,
            averageComponentLifetime: 0 // TODO: Track component lifetimes
        };
    }
    /**
     * Clean up all components and event listeners
     */
    destroy() {
        try {
            // Destroy all components
            for (const [componentId, component] of this.components) {
                try {
                    component.destroy();
                }
                catch (error) {
                    errorLogger.warn('Error destroying component during cleanup', error instanceof Error ? error : undefined, {
                        componentId
                    }, 'loading-ui-manager');
                }
            }
            this.components.clear();
            this.activeOperations.clear();
            this.eventListeners.clear();
            errorLogger.info('LoadingUIManager destroyed', {}, 'loading-ui-manager');
        }
        catch (error) {
            errorLogger.error('Error during LoadingUIManager cleanup', error instanceof Error ? error : undefined, {}, 'loading-ui-manager');
        }
    }
    /**
     * Initialize event listeners for loading state manager
     */
    initializeEventListeners() {
        this.loadingStateManager.subscribe((event) => {
            this.handleLoadingEvent(event);
        });
    }
    /**
     * Handle loading state events
     * @param event - Loading event
     * @param targetComponent - Specific component to update (optional)
     */
    handleLoadingEvent(event, targetComponent) {
        try {
            const componentsToUpdate = targetComponent
                ? [targetComponent]
                : [...this.components.values()].filter(c => c.operationId === event.operationId);
            for (const component of componentsToUpdate) {
                switch (event.type) {
                    case 'loading-started': {
                        component.show();
                        break;
                    }
                    case 'loading-completed': {
                        component.hide();
                        // Auto-destroy completed components after a delay
                        setTimeout(() => {
                            this.destroyComponent(component.id);
                        }, 1000);
                        break;
                    }
                    case 'loading-failed': {
                        component.hide();
                        // Show error toast
                        this.showToast(`Operation failed: ${event.error?.userMessage || 'Unknown error'}`, 'error', 5000);
                        break;
                    }
                    case 'progress-updated': {
                        component.update(event.state);
                        break;
                    }
                    // No default
                }
                this.emitEvent('component-updated', {
                    componentId: component.id,
                    operationId: component.operationId,
                    eventType: event.type,
                    state: event.state
                });
            }
            // Play sound effects if enabled
            if (this.soundEnabled) {
                this.playEventSound(event.type);
            }
        }
        catch (error) {
            errorLogger.error('Error handling loading event', error instanceof Error ? error : undefined, {
                eventType: event.type,
                operationId: event.operationId
            }, 'loading-ui-manager');
        }
    }
    /**
     * Create a loading component internally
     * @param componentId - Component ID
     * @param operationId - Operation ID
     * @param type - Component type
     * @param container - Container element
     * @returns Loading UI component
     */
    createComponentInternal(componentId, operationId, type, container) {
        const element = this.createComponentElement(type, container);
        return {
            id: componentId,
            type,
            element,
            operationId,
            visible: false,
            show: () => {
                element.style.display = 'block';
                element.classList.add('loading-visible');
                this.visible = true;
            },
            hide: () => {
                element.style.display = 'none';
                element.classList.remove('loading-visible');
                this.visible = false;
            },
            update: (state) => {
                this.updateComponentElement(element, type, state);
            },
            destroy: () => {
                if (element.parentNode) {
                    element.remove();
                }
            }
        };
    }
    /**
     * Create component element based on type
     * @param type - Component type
     * @param container - Container element
     * @returns Component element
     */
    createComponentElement(type, container) {
        const element = document.createElement('div');
        element.className = `loading-ui loading-${type} ${this.options.customClasses[type] || ''}`;
        switch (type) {
            case 'progress-bar': {
                element.innerHTML = `
          <div class="loading-progress-bar">
            <div class="loading-progress-fill"></div>
            ${this.options.showPercentage ? '<div class="loading-progress-text">0%</div>' : ''}
          </div>
        `;
                break;
            }
            case 'spinner': {
                element.innerHTML = `
          <div class="loading-spinner">
            <div class="loading-spinner-circle"></div>
            <div class="loading-spinner-text">Loading...</div>
          </div>
        `;
                break;
            }
            case 'status-text': {
                element.innerHTML = `
          <div class="loading-status-text">
            <div class="loading-status-message">Loading...</div>
            ${this.options.showTimeRemaining ? '<div class="loading-status-time"></div>' : ''}
          </div>
        `;
                break;
            }
            case 'toast': {
                element.innerHTML = `
          <div class="loading-toast">
            <div class="loading-toast-message">Loading...</div>
          </div>
        `;
                break;
            }
            case 'modal': {
                element.innerHTML = `
          <div class="loading-modal-overlay">
            <div class="loading-modal-content">
              <div class="loading-modal-spinner"></div>
              <div class="loading-modal-message">Loading...</div>
            </div>
          </div>
        `;
                break;
            }
        }
        if (container) {
            container.append(element);
        }
        else {
            document.body.append(element);
        }
        return element;
    }
    /**
     * Update component element with loading state
     * @param element - Component element
     * @param type - Component type
     * @param state - Loading state
     */
    updateComponentElement(element, type, state) {
        switch (type) {
            case 'progress-bar': {
                const fill = element.querySelector('.loading-progress-fill');
                const text = element.querySelector('.loading-progress-text');
                if (fill) {
                    fill.style.width = `${state.progress || 0}%`;
                }
                if (text && this.options.showPercentage) {
                    text.textContent = `${Math.round(state.progress || 0)}%`;
                }
                break;
            }
            case 'status-text': {
                const message = element.querySelector('.loading-status-message');
                const time = element.querySelector('.loading-status-time');
                if (message && state.stage) {
                    message.textContent = state.stage;
                }
                if (time && this.options.showTimeRemaining && state.estimatedTimeRemaining) {
                    time.textContent = `~${Math.round(state.estimatedTimeRemaining / 1000)}s remaining`;
                }
                break;
            }
            case 'toast': {
                const toastMessage = element.querySelector('.loading-toast-message');
                if (toastMessage && state.stage) {
                    toastMessage.textContent = state.stage;
                }
                break;
            }
            case 'modal': {
                const modalMessage = element.querySelector('.loading-modal-message');
                if (modalMessage && state.stage) {
                    modalMessage.textContent = state.stage;
                }
                break;
            }
        }
    }
    /**
     * Create toast element
     * @param message - Toast message
     * @param type - Toast type
     * @returns Toast element
     */
    createToastElement(message, type) {
        const toast = document.createElement('div');
        toast.className = `loading-toast loading-toast-${type}`;
        toast.innerHTML = `
      <div class="loading-toast-content">
        <div class="loading-toast-message">${message}</div>
        <button class="loading-toast-close" aria-label="Close">×</button>
      </div>
    `;
        // Add close button handler
        const closeBtn = toast.querySelector('.loading-toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, this.options.animationDuration);
            });
        }
        return toast;
    }
    /**
     * Create modal element
     * @param message - Modal message
     * @param options - Modal options
     * @returns Modal element
     */
    createModalElement(message, options) {
        const modal = document.createElement('div');
        modal.className = 'loading-modal';
        let contentHTML = `
      <div class="loading-modal-content">
        <div class="loading-modal-spinner"></div>
        <div class="loading-modal-message">${message}</div>
    `;
        if (options.showProgress) {
            contentHTML += `
        <div class="loading-modal-progress">
          <div class="loading-modal-progress-bar">
            <div class="loading-modal-progress-fill"></div>
          </div>
        </div>
      `;
        }
        if (options.allowCancel) {
            contentHTML += `
        <button class="loading-modal-cancel">Cancel</button>
      `;
        }
        contentHTML += '</div>';
        modal.innerHTML = contentHTML;
        // Add cancel button handler
        const cancelBtn = modal.querySelector('.loading-modal-cancel');
        if (cancelBtn && options.onCancel) {
            cancelBtn.addEventListener('click', options.onCancel);
        }
        return modal;
    }
    /**
     * Play sound effect for event
     * @param eventType - Event type
     */
    playEventSound(eventType) {
        // TODO: Implement sound effects
        // This would use Web Audio API or HTML5 audio elements
    }
    /**
     * Emit loading UI event
     * @param eventType - Event type
     * @param data - Event data
     */
    emitEvent(eventType, data = {}) {
        const event = {
            type: eventType,
            ...data,
            timestamp: new Date()
        };
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            for (const listener of listeners) {
                try {
                    listener(new CustomEvent('loading-ui', { detail: event }));
                }
                catch (error) {
                    errorLogger.error('Error in event listener', error instanceof Error ? error : undefined, {
                        eventType
                    }, 'loading-ui-manager');
                }
            }
        }
    }
    /**
     * Generate unique component ID
     * @returns Unique component ID
     */
    generateComponentId() {
        return `loading-ui-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }
    /**
     * Create global CSS styles for loading components
     */
    createGlobalStyles() {
        const styleId = 'loading-ui-global-styles';
        // Check if styles already exist
        if (document.getElementById(styleId)) {
            return;
        }
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
      /* Loading UI Global Styles */
      .loading-ui {
        box-sizing: border-box;
      }
      
      .loading-ui * {
        box-sizing: border-box;
      }
      
      /* Progress Bar */
      .loading-progress-bar {
        width: 100%;
        height: 8px;
        background: #e0e0e0;
        border-radius: 4px;
        overflow: hidden;
        position: relative;
      }
      
      .loading-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #007bff, #0056b3);
        border-radius: 4px;
        transition: width 0.3s ease;
        width: 0%;
      }
      
      .loading-progress-text {
        text-align: center;
        margin-top: 8px;
        font-size: 14px;
        color: #666;
      }
      
      /* Spinner */
      .loading-spinner {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }
      
      .loading-spinner-circle {
        width: 32px;
        height: 32px;
        border: 3px solid #e0e0e0;
        border-top: 3px solid #007bff;
        border-radius: 50%;
        animation: loading-spin 1s linear infinite;
      }
      
      .loading-spinner-text {
        font-size: 14px;
        color: #666;
      }
      
      /* Status Text */
      .loading-status-text {
        text-align: center;
      }
      
      .loading-status-message {
        font-size: 16px;
        color: #333;
        margin-bottom: 4px;
      }
      
      .loading-status-time {
        font-size: 12px;
        color: #999;
      }
      
      /* Toast */
      .loading-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
      }
      
      .loading-toast.show {
        transform: translateX(0);
      }
      
      .loading-toast-content {
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .loading-toast-message {
        flex: 1;
        font-size: 14px;
        color: #333;
      }
      
      .loading-toast-close {
        background: none;
        border: none;
        font-size: 18px;
        color: #999;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .loading-toast-close:hover {
        color: #666;
      }
      
      .loading-toast-info {
        border-left: 4px solid #007bff;
      }
      
      .loading-toast-success {
        border-left: 4px solid #28a745;
      }
      
      .loading-toast-warning {
        border-left: 4px solid #ffc107;
      }
      
      .loading-toast-error {
        border-left: 4px solid #dc3545;
      }
      
      /* Modal */
      .loading-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .loading-modal.show {
        opacity: 1;
      }
      
      .loading-modal-content {
        background: white;
        border-radius: 8px;
        padding: 24px;
        text-align: center;
        min-width: 300px;
        max-width: 500px;
      }
      
      .loading-modal-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e0e0e0;
        border-top: 4px solid #007bff;
        border-radius: 50%;
        animation: loading-spin 1s linear infinite;
        margin: 0 auto 16px;
      }
      
      .loading-modal-message {
        font-size: 16px;
        color: #333;
        margin-bottom: 16px;
      }
      
      .loading-modal-progress {
        margin-bottom: 16px;
      }
      
      .loading-modal-progress-bar {
        width: 100%;
        height: 8px;
        background: #e0e0e0;
        border-radius: 4px;
        overflow: hidden;
      }
      
      .loading-modal-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #007bff, #0056b3);
        border-radius: 4px;
        transition: width 0.3s ease;
        width: 0%;
      }
      
      .loading-modal-cancel {
        background: #6c757d;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      
      .loading-modal-cancel:hover {
        background: #5a6268;
      }
      
      /* Animations */
      @keyframes loading-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      /* Visibility states */
      .loading-ui {
        transition: opacity 0.3s ease;
      }
      
      .loading-ui.loading-visible {
        opacity: 1;
      }
      
      .loading-ui:not(.loading-visible) {
        opacity: 0;
        pointer-events: none;
      }
    `;
        document.head.append(style);
    }
}
// Create singleton instance
export const loadingUIManager = new LoadingUIManager();
export default loadingUIManager;
//# sourceMappingURL=loading-ui-manager.js.map