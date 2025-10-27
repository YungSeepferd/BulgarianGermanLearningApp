/**
 * Global Error Handler for Bulgarian-German Learning App
 *
 * Provides centralized error handling, logging, and user notifications
 * for production-ready error management.
 */

class ErrorHandler {
  constructor() {
    this.errors = [];
    this.maxErrors = 50; // Keep last 50 errors
    this.isProduction = !window.location.hostname.includes('localhost');
    this.setupGlobalHandlers();
  }

  /**
   * Setup global error handlers
   */
  setupGlobalHandlers() {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        type: 'unhandledrejection',
        timestamp: new Date().toISOString()
      });

      // Prevent default browser error reporting
      event.preventDefault();
    });

    // Catch global errors
    window.addEventListener('error', (event) => {
      this.handleError({
        message: event.message || 'Global Error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        type: 'error',
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Handle and log errors
   * @param {Object} error - Error object
   */
  handleError(error) {
    // Add to error log
    this.errors.push(error);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift(); // Remove oldest error
    }

    // Log to console in development
    if (!this.isProduction) {
      console.error('[ErrorHandler]', error);
    }

    // Store in localStorage for debugging (last 10 errors only)
    try {
      const recentErrors = this.errors.slice(-10);
      localStorage.setItem('bgde:errors', JSON.stringify(recentErrors));
    } catch (e) {
      console.warn('Could not store errors in localStorage:', e);
    }

    // Show user-friendly notification for critical errors
    if (error.type === 'error' || error.type === 'unhandledrejection') {
      this.showUserNotification(error);
    }
  }

  /**
   * Show user-friendly error notification
   * @param {Object} error - Error object
   */
  showUserNotification(error) {
    // Check if we should show notification (not too many errors in short time)
    const recentErrors = this.errors.filter(e => {
      const errorTime = new Date(e.timestamp).getTime();
      const now = Date.now();
      return now - errorTime < 30000; // Last 30 seconds
    });

    // Don't spam user with notifications
    if (recentErrors.length > 3) {
      return;
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.setAttribute('role', 'alert');
    notification.innerHTML = `
      <div class="error-notification-content">
        <strong>⚠️ Ein Fehler ist aufgetreten / Възникна грешка</strong>
        <p>${this.getUserFriendlyMessage(error)}</p>
        <button class="error-notification-close" aria-label="Close">×</button>
      </div>
    `;

    // Add styles if not already present
    if (!document.getElementById('error-handler-styles')) {
      const style = document.createElement('style');
      style.id = 'error-handler-styles';
      style.textContent = `
        .error-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          max-width: 400px;
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10000;
          animation: slideIn 0.3s ease-out;
        }

        .error-notification-content {
          position: relative;
        }

        .error-notification strong {
          display: block;
          margin-bottom: 8px;
          color: #856404;
        }

        .error-notification p {
          margin: 0;
          color: #856404;
          font-size: 14px;
        }

        .error-notification-close {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ffc107;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          color: #856404;
        }

        .error-notification-close:hover {
          background: #e0a800;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Add to page
    document.body.appendChild(notification);

    // Setup close button
    const closeBtn = notification.querySelector('.error-notification-close');
    closeBtn.addEventListener('click', () => {
      notification.remove();
    });

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 10000);
  }

  /**
   * Get user-friendly error message
   * @param {Object} error - Error object
   * @returns {string} User-friendly message
   */
  getUserFriendlyMessage(error) {
    const message = error.message || '';

    // Network errors
    if (message.includes('fetch') || message.includes('network')) {
      return 'Bitte überprüfen Sie Ihre Internetverbindung / Моля, проверете интернет връзката си.';
    }

    // Storage errors
    if (message.includes('localStorage') || message.includes('storage')) {
      return 'Speicherproblem. Bitte löschen Sie den Browser-Cache / Проблем със съхранението. Моля, изчистете кеша на браузъра.';
    }

    // Generic error
    return 'Die Seite wird neu geladen... / Страницата ще се презареди...';
  }

  /**
   * Get error statistics
   * @returns {Object} Error statistics
   */
  getStats() {
    const errorsByType = {};
    this.errors.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
    });

    return {
      total: this.errors.length,
      byType: errorsByType,
      recent: this.errors.slice(-5)
    };
  }

  /**
   * Clear error log
   */
  clearErrors() {
    this.errors = [];
    localStorage.removeItem('bgde:errors');
  }

  /**
   * Export errors for debugging
   * @returns {string} JSON string of errors
   */
  exportErrors() {
    return JSON.stringify({
      errors: this.errors,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }, null, 2);
  }
}

// Create global error handler instance
const errorHandler = new ErrorHandler();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = errorHandler;
}

// Make available globally for debugging
window.bgdeErrorHandler = errorHandler;

// Log initialization
if (!errorHandler.isProduction) {
  console.log('[ErrorHandler] Initialized. Access via window.bgdeErrorHandler');
  console.log('[ErrorHandler] Commands: .getStats(), .clearErrors(), .exportErrors()');
}
