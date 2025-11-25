/**
 * Main application entry point
 */

// Vocabulary item interface
interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  category: string;
  level: string;
  difficulty: number;
  frequency: number;
  examples: Array<{
    sentence: string;
    translation: string;
    context: string;
  }>;
  notes?: string;
  etymology?: string;
  cultural_note?: string;
}

// Vocabulary filters interface
interface VocabularyFilters {
  level: string;
  category: string;
  search: string;
}

// Vocabulary state interface
interface VocabularyState {
  data: VocabularyItem[];
  filteredData: VocabularyItem[];
  selectedWords: Set<string>;
  filters: VocabularyFilters;
}

// Declare global BgDeApp interface
interface BgDeAppNamespace {
  init: () => void;
  initNavigation: () => void;
  initLanguageToggle: () => void;
  initPerformanceMonitor: () => void;
  initVocabulary: () => void;
  initGrammar: () => void;
  initPracticeSession: () => void;
  initProgressDashboard: () => void;
  updateLanguageText: (lang: string) => void;
  startPractice: (level: string, category: string) => void;
  initChart: (container: HTMLElement, chartType: string) => void;
  handleError: (error: Error, context: string) => void;
  debounce: <T extends (...args: unknown[]) => void>(func: T, wait: number) => T;
  throttle: <T extends (...args: unknown[]) => void>(func: T, limit: number) => T;
  vocabulary: VocabularyState;
  loadVocabularyData: () => void;
  bindVocabularyEvents: () => void;
  renderVocabulary: () => void;
  updateVocabularyStats: () => void;
  applyVocabularyFilters: () => void;
  clearAllVocabularyFilters: () => void;
  bindCardSelectionEvents: () => void;
  toggleWordSelection: (word: string, cardElement: HTMLElement) => void;
  flipVocabularyCard: (cardElement: HTMLElement) => void;
  startPracticeWithSelected: () => void;
  shuffleArray: <T>(array: T[]) => T[];
}

// Global namespace
interface WindowWithBgDeApp {
  BgDeApp?: BgDeAppNamespace;
  gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
}

(window as Window & WindowWithBgDeApp).BgDeApp = (window as Window & WindowWithBgDeApp).BgDeApp || {};

// Initialize application
((window as Window & WindowWithBgDeApp).BgDeApp as BgDeAppNamespace).init = function(): void {
  console.log('BulgarianGermanLearningApp initialized');
  
  // Initialize various modules
  ((window as WindowWithBgDeApp).BgDeApp as BgDeAppNamespace).initNavigation();
  ((window as WindowWithBgDeApp).BgDeApp as BgDeAppNamespace).initLanguageToggle();
  ((window as WindowWithBgDeApp).BgDeApp as BgDeAppNamespace).initPerformanceMonitor();
  
  // Initialize specific page functionality
  if (document.querySelector('#vocabulary-grid')) {
    ((window as WindowWithBgDeApp).BgDeApp as BgDeAppNamespace).initVocabulary();
  }
  
  if (document.querySelector('#grammar-content')) {
    ((window as WindowWithBgDeApp).BgDeApp as BgDeAppNamespace).initGrammar();
  }
  
  if (document.querySelector('#practice-session')) {
    ((window as WindowWithBgDeApp).BgDeApp as BgDeAppNamespace).initPracticeSession();
  }
  
  if (document.querySelector('#progress-dashboard')) {
    ((window as WindowWithBgDeApp).BgDeApp as BgDeAppNamespace).initProgressDashboard();
  }
};

// Initialize navigation
((window as Window & WindowWithBgDeApp).BgDeApp as BgDeAppNamespace).initNavigation = function(): void {
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
((window as Window & WindowWithBgDeApp).BgDeApp as BgDeAppNamespace).initLanguageToggle = function(): void {
  const languageToggle = document.querySelector('#language-toggle');
  
  if (languageToggle) {
    languageToggle.addEventListener('click', function(): void {
      const currentLang = document.documentElement.lang || 'en';
      const newLang = currentLang === 'en' ? 'de' : 'en';
      
      document.documentElement.lang = newLang;
      localStorage.setItem('bgde:language', newLang);
      
      // Update UI text based on language
      ((window as WindowWithBgDeApp).BgDeApp as BgDeAppNamespace).updateLanguageText(newLang);
    });
  }
};

// Update UI text based on language
((window as Window & WindowWithBgDeApp).BgDeApp as BgDeAppNamespace).updateLanguageText = function(lang: string): void {
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
((window as Window & WindowWithBgDeApp).BgDeApp as BgDeAppNamespace).initGrammar = function(): void {
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
((window as Window & WindowWithBgDeApp).BgDeApp as BgDeAppNamespace).initPracticeSession = function(): void {
  // Practice session initialization
  const startButtons = document.querySelectorAll('.start-practice');
  
  for (const button of startButtons) {
    button.addEventListener('click', function(): void {
      const level = button.dataset.level;
      const category = button.dataset.category;
      
      if (level && category) {
        ((window as WindowWithBgDeApp).BgDeApp as BgDeAppNamespace).startPractice(level, category);
      }
    });
  }
};

// Start practice session
((window as Window & WindowWithBgDeApp).BgDeApp as BgDeAppNamespace).startPractice = function(level: string, category: string): void {
  // Store practice settings
  localStorage.setItem('bgde:practice_level', level);
  localStorage.setItem('bgde:practice_category', category);
  
  // Navigate to practice page
  window.location.href = '/practice/';
};

// Initialize progress dashboard
((window as Window & WindowWithBgDeApp).BgDeApp as BgDeAppNamespace).initProgressDashboard = function(): void {
  // Progress dashboard initialization
  const chartContainers = document.querySelectorAll('.chart-container');
  
  for (const container of chartContainers) {
    const chartType = container.dataset.chartType;
    
    if (chartType) {
      ((window as WindowWithBgDeApp).BgDeApp as BgDeAppNamespace).initChart(container as HTMLElement, chartType);
    }
  }
};

// Initialize chart
((window as Window & WindowWithBgDeApp).BgDeApp as BgDeAppNamespace).initChart = function(container: HTMLElement, chartType: string): void {
  // Chart initialization logic
  console.log(`Initializing ${chartType} chart in`, container);
  
  // Placeholder for chart initialization
  // This would typically use a charting library like Chart.js
};

// Initialize performance monitor
((window as Window & WindowWithBgDeApp).BgDeApp as BgDeAppNamespace).initPerformanceMonitor = function(): void {
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
((window as Window & WindowWithBgDeApp).BgDeApp as BgDeAppNamespace).handleError = function(error: Error, context: string): void {
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
((window as Window & WindowWithBgDeApp).BgDeApp as BgDeAppNamespace).debounce = function<T extends (...args: unknown[]) => void>(func: T, wait: number): T {
  let timeout: number;
  return function(...args: Parameters<T>): void {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(null, args), wait);
  } as T;
};

((window as Window & WindowWithBgDeApp).BgDeApp as BgDeAppNamespace).throttle = function<T extends (...args: unknown[]) => void>(func: T, limit: number): T {
  let inThrottle: boolean;
  return function(...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  } as T;
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function(): void {
  ((window as Window & WindowWithBgDeApp).BgDeApp as BgDeAppNamespace).init();
});

// Export for module usage if needed
export {};