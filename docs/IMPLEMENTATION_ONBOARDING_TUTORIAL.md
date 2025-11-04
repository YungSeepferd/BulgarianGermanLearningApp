# Implementation Guide: Onboarding Tutorial Feature

## Overview

Create an interactive guided tour that walks new users through the app's key features (vocabulary, practice, spaced repetition, language toggle). This improves first-time user experience and reduces learning curve.

**Estimated Effort**: 2 days
**Priority**: HIGH (Critical for user retention)
**Dependencies**: None (vanilla JS)

---

## Feature Requirements

### Functionality
1. **Guided Tour**: Step-by-step walkthrough of core features
2. **Smart Detection**: Show only once on first visit
3. **Skip Option**: Allow users to exit tutorial anytime
4. **Resume**: Remember user progress if they pause
5. **Interactive Highlighting**: Highlight relevant UI elements
6. **Responsive**: Works on mobile and desktop
7. **Accessibility**: Full keyboard navigation support

---

## Implementation Steps

### Step 1: Create Onboarding Manager Module

**File**: `assets/js/modules/onboarding-manager.js`

```javascript
/**
 * Onboarding Tutorial Manager
 * Handles guided tour for new users
 */

class OnboardingManager {
  constructor(options = {}) {
    this.STORAGE_KEY = 'bgde:onboarding';
    this.currentStep = 0;
    this.isActive = false;
    this.steps = options.steps || this.getDefaultSteps();
    this.callbacks = options.callbacks || {};
    
    this.initializeState();
  }

  /**
   * Initialize onboarding state
   */
  initializeState() {
    const saved = this.getSavedState();
    if (!saved) {
      const state = {
        completed: false,
        currentStep: 0,
        startedAt: new Date().toISOString(),
        skipped: false,
        dismissedAt: null
      };
      this.saveState(state);
    }
  }

  /**
   * Get saved onboarding state
   */
  getSavedState() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  }

  /**
   * Save onboarding state
   */
  saveState(state) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
  }

  /**
   * Should show onboarding?
   */
  shouldShowOnboarding() {
    const state = this.getSavedState();
    if (!state) return true;
    return !state.completed && !state.skipped;
  }

  /**
   * Start onboarding tour
   */
  startTour() {
    this.isActive = true;
    this.currentStep = 0;
    const state = this.getSavedState();
    state.currentStep = 0;
    this.saveState(state);

    if (this.callbacks.onStart) {
      this.callbacks.onStart();
    }

    this.showStep(0);
  }

  /**
   * Show specific step
   */
  showStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= this.steps.length) {
      this.completeTour();
      return;
    }

    this.currentStep = stepIndex;
    const step = this.steps[stepIndex];

    if (this.callbacks.onStepStart) {
      this.callbacks.onStepStart(step, stepIndex);
    }

    // Update saved state
    const state = this.getSavedState();
    state.currentStep = stepIndex;
    this.saveState(state);
  }

  /**
   * Next step
   */
  nextStep() {
    this.showStep(this.currentStep + 1);
  }

  /**
   * Previous step
   */
  previousStep() {
    if (this.currentStep > 0) {
      this.showStep(this.currentStep - 1);
    }
  }

  /**
   * Skip tour
   */
  skipTour() {
    const state = this.getSavedState();
    state.skipped = true;
    state.dismissedAt = new Date().toISOString();
    this.saveState(state);
    this.isActive = false;

    if (this.callbacks.onSkip) {
      this.callbacks.onSkip();
    }
  }

  /**
   * Complete tour
   */
  completeTour() {
    const state = this.getSavedState();
    state.completed = true;
    state.completedAt = new Date().toISOString();
    this.saveState(state);
    this.isActive = false;

    if (this.callbacks.onComplete) {
      this.callbacks.onComplete();
    }
  }

  /**
   * Reset onboarding (for testing or user request)
   */
  reset() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.initializeState();
  }

  /**
   * Get default tutorial steps
   */
  getDefaultSteps() {
    return [
      {
        id: 'welcome',
        title: 'Welcome to Bulgarian-German Learning App',
        description: 'Let\'s take a quick tour to help you get started!',
        position: 'center',
        actions: [
          { text: 'Next', action: 'next' },
          { text: 'Skip Tour', action: 'skip' }
        ]
      },
      {
        id: 'vocabulary',
        title: 'Browse Vocabulary',
        description: 'Click here to explore 750+ vocabulary items organized by level and category.',
        target: 'a[href*="/vocabulary/"]',
        position: 'bottom',
        highlight: true,
        actions: [
          { text: 'Previous', action: 'previous' },
          { text: 'Next', action: 'next' }
        ]
      },
      {
        id: 'practice',
        title: 'Practice with Flashcards',
        description: 'Start a practice session to reinforce your learning with spaced repetition.',
        target: 'a[href*="/practice/"]',
        position: 'bottom',
        highlight: true,
        actions: [
          { text: 'Previous', action: 'previous' },
          { text: 'Next', action: 'next' }
        ]
      },
      {
        id: 'language-toggle',
        title: 'Language Direction Toggle',
        description: 'Switch between learning German→Bulgarian or Bulgarian→German with this button.',
        target: 'button[aria-label*="learning direction"], [data-language-toggle]',
        position: 'bottom',
        highlight: true,
        actions: [
          { text: 'Previous', action: 'previous' },
          { text: 'Next', action: 'next' }
        ]
      },
      {
        id: 'spaced-repetition',
        title: 'Spaced Repetition System',
        description: 'Our SM-2 algorithm optimizes review intervals. Grade each card (0-5) to personalize your learning schedule.',
        position: 'center',
        actions: [
          { text: 'Previous', action: 'previous' },
          { text: 'Complete Tour', action: 'complete' }
        ]
      }
    ];
  }
}

export default OnboardingManager;
```

### Step 2: Create Onboarding UI Component

**File**: `assets/js/modules/onboarding-ui.js`

```javascript
/**
 * Onboarding UI Component
 * Renders guided tour interface
 */

import OnboardingManager from './onboarding-manager.js';

class OnboardingUI {
  constructor(options = {}) {
    this.manager = new OnboardingManager({
      ...options,
      callbacks: {
        onStepStart: (step, index) => this.renderStep(step, index),
        onComplete: () => this.handleComplete(),
        onSkip: () => this.handleSkip(),
        ...options.callbacks
      }
    });

    this.tourOverlay = null;
    this.tourPopover = null;
  }

  /**
   * Initialize and start tour if applicable
   */
  init() {
    if (this.manager.shouldShowOnboarding()) {
      // Wait for DOM to fully load
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.manager.startTour());
      } else {
        this.manager.startTour();
      }
    }
  }

  /**
   * Render a tutorial step
   */
  renderStep(step, stepIndex) {
    this.clearTour();

    // Create overlay
    this.createOverlay();

    // Create popover
    this.createPopover(step, stepIndex);

    // Highlight target element if specified
    if (step.target) {
      this.highlightTarget(step.target);
    }

    // Setup keyboard navigation
    this.setupKeyboardNavigation();

    // Call custom renderer if provided
    if (window.OnboardingCustomRenderer?.[step.id]) {
      window.OnboardingCustomRenderer[step.id](step);
    }
  }

  /**
   * Create overlay
   */
  createOverlay() {
    this.tourOverlay = document.createElement('div');
    this.tourOverlay.className = 'onboarding-overlay';
    this.tourOverlay.setAttribute('role', 'presentation');
    document.body.appendChild(this.tourOverlay);

    this.tourOverlay.addEventListener('click', () => {
      // Clicking overlay skips tour
      // Alternatively, could be no-op
    });
  }

  /**
   * Create popover with step content
   */
  createPopover(step, stepIndex) {
    this.tourPopover = document.createElement('div');
    this.tourPopover.className = `onboarding-popover onboarding-${step.position}`;
    this.tourPopover.setAttribute('role', 'dialog');
    this.tourPopover.setAttribute('aria-label', `Tutorial step ${stepIndex + 1}`);

    // Build HTML
    let html = `
      <div class="popover-header">
        <h3 class="popover-title">${step.title}</h3>
        <button class="popover-close" aria-label="Close tutorial">×</button>
      </div>
      
      <div class="popover-content">
        <p>${step.description}</p>
      </div>

      <div class="popover-progress">
        <span class="progress-text">Step ${stepIndex + 1} of ${this.manager.steps.length}</span>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${((stepIndex + 1) / this.manager.steps.length) * 100}%"></div>
        </div>
      </div>

      <div class="popover-actions">
    `;

    step.actions.forEach(action => {
      html += `<button class="popover-btn popover-btn-${action.action}" data-action="${action.action}">${action.text}</button>`;
    });

    html += '</div>';

    this.tourPopover.innerHTML = html;
    document.body.appendChild(this.tourPopover);

    // Position popover
    this.positionPopover(step);

    // Attach event listeners
    this.attachPopoverListeners();
  }

  /**
   * Position popover relative to target or viewport
   */
  positionPopover(step) {
    if (!step.target) {
      // Center on screen
      this.tourPopover.style.position = 'fixed';
      this.tourPopover.style.top = '50%';
      this.tourPopover.style.left = '50%';
      this.tourPopover.style.transform = 'translate(-50%, -50%)';
      return;
    }

    const target = document.querySelector(step.target);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const popoverRect = this.tourPopover.getBoundingClientRect();

    const positions = {
      top: {
        top: rect.top - popoverRect.height - 20,
        left: rect.left + rect.width / 2 - popoverRect.width / 2
      },
      bottom: {
        top: rect.bottom + 20,
        left: rect.left + rect.width / 2 - popoverRect.width / 2
      },
      left: {
        top: rect.top + rect.height / 2 - popoverRect.height / 2,
        left: rect.left - popoverRect.width - 20
      },
      right: {
        top: rect.top + rect.height / 2 - popoverRect.height / 2,
        left: rect.right + 20
      }
    };

    const position = positions[step.position] || positions.bottom;
    this.tourPopover.style.position = 'fixed';
    this.tourPopover.style.top = `${Math.max(10, position.top)}px`;
    this.tourPopover.style.left = `${Math.max(10, Math.min(position.left, window.innerWidth - popoverRect.width - 10))}px`;
  }

  /**
   * Highlight target element
   */
  highlightTarget(selector) {
    const target = document.querySelector(selector);
    if (!target) return;

    // Create highlight box
    const highlight = document.createElement('div');
    highlight.className = 'onboarding-highlight';
    highlight.setAttribute('role', 'presentation');
    
    const rect = target.getBoundingClientRect();
    highlight.style.position = 'fixed';
    highlight.style.top = `${rect.top - 5}px`;
    highlight.style.left = `${rect.left - 5}px`;
    highlight.style.width = `${rect.width + 10}px`;
    highlight.style.height = `${rect.height + 10}px`;
    
    document.body.appendChild(highlight);

    // Make target accessible during tour
    target.setAttribute('data-onboarding-highlight', 'true');
    target.style.position = 'relative';
    target.style.zIndex = '10001';
  }

  /**
   * Attach popover event listeners
   */
  attachPopoverListeners() {
    const closeBtn = this.tourPopover.querySelector('.popover-close');
    closeBtn?.addEventListener('click', () => this.manager.skipTour());

    const actionBtns = this.tourPopover.querySelectorAll('[data-action]');
    actionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        switch (action) {
          case 'next':
            this.manager.nextStep();
            break;
          case 'previous':
            this.manager.previousStep();
            break;
          case 'skip':
            this.manager.skipTour();
            break;
          case 'complete':
            this.manager.completeTour();
            break;
        }
      });
    });
  }

  /**
   * Setup keyboard navigation
   */
  setupKeyboardNavigation() {
    const handler = (e) => {
      if (e.key === 'ArrowRight') {
        this.manager.nextStep();
      } else if (e.key === 'ArrowLeft') {
        this.manager.previousStep();
      } else if (e.key === 'Escape') {
        this.manager.skipTour();
      }
    };

    document.addEventListener('keydown', handler);
    this.currentKeyHandler = handler;
  }

  /**
   * Clear tour elements
   */
  clearTour() {
    // Remove overlay
    this.tourOverlay?.remove();
    this.tourOverlay = null;

    // Remove popover
    this.tourPopover?.remove();
    this.tourPopover = null;

    // Remove highlights
    document.querySelectorAll('.onboarding-highlight').forEach(el => el.remove());
    document.querySelectorAll('[data-onboarding-highlight]').forEach(el => {
      el.removeAttribute('data-onboarding-highlight');
      el.style.zIndex = '';
      el.style.position = '';
    });

    // Remove keyboard handler
    if (this.currentKeyHandler) {
      document.removeEventListener('keydown', this.currentKeyHandler);
      this.currentKeyHandler = null;
    }
  }

  /**
   * Handle tour completion
   */
  handleComplete() {
    this.clearTour();
    this.showCompletionMessage();
  }

  /**
   * Handle tour skip
   */
  handleSkip() {
    this.clearTour();
    // Optionally show option to restart tour
  }

  /**
   * Show completion message
   */
  showCompletionMessage() {
    const message = document.createElement('div');
    message.className = 'onboarding-completion';
    message.innerHTML = `
      <div class="completion-content">
        <h3>🎉 Great! You're all set!</h3>
        <p>You're ready to start learning. Happy studying!</p>
        <button class="completion-btn">Get Started</button>
      </div>
    `;

    document.body.appendChild(message);

    message.querySelector('.completion-btn').addEventListener('click', () => {
      message.remove();
    });

    setTimeout(() => message.remove(), 5000);
  }

  /**
   * Show restart tutorial option
   */
  showRestartOption() {
    const btn = document.createElement('button');
    btn.className = 'restart-tour-btn';
    btn.innerHTML = '? Start Tour';
    btn.title = 'Click to restart the tutorial';
    btn.addEventListener('click', () => {
      this.manager.reset();
      this.manager.startTour();
    });

    return btn;
  }
}

export default OnboardingUI;
```

### Step 3: Add CSS Styling

**File**: `assets/scss/components/_onboarding.scss`

```scss
// Overlay
.onboarding-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9998;
  animation: fade-in 0.3s ease;
}

// Highlight box
.onboarding-highlight {
  border: 3px solid #667eea;
  border-radius: 8px;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
  z-index: 10000;
  animation: pulse-border 2s infinite;
}

// Popover
.onboarding-popover {
  position: fixed;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  z-index: 10001;
  animation: slide-in 0.3s ease;

  .popover-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #e9ecef;

    .popover-title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
    }

    .popover-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #999;
      padding: 0;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: #333;
      }
    }
  }

  .popover-content {
    padding: 1rem;
    color: #666;
    font-size: 0.95rem;
    line-height: 1.5;

    p {
      margin: 0;
    }
  }

  .popover-progress {
    padding: 1rem;
    border-top: 1px solid #e9ecef;

    .progress-text {
      display: block;
      font-size: 0.85rem;
      color: #999;
      margin-bottom: 0.5rem;
      text-align: center;
    }

    .progress-bar {
      width: 100%;
      height: 4px;
      background: #e9ecef;
      border-radius: 2px;
      overflow: hidden;

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        transition: width 0.3s ease;
      }
    }
  }

  .popover-actions {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    border-top: 1px solid #e9ecef;

    .popover-btn {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.9rem;

      &.popover-btn-next,
      &.popover-btn-complete {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
      }

      &.popover-btn-previous,
      &.popover-btn-skip {
        background: #f0f0f0;
        color: #333;

        &:hover {
          background: #e0e0e0;
        }
      }
    }
  }
}

// Completion message
.onboarding-completion {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10002;
  animation: slide-up 0.3s ease;

  .completion-content {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    text-align: center;

    h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.3rem;
      color: #333;
    }

    p {
      margin: 0 0 1rem 0;
      color: #666;
    }

    .completion-btn {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }
    }
  }
}

// Restart button
.restart-tour-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 0.75rem 1.5rem;
  background: #f0f0f0;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  z-index: 100;
  transition: all 0.2s ease;

  &:hover {
    background: white;
    border-color: #667eea;
    color: #667eea;
  }
}

// Animations
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes pulse-border {
  0%, 100% {
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(102, 126, 234, 0.1);
  }
}

// Mobile responsive
@media (max-width: 640px) {
  .onboarding-popover {
    max-width: calc(100vw - 2rem);
    margin: 0 1rem;

    .popover-actions {
      flex-direction: column;

      .popover-btn {
        width: 100%;
      }
    }
  }

  .restart-tour-btn {
    bottom: 1rem;
    right: 1rem;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}
```

### Step 4: Integration with App

**In `layouts/partials/header.html` or main template**:

```html
<script type="module">
  import OnboardingUI from '/BulgarianGermanLearningApp/js/modules/onboarding-ui.js';
  
  // Initialize onboarding on page load
  const onboarding = new OnboardingUI();
  onboarding.init();

  // Make restart option available
  window.restartTutorial = () => {
    const manager = onboarding.manager;
    manager.reset();
    manager.startTour();
  };
</script>
```

---

## Testing Strategy

### Manual Tests
- [ ] First visit shows tutorial automatically
- [ ] All steps display correctly
- [ ] Target highlighting works
- [ ] Keyboard navigation (arrows, escape)
- [ ] Skip button works
- [ ] Complete button marks tour as done
- [ ] Reset properly resets state
- [ ] Mobile responsive on all sizes
- [ ] Accessibility with screen reader

### Edge Cases
- [ ] Tour restarts if requested
- [ ] Multiple visits don't show tutorial
- [ ] Tour survives page navigation
- [ ] Handles missing target elements gracefully

---

## Deployment Checklist

- [ ] Add onboarding-manager.js
- [ ] Add onboarding-ui.js
- [ ] Add _onboarding.scss
- [ ] Import in main.scss
- [ ] Add initialization script to header
- [ ] Test on fresh browser (no localStorage)
- [ ] Verify localStorage persistence
- [ ] Test keyboard navigation
- [ ] Test on mobile
- [ ] Verify accessibility compliance

---

## Future Enhancements

1. **Contextual Tours**: Different tours for different user segments
2. **Video Tutorials**: Embedded video explanations
3. **Interactive Elements**: Click-through guided steps
4. **Analytics**: Track which steps users skip/complete
5. **Translations**: Multi-language tutorial content
6. **Smart Restart**: Show tips for power users
