/**
 * Lightweight wrapper around the Web Speech API for pronunciation practice.
 * Provides a minimal event-driven interface so other modules can trigger
 * recognition without dealing with browser quirks.
 */

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
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

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResult[];
  error?: string;
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

// Extend Window interface for speech recognition APIs
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    mozSpeechRecognition?: SpeechRecognitionConstructor;
    msSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const getRecognitionConstructor = (): SpeechRecognitionConstructor | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    window.mozSpeechRecognition ||
    window.msSpeechRecognition ||
    null
  );
};

export class SpeechPractice {
  private handlers: SpeechPracticeHandlers;
  private recognition: SpeechRecognition;
  private isListening = false;

  /**
   * @param handlers - Event handlers for speech recognition
   */
  constructor(handlers: SpeechPracticeHandlers = {}) {
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

    this.recognition.addEventListener('result', (event: Event) => {
      const speechEvent = event as SpeechRecognitionEvent;
      const transcript = [...speechEvent.results]
        .map((result: SpeechRecognitionResult) => result[0]?.transcript ?? '')
        .join(' ')
        .trim();

      if (transcript) {
        this.handlers.onResult?.(transcript);
      }
    });

    this.recognition.addEventListener('error', (event: Event) => {
      const speechEvent = event as SpeechRecognitionEvent;
      this.handlers.onError?.(speechEvent.error ?? 'Speech recognition error');
    });
  }

  /**
   * Starts listening for speech.
   * @param options - Configuration options
   */
  start(options: SpeechPracticeOptions = {}): void {
    if (options.lang) {
      this.recognition.lang = options.lang;
    }

    if (this.isListening) {
      return;
    }

    try {
      this.recognition.start();
    } catch (error) {
      // Chrome throws if start is called back-to-back; surface as friendly message.
      this.handlers.onError?.(error instanceof Error ? error.message : 'Unable to start speech recognition');
    }
  }

  stop(): void {
    if (!this.isListening) {
      return;
    }

    try {
      this.recognition.stop();
    } catch (error) {
      this.handlers.onError?.(error instanceof Error ? error.message : 'Unable to stop speech recognition');
    }
  }

  abort(): void {
    if (!this.isListening) {
      return;
    }
    try {
      this.recognition.abort();
    } catch {
      // ignore – abort is best effort
    }
  }

  destroy(): void {
    this.abort();
    this.handlers = {};
  }

  static isSupported(): boolean {
    return Boolean(getRecognitionConstructor());
  }
}

export default SpeechPractice;