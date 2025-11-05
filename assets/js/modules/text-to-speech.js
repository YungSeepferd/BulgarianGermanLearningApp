/**
 * Enhanced Text-to-Speech Module
 * Provides language-specific voice selection and configuration for Bulgarian and German
 * Uses Web Speech API with voice caching and preference management
 */

export class TextToSpeech {
  constructor(options = {}) {
    this.synthesis = window.speechSynthesis;
    this.enabled = options.enabled !== false;
    this.voices = [];
    this.voicesLoaded = false;
    this.currentUtterance = null;

    // Voice preferences - can be customized per language
    this.voicePreferences = {
      'bg-BG': {
        names: ['Google Bulgarian', 'Microsoft Zira', 'Bulgarian', 'voice_0'],
        rate: options.bgRate || 0.85,
        pitch: options.bgPitch || 1.0,
        volume: options.bgVolume || 1.0,
      },
      'de-DE': {
        names: ['Google Deutsch', 'Microsoft David', 'Deutsche', 'German', 'voice_0'],
        rate: options.deRate || 0.9,
        pitch: options.dePitch || 1.0,
        volume: options.deVolume || 1.0,
      },
      'de-AT': {
        names: ['Google Deutsch (Austria)', 'Österreichisches Deutsch'],
        rate: options.deRate || 0.9,
        pitch: options.dePitch || 1.0,
        volume: options.deVolume || 1.0,
      }
    };

    // Load voices asynchronously
    this.initializeVoices();
  }

  /**
   * Initialize voices - load and cache available system voices
   */
  initializeVoices() {
    const loadVoices = () => {
      this.voices = this.synthesis.getVoices();
      this.voicesLoaded = true;

      // Log available voices in development
      if (typeof console !== 'undefined') {
        console.log('[TextToSpeech] Loaded voices:', this.voices.length);
        this.voices.forEach((v, i) => {
          if (v.lang.includes('bg') || v.lang.includes('de')) {
            console.log(`  [${i}] ${v.name} (${v.lang})`);
          }
        });
      }
    };

    // Some browsers load voices asynchronously
    if (this.synthesis.getVoices().length > 0) {
      loadVoices();
    } else {
      // Wait for voices to load
      this.synthesis.addEventListener('voiceschanged', loadVoices, { once: true });
    }
  }

  /**
   * Select the best voice for a language
   * @param {string} lang - Language code ('bg-BG', 'de-DE', 'de-AT')
   * @returns {SpeechSynthesisVoice|null}
   */
  selectBestVoice(lang) {
    if (!this.voicesLoaded || this.voices.length === 0) {
      return null;
    }

    const prefs = this.voicePreferences[lang];
    if (!prefs) {
      return null;
    }

    // Try to find a voice matching preferred names
    for (const prefName of prefs.names) {
      const voice = this.voices.find(v =>
        v.name.toLowerCase().includes(prefName.toLowerCase()) &&
        v.lang.startsWith(lang.split('-')[0]) // Match language code
      );
      if (voice) {
        return voice;
      }
    }

    // Fallback: find any voice matching language
    const langCode = lang.split('-')[0];
    const fallbackVoice = this.voices.find(v =>
      v.lang.startsWith(langCode)
    );

    return fallbackVoice || null;
  }

  /**
   * Speak text in a specific language
   * @param {string} text - Text to speak
   * @param {string} lang - Language code ('bg-BG' or 'de-DE')
   * @param {Object} options - Override options
   */
  speak(text, lang = 'bg-BG', options = {}) {
    if (!this.enabled || !this.synthesis || !text) {
      return;
    }

    // Cancel any current speech
    this.stop();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = this.selectBestVoice(lang);
      const prefs = this.voicePreferences[lang] || this.voicePreferences['bg-BG'];

      // Set voice if available
      if (voice) {
        utterance.voice = voice;
      }

      // Apply language
      utterance.lang = lang;

      // Apply preferences with override support
      utterance.rate = options.rate || prefs.rate;
      utterance.pitch = options.pitch || prefs.pitch;
      utterance.volume = options.volume || prefs.volume;

      // Store reference for control
      this.currentUtterance = utterance;

      // Add event listeners
      utterance.addEventListener('start', () => {
        if (typeof window.dispatchEvent === 'function') {
          window.dispatchEvent(new CustomEvent('tts-start', {
            detail: { lang, text }
          }));
        }
      });

      utterance.addEventListener('end', () => {
        this.currentUtterance = null;
        if (typeof window.dispatchEvent === 'function') {
          window.dispatchEvent(new CustomEvent('tts-end', {
            detail: { lang }
          }));
        }
      });

      utterance.addEventListener('error', (event) => {
        console.warn('[TextToSpeech] Error:', event.error);
        if (typeof window.dispatchEvent === 'function') {
          window.dispatchEvent(new CustomEvent('tts-error', {
            detail: { lang, error: event.error }
          }));
        }
      });

      // Start speaking
      this.synthesis.speak(utterance);
    } catch (error) {
      console.error('[TextToSpeech] Failed to speak:', error);
    }
  }

  /**
   * Speak Bulgarian text
   * @param {string} text - Text to speak
   * @param {Object} options - Override options
   */
  speakBulgarian(text, options = {}) {
    this.speak(text, 'bg-BG', options);
  }

  /**
   * Speak German text
   * @param {string} text - Text to speak
   * @param {Object} options - Override options
   */
  speakGerman(text, options = {}) {
    this.speak(text, 'de-DE', options);
  }

  /**
   * Speak text in the direction's target language
   * @param {string} text - Text to speak
   * @param {string} direction - Learning direction ('de-bg' or 'bg-de')
   * @param {Object} options - Override options
   */
  speakInDirection(text, direction, options = {}) {
    // For de-bg direction, we're going from German to Bulgarian, so speak Bulgarian
    const lang = direction === 'de-bg' ? 'bg-BG' : 'de-DE';
    this.speak(text, lang, options);
  }

  /**
   * Stop current speech
   */
  stop() {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
  }

  /**
   * Pause current speech
   */
  pause() {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume() {
    if (this.synthesis && this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  /**
   * Check if speech is currently active
   */
  isSpeaking() {
    return this.synthesis && (this.synthesis.speaking || this.synthesis.paused);
  }

  /**
   * Toggle TTS enabled state
   */
  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('tts-enabled', this.enabled.toString());
    return this.enabled;
  }

  /**
   * Get all available voices
   */
  getAvailableVoices() {
    return this.voices;
  }

  /**
   * Get Bulgarian voices
   */
  getBulgarianVoices() {
    if (!this.voicesLoaded) {
      return [];
    }
    return this.voices.filter(v => v.lang.startsWith('bg'));
  }

  /**
   * Get German voices
   */
  getGermanVoices() {
    if (!this.voicesLoaded) {
      return [];
    }
    return this.voices.filter(v => v.lang.startsWith('de'));
  }

  /**
   * Update voice preferences for a language
   * @param {string} lang - Language code
   * @param {Object} preferences - New preferences
   */
  updatePreferences(lang, preferences) {
    if (this.voicePreferences[lang]) {
      this.voicePreferences[lang] = {
        ...this.voicePreferences[lang],
        ...preferences
      };
    }
  }

  /**
   * Get current preferences for a language
   * @param {string} lang - Language code
   */
  getPreferences(lang) {
    return this.voicePreferences[lang] || null;
  }

  /**
   * Check if TTS is supported
   */
  static isSupported() {
    return 'speechSynthesis' in window;
  }
}

export default TextToSpeech;
