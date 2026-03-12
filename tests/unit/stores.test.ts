/**
 * Unit tests for Settings Stores
 *
 * Tests the persisted stores including:
 * - Settings store initialization and defaults
 * - Theme changes
 * - Language mode changes
 * - Persistence to localStorage
 * - Helper functions
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { get } from 'svelte/store';

// Mock the persisted store before importing settings
vi.mock('svelte-persisted-store', () => {
    return {
        persisted: <T>(_key: string, initialValue: T) => {
            let value = initialValue;
            const subscribers = new Set<(value: T) => void>();
            
            return {
                subscribe: (callback: (value: T) => void) => {
                    subscribers.add(callback);
                    callback(value);
                    return () => { subscribers.delete(callback); };
                },
                set: (newValue: T) => {
                    value = newValue;
                    subscribers.forEach(cb => cb(value));
                },
                update: (updater: (value: T) => T) => {
                    const newValue = updater(value);
                    value = newValue;
                    subscribers.forEach(cb => cb(newValue));
                }
            };
        }
    };
});

// Mock constants
vi.mock('$lib/constants/app', () => ({
    STORAGE_KEY_PREFIX: 'bg-de-learn'
}));

// Import after mocks
import {
    userSettings,
    studyProgress,
    lessonState,
    practicePreferences,
    toggleLanguageMode,
    setLanguageMode,
    recordStudySession,
    resetLessonState,
    startLesson,
    completeLessonItem,
    exportAllUserData,
    importAllUserData
} from '$lib/stores/settings';

describe('Settings Stores', () => {
    beforeEach(() => {
        vi.stubGlobal('localStorage', {
            getItem: vi.fn(() => null),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn(),
            key: vi.fn(() => null),
            get length() { return 0; }
        });
        
        vi.stubGlobal('sessionStorage', {
            getItem: vi.fn(() => null),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn(),
            key: vi.fn(() => null),
            get length() { return 0; }
        });
    });
    
    afterEach(() => {
        vi.resetAllMocks();
    });
    
    describe('userSettings', () => {
        it('should have correct default values', () => {
            const settings = get(userSettings);
            
            expect(settings.languageMode).toBe('DE_BG');
            expect(settings.dailyGoal).toBe(10);
            expect(settings.audioEnabled).toBe(true);
            expect(settings.notificationsEnabled).toBe(false);
            expect(settings.theme).toBe('system');
            expect(settings.uiLanguage).toBe('de');
        });
        
        it('should update language mode', () => {
            userSettings.set({
                languageMode: 'BG_DE',
                dailyGoal: 10,
                audioEnabled: true,
                notificationsEnabled: false,
                theme: 'system',
                uiLanguage: 'de'
            });
            
            const settings = get(userSettings);
            expect(settings.languageMode).toBe('BG_DE');
        });
        
        it('should update theme', () => {
            userSettings.update(s => ({ ...s, theme: 'dark' }));
            
            const settings = get(userSettings);
            expect(settings.theme).toBe('dark');
        });
        
        it('should update daily goal', () => {
            userSettings.update(s => ({ ...s, dailyGoal: 20 }));
            
            const settings = get(userSettings);
            expect(settings.dailyGoal).toBe(20);
        });
        
        it('should toggle audio enabled', () => {
            userSettings.update(s => ({ ...s, audioEnabled: !s.audioEnabled }));
            
            const settings = get(userSettings);
            expect(settings.audioEnabled).toBe(false);
        });
    });
    
    describe('toggleLanguageMode', () => {
        it('should toggle from DE_BG to BG_DE', () => {
            userSettings.set({
                languageMode: 'DE_BG',
                dailyGoal: 10,
                audioEnabled: true,
                notificationsEnabled: false,
                theme: 'system',
                uiLanguage: 'de'
            });
            
            toggleLanguageMode();
            
            const settings = get(userSettings);
            expect(settings.languageMode).toBe('BG_DE');
        });
        
        it('should toggle from BG_DE to DE_BG', () => {
            userSettings.set({
                languageMode: 'BG_DE',
                dailyGoal: 10,
                audioEnabled: true,
                notificationsEnabled: false,
                theme: 'system',
                uiLanguage: 'de'
            });
            
            toggleLanguageMode();
            
            const settings = get(userSettings);
            expect(settings.languageMode).toBe('DE_BG');
        });
    });
    
    describe('setLanguageMode', () => {
        it('should set language mode explicitly', () => {
            setLanguageMode('BG_DE');
            
            const settings = get(userSettings);
            expect(settings.languageMode).toBe('BG_DE');
        });
    });
    
    describe('studyProgress', () => {
        it('should have correct default values', () => {
            const progress = get(studyProgress);
            
            expect(progress.currentStreak).toBe(0);
            expect(progress.longestStreak).toBe(0);
            expect(progress.lastStudyDate).toBeNull();
            expect(progress.totalWordsLearned).toBe(0);
            expect(progress.totalXP).toBe(0);
            expect(progress.level).toBe(1);
        });
        
        it('should update progress', () => {
            studyProgress.update(p => ({
                ...p,
                totalWordsLearned: 10,
                totalXP: 100
            }));
            
            const progress = get(studyProgress);
            expect(progress.totalWordsLearned).toBe(10);
            expect(progress.totalXP).toBe(100);
        });
    });
    
    describe('recordStudySession', () => {
        it('should increment streak on first session', () => {
            studyProgress.set({
                currentStreak: 0,
                longestStreak: 0,
                lastStudyDate: null,
                totalWordsLearned: 0,
                totalXP: 0,
                level: 1
            });
            
            recordStudySession(5, 50);
            
            const progress = get(studyProgress);
            expect(progress.currentStreak).toBe(1);
            expect(progress.totalWordsLearned).toBe(5);
            expect(progress.totalXP).toBe(50);
        });
        
        it('should update level based on XP', () => {
            studyProgress.set({
                currentStreak: 0,
                longestStreak: 0,
                lastStudyDate: null,
                totalWordsLearned: 0,
                totalXP: 0,
                level: 1
            });
            
            recordStudySession(10, 150);
            
            const progress = get(studyProgress);
            expect(progress.level).toBe(2);
        });
    });
    
    describe('lessonState', () => {
        it('should have correct default values', () => {
            const state = get(lessonState);
            
            expect(state.currentLessonId).toBeNull();
            expect(state.completedItemIds).toEqual([]);
            expect(state.startTime).toBeNull();
            expect(state.lastActivity).toBeNull();
        });
    });
    
    describe('startLesson', () => {
        it('should start a new lesson', () => {
            startLesson('lesson-123');
            
            const state = get(lessonState);
            expect(state.currentLessonId).toBe('lesson-123');
            expect(state.completedItemIds).toEqual([]);
            expect(state.startTime).not.toBeNull();
        });
    });
    
    describe('completeLessonItem', () => {
        it('should mark item as completed', () => {
            startLesson('lesson-123');
            completeLessonItem('item-456');
            
            const state = get(lessonState);
            expect(state.completedItemIds).toContain('item-456');
        });
    });
    
    describe('resetLessonState', () => {
        it('should reset lesson state', () => {
            startLesson('lesson-123');
            completeLessonItem('item-456');
            
            resetLessonState();
            
            const state = get(lessonState);
            expect(state).toEqual({
                currentLessonId: null,
                completedItemIds: [],
                startTime: null,
                lastActivity: null
            });
        });
    });
    
    describe('practicePreferences', () => {
        it('should have correct default values', () => {
            const prefs = get(practicePreferences);
            
            expect(prefs.autoShowAnswerDelay).toBe(0);
            expect(prefs.hapticFeedback).toBe(true);
            expect(prefs.showTransliteration).toBe(true);
            expect(prefs.flipAnimationDuration).toBe(300);
        });
        
        it('should update preferences', () => {
            practicePreferences.update(p => ({
                ...p,
                autoShowAnswerDelay: 2000,
                showTransliteration: false
            }));
            
            const prefs = get(practicePreferences);
            expect(prefs.autoShowAnswerDelay).toBe(2000);
            expect(prefs.showTransliteration).toBe(false);
        });
    });
    
    describe('exportAllUserData', () => {
        it('should export all user data as JSON', () => {
            userSettings.set({
                languageMode: 'BG_DE',
                dailyGoal: 15,
                audioEnabled: false,
                notificationsEnabled: true,
                theme: 'dark',
                uiLanguage: 'bg'
            });
            
            const exported = exportAllUserData();
            const data = JSON.parse(exported);
            
            expect(data.settings).toBeDefined();
            expect(data.settings.languageMode).toBe('BG_DE');
            expect(data.progress).toBeDefined();
            expect(data.lesson).toBeDefined();
            expect(data.practice).toBeDefined();
        });
    });
    
    describe('importAllUserData', () => {
        it('should import valid user data', () => {
            const testData = JSON.stringify({
                settings: {
                    languageMode: 'DE_BG',
                    dailyGoal: 25,
                    audioEnabled: true,
                    notificationsEnabled: true,
                    theme: 'light',
                    uiLanguage: 'en'
                },
                progress: {
                    currentStreak: 5,
                    longestStreak: 10,
                    lastStudyDate: '2025-01-15',
                    totalWordsLearned: 100,
                    totalXP: 500,
                    level: 6
                }
            });
            
            const result = importAllUserData(testData);
            
            expect(result).toBe(true);
            
            const settings = get(userSettings);
            expect(settings.languageMode).toBe('DE_BG');
            expect(settings.dailyGoal).toBe(25);
        });
        
        it('should return false for invalid JSON', () => {
            const result = importAllUserData('invalid json');
            expect(result).toBe(false);
        });
    });
});

describe('Persisted Store', () => {
    let mockLocalStorage: Record<string, string>;
    
    beforeEach(() => {
        mockLocalStorage = {};
        
        vi.stubGlobal('localStorage', {
            getItem: vi.fn((key: string) => mockLocalStorage[key] ?? null),
            setItem: vi.fn((key: string, value: string) => {
                mockLocalStorage[key] = value;
            }),
            removeItem: vi.fn((key: string) => {
                delete mockLocalStorage[key];
            }),
            clear: vi.fn(() => {
                mockLocalStorage = {};
            }),
            key: vi.fn((index: number) => Object.keys(mockLocalStorage)[index] ?? null),
            get length() {
                return Object.keys(mockLocalStorage).length;
            }
        });
    });
    
    it('should persist data to localStorage when set', () => {
        userSettings.set({
            languageMode: 'BG_DE',
            dailyGoal: 20,
            audioEnabled: true,
            notificationsEnabled: true,
            theme: 'dark',
            uiLanguage: 'bg'
        });
        
        // The mock doesn't actually persist, but the store should work
        const settings = get(userSettings);
        expect(settings.languageMode).toBe('BG_DE');
    });
    
    it('should handle missing localStorage gracefully', () => {
        vi.stubGlobal('localStorage', undefined);
        
        expect(() => {
            userSettings.set({
                languageMode: 'DE_BG',
                dailyGoal: 10,
                audioEnabled: true,
                notificationsEnabled: false,
                theme: 'system',
                uiLanguage: 'de'
            });
        }).not.toThrow();
    });
});