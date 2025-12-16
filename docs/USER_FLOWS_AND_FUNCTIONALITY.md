# User Flows and Functionality Map

**Date**: December 17, 2025
**Version**: 1.0
**Status**: Verified via Live Browser Inspection

This document maps the user flows, interactive elements, and functionality of the Bulgarian-German Learning App. It serves as a reference for testing, development, and UX analysis.

---

## 1. Global Navigation (Header)
*Present on all pages.*

| Element | Type | Action | Destination |
| :--- | :--- | :--- | :--- |
| **Logo/Title** | Link | Click | `/` (Home) |
| **Dashboard** | Link | Click | `/` (Home) |
| **Vokabular** | Link | Click | `/vocabulary` |
| **Grammatik** | Link | Click | `/grammar` |
| **Üben** | Link | Click | `/practice` |
| **Lernen** | Link | Click | `/learn` |
| **Language Toggle** | Button | Click | Toggles App Mode (`DE_BG` ↔ `BG_DE`) |

---

## 2. Dashboard (Home)
**Route**: `/`

### Core Functionality
- **Overview**: Provides quick access to key app sections and displays high-level stats.
- **Stats Display**: Shows "Wörter gelernt" (Words learned) and "Aktuelle Serie" (Current streak).

### Interactive Elements
| Element | Type | Action | Flow |
| :--- | :--- | :--- | :--- |
| **"Jetzt üben"** | Button | Click | Navigates to `/practice` (Quick start) |
| **"Vokabular"** | Card/Link | Click | Navigates to `/vocabulary` |
| **"Grammatik"** | Card/Link | Click | Navigates to `/grammar` |
| **"Lernen"** | Card/Link | Click | Navigates to `/learn` |

---

## 3. Vocabulary (Wortschatz)
**Route**: `/vocabulary`

### Core Functionality
- **Database View**: Lists all 746 vocabulary items.
- **Filtering**: Allows users to narrow down the list by difficulty, category, part of speech, and learning phase.
- **Selection**: Users can select specific words to practice.

### Interactive Elements
| Element | Type | Action | Flow |
| :--- | :--- | :--- | :--- |
| **Search Box** | Input | Type | Filters list by text (German or Bulgarian) |
| **Difficulty Filters** | Buttons | Click | Filter by A1, A2, B1, B2, C1, Alle |
| **Category** | Combobox | Select | Filter by topic (e.g., "Begrüßungen") |
| **Part of Speech** | Combobox | Select | Filter by grammar type (e.g., "Substantiv") |
| **Learning Phase** | Combobox | Select | Filter by user progress (e.g., "Neu", "Gelernt") |
| **"Filter zurücksetzen"** | Button | Click | Clears all active filters |
| **"Auswahl üben (X)"** | Button | Click | Starts practice session with selected items (Disabled if 0) |
| **Item Card** | Button | Click | Expands/Details (if applicable) or Focus |
| **"Üben" (Item)** | Button | Click | Starts immediate practice for this single word |
| **Checkbox (Item)** | Input | Check | Adds item to "Auswahl üben" selection |

---

## 4. Grammar (Grammatik)
**Route**: `/grammar`

### Core Functionality
- **Reference**: Displays a table of 12 key grammar rules.
- **Examples**: Shows bilingual examples for each rule.

### Interactive Elements
| Element | Type | Action | Flow |
| :--- | :--- | :--- | :--- |
| **Search Box** | Input | Type | Filters rules by text |
| **"Beispiele anzeigen"** | Checkbox | Toggle | Shows/Hides example column in table |
| **Category List** | List | Click | Scrolls to/Filters by category (Verbformen, Fälle, etc.) |

---

## 5. Practice (Üben)
**Route**: `/practice`

### Core Functionality
- **Interactive Learning**: Flashcard-style practice with text input.
- **Feedback**: Immediate validation of answers.
- **Stats**: Real-time session stats (Correct, Streak, Accuracy).

### Interactive Elements
| Element | Type | Action | Flow |
| :--- | :--- | :--- | :--- |
| **Tandem Toggle** | Button | Click | Switches direction (DE→BG ↔ BG→DE) for this session |
| **Mode Toggle** | Button | Click | Switches between "Üben" (Practice) and "Suchen" (Search) modes |
| **Favorite Heart** | Button | Click | Toggles "Favorite" status for current word |
| **Answer Input** | Textbox | Type | User types translation |
| **"Antwort prüfen"** | Button | Click | Submits answer for validation (Disabled if empty) |
| **Recommendation** | Button | Click | Loads a specific recommended word into the flashcard |

---

## 6. Learn (Lernen)
**Route**: `/learn`

### Core Functionality
- **Guided Paths**: Intended to offer structured learning (A1, A2, etc.).
- **Quick Actions**: Shortcuts to practice and vocabulary.

### Interactive Elements
| Element | Type | Action | Flow |
| :--- | :--- | :--- | :--- |
| **"Schnell üben"** | Button | Click | Navigates to `/practice` (Random session) |
| **"Vokabular durchsuchen"** | Button | Click | Navigates to `/vocabulary` |
| **Learning Path Cards** | Buttons | Click | **(Currently Broken)** Should start specific path, but shows "0 words" |

---

## 7. Redundancy Analysis: Vocabulary vs. Learn

### Observation
The **Learn** page currently acts as a "shell" or "hub" that largely duplicates entry points found elsewhere:
1.  **"Schnell üben"** is identical to the "Üben" nav link or "Jetzt üben" on Dashboard.
2.  **"Vokabular durchsuchen"** is identical to the "Vokabular" nav link.
3.  **Learning Paths** (A1, A2, etc.) are the unique value proposition, but they currently display **"0 words"** and appear non-functional.

### Conclusion
In its current state, the **Learn** page adds friction without adding value.
- **If Paths are fixed**: It becomes a valuable "Guided Mode" vs. the "Free Mode" of the Vocabulary page.
- **If Paths remain broken**: The page should be hidden or merged into Dashboard/Practice until fixed.

### Recommendation
**Fix the Learning Paths data connection.** The Vocabulary page is for *reference and custom selection*, while the Learn page should be for *curated progression*. They serve different user needs (Search vs. Guide), but only if the Guide works.
