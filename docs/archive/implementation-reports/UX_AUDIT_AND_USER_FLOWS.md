# UX Audit & User Flow Analysis

**Date**: October 17, 2025  
**UX Designer**: Senior UX/Accessibility Specialist  
**Scope**: Bidirectional Bulgarian-German Learning App  
**Target Users**: German speakers learning Bulgarian & Bulgarian speakers learning German

---

## Executive Summary

### Current UX Status: 🟡 **GOOD WITH IMPROVEMENTS NEEDED**

**Overall Score**: 75/100

| Category | Score | Status |
|----------|-------|--------|
| **User Flow Clarity** | 70/100 | 🟡 FAIR |
| **Bidirectional UX** | 60/100 | 🟠 NEEDS WORK |
| **Accessibility** | 65/100 | 🟡 FAIR |
| **Visual Hierarchy** | 80/100 | ✅ GOOD |
| **Error States** | 85/100 | ✅ GOOD |
| **Language Parity** | 55/100 | 🟠 NEEDS WORK |

---

## User Personas

### Persona 1: "Klaus" - German Speaker Learning Bulgarian

**Profile**:
- 🇩🇪 Native German speaker
- 📍 Lives in Germany, planning to move to Bulgaria
- 🎯 Goal: Learn Bulgarian for daily life
- 📱 Tech-savvy, uses mobile primarily
- ⏰ Prefers 15-min daily sessions
- 🗣️ Reads Cyrillic slowly, needs Latin transliteration

**Pain Points**:
- Cyrillic alphabet is unfamiliar
- Needs more German-language UI labels
- Wants cultural context from German perspective
- Needs audio pronunciation heavily

**Success Metrics**:
- Can recognize 100 Bulgarian words in 2 weeks
- Understands basic greetings
- Can read simple Bulgarian signs

---

### Persona 2: "Мария" (Maria) - Bulgarian Speaker Learning German

**Profile**:
- 🇧🇬 Native Bulgarian speaker
- 📍 Lives in Bulgaria, working with German companies
- 🎯 Goal: Business German proficiency
- 💼 Uses desktop at work
- ⏰ Studies 30-60 min sessions
- 🗣️ Familiar with Latin alphabet, needs German grammar help

**Pain Points**:
- German cases (Nominativ, Akkusativ, Dativ, Genitiv) are confusing
- Needs Bulgarian explanations of grammar
- Wants examples in business context
- Needs compound word breakdown

**Success Metrics**:
- Can write professional emails in German
- Understands German grammar cases
- Can hold business conversations

---

## Current User Flow Analysis

### Flow 1: First-Time User Onboarding

**Current State**: ❌ **MISSING**

```
User arrives → Homepage
  ↓
❌ No onboarding
❌ No language direction selection prompt
❌ No explanation of features
  ↓
User confused about where to start
```

**Issues**:
1. No welcome screen
2. No language direction prompt
3. No feature tour
4. Assumes users know spaced repetition
5. No personalization

**Recommendation**: 🔴 **CRITICAL** - Add onboarding flow

---

### Flow 2: Changing Learning Direction (DE→BG vs BG→DE)

**Current State**: 🟡 **FUNCTIONAL BUT HIDDEN**

```
User on any page
  ↓
See language toggle button: 🇩🇪→🇧🇬
  ↓
❓ No explanation what this does
  ↓
Click button
  ↓
Button changes: 🇧🇬→🇩🇪
❓ No confirmation feedback
❓ No explanation of impact
  ↓
Content updates (if user notices)
```

**Issues**:
1. **No tooltip** explaining what toggle does
2. **No confirmation toast** after switching
3. **No explanation** of impact on learning
4. **No visual feedback** beyond button change
5. **Footer indicator** too subtle ("Deutsch → Български")

**Current Implementation**:
```html
<!-- layouts/partials/language-toggle.html -->
<div class="language-controls" data-language-toggle>
  <!-- Dynamically created by JavaScript -->
</div>
```

**UX Problems**:
- ❌ No aria-live region for screen readers
- ❌ No tooltip or help text
- ❌ No confirmation message
- ❌ Button label not translated based on direction
- ❌ No explanation of difficulty multipliers

**Recommendation**: 🟡 **HIGH** - Add contextual help and feedback

---

### Flow 3: Practice Session (Current)

**German Speaker (Klaus) Flow**:

```
1. Navigate to /practice/
   ↓
2. See flashcard with Bulgarian word: "Здравей"
   ❌ No transliteration (zdravey)
   ❌ No context (greeting)
   ↓
3. Click "Antwort zeigen" (German) ✅
   ↓
4. See translation: "Hallo" ✅
   ❌ No usage example
   ❌ No cultural note
   ↓
5. Grade card (buttons in German) ✅
   ↓
6. Next card
```

**Bulgarian Speaker (Maria) Flow**:

```
1. Navigate to /practice/
   ↓
2. See flashcard with German word: "Guten Tag"
   ✅ Familiar Latin alphabet
   ↓
3. Click "Покажи отговора" (Bulgarian) ✅
   ↓
4. See translation: "Добър ден" ✅
   ❌ No grammar notes (formal/informal)
   ❌ No context (when to use)
   ↓
5. Grade card (buttons in Bulgarian) ✅
   ↓
6. Next card
```

**Issues Common to Both**:
1. ❌ No progress saved indicator
2. ❌ No streak/motivation elements
3. ❌ No explanation of grading system
4. ❌ Session length not clearly communicated upfront
5. ❌ No pause/resume functionality visible
6. ❌ No way to mark word as "too hard" and skip

**Recommendation**: 🟡 **HIGH** - Enhance practice UX

---

### Flow 4: Vocabulary Browsing

**Current State**: ✅ **GOOD** (but missing bidirectional clarity)

```
User on /vocabulary/
  ↓
See 156 items
  ✅ Filters work (level, category)
  ✅ Search works
  ✅ Cards flip
  ↓
Filter by A1
  ✅ Updates immediately
  ↓
Click "Practice" on card
  ❌ No confirmation which direction
  ❌ Doesn't start practice session
```

**Issues**:
1. ❌ Cards don't indicate which direction (BG→DE or DE→BG)
2. ❌ "Practice" button doesn't actually start practice
3. ❌ No bulk selection for custom practice
4. ❌ Cultural notes not visible without flipping card
5. ❌ No indication which words are already learned

**Recommendation**: 🟡 **MEDIUM** - Clarify direction and add features

---

## Accessibility Audit (WCAG 2.1 Level AA)

### Current Accessibility Status: 65/100

#### ✅ **Strengths**

1. **Keyboard Navigation**: Present
   - Tab order works
   - Enter/Space supported on flashcards
   
2. **ARIA Labels**: Partially present
   ```html
   <button aria-label="Toggle dark mode">
   <button aria-label="Play pronunciation for X">
   <div role="progressbar" aria-valuemin="0">
   ```

3. **Semantic HTML**: Good
   - Proper heading hierarchy
   - `<nav>`, `<main>`, `<button>` used correctly

4. **Alt Text**: Present on images

#### ❌ **Critical Issues**

1. **No Screen Reader Announcements for Dynamic Changes**
   ```html
   <!-- MISSING: aria-live regions -->
   ❌ Language toggle: No announcement when direction changes
   ❌ Flashcard flip: No announcement of translation
   ❌ Progress updates: Not announced
   ❌ Error messages: Not properly announced
   ```

2. **Language Toggle Not Accessible**
   ```html
   <!-- Current: -->
   <button class="language-toggle-btn">
     🇩🇪→🇧🇬 DE→BG
   </button>
   
   <!-- Issues: -->
   ❌ No aria-label explaining function
   ❌ No aria-pressed state
   ❌ No screen reader announcement after toggle
   ❌ Relies on flag emojis (not accessible)
   ```

3. **Missing Focus Indicators**
   - Some buttons lack visible focus
   - Flashcard focus not obvious
   
4. **Color Contrast Issues** (needs verification)
   - Grade buttons may not meet 4.5:1 ratio
   - Secondary text may be too light

5. **No Skip Navigation Link**
   ```html
   <!-- MISSING: -->
   ❌ <a href="#main-content" class="skip-link">Skip to main content</a>
   ```

6. **Form Labels**
   ```html
   <!-- Vocabulary filters missing proper labels -->
   <select id="level-filter">
     ❌ No associated <label> element
   </select>
   ```

7. **Dynamic Content Not Announced**
   ```html
   <!-- When flashcard changes: -->
   <div class="flashcard-front">
     <div class="word-text">Здравей</div>
   </div>
   
   <!-- MISSING: -->
   ❌ No aria-live="polite"
   ❌ No announcement of new card
   ❌ No card count announcement ("Card 1 of 20")
   ```

8. **Bilingual Content Not Marked**
   ```html
   <!-- Current: -->
   <div class="word-text" lang="bg">Здравей</div> ✅
   <div class="translation-text" lang="de">Hallo</div> ✅
   
   <!-- But missing in many places: -->
   <button>Antwort zeigen / Покажи отговора</button>
   ❌ Mixed language content not marked with lang spans
   ```

#### ⚠️ **Medium Issues**

1. **Touch Targets Too Small**
   - Language toggle button: Need min 44x44px
   - Filter dropdowns: Check mobile size

2. **No Reduced Motion Support**
   ```css
   /* MISSING: */
   @media (prefers-reduced-motion: reduce) {
     /* Disable flip animations */
   }
   ```

3. **Session Timeout Warnings**
   - No warning before session expires
   - No auto-save indication

---

## Bidirectional UX Issues

### Problem 1: Language Parity ❌

**Current**: UI text is partially bilingual but inconsistent

**Examples**:

```html
<!-- Good: Bilingual labels -->
<button>Antwort zeigen / Покажи отговора</button>

<!-- Bad: Only German -->
<button>Sitzung beenden</button>

<!-- Bad: Only Bulgarian -->
<span>Точност</span>
```

**Impact**:
- German speakers can navigate easily ✅
- Bulgarian speakers struggle with German-only terms ❌
- Inconsistent experience depending on page ❌

**Recommendation**: 🔴 **CRITICAL** - Full i18n implementation

---

### Problem 2: Cultural Context Not Bidirectional ❌

**Current**: Cultural notes exist but not adapted per direction

Example:
```json
{
  "word": "Здравей",
  "translation": "Hallo",
  "cultural_note": "Standard informal greeting used throughout the day in Bulgaria."
}
```

**Issues**:
- ❌ Note written from Bulgarian perspective
- ❌ German speaker needs: "Similar to German 'Hallo' but can be used all day"
- ❌ Bulgarian speaker needs: "German 'Hallo' is less formal than 'Guten Tag'"

**Recommendation**: 🟡 **HIGH** - Add direction-aware cultural notes

---

### Problem 3: Direction Indicator Too Subtle ❌

**Current**: Footer shows "Deutsch → Български"

**Issues**:
- Too small (footer)
- Easy to miss
- Not contextual to current activity
- No persistent indicator on flashcards

**Recommendation**: 🟡 **HIGH** - Add prominent direction indicator

---

### Problem 4: Grading Labels Not Contextual ❌

**Current**: Grade buttons show "Wrong / Hard / Good / Easy"

**Issue**: Same labels for both directions

**Better UX**:

For Klaus (DE→BG):
- "Didn't recognize the Cyrillic"
- "Recognized but couldn't translate"
- "Translated with effort"
- "Translated easily"

For Maria (BG→DE):
- "Didn't remember the German word"
- "Remembered but wrong case"
- "Remembered after thinking"
- "Perfect recall with correct case"

**Recommendation**: 🟢 **MEDIUM** - Context-aware grading labels

---

## Visual Hierarchy Issues

### Issue 1: Language Toggle Placement ⚠️

**Current**: In header navigation (good) ✅  
**But**: Not prominent enough for core feature ❌

**Recommendation**: 
- Make larger
- Add badge "Switch direction"
- Highlight on first use

---

### Issue 2: Progress Indicators Scattered ⚠️

**Current State**:
- Progress bar at top
- Stats in sidebar
- Accuracy separate
- Time separate

**Better**:
- Consolidated stats panel
- Visual progress circle
- Achievement badges
- Streak counter

---

### Issue 3: Call-to-Action Not Clear ⚠️

**Homepage Issues**:
- Too many options
- No clear "Start Learning" path
- No direction selection prompt

**Recommendation**: Single primary CTA with direction choice

---

## Mobile UX Issues

### Issue 1: Touch Targets ❌

**Current**: Some buttons too small for mobile

**Minimum Required**: 44x44px (Apple HIG, Material Design)

**Check Required**:
- Language toggle button
- Grade buttons on mobile
- Filter dropdowns
- Card flip areas

---

### Issue 2: Landscape Mode ⚠️

**Need to verify**:
- Flashcards in landscape
- Navigation accessibility
- Stats visibility

---

## User Flow Redesign Recommendations

### Proposed Flow 1: Enhanced Onboarding

```
NEW USER ARRIVES
  ↓
Welcome Screen
  ↓
"I speak..." selection
  [🇩🇪 German] or [🇧🇬 Bulgarian]
  ↓
"I want to learn..." 
  (Pre-selected based on first choice)
  ↓
"Why are you learning?"
  [ ] Travel
  [ ] Work
  [ ] Family
  [ ] Personal interest
  ↓
Quick Tutorial (3 screens)
  1. How flashcards work
  2. Grading system explained
  3. Spaced repetition benefit
  ↓
"Start your first session"
  → Practice page with 5 cards
```

**Benefits**:
- Personalizes experience immediately
- Sets correct learning direction
- Explains core concepts
- Reduces confusion
- Increases engagement

---

### Proposed Flow 2: Enhanced Language Toggle

```
CURRENT STATE: DE→BG
  ↓
User clicks toggle button (now with tooltip)
  ↓
Modal appears:
  ┌────────────────────────────────────┐
  │ Switch Learning Direction?         │
  │                                    │
  │ Currently: German → Bulgarian      │
  │ Change to: Bulgarian → German?     │
  │                                    │
  │ This will:                         │
  │ • Show Bulgarian words to translate│
  │ • Adjust difficulty                │
  │ • Update all practice sessions     │
  │                                    │
  │ [Cancel] [Switch Direction]        │
  └────────────────────────────────────┘
  ↓
User confirms
  ↓
Toast notification appears:
  "✓ Switched to BG→DE mode"
  ↓
Page updates with animation
  ↓
Direction indicator updates everywhere
```

**Benefits**:
- Clear explanation
- Prevents accidental switches
- Shows impact before change
- Provides confirmation
- Educates user

---

### Proposed Flow 3: Enhanced Practice Session

```
START PRACTICE
  ↓
Session Setup Screen (NEW)
  ┌────────────────────────────────────┐
  │ Setup Your Practice Session        │
  │                                    │
  │ Direction: [🇩🇪→🇧🇬 German to Bulgarian]│
  │ Length: [ 10 | 20 | 30 | 50 cards ]│
  │ Focus: [✓ New words] [✓ Review]   │
  │ Level: [✓ A1] [✓ A2] [ ] B1 [ ] B2│
  │                                    │
  │ [Start Session]                    │
  └────────────────────────────────────┘
  ↓
Card 1 of 20
  ┌────────────────────────────────────┐
  │ 🇩🇪→🇧🇬                      1/20  │
  ├────────────────────────────────────┤
  │                                    │
  │         Здравей                    │
  │        (zdravey)                   │
  │                                    │
  │         A1 • Greeting              │
  │                                    │
  │    [Show Translation]              │
  │    [💡 Hint]                       │
  └────────────────────────────────────┘
  ↓
Show Translation clicked
  ┌────────────────────────────────────┐
  │ 🇩🇪→🇧🇬                      1/20  │
  ├────────────────────────────────────┤
  │ Bulgarian: Здравей (zdravey)       │
  │ German: Hallo                      │
  │                                    │
  │ 💡 Tip: Used throughout the day,   │
  │    similar to "Hi" in English      │
  │                                    │
  │ How well did you know this?        │
  │ [❌ Wrong] [🤔 Hard] [👍 Good] [😊 Easy]│
  └────────────────────────────────────┘
  ↓
Grade selected → Auto-advance
  ↓
Progress saved → Visual feedback
  ↓
Next card with smooth transition
```

**Benefits**:
- Session customization
- Clear direction indicator on every card
- Transliteration for Cyrillic
- Contextual tips
- Emoji-enhanced grading (universal)
- Visual feedback for actions
- Progress transparency

---

## Accessibility Improvement Plan

### Priority 1: Critical (Implement Immediately)

1. **Add aria-live regions**
```html
<!-- Add to practice page -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  <span id="card-announcement"></span>
</div>

<script>
// When card changes:
document.getElementById('card-announcement').textContent = 
  `Card ${current} of ${total}. Word: ${word}`;
</script>
```

2. **Fix language toggle accessibility**
```html
<button 
  class="language-toggle-btn"
  aria-label="Switch learning direction. Currently German to Bulgarian"
  aria-pressed="false"
  aria-describedby="toggle-description">
  <span aria-hidden="true">🇩🇪→🇧🇬</span>
  <span class="sr-only">German to Bulgarian</span>
</button>
<span id="toggle-description" class="sr-only">
  Click to switch to learning German from Bulgarian
</span>
```

3. **Add skip link**
```html
<a href="#main-content" class="skip-link">
  Skip to main content / Към основното съдържание
</a>
```

4. **Fix form labels**
```html
<label for="level-filter">
  Difficulty Level / Ниво на трудност
</label>
<select id="level-filter" aria-label="Filter by difficulty level">
  ...
</select>
```

---

### Priority 2: High (Next Sprint)

1. **Add reduced motion support**
```css
@media (prefers-reduced-motion: reduce) {
  .flashcard {
    transition: none !important;
  }
  .fade-in,
  .slide-in {
    animation: none !important;
  }
}
```

2. **Improve focus indicators**
```css
:focus-visible {
  outline: 3px solid var(--focus-color, #2196F3);
  outline-offset: 2px;
}

.flashcard:focus-visible {
  box-shadow: 0 0 0 4px rgba(33, 150, 243, 0.4);
}
```

3. **Add touch target sizing**
```css
/* Ensure minimum 44x44px on mobile */
@media (max-width: 768px) {
  button,
  .clickable {
    min-width: 44px;
    min-height: 44px;
  }
}
```

---

### Priority 3: Medium (Month 2)

1. **Add keyboard shortcuts guide**
2. **Implement high contrast mode**
3. **Add text size controls**
4. **Test with actual screen readers** (NVDA, JAWS, VoiceOver)

---

## Implementation Priority Matrix

| Feature | Impact | Effort | Priority | Timeline |
|---------|--------|--------|----------|----------|
| **Onboarding flow** | HIGH | MEDIUM | 🔴 P0 | Week 1 |
| **Language toggle UX** | HIGH | LOW | 🔴 P0 | Week 1 |
| **Aria-live regions** | HIGH | LOW | 🔴 P0 | Week 1 |
| **Skip link** | MEDIUM | LOW | 🟡 P1 | Week 1 |
| **Session setup screen** | HIGH | MEDIUM | 🟡 P1 | Week 2 |
| **Direction indicator** | MEDIUM | LOW | 🟡 P1 | Week 2 |
| **Transliteration** | MEDIUM | MEDIUM | 🟡 P1 | Week 2 |
| **Context-aware tips** | MEDIUM | HIGH | 🟢 P2 | Week 3 |
| **Form labels** | MEDIUM | LOW | 🟢 P2 | Week 3 |
| **Reduced motion** | MEDIUM | LOW | 🟢 P2 | Week 3 |
| **Full i18n** | HIGH | HIGH | 🟢 P2 | Month 2 |

---

## Testing Plan

### Phase 1: Usability Testing with Real Users

**Participants Needed**:
- 3 German speakers (Klaus persona)
- 3 Bulgarian speakers (Maria persona)
- 2 users with disabilities (screen reader, motor impairment)

**Test Scenarios**:
1. First-time user onboarding
2. Changing learning direction
3. Complete practice session
4. Browse and filter vocabulary
5. Handle errors gracefully

**Success Metrics**:
- Task completion rate > 90%
- Time to first practice < 3 min
- Direction change understanding > 80%
- Zero accessibility blockers

---

### Phase 2: Accessibility Testing

**Tools**:
- [ ] axe DevTools
- [ ] WAVE
- [ ] Lighthouse Accessibility
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] Keyboard-only navigation test
- [ ] Color contrast analyzer

**Target**: WCAG 2.1 Level AA compliance (100%)

---

### Phase 3: Cross-Device Testing

**Devices**:
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] iPad (landscape/portrait)
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)

---

## Next Steps

1. **Review this audit with stakeholders**
2. **Prioritize fixes based on matrix**
3. **Implement P0 improvements**
4. **Test with real users**
5. **Iterate based on feedback**
6. **Document UX guidelines**

---

**Document Status**: DRAFT  
**Next Review**: After P0 implementation  
**Owner**: Senior UX Designer  
**Stakeholders**: Product, Engineering, QA
