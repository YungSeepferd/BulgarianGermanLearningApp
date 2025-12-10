# Manual Testing Guide for Bilingual Support

This document provides step-by-step instructions for manually testing the bilingual support implementation in the Bulgarian-German language learning application.

## Setup Instructions

1. **Start the development server**:
   ```bash
   pnpm dev
   ```

2. **Open the application** in your browser at `http://localhost:5173`

3. **Open the browser console** (F12 or Ctrl+Shift+I) for debugging

## Test Cases

### 1. Language State Management Tests

#### Test 1.1: Default Language Setting
1. Open the browser console
2. Clear localStorage: `localStorage.clear()`
3. Refresh the page
4. In the console, run: `appState.languageMode`
5. **Expected**: Should return `"DE_BG"`

#### Test 1.2: Language Toggle Functionality
1. In the application, find the language toggle button (usually in the top navigation)
2. Click the toggle button
3. In the console, run: `appState.languageMode`
4. **Expected**: Should return `"BG_DE"`
5. Click the toggle button again
6. In the console, run: `appState.languageMode`
7. **Expected**: Should return `"DE_BG"`

#### Test 1.3: Migration from Legacy Format
1. Open the browser console
2. Set legacy format: `localStorage.setItem('tandem-direction', 'DE->BG')`
3. Refresh the page
4. In the console, run: `appState.languageMode`
5. **Expected**: Should return `"DE_BG"`
6. In the console, run: `localStorage.getItem('tandem-direction')`
7. **Expected**: Should return `null` (legacy key should be removed)
8. In the console, run: `localStorage.getItem('app-language-mode')`
9. **Expected**: Should return `"DE_BG"`

### 2. Localization System Tests

#### Test 2.1: Translation Availability
1. Navigate through all pages (Dashboard, Vocabulary, Grammar, Practice, Learn)
2. Check that all UI text is in English (DE_BG mode)
3. Click the language toggle to switch to BG_DE mode
4. Navigate through all pages again
5. Check that all UI text is translated to Bulgarian
6. Click the language toggle to switch back to DE_BG mode
7. Check that all UI text is back in English

#### Test 2.2: Dynamic Language Switching
1. Open a page with multiple UI elements (e.g., Practice page)
2. Click the language toggle button
3. **Expected**: All UI text should update immediately without page reload
4. Click the language toggle button again
5. **Expected**: All UI text should update back immediately

### 3. Language Persistence Tests

#### Test 3.1: Language Preference Persistence
1. Set language to BG_DE using the toggle button
2. Refresh the page
3. **Expected**: Language should remain BG_DE
4. Set language to DE_BG using the toggle button
5. Refresh the page
6. **Expected**: Language should remain DE_BG

### 4. Content Adaptation Tests

#### Test 4.1: Vocabulary Display Direction
1. Generate or open a lesson with vocabulary items
2. In DE_BG mode, check that German words are displayed prominently
3. Toggle to BG_DE mode
4. Check that Bulgarian words are now displayed prominently
5. Toggle back to DE_BG mode
6. Check that German words are displayed prominently again

#### Test 4.2: Practice Session Language Direction
1. Start a practice session
2. In DE_BG mode, check that questions are in German and answers should be in Bulgarian
3. Toggle to BG_DE mode
4. Check that questions are now in Bulgarian and answers should be in German
5. Complete a few practice items to verify the flow works correctly

### 5. Component Localization Tests

#### Test 5.1: Navigation Localization
1. Check navigation items in DE_BG mode (should be in English)
2. Toggle to BG_DE mode
3. Check navigation items (should be in Bulgarian)
4. Toggle back to DE_BG mode
5. Check navigation items (should be back in English)

#### Test 5.2: Practice Component Localization
1. Open the Practice page in DE_BG mode
2. Check all buttons, labels, and messages (should be in English)
3. Toggle to BG_DE mode
4. Check all buttons, labels, and messages (should be in Bulgarian)
5. Try answering a question and check feedback messages

#### Test 5.3: Lesson Generator Localization
1. Open the lesson generator modal
2. Check all form fields, labels, and buttons (should be in English)
3. Toggle to BG_DE mode
4. Check all form fields, labels, and buttons (should be in Bulgarian)
5. Try generating a lesson to verify the flow works

### 6. Integration Tests

#### Test 6.1: End-to-End User Flow
1. Start in DE_BG mode
2. Navigate to Vocabulary section
3. Generate a lesson
4. Practice vocabulary
5. Toggle to BG_DE mode
6. Repeat the same flow (navigate, generate, practice)
7. **Expected**: All steps should work correctly in both language modes

#### Test 6.2: Error Handling
1. In DE_BG mode, try to trigger an error (e.g., by disconnecting from the internet and trying to generate a lesson)
2. Check error message (should be in English)
3. Toggle to BG_DE mode
4. Trigger the same error
5. Check error message (should be in Bulgarian)

## Verification Checklist

### Language State Management
- [ ] Default language is DE_BG when no preference exists
- [ ] Language can be toggled between DE_BG and BG_DE
- [ ] Legacy format is properly migrated to new format
- [ ] Language preference persists across page reloads

### Localization System
- [ ] All UI elements are translated in both languages
- [ ] Language switching happens immediately without page reload
- [ ] Missing translations fall back gracefully

### Content Adaptation
- [ ] Vocabulary items display correct language based on direction
- [ ] Practice sessions adapt to language direction
- [ ] Lesson content adapts to language direction

### Component Localization
- [ ] Navigation components are properly localized
- [ ] Practice components are properly localized
- [ ] Lesson generator is properly localized
- [ ] Error messages are properly localized

### Integration
- [ ] Complete user flows work in both language modes
- [ ] Language switching works during active sessions
- [ ] Performance is not impacted by language switching

## Reporting Issues

If you find any issues during testing:

1. Note the exact steps to reproduce the issue
2. Take screenshots if applicable
3. Check the browser console for errors
4. Report the issue with as much detail as possible

## Test Results Template

```markdown
# Test Results - [Date]

## Environment
- Browser: [Chrome/Firefox/Safari]
- Device: [Desktop/Tablet/Mobile]
- OS: [Windows/macOS/Linux]

## Test Results

### Language State Management
- Test 1.1: [Pass/Fail] - Notes:
- Test 1.2: [Pass/Fail] - Notes:
- Test 1.3: [Pass/Fail] - Notes:

### Localization System
- Test 2.1: [Pass/Fail] - Notes:
- Test 2.2: [Pass/Fail] - Notes:

### Language Persistence
- Test 3.1: [Pass/Fail] - Notes:

### Content Adaptation
- Test 4.1: [Pass/Fail] - Notes:
- Test 4.2: [Pass/Fail] - Notes:

### Component Localization
- Test 5.1: [Pass/Fail] - Notes:
- Test 5.2: [Pass/Fail] - Notes:
- Test 5.3: [Pass/Fail] - Notes:

### Integration
- Test 6.1: [Pass/Fail] - Notes:
- Test 6.2: [Pass/Fail] - Notes:

## Issues Found
- [Issue 1]: Description, Steps to reproduce, Screenshots
- [Issue 2]: Description, Steps to reproduce, Screenshots

## Overall Assessment
[Pass/Fail] - Overall assessment of the bilingual support implementation