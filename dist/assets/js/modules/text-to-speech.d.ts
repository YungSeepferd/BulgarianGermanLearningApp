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
 * Voice preference configuration for a specific language
 *
 * Defines the preferred voices and speech parameters for each language
 * supported by the text-to-speech system.
 *
 * @interface VoicePreference
 * @property {string[]} names - Array of preferred voice names in order of preference
 * @property {number} rate - Speech rate (0.1 to 2.0, default 1.0)
 * @property {number} pitch - Voice pitch (0.0 to 2.0, default 1.0)
 * @property {number} volume - Voice volume (0.0 to 1.0, default 1.0)
 *
 * @example
 * ```typescript
 * const bulgarianPrefs: VoicePreference = {
 *   names: ['Google Bulgarian', 'Microsoft Zira'],
 *   rate: 0.85,
 *   pitch: 1.0,
 *   volume: 0.9
 * };
 * ```
 */
interface VoicePreference {
    names: string[];
    rate: number;
    pitch: number;
    volume: number;
}
/**
 * Text-to-Speech configuration options
 *
 * Configuration options for initializing the TextToSpeech instance
 * with custom speech parameters for each supported language.
 *
 * @interface TextToSpeechOptions
 * @property {boolean} [enabled=true] - Whether TTS is enabled by default
 * @property {number} [bgRate=0.85] - Default speech rate for Bulgarian
 * @property {number} [bgPitch=1] - Default pitch for Bulgarian
 * @property {number} [bgVolume=1] - Default volume for Bulgarian
 * @property {number} [deRate=0.9] - Default speech rate for German
 * @property {number} [dePitch=1] - Default pitch for German
 * @property {number} [deVolume=1] - Default volume for German
 *
 * @example
 * ```typescript
 * const options: TextToSpeechOptions = {
 *   enabled: true,
 *   bgRate: 0.9,
 *   deRate: 0.8,
 *   bgVolume: 0.85
 * };
 * ```
 */
interface TextToSpeechOptions {
    enabled?: boolean;
    bgRate?: number;
    bgPitch?: number;
    bgVolume?: number;
    deRate?: number;
    dePitch?: number;
    deVolume?: number;
}
/**
 * Speech options that can override default preferences
 *
 * Options that can be passed to individual speech calls to override
 * the default voice preferences for that specific utterance.
 *
 * @interface SpeechOptions
 * @property {number} [rate] - Override speech rate
 * @property {number} [pitch] - Override voice pitch
 * @property {number} [volume] - Override voice volume
 *
 * @example
 * ```typescript
 * // Speak with custom rate
 * tts.speak('Hello', 'en-US', { rate: 1.2 });
 *
 * // Speak with custom volume
 * tts.speak('Hello', 'en-US', { volume: 0.7 });
 * ```
 */
interface SpeechOptions {
    rate?: number;
    pitch?: number;
    volume?: number;
}
/**
 * Learning direction for language selection
 *
 * Defines the direction of learning to determine which language
 * should be spoken for text-to-speech pronunciation.
 *
 * @typedef {'de-bg'|'bg-de'} LearningDirection
 *
 * @example
 * ```typescript
 * // German to Bulgarian learning
 * const direction: LearningDirection = 'de-bg';
 *
 * // Bulgarian to German learning
 * const direction: LearningDirection = 'bg-de';
 * ```
 */
type LearningDirection = 'de-bg' | 'bg-de';
/**
 * Language codes supported by TTS
 *
 * Standard language codes for the supported text-to-speech languages.
 *
 * @typedef {'bg-BG'|'de-DE'|'de-AT'} LanguageCode
 *
 * @example
 * ```typescript
 * const bulgarian: LanguageCode = 'bg-BG';
 * const german: LanguageCode = 'de-DE';
 * const austrianGerman: LanguageCode = 'de-AT';
 * ```
 */
type LanguageCode = 'bg-BG' | 'de-DE' | 'de-AT';
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
export declare class TextToSpeech {
    /** Speech synthesis instance from Web Speech API */
    private synthesis;
    /** Whether TTS is currently enabled */
    private enabled;
    /** Array of available system voices */
    private voices;
    /** Whether voices have been loaded from the system */
    private voicesLoaded;
    /** Currently active speech utterance */
    private currentUtterance;
    /** Voice preferences for each language */
    private voicePreferences;
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
    constructor(options?: TextToSpeechOptions);
    /**
     * Initialize voices - load and cache available system voices
     */
    private initializeVoices;
    /**
     * Select the best voice for a language
     * @param lang - Language code ('bg-BG', 'de-DE', 'de-AT')
     * @returns Best matching voice or null if not found
     */
    private selectBestVoice;
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
    speak(text: string, lang?: LanguageCode, options?: SpeechOptions): void;
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
    speakBulgarian(text: string, options?: SpeechOptions): void;
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
    speakGerman(text: string, options?: SpeechOptions): void;
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
    speakInDirection(text: string, direction: LearningDirection, options?: SpeechOptions): void;
    /**
     * Stop current speech
     */
    stop(): void;
    /**
     * Pause current speech
     */
    pause(): void;
    /**
     * Resume paused speech
     */
    resume(): void;
    /**
     * Check if speech is currently active
     * @returns True if speaking or paused
     */
    isSpeaking(): boolean;
    /**
     * Toggle TTS enabled state
     * @returns New enabled state
     */
    toggle(): boolean;
    /**
     * Get all available voices
     * @returns Array of available voices
     */
    getAvailableVoices(): SpeechSynthesisVoice[];
    /**
     * Get Bulgarian voices
     * @returns Array of Bulgarian voices
     */
    getBulgarianVoices(): SpeechSynthesisVoice[];
    /**
     * Get German voices
     * @returns Array of German voices
     */
    getGermanVoices(): SpeechSynthesisVoice[];
    /**
     * Update voice preferences for a language
     * @param lang - Language code
     * @param preferences - New preferences
     */
    updatePreferences(lang: LanguageCode, preferences: Partial<VoicePreference>): void;
    /**
     * Get current preferences for a language
     * @param lang - Language code
     * @returns Current preferences or null if not found
     */
    getPreferences(lang: LanguageCode): VoicePreference | null;
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
    static isSupported(): boolean;
}
export default TextToSpeech;
//# sourceMappingURL=text-to-speech.d.ts.map