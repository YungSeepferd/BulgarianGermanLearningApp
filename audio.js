// Web Speech API implementation for the Bulgarian Learning App
const speechSynthesis = window.speechSynthesis;
let currentUtterance = null;

// Language options
const LANGUAGES = {
    ENGLISH: 'en-US',
    BULGARIAN: 'bg-BG',
    GERMAN: 'de-DE'
};

// Store the selected language
let selectedLanguage = localStorage.getItem('selectedLanguage') || LANGUAGES.ENGLISH;

function setLanguage(language) {
    selectedLanguage = language;
    localStorage.setItem('selectedLanguage', language);
}

function speak(text) {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage;
    utterance.rate = parseFloat(localStorage.getItem('speechRate')) || 1.0;
    utterance.volume = parseFloat(localStorage.getItem('speechVolume')) || 1.0;
    
    currentUtterance = utterance;
    speechSynthesis.speak(utterance);

    utterance.onstart = () => {
        document.dispatchEvent(new CustomEvent('audioStateChanged', { 
            detail: { 
                isPlaying: true, 
                text,
                language: selectedLanguage 
            }
        }));
    };

    utterance.onend = () => {
        document.dispatchEvent(new CustomEvent('audioStateChanged', { 
            detail: { 
                isPlaying: false, 
                text: '',
                language: selectedLanguage
            }
        }));
        currentUtterance = null;
    };
}

function stopSpeaking() {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
}

function updateAudioSettings(rate, volume) {
    localStorage.setItem('speechRate', rate);
    localStorage.setItem('speechVolume', volume);
}
