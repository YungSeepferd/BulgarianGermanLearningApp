/**
 * Enhanced Text-to-Speech Module
 *
 * Provides language-specific voice selection and configuration for Bulgarian and German
 * using the Web Speech API with voice caching and preference management. This module
 * offers intelligent voice selection, customizable speech parameters, and event-driven
 * architecture for integration with the learning application.
 *
 * Features:
 * - Automatic voice selection for Bulgarian and German
 * - Configurable speech parameters (rate, pitch, volume)
 * - Voice caching and preference management
 * - Event-driven architecture for UI integration
 * - Support for multiple German dialects (DE, AT)
 * - Learning direction-aware language selection
 * - Speech control (play, pause, stop, resume)
 * - Browser compatibility detection
 *
 * @example
 * ```typescript
 * import TextToSpeech from './modules/text-to-speech.js';
 *
 * // Create TTS instance with custom settings
 * const tts = new TextToSpeech({
 *   enabled: true,
 *   bgRate: 0.9,
 *   deRate: 0.85,
 *   bgVolume: 0.8
 * });
 *
 * // Speak Bulgarian text
 * tts.speakBulgarian('Здравей свят');
 *
 * // Speak German text
 * tts.speakGerman('Hallo Welt');
 *
 * // Speak based on learning direction
 * tts.speakInDirection('Hello', 'bg-de');
 *
 * // Listen for events
 * window.addEventListener('tts-start', (e) => {
 *   console.log('Speech started:', e.detail.lang);
 * });
 * ```
 *
 * @since 1.0.0
 */
/**
 * Text-to-Speech class for multilingual speech synthesis
 *
 * Provides comprehensive text-to-speech functionality with intelligent voice
 * selection, customizable parameters, and event-driven architecture. The class
 * supports Bulgarian and German languages with automatic voice preference management
 * and learning direction-aware language selection.
 *
 * @class TextToSpeech
 *
 * @example
 * ```typescript
 * // Basic usage
 * const tts = new TextToSpeech();
 *
 * // Speak in different languages
 * tts.speakBulgarian('Здравей свят');
 * tts.speakGerman('Hallo Welt');
 *
 * // Control speech
 * if (tts.isSpeaking()) {
 *   tts.pause();
 *   setTimeout(() => tts.resume(), 1000);
 * }
 *
 * // Update preferences
 * tts.updatePreferences('bg-BG', { rate: 0.9, volume: 0.8 });
 * ```
 *
 * @since 1.0.0
 */
export class TextToSpeech {
    /**
     * Creates a new TextToSpeech instance
     *
     * @constructor
     * @param {TextToSpeechOptions} [options={}] - Configuration options
     *
     * @example
     * ```typescript
     * // Create with default settings
     * const tts = new TextToSpeech();
     *
     * // Create with custom settings
     * const tts = new TextToSpeech({
     *   enabled: true,
     *   bgRate: 0.9,
     *   deRate: 0.85,
     *   bgVolume: 0.8
     * });
     * ```
     */
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
                pitch: options.bgPitch || 1,
                volume: options.bgVolume || 1
            },
            'de-DE': {
                names: ['Google Deutsch', 'Microsoft David', 'Deutsche', 'German', 'voice_0'],
                rate: options.deRate || 0.9,
                pitch: options.dePitch || 1,
                volume: options.deVolume || 1
            },
            'de-AT': {
                names: ['Google Deutsch (Austria)', 'Österreichisches Deutsch'],
                rate: options.deRate || 0.9,
                pitch: options.dePitch || 1,
                volume: options.deVolume || 1
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
                for (const [i, v] of this.voices.entries()) {
                    if (v.lang.includes('bg') || v.lang.includes('de')) {
                        console.log(`  [${i}] ${v.name} (${v.lang})`);
                    }
                }
            }
        };
        // Some browsers load voices asynchronously
        if (this.synthesis.getVoices().length > 0) {
            loadVoices();
        }
        else {
            // Wait for voices to load
            this.synthesis.addEventListener('voiceschanged', loadVoices, { once: true });
        }
    }
    /**
     * Select the best voice for a language
     * @param lang - Language code ('bg-BG', 'de-DE', 'de-AT')
     * @returns Best matching voice or null if not found
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
            const voice = this.voices.find(v => v.name.toLowerCase().includes(prefName.toLowerCase()) &&
                v.lang.startsWith(lang.split('-')[0]) // Match language code
            );
            if (voice) {
                return voice;
            }
        }
        // Fallback: find any voice matching language
        const langCode = lang.split('-')[0];
        const fallbackVoice = this.voices.find(v => v.lang.startsWith(langCode));
        return fallbackVoice || null;
    }
    /**
     * Speaks text in a specific language
     *
     * This method converts text to speech using the Web Speech API with
     * intelligent voice selection and customizable parameters. It handles
     * voice selection, applies language-specific preferences, and dispatches
     * events for UI integration.
     *
     * @public
     * @param {string} text - Text to speak
     * @param {LanguageCode} [lang='bg-BG'] - Language code ('bg-BG', 'de-DE', 'de-AT')
     * @param {SpeechOptions} [options={}] - Override options for this utterance
     * @returns {void}
     *
     * @example
     * ```typescript
     * // Speak Bulgarian text
     * tts.speak('Здравей свят', 'bg-BG');
     *
     * // Speak German text with custom rate
     * tts.speak('Hallo Welt', 'de-DE', { rate: 1.2 });
     *
     * // Speak with custom volume
     * tts.speak('Hello', 'en-US', { volume: 0.8 });
     *
     * // Listen for events
     * window.addEventListener('tts-start', (e) => {
     *   console.log('Started speaking:', e.detail.text);
     * });
     * ```
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
        }
        catch (error) {
            console.error('[TextToSpeech] Failed to speak:', error);
        }
    }
    /**
     * Speaks Bulgarian text using Bulgarian voice preferences
     *
     * Convenience method that automatically uses the Bulgarian language
     * code and applies Bulgarian-specific voice preferences.
     *
     * @public
     * @param {string} text - Text to speak in Bulgarian
     * @param {SpeechOptions} [options={}] - Override options for this utterance
     * @returns {void}
     *
     * @example
     * ```typescript
     * // Speak Bulgarian text
     * tts.speakBulgarian('Здравей свят');
     *
     * // Speak with custom rate
     * tts.speakBulgarian('Как си?', { rate: 0.9 });
     *
     * // Speak with lower volume
     * tts.speakBulgarian('Добър ден', { volume: 0.7 });
     * ```
     */
    speakBulgarian(text, options = {}) {
        this.speak(text, 'bg-BG', options);
    }
    /**
     * Speaks German text using German voice preferences
     *
     * Convenience method that automatically uses the German language
     * code and applies German-specific voice preferences.
     *
     * @public
     * @param {string} text - Text to speak in German
     * @param {SpeechOptions} [options={}] - Override options for this utterance
     * @returns {void}
     *
     * @example
     * ```typescript
     * // Speak German text
     * tts.speakGerman('Hallo Welt');
     *
     * // Speak with custom rate
     * tts.speakGerman('Wie geht es dir?', { rate: 0.85 });
     *
     * // Speak with higher pitch
     * tts.speakGerman('Guten Tag', { pitch: 1.1 });
     * ```
     */
    speakGerman(text, options = {}) {
        this.speak(text, 'de-DE', options);
    }
    /**
     * Speaks text in the target language based on learning direction
     *
     * This method automatically determines the appropriate language to speak
     * based on the learning direction. For 'de-bg' (German to Bulgarian learning),
     * it speaks Bulgarian. For 'bg-de' (Bulgarian to German learning), it speaks German.
     *
     * @public
     * @param {string} text - Text to speak
     * @param {LearningDirection} direction - Learning direction ('de-bg' or 'bg-de')
     * @param {SpeechOptions} [options={}] - Override options for this utterance
     * @returns {void}
     *
     * @example
     * ```typescript
     * // Learning German from Bulgarian - speak German pronunciation
     * tts.speakInDirection('Hello', 'bg-de');
     *
     * // Learning Bulgarian from German - speak Bulgarian pronunciation
     * tts.speakInDirection('Здравей', 'de-bg');
     *
     * // Use with custom options
     * tts.speakInDirection('Thank you', 'bg-de', { rate: 0.9 });
     * ```
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
     * @returns True if speaking or paused
     */
    isSpeaking() {
        return this.synthesis && (this.synthesis.speaking || this.synthesis.paused);
    }
    /**
     * Toggle TTS enabled state
     * @returns New enabled state
     */
    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('tts-enabled', this.enabled.toString());
        return this.enabled;
    }
    /**
     * Get all available voices
     * @returns Array of available voices
     */
    getAvailableVoices() {
        return this.voices;
    }
    /**
     * Get Bulgarian voices
     * @returns Array of Bulgarian voices
     */
    getBulgarianVoices() {
        if (!this.voicesLoaded) {
            return [];
        }
        return this.voices.filter(v => v.lang.startsWith('bg'));
    }
    /**
     * Get German voices
     * @returns Array of German voices
     */
    getGermanVoices() {
        if (!this.voicesLoaded) {
            return [];
        }
        return this.voices.filter(v => v.lang.startsWith('de'));
    }
    /**
     * Update voice preferences for a language
     * @param lang - Language code
     * @param preferences - New preferences
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
     * @param lang - Language code
     * @returns Current preferences or null if not found
     */
    getPreferences(lang) {
        return this.voicePreferences[lang] || null;
    }
    /**
     * Checks if text-to-speech is supported in the current browser
     *
     * This static method checks for the availability of the Web Speech API
     * speech synthesis interface. Should be called before creating a TextToSpeech
     * instance to ensure compatibility.
     *
     * @public
     * @static
     * @returns {boolean} True if speech synthesis is supported
     *
     * @example
     * ```typescript
     * // Check support before using
     * if (TextToSpeech.isSupported()) {
     *   const tts = new TextToSpeech();
     *   tts.speak('Hello World');
     * } else {
     *   console.log('Text-to-speech not supported in this browser');
     *   // Show fallback UI or alternative functionality
     * }
     * ```
     */
    static isSupported() {
        return 'speechSynthesis' in window;
    }
}
export default TextToSpeech;
//# sourceMappingURL=text-to-speech.js.map