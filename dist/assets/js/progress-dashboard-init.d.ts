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
declare function initializeProgressDashboard(): Promise<void>;
export { initializeProgressDashboard };
//# sourceMappingURL=progress-dashboard-init.d.ts.map