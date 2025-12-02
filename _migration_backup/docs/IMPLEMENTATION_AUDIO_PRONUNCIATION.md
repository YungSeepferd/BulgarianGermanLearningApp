# Implementation Guide: Audio Pronunciation Feature

## Overview

Add Web Speech API and TTS (Text-to-Speech) integration to provide pronunciation examples for vocabulary. This critical language learning feature improves listening comprehension and pronunciation.

**Estimated Effort**: 3-5 days
**Priority**: HIGH (Essential for language learning)
**Dependencies**: Web Speech API (browser-native)

---

## Feature Requirements

### Functional Requirements
1. **Vocabulary Pronunciation**: Play audio for Bulgarian and German words
2. **Text-to-Speech Fallback**: Use browser TTS if no pre-recorded audio
3. **Speech Recognition**: Bonus feature - let users record and check pronunciation
4. **Example Sentences**: Play audio for example sentence context
5. **Speaker Selection**: Choose male/female voices
6. **Audio Controls**: Play/pause, speed control, repeat buttons

### Browser Support
- Chrome/Edge: Full support (Web Speech API + TTS)
- Firefox: TTS only (no recognition)
- Safari: Limited TTS support
- Fallback: Text display if no TTS available

---

## Implementation Steps

### Step 1: Create Audio Manager Module

**File**: `assets/js/modules/audio-manager.js`

```javascript
/**
 * Audio & Pronunciation Manager
 * Handles Web Speech API for text-to-speech and speech recognition
 */

class AudioManager {
  constructor(options = {}) {
    this.synth = window.speechSynthesis;
    this.recognition = this.initSpeechRecognition();
    
    this.options = {
      voicePreference: options.voicePreference || 'female', // 'male' or 'female'
      rate: options.rate || 1.0,
      pitch: options.pitch || 1.0,
      lang: options.lang || 'de-DE',
      ...options
    };

    this.isPlaying = false;
    this.isSpeaking = false;
    this.currentUtterance = null;
  }

  /**
   * Initialize speech recognition (if available)
   */
  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    return recognition;
  }

  /**
   * Check if Web Speech API is available
   */
  isSupported() {
    return 'speechSynthesis' in window;
  }

  /**
   * Get available voices
   */
  getAvailableVoices() {
    return this.synth.getVoices();
  }

  /**
   * Get best voice match for language and gender preference
   */
  getVoice(lang, gender = 'female') {
    const voices = this.getAvailableVoices();
    
    // First try: exact language + gender match
    let voice = voices.find(v => 
      v.lang.startsWith(lang.split('-')[0]) && 
      v.name.toLowerCase().includes(gender)
    );

    // Second try: language match only
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
    }

    // Fallback: first available voice
    return voice || voices[0];
  }

  /**
   * Speak text using Web Speech API
   */
  speak(text, lang = null, options = {}) {
    if (!this.isSupported()) {
      console.warn('Web Speech API not supported');
      return Promise.reject(new Error('Web Speech API not supported'));
    }

    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language
      utterance.lang = lang || this.options.lang;

      // Set voice
      const gender = options.gender || this.options.voicePreference;
      utterance.voice = this.getVoice(utterance.lang, gender);

      // Set rate and pitch
      utterance.rate = options.rate || this.options.rate;
      utterance.pitch = options.pitch || this.options.pitch;

      // Event handlers
      utterance.onstart = () => {
        this.isSpeaking = true;
        if (options.onStart) options.onStart();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        if (options.onEnd) options.onEnd();
        resolve();
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        console.error('Speech synthesis error:', event.error);
        if (options.onError) options.onError(event.error);
        reject(new Error(`Speech error: ${event.error}`));
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    });
  }

  /**
   * Stop current speech
   */
  stop() {
    this.synth.cancel();
    this.isSpeaking = false;
  }

  /**
   * Speak Bulgarian word
   */
  speakBulgarian(text, options = {}) {
    return this.speak(text, 'bg-BG', options);
  }

  /**
   * Speak German word
   */
  speakGerman(text, options = {}) {
    return this.speak(text, 'de-DE', options);
  }

  /**
   * Start speech recognition
   */
  startRecognition(lang = 'de-DE') {
    if (!this.recognition) {
      console.warn('Speech Recognition not available');
      return Promise.reject(new Error('Speech Recognition not available'));
    }

    return new Promise((resolve, reject) => {
      this.recognition.lang = lang;
      
      let finalTranscript = '';
      let interimTranscript = '';

      this.recognition.onstart = () => {
        console.log('Speech recognition started');
      };

      this.recognition.onresult = (event) => {
        interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (event.results[0].isFinal) {
          resolve({
            transcript: finalTranscript.trim(),
            isFinal: true,
            confidence: event.results[0][0].confidence
          });
        }
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        reject(new Error(`Recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        if (!finalTranscript) {
          reject(new Error('No speech detected'));
        }
      };

      this.recognition.start();
    });
  }

  /**
   * Stop speech recognition
   */
  stopRecognition() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  /**
   * Check pronunciation similarity (simple edit distance)
   */
  checkPronunciation(spoken, expected) {
    const spokenNorm = spoken.toLowerCase().trim();
    const expectedNorm = expected.toLowerCase().trim();

    if (spokenNorm === expectedNorm) {
      return { match: true, similarity: 1.0 };
    }

    const distance = this.levenshteinDistance(spokenNorm, expectedNorm);
    const maxLength = Math.max(spokenNorm.length, expectedNorm.length);
    const similarity = 1 - (distance / maxLength);

    return {
      match: similarity > 0.7, // 70% similarity threshold
      similarity: Math.round(similarity * 100) / 100,
      distance,
      spoken: spokenNorm,
      expected: expectedNorm
    };
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[0][i] = i;
    for (let j = 0; j <= len2; j++) matrix[j][0] = j;

    for (let j = 1; j <= len2; j++) {
      for (let i = 1; i <= len1; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,      // deletion
          matrix[j - 1][i] + 1,      // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[len2][len1];
  }
}

export default AudioManager;
```

### Step 2: Create Pronunciation UI Component

**File**: `assets/js/modules/pronunciation-ui.js`

```javascript
/**
 * Pronunciation UI Component
 * Renders audio controls and recording interface
 */

import AudioManager from './audio-manager.js';

class PronunciationUI {
  constructor(options = {}) {
    this.audioManager = new AudioManager(options);
    this.isRecording = false;
    this.recordedAudio = null;
  }

  /**
   * Create pronunciation button for vocabulary card
   */
  createPronunciationButton(word, lang = 'de-DE', type = 'word') {
    const button = document.createElement('button');
    button.className = 'pronunciation-btn';
    button.setAttribute('aria-label', `Pronounce ${word}`);
    button.setAttribute('data-word', word);
    button.setAttribute('data-lang', lang);
    button.innerHTML = '🔊 Play';

    button.addEventListener('click', () => {
      this.playPronunciation(word, lang, button);
    });

    return button;
  }

  /**
   * Play pronunciation
   */
  async playPronunciation(word, lang, buttonElement) {
    try {
      if (buttonElement) {
        buttonElement.disabled = true;
        buttonElement.innerHTML = '▶️ Playing...';
      }

      await this.audioManager.speak(word, lang, {
        onEnd: () => {
          if (buttonElement) {
            buttonElement.disabled = false;
            buttonElement.innerHTML = '🔊 Play';
          }
        }
      });
    } catch (error) {
      console.error('Pronunciation error:', error);
      if (buttonElement) {
        buttonElement.disabled = false;
        buttonElement.innerHTML = '❌ Error';
      }
    }
  }

  /**
   * Create speech recognition interface
   */
  createRecognitionInterface(expectedWord, lang = 'de-DE') {
    const container = document.createElement('div');
    container.className = 'pronunciation-recognition';

    const html = `
      <div class="recognition-container">
        <div class="recognition-display">
          <div class="expected-word">
            <span class="label">Say:</span>
            <span class="word">${expectedWord}</span>
          </div>
          
          <button class="record-btn" aria-label="Start recording">
            🎤 Start Recording
          </button>
          
          <div class="recognized-text" style="display: none;">
            <span class="label">You said:</span>
            <span class="transcript"></span>
          </div>
          
          <div class="recognition-feedback" style="display: none;">
            <span class="feedback-icon"></span>
            <span class="feedback-text"></span>
            <span class="similarity-score"></span>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Setup event listeners
    this.setupRecognitionListeners(container, expectedWord, lang);

    return container;
  }

  /**
   * Setup speech recognition event listeners
   */
  setupRecognitionListeners(container, expectedWord, lang) {
    const recordBtn = container.querySelector('.record-btn');
    const recognizedText = container.querySelector('.recognized-text');
    const transcript = container.querySelector('.transcript');
    const feedback = container.querySelector('.recognition-feedback');
    const feedbackIcon = container.querySelector('.feedback-icon');
    const feedbackText = container.querySelector('.feedback-text');
    const similarityScore = container.querySelector('.similarity-score');

    recordBtn.addEventListener('click', async () => {
      if (this.isRecording) {
        // Stop recording
        this.audioManager.stopRecognition();
        this.isRecording = false;
        recordBtn.innerHTML = '🎤 Start Recording';
        recordBtn.classList.remove('recording');
      } else {
        // Start recording
        try {
          this.isRecording = true;
          recordBtn.innerHTML = '⏹️ Stop Recording';
          recordBtn.classList.add('recording');
          recognizedText.style.display = 'none';
          feedback.style.display = 'none';

          const result = await this.audioManager.startRecognition(lang);
          
          // Show recognized text
          transcript.textContent = result.transcript;
          recognizedText.style.display = 'block';

          // Check pronunciation
          const check = this.audioManager.checkPronunciation(
            result.transcript,
            expectedWord
          );

          // Show feedback
          this.showPronunciationFeedback(
            feedback,
            feedbackIcon,
            feedbackText,
            similarityScore,
            check
          );

          this.isRecording = false;
          recordBtn.innerHTML = '🎤 Start Recording';
          recordBtn.classList.remove('recording');
        } catch (error) {
          console.error('Recognition error:', error);
          recordBtn.innerHTML = '❌ Error';
          this.isRecording = false;
          
          setTimeout(() => {
            recordBtn.innerHTML = '🎤 Start Recording';
          }, 2000);
        }
      }
    });
  }

  /**
   * Show pronunciation feedback
   */
  showPronunciationFeedback(container, icon, text, score, checkResult) {
    container.style.display = 'block';

    if (checkResult.match) {
      icon.innerHTML = '✅';
      icon.className = 'feedback-icon success';
      text.innerHTML = 'Perfect!';
      text.className = 'feedback-text success';
      score.innerHTML = `Similarity: ${(checkResult.similarity * 100).toFixed(0)}%`;
    } else {
      icon.innerHTML = '⚠️';
      icon.className = 'feedback-icon partial';
      text.innerHTML = 'Close, but try again!';
      text.className = 'feedback-text partial';
      score.innerHTML = `Similarity: ${(checkResult.similarity * 100).toFixed(0)}%`;
    }
  }

  /**
   * Create audio settings panel
   */
  createAudioSettings() {
    const container = document.createElement('div');
    container.className = 'audio-settings';

    const html = `
      <div class="settings-content">
        <h3>Audio Settings</h3>
        
        <label class="setting-group">
          <span>Voice Gender:</span>
          <select id="voice-gender">
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </label>

        <label class="setting-group">
          <span>Speech Rate: <span id="rate-value">1.0x</span></span>
          <input type="range" id="speech-rate" min="0.5" max="2" step="0.1" value="1.0">
        </label>

        <label class="setting-group">
          <span>Pitch: <span id="pitch-value">1.0</span></span>
          <input type="range" id="speech-pitch" min="0.5" max="2" step="0.1" value="1.0">
        </label>

        <label class="setting-group">
          <input type="checkbox" id="auto-play"> Auto-play pronunciation on load
        </label>
      </div>
    `;

    container.innerHTML = html;
    this.setupSettingsListeners(container);

    return container;
  }

  /**
   * Setup audio settings listeners
   */
  setupSettingsListeners(container) {
    const genderSelect = container.querySelector('#voice-gender');
    const rateSlider = container.querySelector('#speech-rate');
    const rateValue = container.querySelector('#rate-value');
    const pitchSlider = container.querySelector('#speech-pitch');
    const pitchValue = container.querySelector('#pitch-value');
    const autoPlayCheckbox = container.querySelector('#auto-play');

    genderSelect.addEventListener('change', (e) => {
      this.audioManager.options.voicePreference = e.target.value;
      localStorage.setItem('bgde:voice_gender', e.target.value);
    });

    rateSlider.addEventListener('input', (e) => {
      this.audioManager.options.rate = parseFloat(e.target.value);
      rateValue.textContent = `${e.target.value}x`;
      localStorage.setItem('bgde:speech_rate', e.target.value);
    });

    pitchSlider.addEventListener('input', (e) => {
      this.audioManager.options.pitch = parseFloat(e.target.value);
      pitchValue.textContent = e.target.value;
      localStorage.setItem('bgde:speech_pitch', e.target.value);
    });

    autoPlayCheckbox.addEventListener('change', (e) => {
      localStorage.setItem('bgde:auto_play_audio', e.target.checked);
    });

    // Load saved settings
    const savedGender = localStorage.getItem('bgde:voice_gender');
    if (savedGender) genderSelect.value = savedGender;

    const savedRate = localStorage.getItem('bgde:speech_rate');
    if (savedRate) {
      rateSlider.value = savedRate;
      rateValue.textContent = `${savedRate}x`;
    }

    const savedPitch = localStorage.getItem('bgde:speech_pitch');
    if (savedPitch) {
      pitchSlider.value = savedPitch;
      pitchValue.textContent = savedPitch;
    }

    const savedAutoPlay = localStorage.getItem('bgde:auto_play_audio');
    if (savedAutoPlay) autoPlayCheckbox.checked = JSON.parse(savedAutoPlay);
  }
}

export default PronunciationUI;
```

### Step 3: Add CSS Styling

**File**: `assets/scss/components/_pronunciation.scss`

```scss
.pronunciation-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }
}

.pronunciation-recognition {
  margin: 1rem 0;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px solid #e9ecef;

  .recognition-container {
    .expected-word {
      margin-bottom: 1rem;
      text-align: center;

      .label {
        display: block;
        font-size: 0.85rem;
        color: #666;
        margin-bottom: 0.25rem;
        text-transform: uppercase;
        font-weight: 600;
      }

      .word {
        display: block;
        font-size: 1.5rem;
        font-weight: 700;
        color: #333;
      }
    }

    .record-btn {
      width: 100%;
      padding: 1rem;
      background: #007bff;
      color: white;
      border: 2px solid #0056b3;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #0056b3;
        transform: scale(1.02);
      }

      &.recording {
        background: #dc3545;
        animation: pulse 1s infinite;
      }
    }

    .recognized-text {
      margin-top: 1rem;
      padding: 1rem;
      background: white;
      border-radius: 6px;
      border-left: 4px solid #28a745;

      .label {
        display: block;
        font-size: 0.85rem;
        color: #666;
        text-transform: uppercase;
        font-weight: 600;
        margin-bottom: 0.25rem;
      }

      .transcript {
        display: block;
        font-size: 1.1rem;
        color: #333;
        font-style: italic;
      }
    }

    .recognition-feedback {
      margin-top: 1rem;
      padding: 1rem;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 1rem;

      &.success {
        background: #d4edda;
        border-left: 4px solid #28a745;

        .feedback-icon.success {
          font-size: 1.5rem;
        }

        .feedback-text.success {
          color: #155724;
          font-weight: 600;
        }
      }

      &.partial {
        background: #fff3cd;
        border-left: 4px solid #ffc107;

        .feedback-icon.partial {
          font-size: 1.5rem;
        }

        .feedback-text.partial {
          color: #856404;
          font-weight: 600;
        }
      }

      .similarity-score {
        margin-left: auto;
        font-size: 0.9rem;
        font-weight: 600;
        color: #666;
      }
    }
  }
}

.audio-settings {
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;

  h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.1rem;
    color: #333;
  }

  .setting-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e9ecef;

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    > span {
      font-weight: 500;
      color: #333;
    }

    select,
    input[type="range"],
    input[type="checkbox"] {
      margin-left: 1rem;
    }

    select,
    input[type="range"] {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    input[type="checkbox"] {
      cursor: pointer;
    }
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

// Mobile responsive
@media (max-width: 640px) {
  .pronunciation-btn {
    width: 100%;
    justify-content: center;
  }

  .pronunciation-recognition {
    padding: 1rem;

    .record-btn {
      padding: 0.75rem;
    }
  }
}
```

### Step 4: Integration with Vocabulary Cards

**Update vocabulary-page.js**:

```javascript
import PronunciationUI from './modules/pronunciation-ui.js';

class VocabularyPageModule {
  init() {
    // ... existing init code ...
    this.pronunciationUI = new PronunciationUI();
    this.addPronunciationButtons();
  }

  addPronunciationButtons() {
    document.querySelectorAll('[data-vocab-item]').forEach(item => {
      const word = item.dataset.word;
      const lang = item.dataset.lang;
      
      const btnContainer = item.querySelector('.pronunciation-controls');
      if (!btnContainer) return;

      // Add Bulgarian pronunciation button
      const bgBtn = this.pronunciationUI.createPronunciationButton(word, 'bg-BG');
      btnContainer.appendChild(bgBtn);

      // Add German pronunciation button
      const deBtn = this.pronunciationUI.createPronunciationButton(word, 'de-DE');
      btnContainer.appendChild(deBtn);
    });
  }
}
```

---

## Testing Strategy

### Browser Compatibility Testing
- [ ] Chrome/Edge: Full TTS + Recognition
- [ ] Firefox: TTS only
- [ ] Safari: Limited support
- [ ] Mobile browsers: Touch controls

### Functionality Tests
- [ ] Bulgarian pronunciation audio plays
- [ ] German pronunciation audio plays
- [ ] Speech recognition works
- [ ] Pronunciation checking algorithm accurate
- [ ] Settings persist across sessions
- [ ] Graceful fallback if TTS unavailable

---

## Deployment Checklist

- [ ] Add audio-manager.js to assets/js/modules/
- [ ] Add pronunciation-ui.js to assets/js/modules/
- [ ] Add _pronunciation.scss to assets/scss/components/
- [ ] Import _pronunciation.scss in main.scss
- [ ] Integrate into vocabulary cards
- [ ] Test TTS with different languages
- [ ] Test speech recognition
- [ ] Verify localStorage persistence
- [ ] Test on multiple browsers
- [ ] Add ARIA labels for accessibility
- [ ] Test with screen readers

---

## Future Enhancements

1. **Pre-recorded Audio**: Add native speaker recordings
2. **Accent Detection**: Identify accent patterns
3. **Phonetic Transcription**: Show IPA pronunciation guide
4. **Slow Speech**: 0.5x speed for learning
5. **Audio Analytics**: Track pronunciation improvement
6. **Pronunciation Exercises**: Dedicated pronunciation drills
