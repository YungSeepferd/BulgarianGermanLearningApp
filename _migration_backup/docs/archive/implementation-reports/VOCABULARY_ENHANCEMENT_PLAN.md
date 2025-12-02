# План за обогатяване на речника / Vokabel-Erweiterungsplan

**Дата / Datum**: 19.10.2025  
**Цел / Ziel**: Добавяне на богати културни и етимологични бележки към всички 156 записа  
**Текущо състояние / Aktueller Stand**: Само 2 думи имат пълни бележки (`Здравей`, `Добро утро`)  
**Липсващи / Fehlend**: Нужни са още бележки за 154 думи

---

## 📊 Анализ на наличните данни / Datenanalyse

### Пример с пълни данни / Vollständiges Beispiel (`Здравей`):
```json
{
  "word": "Здравей",
  "translation": "Hallo",
  "notes": "Das Wort 'Здравей' leitet sich vom bulgarischen Wort 'здрав' (gesund) ab...",
  "etymology": "Произход: праславянското 'zdravъ' (здрав); пожелание за добро здраве.\nHerkunft: Proto-Slawisch 'zdravъ' („gesund") – traditioneller Gesundheitsgruß.",
  "cultural_note": "Културен контекст: неформално обръщение за целия ден.\nKultureller Kontext: Informelle Begrüßung, ganztägig gebräuchlich.",
  "linguistic_note": "Лингвистична бележка: ударение върху първата сричка (ЗДРА-вей); кратка форма 'Здрасти'.\nLinguistischer Hinweis: Betonung auf der ersten Silbe; Kurzform 'Здрасти'."
}
```

### Липсващи бележки / Fehlende Angaben (154 думи):
- ❌ Добър ден / Guten Tag
- ❌ Довиждане / Auf Wiedersehen
- ❌ Моля / Bitte
- ❌ Благодаря / Danke
- ❌ още 150 думи

---

## 🎯 Насоки за съдържание / Leitlinien für Anmerkungen

### Пример за качествена бележка / Was macht eine gute Notiz aus?

**Дума / Wort**: zusammen / заедно

**Структура / Aufbau**:
1. **Буквален разбор / Zerlegung**: „за“ (към) + „едно“ (eins)
2. **Етимология / Etymologie**: Сложно образуване (Kompositum)
3. **Буквален превод / Wörtliche Übertragung**: „за едно“ / „auf ein Ziel hin“
4. **Културен акцент / Kultureller Fokus**: Подчертава ценността на общността и съвместните действия

### Полета за попълване (само BG/DE) / Auszufüllende Felder (nur BG/DE)

#### 1. `notes_de_to_bg`
- **Функция / Funktion**: Обратна страна за германски учащи (DE → BG)
- **Език / Sprache**: Deutsch
- **Стил / Stil**: Кратко, ясно, фокус върху българската употреба
- **Пример / Beispiel**: "Das Wort 'заедно' betont gemeinsames Handeln; wörtlich 'für eins' (за + едно)."

#### 2. `notes_bg_to_de`
- **Функция / Funktion**: Обратна страна за български учащи (BG → DE)
- **Език / Sprache**: Български
- **Стил / Stil**: Ясно, конкретно, с насоки за немски
- **Пример / Beispiel**: "'zusammen' се поставя след спрегнатия глагол: Wir arbeiten zusammen."

#### 3. `etymology`
- **Формат / Format**: Първо български резюме, после немско пояснение на нов ред
- **Пример / Beispiel**:
  - "Произход: комбинация 'за' + 'едно'."
  - "Herkunft: Präfix 'за-' plus Zahlwort 'едно'."

#### 4. `cultural_note`
- **Формат / Format**: Български абзац, следван от немски превод/обяснение
- **Пример / Beispiel**:
  - "Културен контекст: често в лозунги за солидарност."
  - "Kultureller Kontext: Häufig in Kampagnen für Gemeinschaft."

#### 5. `linguistic_note`
- **Формат / Format**: Българско обяснение + немски ред за огледално уточнение
- **Пример / Beispiel**:
  - "Лингвистична бележка: ударение на втората сричка; форма неизменяема."
  - "Linguistischer Hinweis: Zweite Silbe betont; unveränderliches Adverb."

---

## 📝 Приоритетни категории / Priorisierte Kategorien

### Ниво 1: Основни A1 думи / Stufe 1: A1 Kernwortschatz
- **Приветствия / Begrüßungen**: Добър ден, Добър вечер, Лека нощ, Довиждане
- **Учтивост / Höflichkeit**: Моля, Благодаря, Извинете, Съжалявам
- **Семейство / Familie**: майка, баща, дете, брат, сестра

### Ниво 2: Често срещани думи (A1/A2) / Stufe 2: Häufige Wörter (A1/A2)
- Числителни, цветове, времеви изрази / Zahlen, Farben, Zeitangaben
- Храна, части на тялото, посоки / Essen, Körperteile, Richtungen
- Чести глаголи: съм, имам, искам и др. / Häufige Verben: sein, haben, wollen usw.

### Ниво 3: Специализирани (A2/B1) / Stufe 3: Spezialisierte Themen (A2/B1)
- Време, природа, емоции / Wetter, Natur, Emotionen
- Работа, образование, хобита / Arbeit, Bildung, Hobbys
- Абстрактни понятия / Abstrakte Begriffe

---

## 🔨 Шаблон / Vorlage

### JSON структура / JSON-Struktur
```json
{
  "word": "[Българска форма]",
  "translation": "[Deutsche Übersetzung]",
  "notes_de_to_bg": "[Kurzinfo auf Deutsch für DE→BG Lernende]",
  "notes_bg_to_de": "[Кратко обяснение на български за BG→DE учащи]",
  "etymology": "[Български резюме]\n[Deutsches Resümee]",
  "cultural_note": "[Български контекст]\n[Deutscher Kontext]",
  "linguistic_note": "[Българска бележка]\n[Deutscher Hinweis]",
  "examples": [ ... ]
}
```

### Пример: „Благодаря“ / „Danke“

```json
{
  "word": "Благодаря",
  "translation": "Danke",
  "notes_de_to_bg": "'Благодаря' nutzt Bulgariens Wurzel 'благо' (Segen) und drückt formelle Dankbarkeit aus; formeller als das entlehnte 'мерси'.",
  "notes_bg_to_de": "Немското 'Danke' има по-кратка форма, но също може да се подсили с 'schön' → 'Danke schön'.",
  "etymology": "Произход: старобългарско 'благо' (добрина) + суфикса '-даря' (давам).\nHerkunft: Altbulgarisch 'благо' + Verbzusatz '-даря'.",
  "cultural_note": "Културен контекст: стандартен учтив отговор; често се добавя 'много' за усилване.\nKultureller Kontext: Höfliche Standardformel, gern mit 'много' verstärkt (≈ 'vielen Dank').",
  "linguistic_note": "Лингвистична бележка: ударение върху последната сричка (благодаря́); първо лице ед.ч. на глагола.\nLinguistischer Hinweis: Betonung auf der letzten Silbe; Verb im Präsens 1. Person Singular."
}
```

---

## 🚀 Implementation Strategy

### Option 1: Manual Enhancement (High Quality)
**Time**: ~15-20 min per word  
**Total**: ~40-50 hours for 154 words  
**Pros**: Highest quality, culturally accurate  
**Cons**: Time-intensive

**Process**:
1. Research each word's etymology
2. Consult Bulgarian cultural sources
3. Write notes in template format
4. Review for accuracy
5. Add to vocabulary.json

### Option 2: AI-Assisted + Human Review (Balanced)
**Time**: ~5-7 min per word  
**Total**: ~13-18 hours  
**Pros**: Faster, good quality with review  
**Cons**: Needs verification

**Process**:
1. Generate notes using linguistic knowledge
2. Human reviews for cultural accuracy
3. Edit/enhance as needed
4. Add to vocabulary.json

### Option 3: Batch Template + Progressive Fill (Incremental)
**Time**: Variable  
**Total**: Done over time  
**Pros**: Can start using app immediately, improve progressively  
**Cons**: Inconsistent completion

**Process**:
1. Create templates for all words
2. Fill high-priority words first
3. Add notes week by week
4. Always show what's available

---

## 📋 Sample Enhancements (Ready to Add)

### 1. Добър ден (Guten Tag)
```json
"notes": "Wörtlich 'guter Tag'. Wird ab etwa 11 Uhr bis zum Abend verwendet",
"etymology": "Compound: 'добър' (good, adj) + 'ден' (day). Standard Slavic greeting pattern",
"cultural_note": "More formal than 'здравей'. Used in business, with strangers, or when showing respect. Universal daytime greeting across Bulgaria",
"linguistic_note": "Stress: ДО-бър ден (both words stressed). Masculine form; feminine would be 'Добра' but fixed expression uses masculine"
```

### 2. Моля (Bitte)
```json
"notes": "Bedeutet 'bitte' und wird für Höflichkeit verwendet. Auch als 'bitte schön' nach dem Danke",
"etymology": "From verb 'моля' (to pray, to request). Related to Old Church Slavonic 'moliti' (to pray/plead)",
"cultural_note": "Essential politeness word in Bulgarian. Can mean 'please' (request), 'you're welcome' (after thanks), or 'here you are' (when giving). Reflects cultural emphasis on courtesy",
"linguistic_note": "Stress: МО-ля. Single word serves multiple polite functions unlike German's bitte/bitte schön/gern geschehen"
```

### 3. Довиждане (Auf Wiedersehen)
```json
"notes": "Formeller Abschiedsgruß, wörtlich 'bis zum Wiedersehen'",
"etymology": "Compound: prefix 'до-' (until) + 'виждане' (seeing). From verb 'видя' (to see). Literally: 'until [next] seeing'",
"cultural_note": "Formal goodbye used in professional/respectful contexts. More casual alternatives: 'чао' (ciao) or 'дочуване' (until hearing). Shows cultural distinction between formal/informal farewells",
"linguistic_note": "Stress: до-ВИЖ-да-не. Often shortened to 'довиж' in casual speech. Alternative form: 'до скоро' (see you soon)"
```

### 4. Благодаря (Danke) - Already shown above

### 5. заедно (zusammen) - NEW WORD TO ADD
```json
{
  "id": "zaedno_157",
  "word": "заедно",
  "translation": "zusammen",
  "source_lang": "bg",
  "target_lang": "de",
  "category": "Allgemein",
  "level": "A2",
  "notes_de_to_bg": "'заедно' bedeutet wörtlich 'für eins' und wird genutzt, wenn gemeinsames Handeln betont werden soll.",
  "notes_bg_to_de": "Немското 'zusammen' стои след спрегнатия глагол: Wir sind zusammen.",
  "etymology": "Произход: добавяне на 'за' (за/към) към числителното 'едно'.\nHerkunft: Präfix 'за-' plus Zahlwort 'едно'.",
  "cultural_note": "Културен контекст: подчертава общност и взаимна подкрепа; често в девизи.\nKultureller Kontext: Vermittelt Gemeinschaftsgefühl, z. B. в лозунги като 'Заедно напред'.",
  "linguistic_note": "Лингвистична бележка: ударение на втората сричка (за-ЕД-но); не се изменя.\nLinguistischer Hinweis: Zweite Silbe betont; unveränderliche Form.",
  "difficulty": 2,
  "frequency": 70,
  "examples": [
    {
      "sentence": "Работим заедно.",
      "translation": "Wir arbeiten zusammen.",
      "context": "general"
    },
    {
      "sentence": "Заедно сме по-силни.",
      "translation": "Zusammen sind wir stärker.",
      "context": "teamwork"
    }
  ]
}
```

---

## 🎯 Препоръчана стратегия / Empfohlene Vorgehensweise

### Фаза 1: Бързи резултати / Phase 1: Schnelle Erfolge
1. Добавете 20-те най-чести думи / 20 häufigste Wörter ergänzen
2. Фокус върху ниво A1 / Fokus auf A1
3. Приветствия, учтивост, семейство / Begrüßung, Höflichkeit, Familie

### Фаза 2: Ядро на речника / Phase 2: Kernwortschatz
1. Покрийте всички A1 думи (~50–60) / Alle A1-Wörter (~50–60)
2. Основни глаголи и съществителни / Kernverben und Nomen
3. Числа, цветове, време / Zahlen, Farben, Zeitangaben

### Фаза 3: Разширение / Phase 3: Ausbau
1. Думи на ниво A2 / Wortschatz A2
2. Специализирани теми / Spezialisierte Themen
3. Идиоми и изрази / Idiomatische Wendungen

---

## 🛠️ Tools & Resources Needed

### For Research:
- Bulgarian etymological dictionary
- Proto-Slavic root references
- Cultural anthropology sources
- Native speaker consultations

### For Implementation:
- JSON editing tool (VSCode with JSON schema)
- Validation script (ensure no duplicates)
- Preview in app (test how notes appear)

---

## ✅ Quality Checklist

Before adding each word's notes, verify:
- [ ] Etymology is linguistically accurate
- [ ] Cultural note provides genuine insight (not generic)
- [ ] German explanation (`notes`) is clear for learners
- [ ] Pronunciation/stress is correct
- [ ] Examples demonstrate usage
- [ ] No spelling errors
- [ ] JSON structure valid

---

## 📊 Progress Tracking

**Goal**: 156 words fully enhanced  
**Current**: 2 complete (1.3%)  
**Target**: All A1 words by next deployment  

**Estimate**:
- 20 words = 2-3 hours (batch 1)
- 50 words = 6-8 hours (all A1)
- 156 words = 18-25 hours (complete)

---

Would you like me to:
1. **Start enhancing now** - I'll add notes for the top 20 words
2. **Create enhancement tool** - Script to make adding notes easier
3. **Just add "заедно"** - Add your example word with full notes

**Recommendation**: Start with Option 1 - add top 20 words with rich notes, then you can continue progressively!
