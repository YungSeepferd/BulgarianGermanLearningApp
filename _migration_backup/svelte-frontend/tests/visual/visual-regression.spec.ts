import { test, expect } from '@playwright/test';
import { createMockVocabulary, createMockSessionStats } from '../test-utils';


test.describe('Visual Regression Tests', () => {
  // Test configurations for different viewports
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1200, height: 800 }
  ];

  // Test configurations for different themes
  const themes = ['light', 'dark'];

  test.describe('Flashcard Component Visual Tests', () => {
    for (const viewport of viewports) {
      test(`Flashcard - ${viewport.name} viewport`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        const mockVocab = createMockVocabulary(1)[0];
        
        await page.goto('/');
        await page.evaluate(([mockVocab]) => {
          const container = document.createElement('div');
          container.id = 'test-container';
          document.body.append(container);
          
          // Mount component (simplified for visual testing)
          container.innerHTML = `
            <div data-testid="flashcard-container" role="article" aria-label="Flashcard" tabindex="0">
              <div data-testid="flashcard-front" class="flashcard-side">
                <h3>Bulgarian</h3>
                <p>${mockVocab.word}</p>
              </div>
              <div data-testid="flashcard-back" class="flashcard-side" style="display: none;">
                <h3>German</h3>
                <p>${mockVocab.translation}</p>
              </div>
            </div>
          `;
        }, [mockVocab]);

        await expect(page.locator('#test-container')).toHaveScreenshot(`flashcard-${viewport.name}-front.png`);
      });

      test(`Flashcard flipped - ${viewport.name} viewport`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        const mockVocab = createMockVocabulary(1)[0];
        
        await page.goto('/');
        await page.evaluate(([mockVocab]) => {
          const container = document.createElement('div');
          container.id = 'test-container';
          document.body.append(container);
          
          container.innerHTML = `
            <div data-testid="flashcard-container" role="article" aria-label="Flashcard" tabindex="0">
              <div data-testid="flashcard-front" class="flashcard-side" style="display: none;">
                <h3>Bulgarian</h3>
                <p>${mockVocab.word}</p>
              </div>
              <div data-testid="flashcard-back" class="flashcard-side">
                <h3>German</h3>
                <p>${mockVocab.translation}</p>
              </div>
            </div>
          `;
        }, [mockVocab]);

        await expect(page.locator('#test-container')).toHaveScreenshot(`flashcard-${viewport.name}-back.png`);
      });
    }

    test('Flashcard with long content', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      
      const longVocab = {
        ...createMockVocabulary(1)[0],
        word: 'Това е много дълъг български текст, който трябва да се покаже правилно на флашкарта и да се тества как се справя с дълго съдържание без да се счупи оформлението.',
        translation: 'Dies ist ein sehr langer deutscher Text, der korrekt auf der Karteikarte angezeigt werden sollte und testen soll, wie er mit langem Inhalten umgeht, ohne das Layout zu beschädigen.'
      };
      
      await page.goto('/');
      await page.evaluate(([longVocab]) => {
        const container = document.createElement('div');
        container.id = 'test-container';
        document.body.append(container);
        
        container.innerHTML = `
          <div data-testid="flashcard-container" role="article" aria-label="Flashcard" tabindex="0">
            <div data-testid="flashcard-front" class="flashcard-side">
              <h3>Bulgarian</h3>
              <p>${longVocab.word}</p>
            </div>
          </div>
        `;
      }, [longVocab]);

      await expect(page.locator('#test-container')).toHaveScreenshot('flashcard-long-content.png');
    });

    test('Flashcard with examples', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      
      const vocabWithExamples = {
        ...createMockVocabulary(1)[0],
        examples: [
          { bulgarian: 'Пример 1', german: 'Beispiel 1' },
          { bulgarian: 'Пример 2', german: 'Beispiel 2' },
          { bulgarian: 'Пример 3', german: 'Beispiel 3' }
        ]
      };
      
      await page.goto('/');
      await page.evaluate(([vocabWithExamples]) => {
        const container = document.createElement('div');
        container.id = 'test-container';
        document.body.append(container);
        
        container.innerHTML = `
          <div data-testid="flashcard-container" role="article" aria-label="Flashcard" tabindex="0">
            <div data-testid="flashcard-back" class="flashcard-side">
              <h3>German</h3>
              <p>${vocabWithExamples.translation}</p>
              <div class="examples">
                <h4>Examples:</h4>
                ${vocabWithExamples.examples.map((ex, i) => `
                  <div class="example">
                    <p><strong>Bulgarian:</strong> ${ex.bulgarian}</p>
                    <p><strong>German:</strong> ${ex.german}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      }, [vocabWithExamples]);

      await expect(page.locator('#test-container')).toHaveScreenshot('flashcard-with-examples.png');
    });
  });

  test.describe('GradeControls Component Visual Tests', () => {
    for (const viewport of viewports) {
      test(`GradeControls - ${viewport.name} viewport`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        await page.goto('/');
        await page.evaluate(() => {
          const container = document.createElement('div');
          container.id = 'test-container';
          document.body.append(container);
          
          container.innerHTML = `
            <div data-testid="grade-controls" class="grade-controls">
              <button data-testid="grade-button-1" class="grade-button grade-1" aria-label="Grade 1 - Again">
                <span class="grade-number">1</span>
                <span class="grade-label">Again</span>
              </button>
              <button data-testid="grade-button-2" class="grade-button grade-2" aria-label="Grade 2 - Hard">
                <span class="grade-number">2</span>
                <span class="grade-label">Hard</span>
              </button>
              <button data-testid="grade-button-3" class="grade-button grade-3" aria-label="Grade 3 - Good">
                <span class="grade-number">3</span>
                <span class="grade-label">Good</span>
              </button>
              <button data-testid="grade-button-4" class="grade-button grade-4" aria-label="Grade 4 - Easy">
                <span class="grade-number">4</span>
                <span class="grade-label">Easy</span>
              </button>
              <button data-testid="grade-button-5" class="grade-button grade-5" aria-label="Grade 5 - Perfect">
                <span class="grade-number">5</span>
                <span class="grade-label">Perfect</span>
              </button>
            </div>
          `;
        });

        await expect(page.locator('#test-container')).toHaveScreenshot(`grade-controls-${viewport.name}.png`);
      });
    }

    test('GradeControls disabled state', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      
      await page.goto('/');
      await page.evaluate(() => {
        const container = document.createElement('div');
        container.id = 'test-container';
        document.body.append(container);
        
        container.innerHTML = `
          <div data-testid="grade-controls" class="grade-controls">
            <button data-testid="grade-button-1" class="grade-button grade-1" disabled aria-label="Grade 1 - Again">
              <span class="grade-number">1</span>
              <span class="grade-label">Again</span>
            </button>
            <button data-testid="grade-button-2" class="grade-button grade-2" disabled aria-label="Grade 2 - Hard">
              <span class="grade-number">2</span>
              <span class="grade-label">Hard</span>
            </button>
            <button data-testid="grade-button-3" class="grade-button grade-3" disabled aria-label="Grade 3 - Good">
              <span class="grade-number">3</span>
              <span class="grade-label">Good</span>
            </button>
            <button data-testid="grade-button-4" class="grade-button grade-4" disabled aria-label="Grade 4 - Easy">
              <span class="grade-number">4</span>
              <span class="grade-label">Easy</span>
            </button>
            <button data-testid="grade-button-5" class="grade-button grade-5" disabled aria-label="Grade 5 - Perfect">
              <span class="grade-number">5</span>
              <span class="grade-label">Perfect</span>
            </button>
          </div>
        `;
      });

      await expect(page.locator('#test-container')).toHaveScreenshot('grade-controls-disabled.png');
    });

    test('GradeControls processing state', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      
      await page.goto('/');
      await page.evaluate(() => {
        const container = document.createElement('div');
        container.id = 'test-container';
        document.body.append(container);
        
        container.innerHTML = `
          <div data-testid="grade-controls" class="grade-controls processing">
            <button data-testid="grade-button-1" class="grade-button grade-1" disabled aria-label="Grade 1 - Again">
              <span class="grade-number">1</span>
              <span class="grade-label">Again</span>
            </button>
            <button data-testid="grade-button-2" class="grade-button grade-2" disabled aria-label="Grade 2 - Hard">
              <span class="grade-number">2</span>
              <span class="grade-label">Hard</span>
            </button>
            <button data-testid="grade-button-3" class="grade-button grade-3" disabled aria-label="Grade 3 - Good">
              <span class="grade-number">3</span>
              <span class="grade-label">Good</span>
            </button>
            <button data-testid="grade-button-4" class="grade-button grade-4" disabled aria-label="Grade 4 - Easy">
              <span class="grade-number">4</span>
              <span class="grade-label">Easy</span>
            </button>
            <button data-testid="grade-button-5" class="grade-button grade-5" disabled aria-label="Grade 5 - Perfect">
              <span class="grade-number">5</span>
              <span class="grade-label">Perfect</span>
            </button>
            <div class="processing-indicator">Processing...</div>
          </div>
        `;
      });

      await expect(page.locator('#test-container')).toHaveScreenshot('grade-controls-processing.png');
    });
  });

  test.describe('ProgressIndicator Component Visual Tests', () => {
    for (const viewport of viewports) {
      test(`ProgressIndicator - ${viewport.name} viewport`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        const mockStats = createMockSessionStats();
        
        await page.goto('/');
        await page.evaluate(([mockStats]) => {
          const container = document.createElement('div');
          container.id = 'test-container';
          document.body.append(container);
          
          container.innerHTML = `
            <div data-testid="progress-indicator" class="progress-indicator">
              <div class="progress-header">
                <h3>Session Progress</h3>
                <span class="progress-text">5 / 10 cards</span>
              </div>
              <div data-testid="progress-bar" role="progressbar" aria-valuenow="5" aria-valuemin="0" aria-valuemax="10" class="progress-bar">
                <div class="progress-fill" style="width: 50%"></div>
              </div>
              <div class="progress-stats">
                <div class="stat">
                  <span class="stat-label">Accuracy:</span>
                  <span class="stat-value">85%</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Time:</span>
                  <span class="stat-value">12:34</span>
                </div>
              </div>
            </div>
          `;
        }, [mockStats]);

        await expect(page.locator('#test-container')).toHaveScreenshot(`progress-indicator-${viewport.name}.png`);
      });
    }

    test('ProgressIndicator different progress levels', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      
      const progressLevels = [0, 25, 50, 75, 100];
      
      for (const progress of progressLevels) {
        await page.goto('/');
        await page.evaluate(([progress]) => {
          const container = document.createElement('div');
          container.id = 'test-container';
          document.body.append(container);
          
          container.innerHTML = `
            <div data-testid="progress-indicator" class="progress-indicator">
              <div class="progress-header">
                <h3>Session Progress</h3>
                <span class="progress-text">${Math.round(progress / 10)} / 10 cards</span>
              </div>
              <div data-testid="progress-bar" role="progressbar" aria-valuenow="${progress / 10}" aria-valuemin="0" aria-valuemax="10" class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
              </div>
            </div>
          `;
        }, [progress]);

        await expect(page.locator('#test-container')).toHaveScreenshot(`progress-indicator-${progress}percent.png`);
      }
    });
  });

  test.describe('SessionStats Component Visual Tests', () => {
    for (const viewport of viewports) {
      test(`SessionStats - ${viewport.name} viewport`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        const mockStats = createMockSessionStats();
        
        await page.goto('/');
        await page.evaluate(([mockStats]) => {
          const container = document.createElement('div');
          container.id = 'test-container';
          document.body.append(container);
          
          container.innerHTML = `
            <div data-testid="session-stats" class="session-stats">
              <div class="stats-header">
                <h3>Session Statistics</h3>
                <button data-testid="close-stats" class="close-button" aria-label="Close statistics">×</button>
              </div>
              <div class="stats-content">
                <div class="stats-grid">
                  <div class="stat-card">
                    <h4>Cards Studied</h4>
                    <p class="stat-value">${mockStats.totalCards}</p>
                  </div>
                  <div class="stat-card">
                    <h4>Reviewed Cards</h4>
                    <p class="stat-value">${mockStats.reviewedCards}</p>
                  </div>
                  <div class="stat-card">
                    <h4>Correct Answers</h4>
                    <p class="stat-value">${mockStats.correctAnswers}</p>
                  </div>
                  <div class="stat-card">
                    <h4>Duration</h4>
                    <p class="stat-value">${mockStats.endTime && mockStats.startTime ? Math.floor((mockStats.endTime.getTime() - mockStats.startTime.getTime()) / 1000 / 60) + ':' + (((mockStats.endTime.getTime() - mockStats.startTime.getTime()) / 1000) % 60).toString().padStart(2, '0') : '00:00'}</p>
                  </div>
                </div>
                <div class="grade-distribution">
                  <h4>Grade Distribution</h4>
                  <div class="distribution-chart">
                    <div class="grade-bar grade-1" style="width: ${(mockStats.grades.filter(g => g === 1).length / mockStats.grades.length) * 20}%">
                      <span>1: ${mockStats.grades.filter(g => g === 1).length}</span>
                    </div>
                    <div class="grade-bar grade-2" style="width: ${(mockStats.grades.filter(g => g === 2).length / mockStats.grades.length) * 20}%">
                      <span>2: ${mockStats.grades.filter(g => g === 2).length}</span>
                    </div>
                    <div class="grade-bar grade-3" style="width: ${(mockStats.grades.filter(g => g === 3).length / mockStats.grades.length) * 20}%">
                      <span>3: ${mockStats.grades.filter(g => g === 3).length}</span>
                    </div>
                    <div class="grade-bar grade-4" style="width: ${(mockStats.grades.filter(g => g === 4).length / mockStats.grades.length) * 20}%">
                      <span>4: ${mockStats.grades.filter(g => g === 4).length}</span>
                    </div>
                    <div class="grade-bar grade-5" style="width: ${(mockStats.grades.filter(g => g === 5).length / mockStats.grades.length) * 20}%">
                      <span>5: ${mockStats.grades.filter(g => g === 5).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
        }, [mockStats]);

        await expect(page.locator('#test-container')).toHaveScreenshot(`session-stats-${viewport.name}.png`);
      });
    }
  });

  test.describe('ErrorBoundary Component Visual Tests', () => {
    for (const viewport of viewports) {
      test(`ErrorBoundary - ${viewport.name} viewport`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        await page.goto('/');
        await page.evaluate(() => {
          const container = document.createElement('div');
          container.id = 'test-container';
          document.body.append(container);
          
          container.innerHTML = `
            <div data-testid="error-boundary" class="error-boundary">
              <div class="error-content">
                <div class="error-icon">⚠️</div>
                <h2>Oops! Something went wrong</h2>
                <p data-testid="error-message">An error occurred while loading the flashcard.</p>
                <div class="error-actions">
                  <button data-testid="retry-button" class="retry-button">Try Again</button>
                  <button data-testid="report-button" class="report-button">Report Issue</button>
                </div>
                <details class="error-details">
                  <summary>Technical Details</summary>
                  <pre data-testid="error-stack">Error: Test error
    at Component (component.js:123)
    at render (renderer.js:456)</pre>
                </details>
              </div>
            </div>
          `;
        });

        await expect(page.locator('#test-container')).toHaveScreenshot(`error-boundary-${viewport.name}.png`);
      });
    }
  });

  test.describe('LoadingSpinner Component Visual Tests', () => {
    for (const viewport of viewports) {
      test(`LoadingSpinner - ${viewport.name} viewport`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        await page.goto('/');
        await page.evaluate(() => {
          const container = document.createElement('div');
          container.id = 'test-container';
          document.body.append(container);
          
          container.innerHTML = `
            <div data-testid="loading-spinner" class="loading-spinner">
              <div class="spinner-animation">
                <div class="spinner-circle"></div>
                <div class="spinner-circle"></div>
                <div class="spinner-circle"></div>
              </div>
              <p class="loading-message">Loading vocabulary...</p>
            </div>
          `;
        });

        await expect(page.locator('#test-container')).toHaveScreenshot(`loading-spinner-${viewport.name}.png`);
      });
    }

    test('LoadingSpinner different variants', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      
      const variants = ['spinner', 'dots', 'pulse', 'bars'];
      
      for (const variant of variants) {
        await page.goto('/');
        await page.evaluate(([variant]) => {
          const container = document.createElement('div');
          container.id = 'test-container';
          document.body.append(container);
          
          const variantHTML = {
            spinner: `
              <div class="spinner-animation">
                <div class="spinner-circle"></div>
                <div class="spinner-circle"></div>
                <div class="spinner-circle"></div>
              </div>
            `,
            dots: `
              <div class="dots-animation">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
              </div>
            `,
            pulse: `
              <div class="pulse-animation">
                <div class="pulse-circle"></div>
              </div>
            `,
            bars: `
              <div class="bars-animation">
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
              </div>
            `
          };
          
          container.innerHTML = `
            <div data-testid="loading-spinner" class="loading-spinner">
              ${variantHTML[variant as keyof typeof variantHTML]}
              <p class="loading-message">Loading vocabulary...</p>
            </div>
          `;
        }, [variant]);

        await expect(page.locator('#test-container')).toHaveScreenshot(`loading-spinner-${variant}.png`);
      }
    });
  });

  test.describe('Full Page Visual Tests', () => {
    for (const viewport of viewports) {
      test(`Practice Session Page - ${viewport.name} viewport`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        // Navigate to practice page
        await page.goto('/practice');
        
        // Wait for page to load
        await page.waitForSelector('[data-testid="practice-page"]', { timeout: 10_000 });
        
        // Take full page screenshot
        await expect(page.locator('body')).toHaveScreenshot(`practice-page-${viewport.name}.png`);
      });
    }

    test('Practice Session Page with different states', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      
      // Test loading state
      await page.goto('/practice');
      await page.waitForSelector('[data-testid="loading-spinner"]', { timeout: 5000 });
      await expect(page.locator('body')).toHaveScreenshot('practice-page-loading.png');
      
      // Test loaded state
      await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 5000 });
      await expect(page.locator('body')).toHaveScreenshot('practice-page-loaded.png');
      
      // Test flipped card state
      await page.locator('[data-testid="flashcard-container"]').click();
      await expect(page.locator('body')).toHaveScreenshot('practice-page-flipped.png');
      
      // Test stats visible
      await page.locator('[data-testid="session-stats-toggle"]').click();
      await expect(page.locator('body')).toHaveScreenshot('practice-page-stats.png');
    });
  });

  test.describe('Theme Visual Tests', () => {
    for (const theme of themes) {
      test(`Theme - ${theme} mode`, async ({ page }) => {
        await page.setViewportSize({ width: 1200, height: 800 });
        
        // Set theme
        await page.goto('/practice');
        await page.evaluate(([theme]) => {
          document.documentElement.dataset.theme = theme;
          if (theme === 'dark') {
            document.body.classList.add('dark-theme');
          }
        }, [theme]);
        
        await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 5000 });
        
        await expect(page.locator('body')).toHaveScreenshot(`practice-page-${theme}-theme.png`);
      });
    }
  });

  test.describe('Responsive Design Tests', () => {
    const responsiveViewports = [
      { name: 'small-mobile', width: 320, height: 568 },
      { name: 'mobile', width: 375, height: 667 },
      { name: 'large-mobile', width: 414, height: 896 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'small-desktop', width: 1024, height: 768 },
      { name: 'desktop', width: 1200, height: 800 },
      { name: 'large-desktop', width: 1440, height: 900 }
    ];

    for (const viewport of responsiveViewports) {
      test(`Responsive Design - ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        await page.goto('/practice');
        await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 10_000 });
        
        await expect(page.locator('body')).toHaveScreenshot(`responsive-${viewport.name}.png`);
      });
    }
  });

  test.describe('Interaction State Visual Tests', () => {
    test('Hover states', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      
      await page.goto('/practice');
      await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 5000 });
      
      // Hover over flashcard
      await page.locator('[data-testid="flashcard-container"]').hover();
      await expect(page.locator('body')).toHaveScreenshot('hover-flashcard.png');
      
      // Hover over grade buttons
      await page.locator('[data-testid="grade-button-3"]').hover();
      await expect(page.locator('body')).toHaveScreenshot('hover-grade-button.png');
    });

    test('Focus states', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      
      await page.goto('/practice');
      await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 5000 });
      
      // Focus flashcard
      await page.locator('[data-testid="flashcard-container"]').focus();
      await expect(page.locator('body')).toHaveScreenshot('focus-flashcard.png');
      
      // Focus grade button
      await page.locator('[data-testid="grade-button-3"]').focus();
      await expect(page.locator('body')).toHaveScreenshot('focus-grade-button.png');
    });

    test('Active states', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      
      await page.goto('/practice');
      await page.waitForSelector('[data-testid="flashcard-container"]', { timeout: 5000 });
      
      // Press and hold grade button
      await page.locator('[data-testid="grade-button-3"]').dispatchEvent('mousedown');
      await expect(page.locator('body')).toHaveScreenshot('active-grade-button.png');
      
      // Release
      await page.locator('[data-testid="grade-button-3"]').dispatchEvent('mouseup');
    });
  });
});