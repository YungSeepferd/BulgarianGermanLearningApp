# Manual Classification for Final 36 "Phrase" Items

**Date**: December 16, 2025  
**Status**: Ready for Review  
**Total Items**: 36

## Classification

### Nouns (34 items) - Need Articles

| # | German | Article | Gender | Plural Form | Bulgarian | Notes |
|---|--------|---------|--------|-------------|-----------|-------|
| 1 | Lärm | der | masculine | - | Шум | No plural |
| 2 | Stille | die | feminine | - | Тишина | No plural |
| 3 | Geschwindigkeit | die | feminine | Geschwindigkeiten | Скорост | |
| 4 | Richtung | die | feminine | Richtungen | Посока | |
| 5 | Entfernung | die | feminine | Entfernungen | Разстояние | |
| 6 | Platz/Ort | der | masculine | Plätze/Orte | Място | Compound - needs split |
| 7 | Punkt | der | masculine | Punkte | Точка | |
| 8 | Linie | die | feminine | Linien | Линия | |
| 9 | Form | die | feminine | Formen | Форма | |
| 10 | Größe | die | feminine | Größen | Размер | |
| 11 | Farbe | die | feminine | Farben | Цвят | |
| 12 | Geruch | der | masculine | Gerüche | Мирис | |
| 13 | Geschmack | der | masculine | Geschmäcke/Geschmäcker | Вкус | |
| 14 | Gefühl | das | neuter | Gefühle | Чувство | |
| 15 | Gedanke | der | masculine | Gedanken | Мисъл | |
| 16 | Idee | die | feminine | Ideen | Идея | |
| 17 | Plan | der | masculine | Pläne | План | |
| 18 | Ziel | das | neuter | Ziele | Цел | |
| 19 | Art/Weise | die | feminine | Arten | Начин | Compound - needs split |
| 20 | Grund/Ursache | der | masculine | Gründe | Причина | Compound - needs split |
| 21 | Ergebnis | das | neuter | Ergebnisse | Резултат | |
| 22 | Beispiel | das | neuter | Beispiele | Пример | |
| 23 | Tatsache | die | feminine | Tatsachen | Факт | |
| 24 | Wahrheit | die | feminine | Wahrheiten | Истина | |
| 25 | Lüge | die | feminine | Lügen | Лъжа | |
| 26 | Geheimnis | das | neuter | Geheimnisse | Тайна | |
| 27 | Recht/Gerechtigkeit | das | neuter | Rechte | Право | Compound - needs split |
| 28 | Gesetz | das | neuter | Gesetze | Закон | |
| 29 | Ordnung/Reihe | die | feminine | Ordnungen | Ред | Compound - needs split |
| 30 | Gruppe | die | feminine | Gruppen | Група | |
| 31 | Mitglied | das | neuter | Mitglieder | Член | |
| 32 | Gesellschaft | die | feminine | Gesellschaften | Общество | |
| 33 | Arbeit | die | feminine | Arbeiten | Работа | Already exists? Check for duplicate |
| 34 | Buch | das | neuter | Bücher | Книга | Already exists as "das Buch"! DUPLICATE |

### Adjectives (2 items)

| # | German | Comparative | Superlative | Bulgarian | Notes |
|---|--------|-------------|-------------|-----------|-------|
| 35 | neu | neuer | am neuesten | Нов | |
| 36 | alt | älter | am ältesten | Стар | |

## Actions Required

### 1. Remove Duplicates
- [ ] Item #33 "Arbeit" - Check if duplicate of existing entry
- [ ] Item #34 "Buch" - CONFIRMED duplicate of "das Buch" (already corrected)

### 2. Add Articles to Nouns (32 items)
Script to add articles:
```typescript
const corrections = [
  { german: 'Lärm', article: 'der', gender: 'masculine', plural: null },
  { german: 'Stille', article: 'die', gender: 'feminine', plural: null },
  { german: 'Geschwindigkeit', article: 'die', gender: 'feminine', plural: 'Geschwindigkeiten' },
  // ... all 32 items
];
```

### 3. Split Compound Terms (5 items)
These need to be split into separate vocabulary items:
- "Platz/Ort" → "der Platz" + "der Ort"
- "Art/Weise" → "die Art" + "die Weise"
- "Grund/Ursache" → "der Grund" + "die Ursache"
- "Recht/Gerechtigkeit" → "das Recht" + "die Gerechtigkeit"
- "Ordnung/Reihe" → "die Ordnung" + "die Reihe"

### 4. Classify Adjectives (2 items)
- "neu" → partOfSpeech: "adjective"
- "alt" → partOfSpeech: "adjective"

## Summary Statistics

- **Total Items Analyzed**: 36
- **Nouns**: 34
  - Simple nouns: 29
  - Compound terms (to split): 5
  - Duplicates (to remove): 2
- **Adjectives**: 2
- **Estimated Correction Time**: 2 hours (manual + script)

## Next Steps

1. Create script to add articles to 29 simple nouns
2. Manually split 5 compound terms into separate entries
3. Remove 2 duplicates
4. Classify 2 adjectives
5. Verify all corrections in Grammar tab
6. Final data quality check

---

**Created By**: Automated Analysis  
**Requires**: Manual Review & Execution
