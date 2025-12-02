/**
 * Main application entry point
 */
window.BgDeApp = window.BgDeApp || {};
// Initialize application
window.BgDeApp.init = function () {
    console.log('BulgarianGermanLearningApp initialized');
    // Initialize various modules
    window.BgDeApp.initNavigation();
    window.BgDeApp.initLanguageToggle();
    window.BgDeApp.initPerformanceMonitor();
    // Initialize specific page functionality
    if (document.querySelector('#vocabulary-grid')) {
        window.BgDeApp.initVocabulary();
    }
    if (document.querySelector('#grammar-content')) {
        window.BgDeApp.initGrammar();
    }
    if (document.querySelector('#practice-session')) {
        window.BgDeApp.initPracticeSession();
    }
    if (document.querySelector('#progress-dashboard')) {
        window.BgDeApp.initProgressDashboard();
    }
};
// Initialize navigation
window.BgDeApp.initNavigation = function () {
    const mobileMenuToggle = document.querySelector('#mobile-menu-toggle');
    const mobileMenu = document.querySelector('#mobile-menu');
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('active');
        });
    }
    // Close mobile menu when clicking outside
    document.addEventListener('click', function (e) {
        const target = e.target;
        if (mobileMenu && mobileMenu.classList.contains('active') &&
            !target.closest('#mobile-menu') &&
            !target.closest('#mobile-menu-toggle')) {
            mobileMenu.classList.remove('active');
        }
    });
};
// Initialize language toggle
window.BgDeApp.initLanguageToggle = function () {
    const languageToggle = document.querySelector('#language-toggle');
    if (languageToggle) {
        languageToggle.addEventListener('click', function () {
            const currentLang = document.documentElement.lang || 'en';
            const newLang = currentLang === 'en' ? 'de' : 'en';
            document.documentElement.lang = newLang;
            localStorage.setItem('bgde:language', newLang);
            // Update UI text based on language
            window.BgDeApp.updateLanguageText(newLang);
        });
    }
};
// Update UI text based on language
window.BgDeApp.updateLanguageText = function (lang) {
    const elements = document.querySelectorAll('[data-lang-en], [data-lang-de]');
    for (const element of elements) {
        const enText = element.dataset.langEn;
        const deText = element.dataset.langDe;
        if (lang === 'en' && enText) {
            element.textContent = enText;
        }
        else if (lang === 'de' && deText) {
            element.textContent = deText;
        }
    }
};
// Initialize grammar functionality
window.BgDeApp.initGrammar = function () {
    // Grammar-specific initialization
    const grammarToggles = document.querySelectorAll('.grammar-toggle');
    for (const toggle of grammarToggles) {
        toggle.addEventListener('click', function () {
            const targetId = toggle.dataset.target;
            if (targetId) {
                const target = document.querySelector(`#${targetId}`);
                if (target) {
                    target.classList.toggle('active');
                }
            }
        });
    }
};
// Initialize practice session
window.BgDeApp.initPracticeSession = function () {
    // Practice session initialization
    const startButtons = document.querySelectorAll('.start-practice');
    for (const button of startButtons) {
        button.addEventListener('click', function () {
            const level = button.dataset.level;
            const category = button.dataset.category;
            if (level && category) {
                window.BgDeApp.startPractice(level, category);
            }
        });
    }
};
// Start practice session
window.BgDeApp.startPractice = function (level, category) {
    // Store practice settings
    localStorage.setItem('bgde:practice_level', level);
    localStorage.setItem('bgde:practice_category', category);
    // Navigate to practice page
    window.location.href = '/practice/';
};
// Initialize progress dashboard
window.BgDeApp.initProgressDashboard = function () {
    // Progress dashboard initialization
    const chartContainers = document.querySelectorAll('.chart-container');
    for (const container of chartContainers) {
        const chartType = container.dataset.chartType;
        if (chartType) {
            window.BgDeApp.initChart(container, chartType);
        }
    }
};
// Initialize chart
window.BgDeApp.initChart = function (container, chartType) {
    // Chart initialization logic
    console.log(`Initializing ${chartType} chart in`, container);
    // Placeholder for chart initialization
    // This would typically use a charting library like Chart.js
};
// Initialize performance monitor
window.BgDeApp.initPerformanceMonitor = function () {
    // Performance monitoring initialization
    if (typeof performance !== 'undefined') {
        performance.mark('app-init-start');
    }
    // Monitor key performance metrics
    window.addEventListener('load', function () {
        if (typeof performance !== 'undefined') {
            performance.mark('app-load-complete');
            performance.measure('app-initialization', 'app-init-start', 'app-load-complete');
        }
    });
};
// Error handling
window.BgDeApp.handleError = function (error, context) {
    console.error(`Error in ${context}:`, error);
    // Send error to analytics if available
    if (window.gtag !== undefined) {
        window.gtag('event', 'exception', {
            description: error.message,
            fatal: false
        });
    }
};
// Utility functions
window.BgDeApp.debounce = function (func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => func(...args), wait);
    };
};
window.BgDeApp.throttle = function (func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};
// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    window.BgDeApp.init();
});
export {};
//# sourceMappingURL=app.js.map