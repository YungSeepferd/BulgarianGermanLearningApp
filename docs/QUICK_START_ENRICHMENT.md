# 🚀 QUICK START CARD - Vocabulary Enrichment

**Status**: ✅ Ready to Start  
**Current Vocabulary**: 11 items  
**First Target**: 25 A1 words  
**Time**: ~2 hours  

---

## ⏱️ YOUR SESSION TIMELINE

```
0:00 - Open A1 PDF resource
0:15 - Extracted 25 word ideas (German + Bulgarian)
0:35 - Start VocabularyEditor for first word
2:35 - Completed 25 words (60 min ÷ 25 = ~2.4 min per word)
2:50 - Verified all entries
2:55 - Git commit
3:00 - Done! 🎉
```

---

## 📋 MINI CHECKLIST

Before each word:
- [ ] German spelling correct
- [ ] Bulgarian translation correct
- [ ] Part of speech identified
- [ ] 2+ examples ready
- [ ] CEFR level: A1

---

## 📚 3 REFERENCE DOCS

1. **For Extracting**: `docs/GERMAN_BULGARIAN_GRAMMAR_GUIDE.md`
2. **For Entering**: `docs/VOCABULARY_EDITOR_GUIDE.md`
3. **For Questions**: `docs/VOCABULARY_ENRICHMENT_WORKFLOW.md`

---

## 🎯 VOCABULARY ENTRY TEMPLATE

```
German:      [word from PDF]
Bulgarian:   [translation]
Definition:  [1-2 sentences each language]
Example 1:   [German] + [Bulgarian]
Example 2:   [German] + [Bulgarian]
Grammar:     [articles, gender, notes]
Categories:  [food, travel, etc.]
```

---

## ✅ BEFORE YOU COMMIT

```bash
# Check status
git status

# See what changed
git diff data/unified-vocabulary.json | head -50

# Then commit
git add data/unified-vocabulary.json
git commit -m "feat: add A1 vocabulary (25 words)"
git push origin feature/enrich-vocabulary-a1-foundation
```

---

## 🆘 QUICK HELP

**German article?** → Check guide (der/die/das)  
**Bulgarian ending?** → Component hints (-та/-ът/-то)  
**Need example?** → Use natural sentences  
**Unsure translation?** → Try multiple PDFs  
**Validation error?** → Read error message  

---

**Ready? Open `data/vocab/resources/A1-Bulgaria-BOOK_2nd-edition.pdf` and start! 🚀**
