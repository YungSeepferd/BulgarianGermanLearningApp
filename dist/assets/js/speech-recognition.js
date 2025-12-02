/**
 * Lightweight wrapper around the Web Speech API for pronunciation practice.
 * Provides a minimal event-driven interface so other modules can trigger
 * recognition without dealing with browser quirks.
 */
const getRecognitionConstructor = () => {
    if (typeof window === 'undefined') {
        return null;
    }
    return (window.SpeechRecognition ||
        window.webkitSpeechRecognition ||
        window.mozSpeechRecognition ||
        window.msSpeechRecognition ||
        null);
};
export class SpeechPractice {
    /**
     * @param handlers - Event handlers for speech recognition
     */
    constructor(handlers = {}) {
        this.isListening = false;
        const Recognition = getRecognitionConstructor();
        if (!Recognition) {
            throw new Error('Speech recognition not supported in this browser');
        }
        this.handlers = handlers;
        this.recognition = new Recognition();
        this.recognition.lang = handlers.lang || 'bg-BG';
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;
        this.recognition.addEventListener('start', () => {
            this.isListening = true;
            this.handlers.onStatus?.('listening');
        });
        this.recognition.addEventListener('end', () => {
            this.isListening = false;
            this.handlers.onStatus?.('idle');
        });
        this.recognition.addEventListener('result', (event) => {
            const speechEvent = event;
            const transcript = [...speechEvent.results]
                .map((result) => result[0]?.transcript ?? '')
                .join(' ')
                .trim();
            if (transcript) {
                this.handlers.onResult?.(transcript);
            }
        });
        this.recognition.addEventListener('error', (event) => {
            const speechEvent = event;
            this.handlers.onError?.(speechEvent.error ?? 'Speech recognition error');
        });
    }
    /**
     * Starts listening for speech.
     * @param options - Configuration options
     */
    start(options = {}) {
        if (options.lang) {
            this.recognition.lang = options.lang;
        }
        if (this.isListening) {
            return;
        }
        try {
            this.recognition.start();
        }
        catch (error) {
            // Chrome throws if start is called back-to-back; surface as friendly message.
            this.handlers.onError?.(error instanceof Error ? error.message : 'Unable to start speech recognition');
        }
    }
    stop() {
        if (!this.isListening) {
            return;
        }
        try {
            this.recognition.stop();
        }
        catch (error) {
            this.handlers.onError?.(error instanceof Error ? error.message : 'Unable to stop speech recognition');
        }
    }
    abort() {
        if (!this.isListening) {
            return;
        }
        try {
            this.recognition.abort();
        }
        catch {
            // ignore – abort is best effort
        }
    }
    destroy() {
        this.abort();
        this.handlers = {};
    }
    static isSupported() {
        return Boolean(getRecognitionConstructor());
    }
}
export default SpeechPractice;
//# sourceMappingURL=speech-recognition.js.map