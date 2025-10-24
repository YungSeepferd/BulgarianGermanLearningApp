# Quick Start Guide: Vocabulary Expansion
## Get Started in 15 Minutes

**Your Mission:** Add 630 high-quality A1 vocabulary entries over 8 weeks  
**Today's Goal:** Understand the system and add your first 5 words  
**Time Required:** 15 minutes to read, then 2-3 hours daily for expansion

---

## 📖 Step 1: Understand What You Have (2 minutes)

### Research Documents (READ THESE):
1. **VOCABULARY_PROJECT_SUMMARY.md** ← START HERE (overview of everything)
2. **VOCABULARY_RESEARCH_SUMMARY.md** (detailed standards)
3. **VOCABULARY_ACTION_PLAN.md** (8-week roadmap)

### Reference Files:
- `/data/vocabulary.json` (your main database - 156 entries currently)
- `/data/vocabulary-sample-a1-batch.json` (10 perfect examples to copy)

---

## 🎯 Step 2: Review Perfect Examples (5 minutes)

Open `/data/vocabulary-sample-a1-batch.json` and study these 10 entries:

1. **Единадесет** (number) - See how numbers are structured
2. **Спя** (verb) - Essential verb with full conjugation notes
3. **Искам** (verb) - Modal verb showing proper examples
4. **Яйце** (noun) - Food item with cultural context
5. **Кой** (question) - Question word with gender forms
6. **Какво** (question) - Most common question word
7. **Риза** (clothing) - Clothing item showing etymology
8. **Евтин** (adjective) - Adjective with cultural notes
9. **Прозорец** (house) - House vocabulary with typical usage
10. **Вчера/Утре** (time) - Time expressions showing daily use

**Key things to notice:**
- ✅ ALL fields are filled in
- ✅ Both BG→DE and DE→BG notes
- ✅ Cultural context where relevant
- ✅ Etymology explaining word origins
- ✅ Linguistic notes (pronunciation, stress, grammar)
- ✅ Multiple examples for common words
- ✅ Context indicators (informal/formal)

---

## 🛠️ Step 3: Set Up Your Workflow (3 minutes)

### Daily Routine (2-3 hours):

**Morning Research (1 hour):**
```
1. Select category from action plan (e.g., "Numbers 11-20")
2. Research 15-20 words in Bulgarian-German dictionary
3. Check Goethe Institut list for German equivalents
4. Note frequency and usage patterns
```

**Afternoon Entry Creation (1.5 hours):**
```
1. Copy template from sample file
2. Fill in Bulgarian word & German translation
3. Add all metadata (level, category, etc.)
4. Write bidirectional learning notes
5. Add etymology (research if needed)
6. Include cultural notes for relevant terms
7. Add 1-3 example sentences
8. Rate frequency (0-100) and difficulty (1-6)
```

**Evening Review (30 minutes):**
```
1. Proofread today's entries
2. Check for consistency
3. Verify all required fields filled
4. Add to main vocabulary.json
5. Track progress (aim for 25-30 words/day)
```

---

## 📝 Step 4: Entry Template (Copy This!)

```json
{
  "id": "a1_[category]_[number]",
  "word": "[Bulgarian word in Cyrillic]",
  "translation": "[German translation with article for nouns]",
  "source_lang": "bg",
  "target_lang": "de",
  "category": "[Category name]",
  "level": "A1",
  "notes": "[General learning note visible to all]",
  "notes_bg_to_de": "[For Bulgarian speakers learning German]",
  "notes_de_to_bg": "[For German speakers learning Bulgarian]",
  "etymology": "[Word origin and historical development]",
  "cultural_note": "[Cultural context, traditions, usage patterns]",
  "linguistic_note": "[Pronunciation (IPA if helpful), stress, grammar notes]",
  "difficulty": 1,
  "frequency": 75,
  "examples": [
    {
      "sentence": "[Bulgarian example]",
      "translation": "[German translation]",
      "context": "informal"
    }
  ]
}
```

---

## 🎯 Step 5: Your First 5 Words (Start NOW!)

### Week 1 Priority: Numbers 11-20

Copy the template and create these 5 entries:

1. **Дванадесет** (zwölf / 12)
2. **Тринадесет** (dreizehn / 13)
3. **Четиринадесет** (vierzehn / 14)
4. **Петнадесет** (fünfzehn / 15)
5. **Шестнадесет** (sechzehn / 16)

**Tips for numbers:**
- Pattern: [unit] + на + десет for 11-19
- Etymology: Breaking down the compound
- Cultural note: How Bulgarians use numbers
- Examples: Age, time, counting

---

## 📊 Step 6: Track Your Progress

### Daily Log:
```
Date: _______
Words added: _____ / 30 target
Time spent: _____ hours
Categories covered: __________
Quality check: ☐ Done
```

### Weekly Milestones:
```
Week 1: 125 words (Numbers, Basic Verbs, Questions)
Week 2: 125 words (Food, Colors, Time)
Week 3: 125 words (House, Clothing, Weather)
Week 4: 125 words (Activities, Shopping, Personal Info)
Week 5: 75 words (Restaurant, Cafe, Travel basics)
Week 6: 75 words (Accommodation, Feelings, Social)
Week 7: 40 words (Missing essentials, Animals)
Week 8: 40 words (Expressions, QA & Review)
```

---

## 🚨 Common Mistakes to Avoid

### ❌ DON'T:
1. Skip any required fields
2. Copy exact text from sources (paraphrase!)
3. Forget to add examples for high-frequency words (freq > 80)
4. Ignore cultural context for culture-specific terms
5. Use English in notes (always use German or Bulgarian)
6. Add words without checking current database for duplicates
7. Forget to specify gender for German nouns (der/die/das)

### ✅ DO:
1. Complete ALL fields for every entry
2. Provide helpful, original notes
3. Include multiple examples for common words
4. Add cultural context where relevant
5. Verify translations with native speakers when possible
6. Check for duplicates before adding
7. Follow consistent formatting
8. Rate frequency based on actual usage
9. Make difficulty ratings consistent with CEFR level

---

## 🎓 Quality Checklist (Use This Daily!)

Before adding any entry to the main database:

**Basic Requirements:**
- [ ] Bulgarian word spelled correctly in Cyrillic
- [ ] German translation accurate (with article for nouns)
- [ ] CEFR level = A1
- [ ] Category assigned
- [ ] ID follows format (a1_category_number)

**Enhanced Fields:**
- [ ] General notes filled in
- [ ] BG→DE notes completed
- [ ] DE→BG notes completed
- [ ] Etymology researched and added
- [ ] Cultural note added (if relevant)
- [ ] Linguistic note with pronunciation/stress

**Examples & Ratings:**
- [ ] At least 1 example for frequency > 70
- [ ] Examples have context tags
- [ ] Frequency rated (0-100)
- [ ] Difficulty rated (1-2 for A1)

**Final Check:**
- [ ] No duplicate of existing entry
- [ ] All fields filled (no null/empty)
- [ ] Consistent formatting
- [ ] Proofread for typos

---

## 📞 Need Help?

### If you get stuck:

1. **Check the samples:** `/data/vocabulary-sample-a1-batch.json`
2. **Review guidelines:** `VOCABULARY_RESEARCH_SUMMARY.md`
3. **Follow the plan:** `VOCABULARY_ACTION_PLAN.md`
4. **Read the summary:** `VOCABULARY_PROJECT_SUMMARY.md`

### Common Questions:

**Q: How do I determine frequency?**
A: Use this scale:
- 90-100: Top 100 words (съм, имам, etc.)
- 80-89: Top 500 words (essential daily)
- 70-79: Top 1000 words (very common)
- 60-69: Common A1 vocabulary
- 50-59: Specialized but useful A1

**Q: When do I need cultural notes?**
A: Add cultural notes for:
- Food items (traditional Bulgarian foods)
- Holidays and traditions
- Social customs (greetings, formality)
- Cultural concepts (family structure, etc.)

**Q: How detailed should etymology be?**
A: Include:
- Original language source (Proto-Slavic, Turkish, etc.)
- Literal meaning if compound word
- Related words in other languages
- Example: "From Turkish 'rıza', shows Ottoman influence"

**Q: What if I can't find information?**
A: That's okay! Do your best with available resources. You can always:
- Mark entries for later review
- Add a note: "Etymology to be researched"
- Continue and come back to it
- Focus on completing required fields first

---

## 🎯 Your Mission Today

1. ✅ Read this quick start guide (Done!)
2. ⏳ Study the 10 sample entries (15 minutes)
3. ⏳ Create your first 5 number entries (1-2 hours)
4. ⏳ Set up your daily routine/workspace
5. ⏳ Review your entries against the quality checklist

**Tomorrow:** Add 25 more words following the same process!

---

## 🚀 You're Ready!

You now have everything you need:
- ✅ Complete research and standards
- ✅ 8-week action plan
- ✅ Perfect examples to copy
- ✅ Quality checklists
- ✅ This quick start guide

**Next Steps:**
1. Open `/data/vocabulary-sample-a1-batch.json`
2. Copy the template
3. Start with numbers 11-20 (Week 1 priority)
4. Follow the quality checklist
5. Add 25-30 words per day
6. Review weekly progress

**Remember:** Quality over speed. Better to add 20 perfect entries than 40 incomplete ones.

---

## 📅 Week 1 Countdown

| Day | Target | Category | Words to Add |
|-----|--------|----------|--------------|
| **Day 1** | 25 | Numbers | 12-36 (every other number) |
| **Day 2** | 25 | Numbers | Remaining + ordinals |
| **Day 3** | 25 | Question Words + Basic Verbs | All questions + 15 verbs |
| **Day 4** | 25 | Basic Verbs continued | 25 essential verbs |
| **Day 5** | 25 | Basic Adjectives + Pronouns | Common adjectives + all pronouns |
| **Weekend** | -- | Review & Quality Check | Audit all 125 entries |

**Week 1 Goal:** 125 words ✅

---

**Good luck! You've got this! 🎉**

Remember: You're building something valuable that will help thousands of people learn Bulgarian and German. Take pride in your work and maintain high quality standards.

**Now go create those first 5 entries! 🚀**
