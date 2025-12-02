/**
 * Onboarding System for Bulgarian-German Learning App
 * Provides first-time user experience for Vincent (DE) and Ida (BG)
 */

const ONBOARDING_STORAGE_KEY = 'bgde:onboarding-completed';
const ONBOARDING_VERSION = '1.0';

type Language = 'de' | 'bg';
type LearningGoal = 'travel' | 'work' | 'family' | 'personal';

interface Step {
  id: string;
  title: {
    de: string;
    bg: string;
  };
  content?: {
    de: string;
    bg: string;
  };
  options?: Array<{
    value: string;
    label?: string;
    secondary?: string;
    icon?: string;
    bilingualLabel?: {
      de: string;
      bg: string;
    };
  }>;
  visual?: string;
}

interface UserData {
  nativeLanguage: Language | null;
  learningGoal: LearningGoal | null;
  hasCompleted: boolean;
}

interface OnboardingStorage {
  version: string;
  completed: boolean;
  nativeLanguage: Language | null;
  learningGoal: LearningGoal | null;
  completedAt: string;
}

interface LanguageToggle {
  setDirection(direction: string): void;
}

class OnboardingFlow {
  private currentStep = 0;
  private userData: UserData = {
    nativeLanguage: null,
    learningGoal: null,
    hasCompleted: false
  };
  
  private steps: Step[] = [
    {
      id: 'welcome',
      title: {
        de: 'Willkommen!',
        bg: 'Добре дошли!'
      },
      content: {
        de: 'Lernen Sie Bulgarisch mit intelligentem Wiederholungssystem',
        bg: 'Научете немски с интелигентна система за повторение'
      }
    },
    {
      id: 'language-selection',
      title: {
        de: 'Welche Sprache sprechen Sie?',
        bg: 'Кой език говорите?'
      },
      options: [
        { value: 'de', label: '🇩🇪 Deutsch', secondary: 'German' },
        { value: 'bg', label: '🇧🇬 Български', secondary: 'Bulgarian' }
      ]
    },
    {
      id: 'learning-goal',
      title: {
        de: 'Warum lernen Sie?',
        bg: 'Защо учите?'
      },
      options: [
        { value: 'travel', icon: '✈️', bilingualLabel: { de: 'Reisen', bg: 'Пътуване' } },
        { value: 'work', icon: '💼', bilingualLabel: { de: 'Arbeit', bg: 'Работа' } },
        { value: 'family', icon: '👨‍👩‍👧', bilingualLabel: { de: 'Familie', bg: 'Семейство' } },
        { value: 'personal', icon: '📚', bilingualLabel: { de: 'Persönliches Interesse', bg: 'Личен интерес' } }
      ]
    },
    {
      id: 'tutorial-flashcards',
      title: {
        de: 'Wie Lernkarten funktionieren',
        bg: 'Как работят флашкартите'
      },
      content: {
        de: 'Sie sehen ein Wort und versuchen, die Übersetzung zu erraten. Klicken Sie dann, um die Antwort zu sehen.',
        bg: 'Виждате дума и се опитвате да познаете превода. След това кликнете, за да видите отговора.'
      },
      visual: 'flashcard-demo'
    },
    {
      id: 'tutorial-grading',
      title: {
        de: 'Bewerten Sie Ihr Wissen',
        bg: 'Оценете знанията си'
      },
      content: {
        de: 'Nach dem Anzeigen der Antwort bewerten Sie, wie gut Sie sie kannten. Das System passt sich Ihrem Lerntempo an.',
        bg: 'След показване на отговора оценете колко добре го познавахте. Системата се адаптира към вашето темпо на обучение.'
      },
      visual: 'grading-demo'
    },
    {
      id: 'tutorial-spaced-repetition',
      title: {
        de: 'Intelligente Wiederholung',
        bg: 'Интелигентно повторение'
      },
      content: {
        de: 'Wörter, die Sie gut kennen, werden seltener wiederholt. Schwierige Wörter erscheinen häufiger.',
        bg: 'Думи, които познавате добре, се повтарят по-рядко. Трудни думи се появяват по-често.'
      },
      visual: 'spaced-repetition-demo'
    },
    {
      id: 'ready',
      title: {
        de: 'Bereit loszulegen!',
        bg: 'Готови да започнете!'
      },
      content: {
        de: 'Starten Sie Ihre erste Übungssitzung mit 5 Wörtern.',
        bg: 'Започнете вашата първа сесия с 5 думи.'
      }
    }
  ];
  
  constructor() {
    this.init();
  }
  
  init(): void {
    // DON'T auto-show onboarding - let user trigger it manually
    // Check if help button exists and attach click handler
    this.attachHelpButtonHandler();
    
    console.log('[Onboarding] Onboarding ready (manual trigger only)');
  }
  
  private attachHelpButtonHandler(): void {
    // Wait for DOM to be fully loaded
    const helpButton = document.querySelector('#onboarding-help-btn');
    if (helpButton) {
      helpButton.addEventListener('click', () => {
        console.log('[Onboarding] Starting onboarding flow (user triggered)');
        this.showOnboarding();
      });
    }
  }
  
  // Public method to manually trigger onboarding
  startOnboarding(): void {
    console.log('[Onboarding] Starting onboarding flow (programmatic)');
    this.showOnboarding();
  }
  
  hasCompletedOnboarding(): boolean {
    try {
      const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (stored) {
        const data: OnboardingStorage = JSON.parse(stored);
        return data.version === ONBOARDING_VERSION && data.completed === true;
      }
    } catch (error) {
      console.warn('[Onboarding] Error checking completion status:', error);
    }
    return false;
  }
  
  shouldShowOnboarding(): boolean {
    // Show on homepage or practice page for new users
    const path = window.location.pathname;
    const isHomepage = path === '/' || path.includes('/index.html');
    const isPracticePage = path.includes('/practice/');
    
    return isHomepage || isPracticePage;
  }
  
  private showOnboarding(): void {
    this.createModal();
    this.renderStep();
  }
  
  private createModal(): void {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'onboarding-overlay';
    overlay.className = 'onboarding-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'onboarding-title');
    
    const modal = document.createElement('div');
    modal.className = 'onboarding-modal';
    modal.innerHTML = `
      <div class="onboarding-header">
        <h2 id="onboarding-title" class="onboarding-title"></h2>
        <button class="onboarding-skip" aria-label="Skip onboarding">
          <span aria-hidden="true">×</span>
          <span class="sr-only">Skip / Пропусни</span>
        </button>
      </div>
      <div class="onboarding-content" id="onboarding-content"></div>
      <div class="onboarding-footer">
        <div class="onboarding-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${this.steps.length}" aria-valuenow="1">
          <div class="onboarding-progress-bar" id="onboarding-progress-bar"></div>
          <span class="onboarding-progress-text" id="onboarding-progress-text">1 / ${this.steps.length}</span>
        </div>
        <div class="onboarding-actions">
          <button class="onboarding-back btn-secondary" id="onboarding-back" style="display: none;">
            <span class="btn-text">← Zurück / Назад</span>
          </button>
          <button class="onboarding-next btn-primary" id="onboarding-next">
            <span class="btn-text">Weiter / Напред →</span>
          </button>
        </div>
      </div>
    `;
    
    overlay.append(modal);
    document.body.append(overlay);
    
    // Bind events
    overlay.querySelector('.onboarding-skip')?.addEventListener('click', () => this.skipOnboarding());
    overlay.querySelector('#onboarding-back')?.addEventListener('click', () => this.previousStep());
    overlay.querySelector('#onboarding-next')?.addEventListener('click', () => this.nextStep());
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
    
    // Announce to screen readers
    this.announceToScreenReader('Onboarding started. Welcome screen.');
  }
  
  private renderStep(): void {
    const step = this.steps[this.currentStep];
    const title = document.querySelector('#onboarding-title');
    const content = document.querySelector('#onboarding-content');
    const backBtn = document.querySelector('#onboarding-back');
    const nextBtn = document.querySelector('#onboarding-next');
    const progressBar = document.querySelector('#onboarding-progress-bar');
    const progressText = document.querySelector('#onboarding-progress-text');
    
    // Update progress
    const progress = ((this.currentStep + 1) / this.steps.length) * 100;
    (progressBar as HTMLElement).style.width = `${progress}%`;
    progressText!.textContent = `${this.currentStep + 1} / ${this.steps.length}`;
    
    // Update back button visibility
    (backBtn as HTMLElement).style.display = this.currentStep > 0 ? 'block' : 'none';
    
    // Update next button text for last step
    if (this.currentStep === this.steps.length - 1) {
      nextBtn!.querySelector('.btn-text')!.textContent = 'Los geht\'s! / Да започнем!';
      nextBtn!.classList.add('btn-success');
    } else {
      nextBtn!.querySelector('.btn-text')!.textContent = 'Weiter / Напред →';
      nextBtn!.classList.remove('btn-success');
    }
    
    // Render step content based on type
    if (!step) return;
    switch (step.id) {
    case 'welcome': {
      if (step) this.renderWelcomeStep(title!, content!, step);
      break;
    }
    case 'language-selection': {
      if (step) this.renderLanguageSelectionStep(title!, content!, step);
      break;
    }
    case 'learning-goal': {
      if (step) this.renderLearningGoalStep(title!, content!, step);
      break;
    }
    case 'tutorial-flashcards':
    case 'tutorial-grading':
    case 'tutorial-spaced-repetition': {
      if (step) this.renderTutorialStep(title!, content!, step);
      break;
    }
    case 'ready': {
      if (step) this.renderReadyStep(title!, content!, step);
      break;
    }
    }
    
    // Announce step to screen readers
    const lang = this.userData.nativeLanguage || 'de';
    if (step) this.announceToScreenReader(`Step ${this.currentStep + 1} of ${this.steps.length}: ${step.title[lang as Language]}`);
  }
  
  private renderWelcomeStep(title: Element, content: Element, step: Step): void {
    title.innerHTML = `
      <span lang="de">${step.title.de}</span> / 
      <span lang="bg">${step.title.bg}</span>
    `;
    
    content.innerHTML = `
      <div class="onboarding-welcome">
        <div class="welcome-icon">🎓</div>
        <p lang="de" class="welcome-text">${step.content?.de}</p>
        <p lang="bg" class="welcome-text">${step.content?.bg}</p>
        <div class="welcome-features">
          <div class="feature-item">
            <span class="feature-icon">🧠</span>
            <span lang="de">Intelligentes Lernen</span> / <span lang="bg">Интелигентно обучение</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">↔️</span>
            <span lang="de">Beide Richtungen</span> / <span lang="bg">В двете посоки</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📱</span>
            <span lang="de">Überall lernen</span> / <span lang="bg">Учете навсякъде</span>
          </div>
        </div>
      </div>
    `;
  }
  
  private renderLanguageSelectionStep(title: Element, content: Element, step: Step): void {
    const bilingual = !this.userData.nativeLanguage;
    
    title.innerHTML = bilingual 
      ? `<span lang="de">${step.title.de}</span> / <span lang="bg">${step.title.bg}</span>`
      : `<span lang="${this.userData.nativeLanguage}">${step.title[this.userData.nativeLanguage as Language]}</span>`;
    
    content.innerHTML = `
      <div class="onboarding-language-selection">
        ${step.options?.map(option => `
          <button class="language-option ${this.userData.nativeLanguage === option.value ? 'selected' : ''}" 
                  data-language="${option.value}"
                  aria-pressed="${this.userData.nativeLanguage === option.value}">
            <span class="option-label">${option.label}</span>
            <span class="option-secondary">${option.secondary}</span>
            ${this.userData.nativeLanguage === option.value ? '<span class="option-check">✓</span>' : ''}
          </button>
        `).join('') || ''}
      </div>
    `;
    
    // Bind selection events
    for (const btn of content.querySelectorAll('.language-option')) {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const lang = target.dataset.language as Language;
        this.userData.nativeLanguage = lang;
        
        // Update UI
        for (const b of content.querySelectorAll('.language-option')) {
          b.classList.remove('selected');
          b.setAttribute('aria-pressed', 'false');
          b.querySelector('.option-check')?.remove();
        }
        target.classList.add('selected');
        target.setAttribute('aria-pressed', 'true');
        target.innerHTML += '<span class="option-check">✓</span>';
        
        // Set language direction in language toggle
        const languageToggle = (window as unknown as { languageToggle?: LanguageToggle }).languageToggle;
        if (languageToggle) {
          const direction = lang === 'de' ? 'de-bg' : 'bg-de';
          languageToggle.setDirection(direction);
        }
        
        this.announceToScreenReader(`Selected ${lang === 'de' ? 'German' : 'Bulgarian'}`);
      });
    }
  }
  
  private renderLearningGoalStep(title: Element, content: Element, step: Step): void {
    const lang = this.userData.nativeLanguage || 'de';
    title.textContent = step.title[lang as Language];
    
    content.innerHTML = `
      <div class="onboarding-learning-goal">
        ${step.options?.map(option => `
          <button class="goal-option ${this.userData.learningGoal === option.value ? 'selected' : ''}" 
                  data-goal="${option.value}"
                  aria-pressed="${this.userData.learningGoal === option.value}">
            <span class="goal-icon" aria-hidden="true">${option.icon}</span>
            <span class="goal-label">${option.bilingualLabel?.[lang as Language] || option.label}</span>
            ${this.userData.learningGoal === option.value ? '<span class="option-check">✓</span>' : ''}
          </button>
        `).join('') || ''}
      </div>
    `;
    
    // Bind selection events
    for (const btn of content.querySelectorAll('.goal-option')) {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const goal = target.dataset.goal as LearningGoal;
        this.userData.learningGoal = goal;
        
        // Update UI
        for (const b of content.querySelectorAll('.goal-option')) {
          b.classList.remove('selected');
          b.setAttribute('aria-pressed', 'false');
          b.querySelector('.option-check')?.remove();
        }
        target.classList.add('selected');
        target.setAttribute('aria-pressed', 'true');
        target.innerHTML += '<span class="option-check">✓</span>';
        
        this.announceToScreenReader(`Selected ${goal}`);
      });
    }
  }
  
  private renderTutorialStep(title: Element, content: Element, step: Step): void {
    const lang = this.userData.nativeLanguage || 'de';
    title.textContent = step.title[lang as Language];
    
    let visualContent = '';
    switch (step.visual) {
    case 'flashcard-demo': {
      visualContent = `
        <div class="tutorial-visual flashcard-demo">
          <div class="demo-flashcard">
            <div class="demo-card-front">
              <span class="demo-word">${lang === 'de' ? 'Здравей' : 'Hallo'}</span>
              <span class="demo-level">A1</span>
            </div>
            <div class="demo-card-back" style="display: none;">
              <span class="demo-translation">${lang === 'de' ? 'Hallo' : 'Здравей'}</span>
            </div>
          </div>
          <button class="demo-flip-btn">
            ${lang === 'de' ? 'Antwort zeigen' : 'Покажи отговора'}
          </button>
        </div>
      `;
    
      break;
    }
    case 'grading-demo': {
      visualContent = `
        <div class="tutorial-visual grading-demo">
          <div class="demo-grade-buttons">
            <button class="demo-grade demo-grade-wrong">
              <span class="grade-emoji">❌</span>
              <span class="grade-label">${lang === 'de' ? 'Falsch' : 'Грешно'}</span>
            </button>
            <button class="demo-grade demo-grade-hard">
              <span class="grade-emoji">🤔</span>
              <span class="grade-label">${lang === 'de' ? 'Schwer' : 'Трудно'}</span>
            </button>
            <button class="demo-grade demo-grade-good">
              <span class="grade-emoji">👍</span>
              <span class="grade-label">${lang === 'de' ? 'Gut' : 'Добре'}</span>
            </button>
            <button class="demo-grade demo-grade-easy">
              <span class="grade-emoji">😊</span>
              <span class="grade-label">${lang === 'de' ? 'Leicht' : 'Лесно'}</span>
            </button>
          </div>
        </div>
      `;
    
      break;
    }
    case 'spaced-repetition-demo': {
      visualContent = `
        <div class="tutorial-visual spaced-repetition-demo">
          <div class="demo-timeline">
            <div class="demo-timeline-item">
              <div class="demo-timeline-dot demo-dot-today"></div>
              <span class="demo-timeline-label">${lang === 'de' ? 'Heute' : 'Днес'}</span>
            </div>
            <div class="demo-timeline-item">
              <div class="demo-timeline-dot demo-dot-tomorrow"></div>
              <span class="demo-timeline-label">${lang === 'de' ? 'Morgen' : 'Утре'}</span>
            </div>
            <div class="demo-timeline-item">
              <div class="demo-timeline-dot demo-dot-week"></div>
              <span class="demo-timeline-label">${lang === 'de' ? '1 Woche' : '1 седмица'}</span>
            </div>
            <div class="demo-timeline-item">
              <div class="demo-timeline-dot demo-dot-month"></div>
              <span class="demo-timeline-label">${lang === 'de' ? '1 Monat' : '1 месец'}</span>
            </div>
          </div>
        </div>
      `;
    
      break;
    }
    // No default
    }
    
    content.innerHTML = `
      <div class="onboarding-tutorial">
        <p class="tutorial-text">${step.content?.[lang as Language]}</p>
        ${visualContent}
      </div>
    `;
    
    // Add interactivity to flashcard demo
    if (step.visual === 'flashcard-demo') {
      const flipBtn = content.querySelector('.demo-flip-btn');
      const cardFront = content.querySelector('.demo-card-front');
      const cardBack = content.querySelector('.demo-card-back');
      
      if (flipBtn) {
        flipBtn.addEventListener('click', () => {
          if ((cardFront as HTMLElement).style.display === 'none') {
            (cardFront as HTMLElement).style.display = 'block';
            (cardBack as HTMLElement).style.display = 'none';
            flipBtn.textContent = lang === 'de' ? 'Antwort zeigen' : 'Покажи отговора';
          } else {
            (cardFront as HTMLElement).style.display = 'none';
            (cardBack as HTMLElement).style.display = 'block';
            flipBtn.textContent = lang === 'de' ? 'Zurück' : 'Назад';
          }
        });
      }
    }
  }
  
  private renderReadyStep(title: Element, content: Element, step: Step): void {
    const lang = this.userData.nativeLanguage || 'de';
    title.textContent = step.title[lang as Language];
    
    const learningFrom = lang === 'de' ? 'Deutsch' : 'Български';
    const learningTo = lang === 'de' ? 'Bulgarisch' : 'Немски';
    
    content.innerHTML = `
      <div class="onboarding-ready">
        <div class="ready-icon">🎉</div>
        <p class="ready-text">${step.content?.[lang as Language]}</p>
        <div class="ready-summary">
          <div class="summary-item">
            <span class="summary-label">${lang === 'de' ? 'Sie sprechen' : 'Вие говорите'}:</span>
            <span class="summary-value">${learningFrom}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">${lang === 'de' ? 'Sie lernen' : 'Вие учите'}:</span>
            <span class="summary-value">${learningTo}</span>
          </div>
          ${this.userData.learningGoal ? `
          <div class="summary-item">
            <span class="summary-label">${lang === 'de' ? 'Ihr Ziel' : 'Вашата цел'}:</span>
            <span class="summary-value">${this.getGoalLabel(this.userData.learningGoal, lang as Language)}</span>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  }
  
  private getGoalLabel(goal: LearningGoal, lang: Language): string {
    const labels = {
      travel: { de: 'Reisen', bg: 'Пътуване' },
      work: { de: 'Arbeit', bg: 'Работа' },
      family: { de: 'Familie', bg: 'Семейство' },
      personal: { de: 'Persönliches Interesse', bg: 'Личен интерес' }
    };
    return labels[goal]?.[lang] || goal;
  }
  
  private nextStep(): void {
    // Validation
    const currentStep = this.steps[this.currentStep];
    if (currentStep && currentStep.id === 'language-selection' && !this.userData.nativeLanguage) {
      this.announceToScreenReader('Please select a language / Моля изберете език');
      return;
    }
    
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.renderStep();
    } else {
      this.completeOnboarding();
    }
  }
  
  private previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.renderStep();
    }
  }
  
  private skipOnboarding(): void {
    const lang = this.userData.nativeLanguage || 'de';
    const confirmMessage = lang === 'de' 
      ? 'Möchten Sie die Einführung überspringen?' 
      : 'Искате ли да пропуснете въведението?';
    
    if (confirm(confirmMessage)) {
      this.closeOnboarding(false);
    }
  }
  
  private completeOnboarding(): void {
    this.userData.hasCompleted = true;
    
    // Save to localStorage
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify({
        version: ONBOARDING_VERSION,
        completed: true,
        nativeLanguage: this.userData.nativeLanguage,
        learningGoal: this.userData.learningGoal,
        completedAt: new Date().toISOString()
      }));
    } catch (error) {
      console.warn('[Onboarding] Error saving completion status:', error);
    }
    
    this.closeOnboarding(true);
    
    // Redirect to practice page if not already there
    if (window.location.pathname.includes('/practice/')) {
      // Reload to start practice session
      window.location.reload();
    } else {
      window.location.href = '/BulgarianGermanLearningApp/practice/';
    }
  }
  
  private closeOnboarding(completed = false): void {
    const overlay = document.querySelector('#onboarding-overlay');
    if (overlay) {
      overlay.remove();
    }
    
    // Restore body scrolling
    document.body.style.overflow = '';
    
    if (completed) {
      this.announceToScreenReader('Onboarding completed. Starting practice session.');
    } else {
      this.announceToScreenReader('Onboarding skipped.');
    }
  }
  
  private announceToScreenReader(message: string): void {
    const announcer = document.querySelector('#sr-announcements');
    if (announcer) {
      announcer.textContent = message;
      setTimeout(() => {
        announcer.textContent = '';
      }, 3000);
    }
  }
}

// Initialize onboarding when DOM is ready
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const onboardingFlow = new OnboardingFlow();
    (window as { onboardingFlow?: OnboardingFlow }).onboardingFlow = onboardingFlow;
  });
  
  console.log('[Onboarding] Module loaded');
}

export default OnboardingFlow;