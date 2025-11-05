/**
 * Progress Dashboard Initialization Script
 * Loads the progress dashboard module and initializes it when the page is ready
 */

console.log('[ProgressDashboard-Init] Module loaded');

// Import the ProgressDashboard class with error handling
async function initializeProgressDashboard() {
  try {
    const { ProgressDashboard } = await import('./modules/progress-dashboard.js');

    // Check if dashboard container exists
    const container = document.querySelector('.progress-dashboard');
    if (!container) {
      console.log('[ProgressDashboard] Container not found');
      return;
    }

    console.log('[ProgressDashboard] Initializing...');
    window.progressDashboard = new ProgressDashboard();
    await window.progressDashboard.initialize();
    console.log('[ProgressDashboard] Initialization complete');
  } catch (error) {
    console.error('[ProgressDashboard] Initialization failed:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeProgressDashboard);
} else {
  initializeProgressDashboard();
}
