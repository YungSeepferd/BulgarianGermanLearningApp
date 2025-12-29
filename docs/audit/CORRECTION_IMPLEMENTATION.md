# 🛠️ Correction Implementation Guide

## 🎯 Batch 1 Correction Process

**Batch**: Items 1-20
**Status**: READY FOR IMPLEMENTATION
**Backup**: Created ✅

---

## 📋 Step-by-Step Correction Process

### Step 1: Create Working Copy
```bash
cp ./src/lib/data/unified-vocabulary.json ./docs/audit/work-in-progress.json
echo "Working copy created"
```

### Step 2: Apply IPA Transcriptions

#### Using jq for Individual Items
```bash
# Apply IPA to "zusammen_bg_zaedno_sample"
jq '.items[0].ipa = {"bulgarian": "/zɐˈɛdno/", "german": "/t͡suˈzamən/"}' \
./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json

# Apply IPA to "zdravej_001"  
jq '.items[1].ipa = {"bulgarian": "/zdraˈvɛj/", "german": "/ˈhalo/"}' \
./docs/audit/work-in-progress.json > temp.json && mv temp.json ./docs/audit/work-in-progress.json
```

#### Batch IPA Application
```bash
# Create IPA mapping file
cat > ./docs/audit/ipa_mappings.json << 'EOF'
[
  {"id": "zusammen_bg_zaedno_sample", "ipa": {"bulgarian": "/zɐˈɛdno/", "german": "/t͡suˈzamən/"}},
  {"id": "zdravej_001", "ipa": {"bulgarian": "/zdraˈvɛj/", "german": "/ˈhalo/"}},
  {"id": "dobro_utro_002", "ipa": {"bulgarian": "/ˈdɔbro ˈutro/", "german": "/ˈɡuːtn̩ ˈmɔʁɡn̩/"}},
  {"id": "guten_abend", "ipa": {"bulgarian": "/doˈbɤr ˈvɛt͡ʃɛr/", "german": "/ˈɡuːtn̩ ˈaːbn̩t/"}},
  {"id": "gute_nacht", "ipa": {"bulgarian": "/ˈlɛka ˈnɔʃt/", "german": "/ˈɡuːtə ˈnaxt/"}},
  {"id": "auf_wiedersehen", "ipa": {"bulgarian": "/doˈvid͡ʒɐnɛ/", "german": "/aʊ̯f ˈviːdɐzeːən/"}},
  {"id": "bitte", "ipa": {"bulgarian": "/ˈmɔlʲɐ/", "german": "/ˈbɪtə/"}},
  {"id": "danke", "ipa": {"bulgarian": "/blɐɡoˈdarʲɐ/", "german": "/ˈdaŋkə/"}},
  {"id": "entschuldigung", "ipa": {"bulgarian": "/izviˈnɛtɛ/", "german": "/ɛntˈʃʊldɪɡʊŋ/"}},
  {"id": "es_tut_mir_leid", "ipa": {"bulgarian": "/sɐʒɐˈlʲavɐm/", "german": "/ɛs tuːt miːɐ̯ laɪ̯t/"}},
  {"id": "mensch", "ipa": {"bulgarian": "/ˈt͡ʃɔvɛk/", "german": "/mɛnʃ/"}},
  {"id": "familie", "ipa": {"bulgarian": "/sɛˈmɛjstvɔ/", "german": "/faˈmiːliə/"}},
  {"id": "haus", "ipa": {"bulgarian": "/ˈkɤʃtɐ/", "german": "/haʊ̯s/"}},
  {"id": "schule", "ipa": {"bulgarian": "/uˈt͡ʃiliʃtɛ/", "german": "/ˈʃuːlə/"}},
  {"id": "stadt", "ipa": {"bulgarian": "/ɡrat/", "german": "/ʃtat/"}},
  {"id": "dorf", "ipa": {"bulgarian": "/ˈsɛɫɔ/", "german": "/dɔʁf/"}},
  {"id": "essen", "ipa": {"bulgarian": "/ˈxranɐ/", "german": "/ˈɛsn̩/"}},
  {"id": "sein", "ipa": {"bulgarian": "/sɤm/", "german": "/zaɪ̯n/"}},
  {"id": "machen", "ipa": {"bulgarian": "/ˈpravʲɐ/", "german": "/ˈmaxn̩/"}},
  {"id": "sprechen", "ipa": {"bulgarian": "/ɡoˈvɔrʲɐ/", "german": "/ˈʃprɛçn̩/"}}
]
EOF

# Apply IPA mappings using Node.js script
node ./docs/audit/apply_ipa.js
```

### Step 3: Replace Unnatural Examples

#### Create Examples Correction Script
```javascript
// ./docs/audit/fix_examples.js
const fs = require('fs');

const corrections = {
  "dobro_utro_002": {
    "examples": [
      {
        "german": "Guten Morgen! Wie haben Sie geschlafen?",
        "bulgarian": "Добро утро! Как спахте?",
        "context": "morning_greeting",
        "formality": "neutral",
        "frequency": "very_common"
      },
      {
        "german": "Guten Morgen, Herr Schmidt!",
        "bulgarian": "Добро утро, господин Шмит!",
        "context": "formal_morning",
        "formality": "formal",
        "frequency": "common"
      }
    ]
  },
  "guten_abend": {
    "examples": [
      {
        "german": "Guten Abend! Willkommen in unserem Restaurant.",
        "bulgarian": "Добър вечер! Добре дошли в нашия ресторант.",
        "context": "evening_welcome",
        "formality": "neutral",
        "frequency": "common"
      },
      {
        "german": "Guten Abend, Frau Müller!",
        "bulgarian": "Добър вечер, госпожо Мюлер!",
        "context": "formal_evening",
        "formality": "formal",
        "frequency": "common"
      }
    ]
  }
  // Add more corrections...
};

// Load vocabulary data
const data = JSON.parse(fs.readFileSync('./docs/audit/work-in-progress.json', 'utf8'));

// Apply corrections
data.items.forEach(item => {
  if (corrections[item.id]) {
    Object.assign(item, corrections[item.id]);
  }
});

// Save corrected data
fs.writeFileSync('./docs/audit/work-in-progress.json', JSON.stringify(data, null, 2));
console.log('✅ Examples corrected');
```

### Step 4: Correct Grammar Tables

#### Create Grammar Correction Script
```javascript
// ./docs/audit/fix_grammar.js
const fs = require('fs');

const grammarCorrections = {
  "mensch": {
    "grammar": {
      "declension": {
        "nominative": {"singular": "Mensch", "plural": "Menschen"},
        "accusative": {"singular": "Menschen", "plural": "Menschen"},
        "dative": {"singular": "Menschen", "plural": "Menschen"},
        "genitive": {"singular": "Menschen", "plural": "Menschen"}
      },
      "gender": "m"
    }
  },
  "familie": {
    "grammar": {
      "declension": {
        "nominative": {"singular": "Familie", "plural": "Familien"},
        "accusative": {"singular": "Familie", "plural": "Familien"},
        "dative": {"singular": "Familie", "plural": "Familien"},
        "genitive": {"singular": "Familie", "plural": "Familien"}
      },
      "gender": "f"
    }
  }
  // Add more corrections...
};

// Load vocabulary data
const data = JSON.parse(fs.readFileSync('./docs/audit/work-in-progress.json', 'utf8'));

// Apply grammar corrections
data.items.forEach(item => {
  if (grammarCorrections[item.id]) {
    Object.assign(item, grammarCorrections[item.id]);
  }
});

// Save corrected data
fs.writeFileSync('./docs/audit/work-in-progress.json', JSON.stringify(data, null, 2));
console.log('✅ Grammar tables corrected');
```

### Step 5: Add Verb Conjugations

#### Create Verb Conjugation Script
```javascript
// ./docs/audit/add_conjugations.js
const fs = require('fs');

const verbConjugations = {
  "sein": {
    "grammar": {
      "conjugation": {
        "presentIndicative": {
          "ich": "bin", "du": "bist", "erSieEs": "ist",
          "wir": "sind", "ihr": "seid", "sieSie": "sind"
        },
        "simpleStPast": {
          "ich": "war", "du": "warst", "erSieEs": "war",
          "wir": "waren", "ihr": "wart", "sieSie": "waren"
        },
        "pastParticiple": "gewesen",
        "presentParticiple": "seiend"
      }
    }
  },
  "machen": {
    "grammar": {
      "conjugation": {
        "presentIndicative": {
          "ich": "mache", "du": "machst", "erSieEs": "macht",
          "wir": "machen", "ihr": "macht", "sieSie": "machen"
        },
        "simpleStPast": {
          "ich": "machte", "du": "machtest", "erSieEs": "machte",
          "wir": "machten", "ihr": "machtet", "sieSie": "machten"
        },
        "pastParticiple": "gemacht",
        "presentParticiple": "machend"
      }
    }
  }
  // Add more conjugations...
};

// Load vocabulary data
const data = JSON.parse(fs.readFileSync('./docs/audit/work-in-progress.json', 'utf8'));

// Apply verb conjugations
data.items.forEach(item => {
  if (verbConjugations[item.id]) {
    Object.assign(item, verbConjugations[item.id]);
  }
});

// Save corrected data
fs.writeFileSync('./docs/audit/work-in-progress.json', JSON.stringify(data, null, 2));
console.log('✅ Verb conjugations added');
```

---

## ✅ Validation Process

### Automated Validation Script
```javascript
// ./docs/audit/validate_corrections.js
const fs = require('fs');

const validationRules = {
  "ipa": item => item.ipa && item.ipa.bulgarian && item.ipa.german,
  "examples": item => item.examples && item.examples.length >= 2 && 
                     !item.examples.some(ex => ex.german.includes("Wo ist")),
  "grammar": item => {
    if (item.partOfSpeech === "noun") {
      return item.grammar && item.grammar.declension && item.grammar.gender;
    } else if (item.partOfSpeech === "verb") {
      return item.grammar && item.grammar.conjugation;
    }
    return true;
  }
};

// Load corrected data
const data = JSON.parse(fs.readFileSync('./docs/audit/work-in-progress.json', 'utf8'));

// Validate corrections
const results = {
  total: data.items.length,
  passed: 0,
  failed: 0,
  errors: []
};

data.items.slice(0, 20).forEach((item, index) => {
  const itemResults = {
    id: item.id,
    checks: {}
  };
  
  for (const [rule, check] of Object.entries(validationRules)) {
    itemResults.checks[rule] = check(item);
  }
  
  if (Object.values(itemResults.checks).every(Boolean)) {
    results.passed++;
  } else {
    results.failed++;
    results.errors.push(itemResults);
  }
});

// Output validation results
console.log(`Validation Results: ${results.passed}/${results.total} items passed`);
console.log(`Failed: ${results.failed}`);

if (results.errors.length > 0) {
  console.log('\nErrors found:');
  results.errors.forEach(error => {
    console.log(`- ${error.id}: ${JSON.stringify(error.checks)}`);
  });
}

fs.writeFileSync('./docs/audit/validation_results.json', JSON.stringify(results, null, 2));
```

---

## 🎯 Implementation Checklist

### Batch 1 Correction Tasks
- [ ] Create working copy
- [ ] Apply IPA transcriptions (20 items)
- [ ] Replace unnatural examples (17 items)
- [ ] Correct grammar tables (14 items)
- [ ] Add verb conjugations (4 items)
- [ ] Run automated validation
- [ ] Manual review of corrections
- [ ] Merge corrections to main database
- [ ] Update tracking system

### Quality Assurance
- [ ] Backup verification
- [ ] Data integrity check
- [ ] JSON structure validation
- [ ] Example quality review
- [ ] Grammar accuracy verification
- [ ] IPA transcription validation

---

## 📅 Implementation Timeline

### Estimated Time
- **IPA Application**: 1-2 hours
- **Example Replacement**: 2-3 hours
- **Grammar Correction**: 1-2 hours
- **Verb Conjugations**: 1 hour
- **Validation**: 1 hour
- **Total**: 6-9 hours

### Milestones
1. **Backup & Setup**: 30 minutes ✅
2. **IPA Transcriptions**: 1-2 hours
3. **Example Replacement**: 2-3 hours
4. **Grammar Correction**: 1-2 hours
5. **Verb Conjugations**: 1 hour
6. **Validation & Review**: 1 hour
7. **Merge to Main**: 30 minutes

---

## 🛠️ Tools & Resources

### Scripts Created
- `apply_ipa.js` - Apply IPA transcriptions
- `fix_examples.js` - Replace unnatural examples
- `fix_grammar.js` - Correct grammar tables
- `add_conjugations.js` - Add verb conjugations
- `validate_corrections.js` - Validate all corrections

### Data Files
- `work-in-progress.json` - Working copy
- `ipa_mappings.json` - IPA transcription data
- `validation_results.json` - Validation output

### References
- `vocabulary_corrections_patch.json` - Correction specifications
- `vocabulary_audit_report.md` - Detailed audit findings

---

## 🎓 Next Steps

### Immediate Actions
1. **Run IPA application script**
2. **Apply example corrections**
3. **Fix grammar tables**
4. **Add verb conjugations**
5. **Run validation**
6. **Manual review**
7. **Merge to main database**

### Documentation Updates
1. **Update AUDIT_TRACKING.md** with progress
2. **Document lessons learned**
3. **Create implementation summary**

---

**Status**: Ready for Implementation
**Next Action**: Run correction scripts
**Target Completion**: 6-9 hours
