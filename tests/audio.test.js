/* eslint-env jest, node */

describe('Audio functionality', () => {
    let audio;

    beforeEach(() => {
        // Clear localStorage
        window.localStorage.clear();

        // Mock Web Speech API
        global.speechSynthesis = {
            speaking: false,
            cancel: jest.fn(),
            speak: jest.fn()
        };
        global.SpeechSynthesisUtterance = jest.fn();

        // Require module after mocks are set
        jest.resetModules();
        audio = require('../audio.js');
    });

    test('setLanguage updates localStorage', () => {
        audio.setLanguage('bg-BG');
        expect(window.localStorage.getItem('selectedLanguage')).toBe('bg-BG');
    });

    test('speak function uses correct language', () => {
        window.localStorage.setItem('selectedLanguage', 'bg-BG');
        audio.speak('test');
        expect(SpeechSynthesisUtterance).toHaveBeenCalled();
        expect(speechSynthesis.speak).toHaveBeenCalled();
    });
});
