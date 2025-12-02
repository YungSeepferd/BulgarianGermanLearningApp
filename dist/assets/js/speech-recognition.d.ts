/**
 * Lightweight wrapper around the Web Speech API for pronunciation practice.
 * Provides a minimal event-driven interface so other modules can trigger
 * recognition without dealing with browser quirks.
 */
interface SpeechRecognitionConstructor {
    new (): SpeechRecognition;
}
interface SpeechRecognition extends EventTarget {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    start(): void;
    stop(): void;
    abort(): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
}
interface SpeechPracticeHandlers {
    onStatus?: (status: 'idle' | 'listening') => void;
    onResult?: (transcript: string) => void;
    onError?: (message: string) => void;
    lang?: string;
}
interface SpeechPracticeOptions {
    lang?: string;
}
declare global {
    interface Window {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
        mozSpeechRecognition?: SpeechRecognitionConstructor;
        msSpeechRecognition?: SpeechRecognitionConstructor;
    }
}
export declare class SpeechPractice {
    private handlers;
    private recognition;
    private isListening;
    /**
     * @param handlers - Event handlers for speech recognition
     */
    constructor(handlers?: SpeechPracticeHandlers);
    /**
     * Starts listening for speech.
     * @param options - Configuration options
     */
    start(options?: SpeechPracticeOptions): void;
    stop(): void;
    abort(): void;
    destroy(): void;
    static isSupported(): boolean;
}
export default SpeechPractice;
//# sourceMappingURL=speech-recognition.d.ts.map