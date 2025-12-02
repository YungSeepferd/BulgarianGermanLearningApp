/**
 * Progress Dashboard Initialization Script
 * Loads the progress dashboard module and initializes it when the page is ready
 */

interface ProgressDashboardInstance {
  initialize(): Promise<void>;
}

declare global {
  interface Window {
    progressDashboard?: ProgressDashboardInstance;
  }
}

console.log('[ProgressDashboard-Init] Module loaded');

// Import the ProgressDashboard class with error handling
async function initializeProgressDashboard(): Promise<void> {
  try {
    const { ProgressDashboard } = await import('./modules/progress-dashboard.js') as { ProgressDashboard: new () => ProgressDashboardInstance };

    // Check if dashboard container exists
    const container = document.querySelector('.progress-dashboard');
    if (!container) {
      console.log('[ProgressDashboard] Container not found');
      return;
    }

    console.log('[ProgressDashboard] Initializing...');
    const dashboard = new ProgressDashboard();
    window.progressDashboard = dashboard;
    await dashboard.initialize();
    console.log('[ProgressDashboard] Initialization complete');
  } catch (error) {
    console.error('[ProgressDashboard] Initialization failed:', error);
  }
}

// Wait for DOM to be ready and then initialize
const initDashboard = async (): Promise<void> => {
  if (document.readyState === 'loading') {
    await new Promise<void>((resolve) => {
      document.addEventListener('DOMContentLoaded', () => resolve());
    });
  }
  await initializeProgressDashboard();
};

// Use top-level await to initialize
await initDashboard();

export { initializeProgressDashboard };