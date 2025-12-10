# Bilingual Support Testing Plan

## Overview
This document outlines the testing strategy for verifying the bilingual support implementation in the Bulgarian-German language learning application. The testing focuses on the six critical areas addressed in the implementation:

1. Standardized language state management
2. Basic localization system
3. Language persistence
4. Content adaptation to language direction
5. Component localization
6. Overall system integration

## Test Environment
- **Browser**: Chrome, Firefox, Safari (latest versions)
- **Devices**: Desktop, Tablet, Mobile
- **Languages**: German (DE), Bulgarian (BG)
- **Language Modes**: DE_BG, BG_DE

## Test Cases

### 1. Language State Management Tests

#### Test 1.1: Default Language Setting
- **Description**: Verify that the default language is set to DE_BG when no preference exists
- **Steps**:
  1. Clear localStorage or use incognito mode
  2. Open the application
  3. Check the current language mode
- **Expected Result**: Language mode should be DE_BG
- **Verification**: Check appState.languageMode in console

#### Test 1.2: Language Toggle Functionality
- **Description**: Verify that language mode can be toggled between DE_BG and BG_DE
- **Steps**:
  1. Open the application
  2. Click the language toggle button
  3. Verify the language mode changes
  4. Click again to toggle back
- **Expected Result**: Language mode should toggle between DE_BG and BG_DE
- **Verification**: Check appState.languageMode in console and UI indicators

#### Test 1.3: Migration from Legacy Format
- **Description**: Verify that old storage format (tandem-direction) is properly migrated
- **Steps**:
  1. Set localStorage item 'tandem-direction' to 'DE->BG'
  2. Open the application
  3. Check the current language mode
  4. Repeat with 'BG->DE'
- **Expected Result**: Language mode should be DE_BG for 'DE->BG' and BG_DE for 'BG->DE'
- **Verification**: Check that 'tandem-direction' is removed and 'app-language-mode' is set

### 2. Localization System Tests

#### Test 2.1: Translation Availability
- **Description**: Verify that translations are available for all UI elements
- **Steps**:
  1. Open the application in DE_BG mode
  2. Navigate through all pages and components
  3. Toggle to BG_DE mode
  4. Navigate through all pages and components
- **Expected Result**: All UI text should be translated to the appropriate language
- **Verification**: Manual inspection of UI elements

#### Test 2.2: Translation Fallback
- **Description**: Verify that the system falls back gracefully when translations are missing
- **Steps**:
  1. Add a new UI element with no translation
  2. Open the application in both language modes
- **Expected Result**: The system should display the translation key or English fallback
- **Verification**: Manual inspection of the new UI element

#### Test 2.3: Dynamic Language Switching
- **Description**: Verify that UI updates immediately when language is changed
- **Steps**:
  1. Open the application
  2. Change language using the toggle
  3. Observe UI changes
- **Expected Result**: All UI text should update immediately without page reload
- **Verification**: Manual inspection

### 3. Language Persistence Tests

#### Test 3.1: Language Preference Persistence
- **Description**: Verify that language preference persists across page reloads
- **Steps**:
  1. Set language to BG_DE
  2. Reload the page
  3. Check current language mode
  4. Set language to DE_BG
  5. Reload the page
  6. Check current language mode
- **Expected Result**: Language mode should persist across page reloads
- **Verification**: Check appState.languageMode in console

#### Test 3.2: LocalStorage Error Handling
- **Description**: Verify that the application handles localStorage errors gracefully
- **Steps**:
  1. Simulate localStorage error (e.g., disable localStorage in browser settings)
  2. Open the application
  3. Try to change language
- **Expected Result**: Application should work normally with default language (DE_BG)
- **Verification**: Check for errors in console and application behavior

### 4. Content Adaptation Tests

#### Test 4.1: Vocabulary Display Direction
- **Description**: Verify that vocabulary items display correctly based on language direction
- **Steps**:
  1. Open a lesson with vocabulary items in DE_BG mode
  2. Check which language is displayed prominently
  3. Toggle to BG_DE mode
  4. Check which language is displayed prominently
- **Expected Result**: In DE_BG mode, German should be prominent; in BG_DE mode, Bulgarian should be prominent
- **Verification**: Manual inspection of vocabulary items

#### Test 4.2: Template Language Adaptation
- **Description**: Verify that lesson templates adapt to language direction
- **Steps**:
  1. Generate a vocabulary lesson in DE_BG mode
  2. Check the content structure and language usage
  3. Generate the same lesson in BG_DE mode
  4. Check the content structure and language usage
- **Expected Result**: Templates should show appropriate language content based on direction
- **Verification**: Manual inspection of generated lesson content

#### Test 4.3: Practice Session Language Direction
- **Description**: Verify that practice sessions adapt to language direction
- **Steps**:
  1. Start a practice session in DE_BG mode
  2. Check the question and answer language
  3. Toggle to BG_DE mode
  4. Check the question and answer language
- **Expected Result**: In DE_BG mode, questions should be in German and answers in Bulgarian; in BG_DE mode, vice versa
- **Verification**: Manual inspection of practice session

### 5. Component Localization Tests

#### Test 5.1: Navigation Localization
- **Description**: Verify that navigation elements are properly localized
- **Steps**:
  1. Check navigation items in DE_BG mode
  2. Toggle to BG_DE mode
  3. Check navigation items again
- **Expected Result**: Navigation items should be translated to the appropriate language
- **Verification**: Manual inspection of navigation bar

#### Test 5.2: Practice Component Localization
- **Description**: Verify that practice components are properly localized
- **Steps**:
  1. Open practice section in DE_BG mode
  2. Check all UI elements (buttons, labels, messages)
  3. Toggle to BG_DE mode
  4. Check all UI elements again
- **Expected Result**: All practice UI elements should be translated
- **Verification**: Manual inspection of practice component

#### Test 5.3: Lesson Generator Localization
- **Description**: Verify that lesson generator is properly localized
- **Steps**:
  1. Open lesson generator in DE_BG mode
  2. Check all form fields, labels, and buttons
  3. Toggle to BG_DE mode
  4. Check all form fields, labels, and buttons again
- **Expected Result**: All lesson generator UI elements should be translated
- **Verification**: Manual inspection of lesson generator modal

### 6. Integration Tests

#### Test 6.1: End-to-End User Flow
- **Description**: Test complete user flow with language switching
- **Steps**:
  1. Start in DE_BG mode
  2. Navigate to vocabulary section
  3. Generate a lesson
  4. Practice vocabulary
  5. Toggle to BG_DE mode
  6. Repeat the same flow
- **Expected Result**: All steps should work correctly in both language modes
- **Verification**: Manual testing of complete flow

#### Test 6.2: Error Handling
- **Description**: Verify that error messages are properly localized
- **Steps**:
  1. Trigger an error in DE_BG mode (e.g., failed lesson generation)
  2. Check error message
  3. Toggle to BG_DE mode
  4. Trigger the same error
  5. Check error message
- **Expected Result**: Error messages should be translated to the appropriate language
- **Verification**: Manual inspection of error messages

#### Test 6.3: Performance
- **Description**: Verify that language switching doesn't impact performance
- **Steps**:
  1. Open the application with complex content
  2. Rapidly toggle between language modes
  3. Observe performance and responsiveness
- **Expected Result**: Language switching should be smooth with no noticeable lag
- **Verification**: Manual testing and performance monitoring

## Test Tools
- **Manual Testing**: Primary method for UI verification
- **Browser Console**: For checking state and debugging
- **LocalStorage Inspector**: For verifying persistence
- **Playwright MCP**: For automated end-to-end testing

## Test Schedule
1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test component interactions and data flow
3. **System Tests**: Test complete user flows
4. **Regression Tests**: Verify that existing functionality still works
5. **User Acceptance Tests**: Manual testing with real users

## Reporting
- Document all test results in the `reports/testing/` directory
- Create bug reports for any issues found
- Provide screenshots and detailed descriptions for any failures