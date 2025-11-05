# Language-Specific Text-to-Speech (TTS) Implementation

## Overview

This document describes the enhanced Text-to-Speech system that provides language-specific voice selection for Bulgarian and German content in the Bulgarian-German Learning App.

## Architecture

### Components

1. **TextToSpeech Module** (`assets/js/modules/text-to-speech.js`)
   - Core TTS functionality with voice management
   - Language-specific voice selection and preferences
   - Fallback mechanisms for unsupported voices

2. **TTS Initialization Script** (`assets/js/tts-init.js`)
   - Dynamically loads the TextToSpeech module
   - Creates global `window.TextToSpeech` and `window.globalTTS` instances
   - Handles TTS enable/disable events

3. **Integration Points**
   - `AudioManager` class in `app.js` - wraps TTS for backward compatibility
   - `PracticePageModule` in `practice-page.js` - uses TTS for word pronunciation

## Features

### Language-Specific Voice Selection

The system automatically selects appropriate voices based on language:

- **Bulgarian (bg-BG)**: Searches for "Google Bulgarian", "Microsoft Zira", or any Bulgarian voice
- **German (de-DE)**: Searches for "Google Deutsch", "Microsoft David", or any German voice
- **Austrian German (de-AT)**: Supports Austrian German dialect preferences

### Voice Preferences

Each language has configurable preferences:

```javascript
{
  names: ['Google Bulgarian', 'Microsoft Zira', 'Bulgarian', 'voice_0'],  // Voice names to try
  rate: 0.85,      // Speech rate (0.1 to 10, default 1)
  pitch: 1.0,      // Pitch (0.1 to 2, default 1)
  volume: 1.0      // Volume (0 to 1, default 1)
}
```

### Customization

Preferences can be updated at runtime:

```javascript
window.globalTTS.updatePreferences('bg-BG', {
  rate: 0.8,
  pitch: 1.1,
  volume: 0.95
});
```

## Usage

### Basic Usage

```javascript
// Speak Bulgarian text
window.globalTTS.speakBulgarian('Здравей');

// Speak German text
window.globalTTS.speakGerman('Hallo');

// Speak text in learning direction
window.globalTTS.speakInDirection('hello', 'de-bg');  // Speaks Bulgarian
```

### Advanced Usage

```javascript
// Custom voice and settings
window.globalTTS.speak('Привет', 'bg-BG', {
  rate: 0.75,
  pitch: 1.2,
  volume: 0.8
});

// Control playback
window.globalTTS.pause();      // Pause current speech
window.globalTTS.resume();     // Resume paused speech
window.globalTTS.stop();       // Stop current speech
window.globalTTS.isSpeaking(); // Check if speaking

// Get available voices
const bulgarianVoices = window.globalTTS.getBulgarianVoices();
const germanVoices = window.globalTTS.getGermanVoices();
```

### Event Listeners

The TTS system dispatches events that can be listened to:

```javascript
// Listen for speech start
window.addEventListener('tts-start', (event) => {
  console.log('Started speaking:', event.detail.lang, event.detail.text);
});

// Listen for speech end
window.addEventListener('tts-end', (event) => {
  console.log('Finished speaking:', event.detail.lang);
});

// Listen for errors
window.addEventListener('tts-error', (event) => {
  console.error('TTS error:', event.detail.error);
});

// Listen for TTS toggle
window.addEventListener('tts-toggle', (event) => {
  console.log('TTS enabled:', event.detail.enabled);
});
```

## Voice Selection Algorithm

1. **Preference-based Selection**: First tries voices matching the names in the preference list
2. **Language Fallback**: If no preferred voice found, searches for any voice matching the language code
3. **Graceful Degradation**: If no voice found, speaks without a specific voice (uses system default)

## Browser Compatibility

- **Chrome/Edge**: Full support, Google voices available
- **Firefox**: Full support
- **Safari**: Full support (limited voice selection)
- **Mobile**: Varies by browser and OS

## Performance Considerations

- Voices are loaded asynchronously on first use
- Voice selection is memoized for performance
- Multiple concurrent utterances are queued by the browser
- Use `stop()` before speaking new text to cancel queued utterances

## LocalStorage Integration

TTS enabled/disabled state is persisted:

```javascript
// Automatically saved to localStorage
localStorage.setItem('tts-enabled', true);

// Can be toggled
window.audioManager.toggle();
```

## Backwards Compatibility

The enhanced TTS system is designed to be backward compatible:

- Existing `AudioManager` class still works
- Falls back to basic `speechSynthesis` API if `TextToSpeech` is not available
- No breaking changes to existing code

## Testing

### Manual Testing

1. Open the app in Chrome/Firefox
2. Go to vocabulary or practice page
3. Click the audio button or use keyboard shortcut
4. Verify that Bulgarian and German text are spoken with appropriate voices
5. Check browser console for voice loading messages

### Voice Availability Check

```javascript
// Check if specific languages have voices
console.log(window.globalTTS.getBulgarianVoices());
console.log(window.globalTTS.getGermanVoices());
```

## Troubleshooting

### No voices available
- **Cause**: Voice list not loaded yet
- **Solution**: Wait a moment and try again, or listen for `voiceschanged` event

### Wrong voice selected
- **Cause**: Preferred voice name doesn't match available voice
- **Solution**: Check `getAvailableVoices()` and update preference names

### Speech sounds wrong
- **Cause**: Rate/pitch settings not optimal for voice
- **Solution**: Adjust `rate` and `pitch` in preferences

### TTS not working
- **Cause**: Browser doesn't support `speechSynthesis` API
- **Solution**: Provide fallback UI without TTS, check browser compatibility

## Future Enhancements

- [ ] Voice pause/resume support for better UX
- [ ] Voice speed control UI in settings
- [ ] Audio file download capability
- [ ] Caching of spoken text for offline use
- [ ] Support for more languages
- [ ] Custom voice preference profiles

## References

- [Web Speech API Specification](https://w3c.github.io/speech-api/)
- [MDN Web Docs - Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [SpeechSynthesis Interface](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
- [SpeechSynthesisUtterance Interface](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance)
