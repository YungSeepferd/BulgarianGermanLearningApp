---
name: exercise-generation
description: Generate customized language learning exercises based on vocabulary and grammar analysis. Use for creating practice materials, quizzes, and interactive learning content with bilingual support.
---

# Exercise Generation Skill

## Core Capabilities

1. Exercise Type Generation
   - Multiple choice questions
   - Fill-in-the-blank exercises
   - Matching activities
   - Translation exercises

2. Difficulty Calibration
   - CEFR level alignment
   - Progressive complexity
   - Learner adaptation

3. Content Integration
   - Vocabulary incorporation
   - Grammar focus
   - Cultural elements

## Instructions

### Exercise Creation
```python
def generate_exercises(content_data, exercise_type):
    """
    Generate language learning exercises
    Returns structured exercise set
    """
    # Implementation in exercise_generator.py
    pass
```

### Difficulty Management
```python
def calibrate_difficulty(exercise_data, target_level):
    """
    Adjust exercise difficulty to target CEFR level
    Returns calibrated exercises
    """
    # Implementation in difficulty_calibration.py
    pass
```

### Content Integration
```python
def integrate_content(exercises, vocabulary_data, grammar_data):
    """
    Integrate vocabulary and grammar into exercises
    Returns enhanced exercises
    """
    # Implementation in content_integration.py
    pass
```

## Additional Resources

- `scripts/exercise_generator.py`: Core exercise generation
- `scripts/difficulty_calibration.py`: Difficulty management
- `scripts/content_integration.py`: Content integration tools
- `templates/`: Exercise format templates
- `REFERENCE.md`: Exercise type documentation

## Examples

1. Multiple Choice Generation:
```json
{
  "query": "Generate vocabulary quiz for food items",
  "response": {
    "exercise": {
      "type": "multiple_choice",
      "level": "A1",
      "questions": [
        {
          "question": "Was bedeutet 'ябълка' auf Deutsch?",
          "options": ["Apfel", "Birne", "Orange", "Banane"],
          "correct": "Apfel",
          "context": "fruits"
        }
      ]
    }
  }
}
```

2. Fill-in-the-Blank:
```json
{
  "query": "Create present tense practice",
  "response": {
    "exercise": {
      "type": "fill_blank",
      "level": "A1",
      "items": [
        {
          "sentence": "Ich ___ in Berlin. (live)",
          "correct": "wohne",
          "bg_equivalent": "живея",
          "grammar_focus": "present_tense"
        }
      ]
    }
  }
}
```

3. Translation Exercise:
```json
{
  "query": "Generate basic phrases translation",
  "response": {
    "exercise": {
      "type": "translation",
      "level": "A1",
      "items": [
        {
          "source": "Добро утро!",
          "target": "Guten Morgen!",
          "context": "greetings",
          "notes": "formal_register"
        }
      ]
    }
  }
}
```

## Usage Guidelines

1. Match CEFR level requirements
2. Include clear instructions
3. Provide answer feedback
4. Balance difficulty progression
5. Include cultural context

## Error Handling

1. Content Mismatch:
   - Check level appropriateness
   - Validate language pairs
   - Ensure cultural relevance

2. Format Issues:
   - Validate exercise structure
   - Check answer correctness
   - Verify instruction clarity

3. Integration Problems:
   - Check content availability
   - Verify grammar accuracy
   - Ensure vocabulary fit

## See Also

- `/vocabulary-analysis`: Vocabulary content source
- `/grammar-progression`: Grammar content source
- `/bilingual-content`: Content verification