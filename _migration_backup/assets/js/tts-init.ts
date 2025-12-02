/**
 * Text-to-Speech Initialization Script
 * Dynamically loads the TextToSpeech module and makes it globally available
 */

export {};

interface TTSToggleEvent extends CustomEvent {
  detail: {
    enabled: boolean;
  };
}

interface TextToSpeechClass {
  new(options?: { enabled?: boolean }): TextToSpeechInstance;
  isSupported(): boolean;
}

interface TextToSpeechInstance {
  enabled: boolean;
}

try {
  // Import the TextToSpeech module
  const { TextToSpeech } = await import('./modules/text-to-speech.js');

  // Make it globally available
  (window as { TextToSpeech?: TextToSpeechClass }).TextToSpeech = TextToSpeech as any;

  // Initialize a global TTS instance if speechSynthesis is supported
  if (TextToSpeech.isSupported()) {
    const globalTTS = new TextToSpeech({
      enabled: localStorage.getItem('tts-enabled') !== 'false'
    });
    (window as { globalTTS?: TextToSpeechInstance }).globalTTS = globalTTS as any;

    console.log('[TTS] Initialized successfully');

    // Listen for TTS enabled/disabled changes
    window.addEventListener('tts-toggle', (event: Event) => {
      const customEvent = event as TTSToggleEvent;
      if (globalTTS) {
        (globalTTS as any).enabled = customEvent.detail.enabled;
      }
    });
  } else {
    console.log('[TTS] Speech synthesis not supported in this browser');
  }
} catch (error) {
  console.error('[TTS] Failed to initialize:', error);
}