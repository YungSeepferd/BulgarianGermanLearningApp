# Vocabulary Migration & Enhancement Guide

## Overview
This guide helps you migrate and enhance existing vocabulary entries to meet the new CEFR-aligned standards.

## Current State Analysis

### Existing Entries Status
- ✅ Have: word, translation, basic structure
- ⚠️ Missing: Many lack etymology, cultural notes, examples
- ⚠️ Incomplete: Some missing difficulty/frequency ratings
- ⚠️ Inconsistent: Notes format varies

## Migration Steps

### Step 1: Backup Current Data
```bash
cd /Users/dinz/Coding\ Projects/BulgariaLearn/BulgarianApp-Fresh
cp data/vocabulary.json data/vocabulary.backup-$(date +%Y%m%d).json
```

### Step 2: Run Validation
```bash
python3 scripts/validate_vocabulary.py data/vocabulary.json
```

This will show you:
- Missing required fields
- Entries without examples (for B1+)
- Missing etymology
- Missing cultural/linguistic notes

### Step 3: Enhance Entries Systematically

#### Priority 1: Add Missing Required Fields

For any entries missing required fields, add them:

```json
{
  "id": "existing_id",
  // If missing level, assign based on difficulty:
  "level": "A1",  // Basic survival words
  // If missing difficulty, assign based on level:
  "difficulty": 1  // 1-6 scale
}
```

#### Priority 2: Add Bidirectional Notes

Enhance existing entries with directional learning notes:

**For Bulgarian → German learners:**
```json
{
  "notes_bg_to_de": "В немски 'das Brot' е среден род. Множествено: die Brote. Често казват 'Schwarzbrot' (черен хляб) вместо само 'Brot'."
}
```

**For German → Bulgarian learners:**
```json
{
  "notes_de_to_bg": "Für Deutschsprachige: 'Хляб' ist maskulin. Plural: хлябове. Wichtig in bulgarischer Küche - traditionell rund gebacken."
}
```

#### Priority 3: Add Etymology

Research and add word origins:

```json
{
  "etymology": "From Proto-Slavic *xlěbъ (bread). Related to Old Church Slavonic хлѣбъ. Cognate with Russian хлеб."
}
```

**Etymology Research Sources:**
- [Etymology Online](https://www.etymonline.com/)
- [Wiktionary](https://en.wiktionary.org/)
- Bulgarian Etymology Dictionary (Български етимологичен речник)

#### Priority 4: Add Cultural Context

Highlight usage differences:

```json
{
  "cultural_note": "Bread is sacred in Bulgarian culture ('хляб-сол' = bread-salt welcome ritual). Germans also value bread highly (200+ bread varieties)."
}
```

#### Priority 5: Add Linguistic Notes

Pronunciation and grammar guidance:

```json
{
  "linguistic_note": "Masculine noun. Stress: хля́б. Vocative: хляб-е! Definite: хлябът. Related: хлебар (baker), хлебарница (bakery)."
}
```

#### Priority 6: Add Examples (B1+ Only)

For B1, B2, C1, C2 entries:

```json
{
  "examples": [
    {
      "sentence": "Купих пресен хляб от пекарната.",
      "translation": "Ich habe frisches Brot vom Bäcker gekauft.",
      "context": "informal"
    },
    {
      "sentence": "Нашият хляб насъщен е домашен.",
      "translation": "Unser tägliches Brot ist hausgemacht.",
      "context": "formal/literary"
    }
  ]
}
```

## Batch Enhancement Script

### Using Find & Replace

For systematic updates, use this pattern:

```bash
# Add missing source_lang and target_lang
# Find entries without these fields and add them
```

Example Python script for batch updates:

```python
import json

# Load vocabulary
with open('data/vocabulary.json', 'r', encoding='utf-8') as f:
    vocab = json.load(f)

# Enhance each entry
for entry in vocab:
    # Add missing fields
    if 'source_lang' not in entry:
        entry['source_lang'] = 'bg'
    if 'target_lang' not in entry:
        entry['target_lang'] = 'de'
    
    # Set default difficulty based on level
    if 'difficulty' not in entry and 'level' in entry:
        difficulty_map = {'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6}
        entry['difficulty'] = difficulty_map.get(entry['level'], 3)

# Save enhanced vocabulary
with open('data/vocabulary-enhanced.json', 'w', encoding='utf-8') as f:
    json.dump(vocab, f, indent=2, ensure_ascii=False)

print("Enhancement complete!")
```

## CSV Import Template

For creating many entries quickly, use CSV:

### CSV Format

Create a file `vocabulary-import.csv`:

```csv
word,translation,level,category,notes,notes_bg_to_de,notes_de_to_bg,etymology,cultural_note,linguistic_note,difficulty,frequency
Ябълка,Apfel,A1,Lebensmittel,Common fruit,"Der Apfel е мъжки род...","Femininum in Bulgarian...","From Proto-Slavic *ablъko...","Apples important in both...","Stress: я́бълка...",1,88
```

### CSV Import Script

```python
import csv
import json

def csv_to_json(csv_file, json_file):
    entries = []
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for i, row in enumerate(reader, 1):
            entry = {
                "id": f"{row['level'].lower()}_{i:03d}",
                "word": row['word'],
                "translation": row['translation'],
                "source_lang": "bg",
                "target_lang": "de",
                "category": row['category'],
                "level": row['level'],
                "difficulty": int(row['difficulty']) if row['difficulty'] else None,
                "frequency": int(row['frequency']) if row['frequency'] else None
            }
            
            # Add optional fields if present
            optional = ['notes', 'notes_bg_to_de', 'notes_de_to_bg', 
                       'etymology', 'cultural_note', 'linguistic_note']
            for field in optional:
                if row.get(field):
                    entry[field] = row[field]
            
            entries.append(entry)
    
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(entries, f, indent=2, ensure_ascii=False)
    
    print(f"Imported {len(entries)} entries from {csv_file} to {json_file}")

# Usage
csv_to_json('vocabulary-import.csv', 'data/vocabulary-new.json')
```

## Quality Checklist

Before considering migration complete, verify:

### A1 Entries
- [ ] All have difficulty rating (1-2)
- [ ] All have frequency rating (70-100 for basics)
- [ ] All have at least basic notes
- [ ] Most have etymology (80%+)
- [ ] Most have cultural notes for culture-specific words

### A2 Entries
- [ ] All have difficulty rating (2-3)
- [ ] All have frequency rating
- [ ] All have bidirectional notes
- [ ] Cultural notes for culturally specific terms
- [ ] Linguistic notes for pronunciation challenges

### B1+ Entries
- [ ] All have difficulty rating (3-6)
- [ ] **All have at least 1 example sentence** ✓
- [ ] All have complete bidirectional notes
- [ ] Etymology for all entries
- [ ] Cultural notes highlighting usage differences
- [ ] Linguistic notes for grammar/pronunciation

## Common Issues & Solutions

### Issue 1: Inconsistent ID Format

**Problem:** IDs don't follow standard pattern
```json
{"id": "word_001"}  // Old format
```

**Solution:** Regenerate IDs
```python
# Regenerate IDs based on level
id_counters = {'A1': 1, 'A2': 1, 'B1': 1, 'B2': 1, 'C1': 1, 'C2': 1}

for entry in vocab:
    level = entry['level']
    entry['id'] = f"{level.lower()}_{id_counters[level]:03d}"
    id_counters[level] += 1
```

### Issue 2: Mixed Language in Notes

**Problem:** Notes mix Bulgarian and German
```json
{"notes": "Das ist ein wichtiges Wort за начинаещи"}
```

**Solution:** Separate into directional notes
```json
{
  "notes": "Important word for beginners",
  "notes_bg_to_de": "Das ist ein wichtiges Wort für Anfänger",
  "notes_de_to_bg": "Важна дума за начинаещи"
}
```

### Issue 3: Missing Examples for B1+

**Problem:** B1+ entries without examples

**Solution:** Add minimum 1 example per B1+ entry
- Use real-life contexts
- Show natural usage
- Include context markers (informal/formal/business)

### Issue 4: Vague Cultural Notes

**Problem:** Generic cultural notes
```json
{"cultural_note": "Important in Bulgarian culture"}
```

**Solution:** Be specific
```json
{
  "cultural_note": "Bread is sacred in Bulgarian tradition. The 'хляб-сол' (bread-salt) ceremony welcomes guests. Never throw bread away. Compare to German '200 Brotsorten' (200 bread varieties) pride."
}
```

## Testing Enhanced Vocabulary

### Run Validation
```bash
python3 scripts/validate_vocabulary.py data/vocabulary.json
```

### Test in Application
1. Load enhanced vocabulary in app
2. Test flashcard display
3. Verify bidirectional learning works
4. Check cultural notes toggle
5. Test examples display for B1+ words

### User Testing
- Test with native Bulgarian speaker
- Test with native German speaker
- Verify notes are helpful
- Check for errors in translations

## Timeline

### Week 1: Foundation
- [ ] Backup current data
- [ ] Run validation
- [ ] Fix all errors
- [ ] Add missing required fields

### Week 2: Enhancement
- [ ] Add bidirectional notes to all entries
- [ ] Add etymology to 80%+ entries
- [ ] Add cultural notes where relevant

### Week 3: Examples & Polish
- [ ] Add examples to all B1+ entries
- [ ] Add linguistic notes
- [ ] Final validation pass

### Week 4: Testing
- [ ] Internal testing
- [ ] User testing
- [ ] Bug fixes
- [ ] Final deployment

## Resources

### Etymology Research
- **Bulgarian:** http://ibl.bas.bg/
- **German:** https://www.dwds.de/
- **General:** https://www.etymonline.com/

### Cultural Context
- **Bulgarian culture:** https://bulgariatravel.org/
- **German culture:** https://www.deutschland.de/en

### Pronunciation
- **Bulgarian:** https://forvo.com/languages/bg/
- **German:** https://forvo.com/languages/de/

## Support

Questions about migration?
- Check `VOCABULARY_STRUCTURE.md` for standards
- Check `VOCABULARY_QUICK_REFERENCE.md` for examples
- Use `scripts/validate_vocabulary.py` to check progress

---

**Migration Status Template:**

Save this to track progress:

```markdown
# Vocabulary Migration Status

**Date:** [Date]
**Total Entries:** [Number]

## Completed
- [ ] Backup created
- [ ] Validation run
- [ ] Required fields complete
- [ ] Bidirectional notes added
- [ ] Etymology added (target: 80%)
- [ ] Cultural notes added (target: 70%)
- [ ] Examples added for B1+ (target: 100%)
- [ ] Final validation passed
- [ ] User testing complete

## Statistics
- A1: [X] / 750 entries
- A2: [X] / 1500 entries  
- B1: [X] / 2500 entries
- B2: [X] / 4000 entries
- C1: [X] / 4500 entries
- C2: [X] / 5000 entries

**Next Steps:** [List next actions]
```
