describe('Audio functionality', () => {
    beforeEach(() => {
        // Mock localStorage
        const localStorageMock = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            clear: jest.fn()
        };
        global.localStorage = localStorageMock;
        
        // Mock Web Speech API
        global.speechSynthesis = {
            speaking: false,
            cancel: jest.fn(),
            speak: jest.fn()
        };
        global.SpeechSynthesisUtterance = jest.fn();
    });

    test('setLanguage updates localStorage', () => {
        setLanguage('bg-BG');
        expect(localStorage.setItem).toHaveBeenCalledWith('selectedLanguage', 'bg-BG');
    });

    test('speak function uses correct language', () => {
        localStorage.getItem.mockReturnValue('bg-BG');
        speak('test');
        expect(SpeechSynthesisUtterance).toHaveBeenCalled();
        expect(speechSynthesis.speak).toHaveBeenCalled();
    });
});
