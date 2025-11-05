/**
 * Text-to-Speech Initialization Script
 * Dynamically loads the TextToSpeech module and makes it globally available
 */

(async function initializeTTS() {
  try {
    // Import the TextToSpeech module
    const { TextToSpeech } = await import('./modules/text-to-speech.js');

    // Make it globally available
    window.TextToSpeech = TextToSpeech;

    // Initialize a global TTS instance if speechSynthesis is supported
    if (TextToSpeech.isSupported()) {
      window.globalTTS = new TextToSpeech({
        enabled: localStorage.getItem('tts-enabled') !== 'false'
      });

      console.log('[TTS] Initialized successfully');

      // Listen for TTS enabled/disabled changes
      window.addEventListener('tts-toggle', (event) => {
        if (window.globalTTS) {
          window.globalTTS.enabled = event.detail.enabled;
        }
      });
    } else {
      console.log('[TTS] Speech synthesis not supported in this browser');
    }
  } catch (error) {
    console.error('[TTS] Failed to initialize:', error);
  }
})();
