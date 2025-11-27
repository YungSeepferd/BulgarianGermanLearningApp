---
description: Двуезичен процес за лингвистични бележки (BG/DE)
---

# Лингвистични бележки / Linguistische Notizen

## Насоки / Richtlinien
- **Източници / Quellen**
  - Rechnik.bg – Български тълковен речник с произношение.
  - Duden – verbindliche Laut- und Flexionsangaben auf Deutsch.
  - Wiktionary и Forvo – проверка на ударение и IPA / IPA-Abgleich.
- **Правила за авторство / Autorenregeln**
  - **`linguistic_note_bg_to_de`**: текст на български, обясняващ немското произношение, Flexion и Wortstellung.
  - **`linguistic_note_de_to_bg`**: текст на немски, описващ българските особености (ударение, род, склонение).
  - Бележката се ограничава до 1–2 изречения с фокус върху произношение и граматика.
  - Отбелязвайте нередовен акцент, звукови промени, множествено число или словообразуване.
  - Не дублирайте `notes_*`; съдържанието остава чисто лингвистично / Keine Dopplung mit `notes_*`.
- **Контрол на качеството / Qualitätssicherung**
  1. Актуализирайте записа в `data/vocabulary.json`.
  2. Стартирайте `python3 scripts/validate_vocabulary.py data/vocabulary.json`.
  3. Стартирайте `node scripts/validate-data.mjs`.
  4. Проверете интерфейса (practice + flashcards) след обновяване на посоките.
  5. Отразете статуса в таблицата по-долу.

## Напредък / Fortschritt
| Партида / Batch | Категории | Статус / Status | Бележки / Hinweise |
| --- | --- | --- | --- |
| B1 | `Begrüßung`, `Abschied` | В процес / In Arbeit | 12 записа: `Здравей`, `Добро утро`, `Auf Wiedersehen`, ... |
| B2 | `Zahl` (0–1000) | В процес / In Arbeit | 29 записа, включително новите варианти |
| B3 | `Pronomen`, `Quantor`, `Fragewort` | В процес / In Arbeit | Функционални думи и частици |
| B4 | `Verb` (A1 Kernverben) | В процес / In Arbeit | Проверка на аспектни двойки |
| B5 | `Substantiv` (семейство, дом, храна) | В процес / In Arbeit | Групиране по семантични полета |
| B6 | Други категории (Adjektiv, Adverb, Transport, Natur...) | В процес / In Arbeit | Финален преглед |

Актуализирайте таблицата след всяка валидирана партида / Tabelle nach jeder validierten Runde aktualisieren.
