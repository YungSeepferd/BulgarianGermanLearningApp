/**
 * Main application entry point
 */

// Import types from global definitions
// Note: These types are defined globally in types.ts and available without explicit import

// Use the global BgDeApp interface from types.ts
interface WindowWithBgDeApp {
  BgDeApp?: Window['BgDeApp'];
  gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
}

(window as Window & WindowWithBgDeApp).BgDeApp = (window as Window & WindowWithBgDeApp).BgDeApp || {} as Window['BgDeApp'];

// Initialize application
((window as Window & WindowWithBgDeApp).BgDeApp as Window['BgDeApp']).init = function(): void {
  console.log('BulgarianGermanLearningApp initialized');
  
  // Initialize various modules
  ((window as WindowWithBgDeApp).BgDeApp as Window['BgDeApp']).initNavigation();
  ((window as WindowWithBgDeApp).BgDeApp as Window['BgDeApp']).initLanguageToggle();
  ((window as WindowWithBgDeApp).BgDeApp as Window['BgDeApp']).initPerformanceMonitor();
  
  // Initialize specific page functionality
  if (document.querySelector('#vocabulary-grid')) {
    ((window as WindowWithBgDeApp).BgDeApp as Window['BgDeApp']).initVocabulary();
  }
  
  if (document.querySelector('#grammar-content')) {
    ((window as WindowWithBgDeApp).BgDeApp as Window['BgDeApp']).initGrammar();
  }
  
  if (document.querySelector('#practice-session')) {
    ((window as WindowWithBgDeApp).BgDeApp as Window['BgDeApp']).initPracticeSession();
  }
  
  if (document.querySelector('#progress-dashboard')) {
    ((window as WindowWithBgDeApp).BgDeApp as Window['BgDeApp']).initProgressDashboard();
  }
};

// Initialize navigation
((window as Window & WindowWithBgDeApp).BgDeApp as Window['BgDeApp']).initNavigation = function(): void {
  const mobileMenuToggle = document.querySelector('#mobile-menu-toggle');
  const mobileMenu = document.querySelector('#mobile-menu');
  
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', function(): void {
      mobileMenu.classList.toggle('active');
    });
  }
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', function(e: Event): void {
    const target = e.target as HTMLElement;
    if (mobileMenu && mobileMenu.classList.contains('active') && 
        !target.closest('#mobile-menu') && 
        !target.closest('#mobile-menu-toggle')) {
      mobileMenu.classList.remove('active');
    }
  });
};

// Initialize language toggle
((window as Window & WindowWithBgDeApp).BgDeApp as Window['BgDeApp']).initLanguageToggle = function(): void {
  const languageToggle = document.querySelector('#language-toggle');
  
  if (languageToggle) {
    languageToggle.addEventListener('click', function(): void {
      const currentLang = document.documentElement.lang || 'en';
      const newLang = currentLang === 'en' ? 'de' : 'en';
      
      document.documentElement.lang = newLang;
      localStorage.setItem('bgde:language', newLang);
      
      // Update UI text based on language
      ((window as WindowWithBgDeApp).BgDeApp as Window['BgDeApp']).updateLanguageText(newLang);
    });
  }
};

// Update UI text based on language
((window as Window & WindowWithBgDeApp).BgDeApp as Window['BgDeApp']).updateLanguageText = function(lang: string): void {
  const elements = document.querySelectorAll('[data-lang-en], [data-lang-de]');
  
  for (const element of elements) {
    const enText = element.dataset.langEn;
    const deText = element.dataset.langDe;
    
    if (lang === 'en' && enText) {
      (element as HTMLElement).textContent = enText;
    } else if (lang === 'de' && deText) {
      (element as HTMLElement).textContent = deText;
    }
  }
};

// Initialize grammar functionality
((window as Window & WindowWithBgDeApp).BgDeApp as Window['BgDeApp']).initGrammar = function(): void {
  // Grammar-specific initialization
  const grammarToggles = document.querySelectorAll('.grammar-toggle');
  
  for (const toggle of grammarToggles) {
    toggle.addEventListener('click', function(): void {
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
((window as Window & WindowWithBgDeApp).BgDeApp as Window['BgDeApp']).initPracticeSession = function(): void {
  // Practice session initialization
  const startButtons = document.querySelectorAll('.start-practice');
  
  for (const button of startButtons) {
    button.addEventListener('click', function(): void {
      const level = button.dataset.level;
      const category = button.dataset.category;
      
      if (level && category) {
        ((window as WindowWithBgDeApp).BgDeApp as Window['BgDeApp']).startPractice(level, category);
      }
    });
  }
};

// Start practice session
((window as Window & WindowWithBgDeApp).BgDeApp as Window['BgDeApp']).startPractice = function(level: string, category: string): void {
  // Store practice settings
  localStorage.setItem('bgde:practice_level', level);
  localStorage.setItem('bgde:practice_category', category);
  
  // Navigate to practice page
  window.location.href = '/practice/';
};

// Initialize progress dashboard
((window as Window & WindowWithBgDeApp).BgDeApp as Window['BgDeApp']).initProgressDashboard = function(): void {
  // Progress dashboard initialization
  const chartContainers = document.querySelectorAll('.chart-container');
  
  for (const container of chartContainers) {
    const chartType = container.dataset.chartType;
    
    if (chartType) {
      ((window as WindowWithBgDeApp).BgDeApp as Window['BgDeApp']).initChart(container as HTMLElement, chartType);
    }
  }
};

// Initialize chart
((window as Window & WindowWithBgDeApp).BgDeApp as Window['BgDeApp']).initChart = function(container: HTMLElement, chartType: string): void {
  // Chart initialization logic
  console.log(`Initializing ${chartType} chart in`, container);
  
  // Placeholder for chart initialization
  // This would typically use a charting library like Chart.js
};

// Initialize performance monitor
((window as Window & WindowWithBgDeApp).BgDeApp as Window['BgDeApp']).initPerformanceMonitor = function(): void {
  // Performance monitoring initialization
  if (typeof performance !== 'undefined') {
    performance.mark('app-init-start');
  }
  
  // Monitor key performance metrics
  window.addEventListener('load', function(): void {
    if (typeof performance !== 'undefined') {
      performance.mark('app-load-complete');
      performance.measure('app-initialization', 'app-init-start', 'app-load-complete');
    }
  });
};

// Error handling
((window as Window & WindowWithBgDeApp).BgDeApp as Window['BgDeApp']).handleError = function(error: Error, context: string): void {
  console.error(`Error in ${context}:`, error);
  
  // Send error to analytics if available
  if ((window as Window & WindowWithBgDeApp).gtag !== undefined) {
    ((window as Window & WindowWithBgDeApp).gtag as (command: string, eventName: string, params?: Record<string, unknown>) => void)('event', 'exception', {
      description: error.message,
      fatal: false
    });
  }
};

// Utility functions
((window as Window & WindowWithBgDeApp).BgDeApp as Window['BgDeApp']).debounce = function<T extends (...args: unknown[]) => void>(func: T, wait: number): T {
  let timeout: number;
  return function(...args: Parameters<T>): void {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  } as T;
};

((window as Window & WindowWithBgDeApp).BgDeApp as Window['BgDeApp']).throttle = function<T extends (...args: unknown[]) => void>(func: T, limit: number): T {
  let inThrottle: boolean;
  return function(...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  } as T;
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function(): void {
  ((window as Window & WindowWithBgDeApp).BgDeApp as Window['BgDeApp']).init();
});

// Export for module usage if needed
export {};