# Bulgarian-German Vocabulary Structure & Expansion Plan

## Overview
This document outlines the comprehensive vocabulary structure for the Bulgarian-German tandem learning app, following CEFR (Common European Framework of Reference for Languages) standards.

## CEFR Level Standards

### Vocabulary Size Targets

| Level | Word Count | Description | User Type |
|-------|------------|-------------|-----------|
| **A1** | 500-1000 | Basic survival vocabulary | Beginner |
| **A2** | 1000-2000 | Elementary daily conversations | Elementary |
| **B1** | 2000-3250 | Independent communication | Independent User |
| **B2** | 3250-3750 | Upper intermediate | Vantage |
| **C1** | 3750-4500 | Advanced proficiency | Advanced |
| **C2** | 4500-5000+ | Near-native mastery | Mastery |

### Current Status (October 2025)
- **Total entries:** 156
- **A1:** 120 words ✅ (Target: 750)
- **A2:** 30 words ⚠️ (Target: 1500)
- **B1:** 6 words ⚠️ (Target: 2500)
- **B2:** 0 words ❌ (Target: 4000)
- **C1:** 0 words ❌ (Target: 4500)
- **C2:** 0 words ❌ (Target: 5000)

## Vocabulary Entry Structure

### Required Fields
```json
{
  "id": "unique_identifier",
  "word": "Bulgarian word",
  "translation": "German translation",
  "source_lang": "bg",
  "target_lang": "de",
  "category": "Category name",
  "level": "A1|A2|B1|B2|C1|C2",
  "notes": "General learning note",
  "notes_bg_to_de": "Notes for Bulgarian speakers learning German",
  "notes_de_to_bg": "Notes for German speakers learning Bulgarian",
  "etymology": "Word origin and historical development",
  "cultural_note": "Cultural context and usage differences",
  "linguistic_note": "Grammar, pronunciation, stress patterns",
  "difficulty": 1-6,
  "frequency": 0-100,
  "examples": [
    {
      "sentence": "Bulgarian example sentence",
      "translation": "German translation",
      "context": "informal|formal|business|academic"
    }
  ]
}
```

### Field Descriptions

#### Core Fields
- **id**: Unique identifier (format: `level_number`, e.g., `a1_001`)
- **word**: The Bulgarian word in Cyrillic
- **translation**: German translation
- **source_lang** / **target_lang**: Always `"bg"` and `"de"`

#### Classification
- **category**: Thematic category (e.g., Begrüßung, Substantiv, Verb, Transport)
- **level**: CEFR level (A1-C2)
- **difficulty**: Subjective difficulty rating (1=easiest, 6=hardest)
- **frequency**: Usage frequency (0-100, where 100=most common)

#### Learning Support
- **notes**: General teaching note visible to all learners
- **notes_bg_to_de**: Specific guidance for Bulgarian native speakers
- **notes_de_to_bg**: Specific guidance for German native speakers
- **etymology**: Word origin and historical development
- **cultural_note**: Cultural context, usage patterns, social implications
- **linguistic_note**: Pronunciation (IPA possible), stress, grammar patterns

#### Examples
- **examples**: Array of example sentences showing word usage in context
  - **sentence**: Example in source language
  - **translation**: Translation to target language
  - **context**: Usage context (informal, formal, business, academic, etc.)

## Thematic Categories by Level

### A1 (Beginner)
**Goal: 750 words**

Core themes:
- **Greetings & Politeness** (Здравей, Благодаря, Моля)
- **Numbers 0-100** (Едно, Две, Три...)
- **Colors** (Червен, Син, Зелен...)
- **Family (immediate)** (Баща, Майка, Брат, Сестра)
- **Body Parts (basic)** (Глава, Ръка, Крак...)
- **Food Basics** (Хляб, Вода, Мляко...)
- **Days & Months**
- **Time (basic)** (Час, Минута, Сега...)
- **Transport (basic)** (Автобус, Влак, Кола)
- **Basic Verbs** (Съм, Имам, Правя, Ходя...)
- **Basic Adjectives** (Добър, Лош, Голям, Малък...)
- **Common Objects** (Маса, Стол, Книга...)

### A2 (Elementary)
**Goal: 1500 words**

Expanded themes:
- **Shopping** (Магазин, Цена, Купувам...)
- **Clothing** (Дреха, Обувки, Панталони...)
- **Health (basic)** (Болница, Лекар, Болка...)
- **Professions** (Учител, Доктор, Инженер...)
- **Hobbies & Leisure**
- **Restaurant & Food ordering**
- **Hotel & Accommodation**
- **Directions & Navigation**
- **Weather (detailed)**
- **Emotions (basic)**
- **Common Animals**
- **Sports & Music**

### B1 (Independent User)
**Goal: 2500 words**

Independence themes:
- **Education** (Образование, Университет...)
- **Technology (basic)** (Компютър, Интернет...)
- **Environment** (Околна среда, Природа...)
- **Travel (extended)** (Резервация, Паспорт...)
- **Culture & Traditions**
- **Entertainment** (Кино, Театър, Музика...)
- **Services** (Поща, Банка...)
- **Relationships** (Приятелство, Любов...)
- **Housing (detailed)** (Наем, Собственик...)
- **Business Basics** (Договор, Заплата...)
- **Politics (basic concepts)**
- **Media** (Новини, Вестник...)

### B2 (Upper Intermediate)
**Goal: 4000 words**

Advanced themes:
- **Business & Commerce** (Предприятие, Финанси...)
- **Politics (detailed)** (Правителство, Избори...)
- **Science (basics)** (Изследване, Експеримент...)
- **Literature & Arts**
- **Abstract Concepts** (Свобода, Справедливост...)
- **Complex Emotions** (Носталгия, Тревожност...)
- **Social Issues** (Неравенство, Интеграция...)
- **Economy** (Инфлация, БВП...)
- **Law (basics)** (Закон, Право...)
- **Medicine (extended)**
- **Technology (advanced)**

### C1 (Advanced)
**Goal: 4500 words**

Proficiency themes:
- **Academic Discourse**
- **Professional Specialization**
- **Idiomatic Expressions**
- **Formal Language** (Bureaucracy, Diplomacy...)
- **Philosophy** (Съзнание, Противоречие...)
- **Advanced Abstractions**
- **Cultural Nuances**
- **Technical Vocabulary** (field-specific)
- **Complex Arguments**
- **Subtle Distinctions**

### C2 (Mastery)
**Goal: 5000+ words**

Near-native themes:
- **Literary & Rare** (Благоденствие, Самобитност...)
- **Philosophical Depth**
- **Regional Variants** (Dialects, colloquialisms)
- **Historical & Archaic Terms**
- **Technical Precision** (expert-level terminology)
- **Idiomatic Mastery** (full command of idioms)
- **Rare Expressions**
- **Nuanced Meanings** (subtle semantic distinctions)

## Cultural Context Integration

### Bulgarian-German Cultural Differences

Key areas to address in cultural notes:

1. **Greetings & Politeness**
   - Bulgarian: More physical (cheek kisses among friends)
   - German: More reserved (handshake standard)

2. **Food Culture**
   - Bulgarian: Late dinners, extended family meals, shopska salad culture
   - German: Punctual mealtimes, Brotzeit tradition, beer culture

3. **Work Culture**
   - Bulgarian: Developing formality, relationship-based
   - German: Punctuality crucial, clear hierarchies, work-life balance valued

4. **Time Concepts**
   - Bulgarian: More flexible with time
   - German: Extreme punctuality (pünktlich ist zu spät)

5. **Communication Style**
   - Bulgarian: More indirect, relationship-oriented
   - German: Direct, task-oriented (Klartext)

6. **Housing**
   - Bulgarian: Apartment living dominant, extended family proximity
   - German: Diverse housing, strong tenant rights, Mietrecht

## Expansion Strategy

### Phase 1: Foundation (Priority 1)
**Timeline: Months 1-2**
- Complete A1 to 750 words
- Build A2 to 500 words
- Focus on highest frequency words
- Ensure all entries have complete metadata

### Phase 2: Independence (Priority 2)
**Timeline: Months 3-4**
- Complete A2 to 1500 words
- Build B1 to 1000 words
- Add more example sentences
- Enhance cultural notes

### Phase 3: Proficiency (Priority 3)
**Timeline: Months 5-6**
- Complete B1 to 2500 words
- Build B2 to 1500 words
- Add advanced examples
- Include idiomatic expressions

### Phase 4: Mastery (Future)
**Timeline: Months 7-12**
- Complete B2 to 4000 words
- Build C1 and C2 levels
- Specialized vocabulary
- Literary and rare expressions

## Quality Assurance Guidelines

### Every Entry Must Have:
✅ Accurate Bulgarian Cyrillic spelling
✅ Accurate German translation
✅ Appropriate CEFR level assignment
✅ At least basic notes
✅ Etymology where relevant
✅ Cultural note for culturally-specific terms
✅ Linguistic note for challenging pronunciation/grammar

### B1+ Entries Should Have:
✅ At least 1 example sentence
✅ Detailed notes for both learning directions
✅ Clear context indicators
✅ Frequency and difficulty ratings

### C1+ Entries Should Have:
✅ Multiple example sentences
✅ Usage notes for formal vs informal contexts
✅ Specialized field indications
✅ Synonyms and related terms

## Sources & Standards

### Primary Sources:
1. **CEFR Framework** - Council of Europe
2. **Goethe Institut** - German vocabulary standards
3. **Bulgarian Academy of Sciences** - Bulgarian lexicography
4. **Profile Deutsch** - German as foreign language standards
5. **Research: Milton & Alexiou (2009)** - Vocabulary size research

### Reference Dictionaries:
- Bulgarian-German Dictionary (Академично издателство)
- Duden Universalwörterbuch
- Bulgarian Толковен речник

## Technical Implementation

### File Structure:
```
/data/
  ├── vocabulary.json              # Main vocabulary file
  ├── vocabulary-enhanced.json     # Enhanced version (if separate)
  ├── vocabulary-expansion-plan.json  # Expansion strategy
  └── vocabulary-enhanced-expansion.json  # This comprehensive plan
```

### Integration Points:
- **Spaced Repetition System (SRS)** - Uses frequency & difficulty
- **Progress Tracking** - CEFR level-based achievements
- **Adaptive Learning** - Adjusts based on user's source language
- **Cultural Context Toggle** - Show/hide cultural notes
- **Bidirectional Support** - BG→DE and DE→BG learning paths

## Maintenance & Updates

### Regular Review Cycle:
1. **Monthly**: Add 100-200 new words (prioritizing lower levels)
2. **Quarterly**: Review and enhance existing entries
3. **Annually**: Major vocabulary audit and CEFR re-alignment

### Quality Metrics:
- Etymology coverage: Target 80%+
- Cultural notes: Target 70%+ for culture-specific terms
- Example sentences: 100% for B1+, 50%+ for A2
- Linguistic notes: 90%+ for pronunciation challenges

## Contributing Guidelines

### Adding New Vocabulary:
1. Check for duplicates
2. Verify CEFR level appropriateness
3. Complete all required fields
4. Add cultural context where relevant
5. Include pronunciation guidance for difficult words
6. Provide examples for B1+ words

### Enhancing Existing Entries:
1. Never change core fields (word, translation) without review
2. Always improve, never remove information
3. Add examples to entries lacking them
4. Enhance notes with usage context
5. Update frequency ratings based on corpus analysis

---

**Last Updated:** October 22, 2025  
**Version:** 2.0  
**Status:** Active Development  
**Next Review:** November 2025
