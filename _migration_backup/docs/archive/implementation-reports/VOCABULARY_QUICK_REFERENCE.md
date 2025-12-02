# Vocabulary Implementation Quick Reference

## For QA Engineers & Developers

### Quick Stats

**Vocabulary Size by CEFR Level (Research-Based)**

```
A1: 500-1000 words    → Can handle basic survival situations
A2: 1000-2000 words   → Can have simple daily conversations  
B1: 2000-3250 words   → Can function independently
B2: 3250-3750 words   → Can work/study in target language
C1: 3750-4500 words   → Advanced proficiency
C2: 4500-5000+ words  → Near-native mastery
```

### Current Repository Status

```bash
# Check vocabulary count
cd /Users/dinz/Coding\ Projects/BulgariaLearn/BulgarianApp-Fresh
grep -o '"level"' data/vocabulary.json | wc -l
```

**As of Oct 2025:**
- Total: 156 entries
- A1: 120 (need 630 more for target)
- A2: 30 (need 1470 more)
- B1: 6 (need 2494 more)
- B2-C2: Missing entirely

### Vocabulary Entry Template

```json
{
  "id": "b1_042",
  "word": "Образование",
  "translation": "Bildung",
  "source_lang": "bg",
  "target_lang": "de",
  "category": "Bildung",
  "level": "B1",
  "notes": "General educational note",
  "notes_bg_to_de": "For Bulgarians learning German: Die Bildung...",
  "notes_de_to_bg": "Für Deutschsprachige: Образование означава...",
  "etymology": "From Old Church Slavonic...",
  "cultural_note": "Cultural context about education in BG vs DE",
  "linguistic_note": "Neuter noun. Stress: образова́ние",
  "difficulty": 3,
  "frequency": 85,
  "examples": [
    {
      "sentence": "Той има високо образование.",
      "translation": "Er hat eine höhere Bildung.",
      "context": "formal"
    }
  ]
}
```

### Testing Vocabulary Data

#### Validate JSON Structure
```bash
# Test if JSON is valid
python3 -m json.tool data/vocabulary.json > /dev/null && echo "Valid JSON" || echo "Invalid JSON"

# Count entries by level
jq '[.[] | .level] | group_by(.) | map({level: .[0], count: length})' data/vocabulary.json
```

#### Check for Missing Fields
```bash
# Find entries without etymology
jq '[.[] | select(.etymology == null) | .id]' data/vocabulary.json

# Find entries without examples (for B1+)
jq '[.[] | select(.level | IN("B1","B2","C1","C2")) | select(.examples == null or .examples == []) | .id]' data/vocabulary.json
```

### Priority Word Lists

#### A1 Must-Have Words (Top 50)

**Verbs (10):**
Съм, Имам, Правя, Мога, Ходя, Ям, Пия, Говоря, Виждам, Чувам

**Nouns (20):**
Човек, Жена, Мъж, Дете, Вода, Хляб, Къща, Град, Час, Ден, Нощ, Работа, Пари, Име, Език, Храна, Семейство, Приятел, Учител, Книга

**Adjectives (10):**
Добър, Лош, Голям, Малък, Нов, Стар, Красив, Топъл, Студен, Бърз

**Other (10):**
Да, Не, Благодаря, Моля, Здравей, Довиждане, Тук, Там, Много, Малко

#### A2 Focus Areas

**Shopping:** Магазин, Цена, Купувам, Продавам, Пари, Скъп, Евтин, Отстъпка
**Health:** Болница, Лекар, Аптека, Лекарство, Болка, Здраве
**Transport:** Билет, Гара, Летище, Карта, Път, Таксиметър
**Food:** Ресторант, Меню, Поръчка, Сметка, Вкусен, Пържен, Варен

### UX/UI Considerations

#### Visual Level Indicators
```css
/* Color-code by CEFR level */
.level-a1 { color: #4CAF50; } /* Green - Beginner */
.level-a2 { color: #8BC34A; } /* Light Green */
.level-b1 { color: #FFC107; } /* Amber - Independent */
.level-b2 { color: #FF9800; } /* Orange */
.level-c1 { color: #F44336; } /* Red - Advanced */
.level-c2 { color: #9C27B0; } /* Purple - Mastery */
```

#### Progress Indicators
```javascript
// Calculate user level based on known words
function calculateCEFRLevel(knownWordCount) {
  if (knownWordCount < 500) return 'A1';
  if (knownWordCount < 1000) return 'A1+';
  if (knownWordCount < 1500) return 'A2';
  if (knownWordCount < 2000) return 'A2+';
  if (knownWordCount < 2500) return 'B1';
  if (knownWordCount < 3250) return 'B1+';
  if (knownWordCount < 3750) return 'B2';
  if (knownWordCount < 4000) return 'B2+';
  if (knownWordCount < 4500) return 'C1';
  if (knownWordCount < 5000) return 'C1+';
  return 'C2';
}
```

### Spaced Repetition Configuration

```javascript
// SRS intervals based on difficulty
const SRS_INTERVALS = {
  1: [1, 3, 7, 14, 30, 60],      // Easy words (A1)
  2: [1, 3, 7, 14, 30, 90],      // A2
  3: [1, 4, 10, 20, 45, 120],    // B1
  4: [2, 5, 12, 25, 60, 150],    // B2
  5: [2, 6, 15, 35, 80, 180],    // C1
  6: [3, 7, 20, 45, 100, 240]    // C2 (harder retention)
};

// Adjust based on learning direction
function getAdjustedDifficulty(word, userNativeLang) {
  const baseDifficulty = word.difficulty;
  
  if (userNativeLang === 'bg' && word.category === 'Grammatik') {
    return baseDifficulty + 0.3; // German grammar harder for Bulgarians
  }
  
  if (userNativeLang === 'de' && word.category === 'Aspekte') {
    return baseDifficulty + 0.5; // Bulgarian aspects harder for Germans
  }
  
  return baseDifficulty;
}
```

### API Endpoints (Suggested)

```javascript
// GET vocabulary by level
app.get('/api/vocabulary/:level', (req, res) => {
  const level = req.params.level; // A1, A2, B1, B2, C1, C2
  const words = vocabulary.filter(w => w.level === level);
  res.json(words);
});

// GET vocabulary by category and level
app.get('/api/vocabulary/:level/:category', (req, res) => {
  const { level, category } = req.params;
  const words = vocabulary.filter(w => 
    w.level === level && w.category === category
  );
  res.json(words);
});

// GET random words for practice
app.get('/api/vocabulary/practice/:level/:count', (req, res) => {
  const { level, count } = req.params;
  const words = vocabulary
    .filter(w => w.level === level)
    .sort(() => 0.5 - Math.random())
    .slice(0, parseInt(count));
  res.json(words);
});
```

### Testing Checklist

#### Data Quality Tests
- [ ] All entries have unique IDs
- [ ] No duplicate words
- [ ] All required fields present
- [ ] CEFR levels correctly assigned
- [ ] Frequency ratings reasonable (0-100)
- [ ] Difficulty ratings consistent (1-6)
- [ ] Examples present for B1+ words
- [ ] Cultural notes for culture-specific terms
- [ ] Etymology for non-obvious borrowings

#### Functional Tests
- [ ] Vocabulary loads correctly in app
- [ ] Filtering by level works
- [ ] Filtering by category works
- [ ] Search functionality works
- [ ] Bidirectional learning supported
- [ ] Cultural notes toggle works
- [ ] Example sentences display correctly
- [ ] Progress tracking accurate

#### UX Tests
- [ ] Level badges display correctly
- [ ] Color coding intuitive
- [ ] Navigation smooth between levels
- [ ] Cards readable on mobile
- [ ] Audio controls work (when implemented)
- [ ] Offline mode functional
- [ ] Sync across devices works

### Common Issues & Solutions

#### Issue: Too Many Words at Once
**Problem:** Users overwhelmed by long vocabulary lists
**Solution:** Implement chunked learning - max 20 new words per session

#### Issue: Incorrect CEFR Assignment
**Problem:** Word too difficult/easy for assigned level
**Solution:** Use frequency data + user feedback to re-calibrate

#### Issue: Missing Cultural Context
**Problem:** Users don't understand when/how to use a word
**Solution:** Mandatory cultural notes for words with usage differences

#### Issue: Pronunciation Uncertainty
**Problem:** Users unsure how to pronounce Bulgarian words
**Solution:** Add IPA transcription + audio in linguistic_note

### Performance Optimization

```javascript
// Index vocabulary by level for faster lookups
const vocabularyIndex = {
  A1: vocabulary.filter(w => w.level === 'A1'),
  A2: vocabulary.filter(w => w.level === 'A2'),
  B1: vocabulary.filter(w => w.level === 'B1'),
  B2: vocabulary.filter(w => w.level === 'B2'),
  C1: vocabulary.filter(w => w.level === 'C1'),
  C2: vocabulary.filter(w => w.level === 'C2')
};

// Cache frequently accessed words
const highFrequencyWords = vocabulary
  .filter(w => w.frequency > 80)
  .reduce((acc, w) => {
    acc[w.id] = w;
    return acc;
  }, {});
```

### Git Workflow for Vocabulary Updates

```bash
# Create feature branch for vocabulary expansion
git checkout -b feature/vocabulary-b1-expansion

# Add new words to vocabulary.json
# ... edit file ...

# Validate JSON before committing
python3 -m json.tool data/vocabulary.json > /dev/null

# Commit with descriptive message
git add data/vocabulary.json
git commit -m "Add 50 B1 level words: Education & Environment categories"

# Push and create PR
git push origin feature/vocabulary-b1-expansion
```

### Useful Scripts

#### Generate Vocabulary Statistics
```python
import json

with open('data/vocabulary.json') as f:
    vocab = json.load(f)

stats = {}
for word in vocab:
    level = word['level']
    stats[level] = stats.get(level, 0) + 1

print("Vocabulary Statistics:")
for level in ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']:
    print(f"{level}: {stats.get(level, 0)} words")
```

#### Find Missing Etymology
```python
import json

with open('data/vocabulary.json') as f:
    vocab = json.load(f)

missing_etymology = [
    w['id'] for w in vocab 
    if not w.get('etymology')
]

print(f"Missing etymology: {len(missing_etymology)} entries")
print(missing_etymology[:10])  # Show first 10
```

### Resources

**CEFR Official:**
- https://www.coe.int/en/web/common-european-framework-reference-languages

**German Standards:**
- Goethe Institut: https://www.goethe.de/en/spr/kup/prf.html
- Profile Deutsch: https://www.langenscheidt.com/Profile-deutsch

**Bulgarian Resources:**
- Bulgarian Academy: https://ibl.bas.bg/
- Bulgarian Dictionary: http://ibl.bas.bg/rbe/

**Vocabulary Research:**
- Milton, J. & Alexiou, T. (2009). Vocabulary size and CEFR levels

---

**Quick Help:**
- Questions? Check `/docs` folder
- Issues? Create GitHub issue with `vocabulary` label
- Contributing? Read `VOCABULARY_STRUCTURE.md` first
