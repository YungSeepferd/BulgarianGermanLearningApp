module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:1313',
        'http://localhost:1313/vocabulary/',
        'http://localhost:1313/grammar/',
        'http://localhost:1313/practice/'
      ],
      startServerCommand: 'npm run dev',
      startServerReadyPattern: 'Web Server is available at',
      startServerReadyTimeout: 30000,
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --headless'
      }
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'categories:pwa': ['warn', { minScore: 0.8 }],
        // Specific accessibility audits that must pass
        'accessibility:color-contrast': ['error'],
        'accessibility:keyboard-navigation': ['error'],
        'accessibility:aria-labels': ['error'],
        'accessibility:html-lang-valid': ['error'],
        'accessibility:meta-viewport': ['error'],
        // Performance budgets
        'performance:summary': ['warn', { minScore: 0.8 }],
        'performance:first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'performance:largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'performance:speed-index': ['warn', { maxNumericValue: 3000 }],
        'performance:interactive': ['warn', { maxNumericValue: 3000 }],
        // PWA requirements
        'pwa:installable': ['warn'],
        'pwa:offline': ['warn'],
        'pwa:service-worker': ['warn']
      }
    },
    upload: {
      target: 'temporary-public-storage',
      reportFilenamePattern: '%%PATHNAME%%-%%DATE%%-%%TIME%%'
    }
  }
};