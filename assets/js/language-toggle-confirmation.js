/**
 * Language Toggle Confirmation Modal
 * Ensures users understand the impact of switching learning direction
 * For Vincent (DE) and Ida (BG)
 */

class LanguageToggleConfirmation {
  constructor() {
    this.isModalOpen = false;
    this.pendingDirection = null;
    this.callback = null;
  }
  
  show(currentDirection, newDirection, onConfirm) {
    if (this.isModalOpen) return;
    
    this.pendingDirection = newDirection;
    this.callback = onConfirm;
    this.isModalOpen = true;
    
    this.createModal(currentDirection, newDirection);
  }
  
  createModal(currentDirection, newDirection) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'language-toggle-confirmation-overlay';
    overlay.className = 'confirmation-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'confirmation-title');
    
    const currentInfo = this.getDirectionInfo(currentDirection);
    const newInfo = this.getDirectionInfo(newDirection);
    
    const modal = document.createElement('div');
    modal.className = 'confirmation-modal';
    modal.innerHTML = `
      <div class="confirmation-header">
        <h2 id="confirmation-title" class="confirmation-title">
          ${currentInfo.lang === 'de' ? 'Lernrichtung wechseln?' : 'Смяна на посоката на обучение?'}
        </h2>
      </div>
      
      <div class="confirmation-content">
        <div class="confirmation-current">
          <span class="confirmation-label">
            ${currentInfo.lang === 'de' ? 'Aktuell' : 'Текущо'}:
          </span>
          <div class="direction-badge direction-current">
            <span class="direction-icon">${currentInfo.icon}</span>
            <span class="direction-text">${currentInfo.text}</span>
          </div>
          <p class="direction-description">${currentInfo.description}</p>
        </div>
        
        <div class="confirmation-arrow">
          <span aria-hidden="true">↓</span>
        </div>
        
        <div class="confirmation-new">
          <span class="confirmation-label">
            ${currentInfo.lang === 'de' ? 'Neu' : 'Ново'}:
          </span>
          <div class="direction-badge direction-new">
            <span class="direction-icon">${newInfo.icon}</span>
            <span class="direction-text">${newInfo.text}</span>
          </div>
          <p class="direction-description">${newInfo.description}</p>
        </div>
        
        <div class="confirmation-impact">
          <p class="impact-title">
            ${currentInfo.lang === 'de' ? 'Dies wird:' : 'Това ще:'}
          </p>
          <ul class="impact-list">
            <li>
              <span class="impact-icon">🔄</span>
              <span class="impact-text">${newInfo.impact1}</span>
            </li>
            <li>
              <span class="impact-icon">📊</span>
              <span class="impact-text">${newInfo.impact2}</span>
            </li>
            <li>
              <span class="impact-icon">💾</span>
              <span class="impact-text">${newInfo.impact3}</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="confirmation-footer">
        <button class="confirmation-cancel btn-secondary" id="confirmation-cancel">
          ${currentInfo.lang === 'de' ? 'Abbrechen' : 'Отказ'}
        </button>
        <button class="confirmation-confirm btn-primary" id="confirmation-confirm">
          ${currentInfo.lang === 'de' ? 'Richtung wechseln' : 'Смяна на посоката'}
        </button>
      </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Bind events
    overlay.querySelector('#confirmation-cancel').addEventListener('click', () => this.cancel());
    overlay.querySelector('#confirmation-confirm').addEventListener('click', () => this.confirm());
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.cancel();
      }
    });
    
    // Close on Escape key
    this.escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.cancel();
      }
    };
    document.addEventListener('keydown', this.escapeHandler);
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
    
    // Focus confirm button
    setTimeout(() => {
      overlay.querySelector('#confirmation-confirm').focus();
    }, 100);
    
    // Announce to screen readers
    this.announceToScreenReader(`Direction change confirmation. Current: ${currentInfo.text}. New: ${newInfo.text}`);
  }
  
  getDirectionInfo(direction) {
    const info = {
      'de-bg': {
        icon: '🇩🇪→🇧🇬',
        text: 'Deutsch → Bulgarisch',
        lang: 'de',
        description: 'Sie lernen Bulgarisch aus deutscher Perspektive',
        impact1: 'Bulgarische Wörter auf Lernkarten anzeigen',
        impact2: 'Schwierigkeitsgrad an DE→BG anpassen',
        impact3: 'Alle Übungssitzungen aktualisieren'
      },
      'bg-de': {
        icon: '🇧🇬→🇩🇪',
        text: 'Български → Deutsch',
        lang: 'bg',
        description: 'Вие учите немски от българска перспектива',
        impact1: 'Показване на немски думи на карти',
        impact2: 'Адаптиране на трудността към BG→DE',
        impact3: 'Актуализиране на всички сесии'
      }
    };
    
    return info[direction] || info['de-bg'];
  }
  
  confirm() {
    if (this.callback) {
      this.callback(this.pendingDirection);
    }
    this.close();
  }
  
  cancel() {
    this.announceToScreenReader('Direction change cancelled');
    this.close();
  }
  
  close() {
    const overlay = document.getElementById('language-toggle-confirmation-overlay');
    if (overlay) {
      overlay.remove();
    }
    
    // Restore body scrolling
    document.body.style.overflow = '';
    
    // Remove escape handler
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
    }
    
    this.isModalOpen = false;
    this.pendingDirection = null;
    this.callback = null;
  }
  
  announceToScreenReader(message) {
    const announcer = document.getElementById('sr-announcements');
    if (announcer) {
      announcer.textContent = message;
      setTimeout(() => {
        announcer.textContent = '';
      }, 3000);
    }
  }
}

// Make globally available
if (typeof window !== 'undefined') {
  window.LanguageToggleConfirmation = LanguageToggleConfirmation;
  console.log('[LanguageToggleConfirmation] Module loaded');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LanguageToggleConfirmation;
}
