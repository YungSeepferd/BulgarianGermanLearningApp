---
name: grammar-progression
description: Analyze and optimize grammar learning progression, identify dependencies between concepts, and generate structured learning paths. Use for curriculum planning, content organization, and grammar exercise generation.
---

# Grammar Progression Skill

## Core Capabilities

1. Grammar Structure Analysis
   - Map concept dependencies
   - Track complexity levels
   - Identify learning bottlenecks

2. Cross-linguistic Comparison
   - Compare Bulgarian and German structures
   - Identify transfer points
   - Note potential interference areas

3. Learning Path Generation
   - Create optimized progression paths
   - Align with CEFR standards
   - Generate practice sequences

## Instructions

### Grammar Analysis
```python
def analyze_grammar_structure(grammar_data):
    """
    Analyze grammar concepts and their relationships
    Returns structured grammar mapping
    """
    # Implementation in grammar_analysis.py
    pass
```

### Linguistic Comparison
```python
def compare_language_structures(bg_data, de_data):
    """
    Compare grammar structures between languages
    Returns comparison analysis
    """
    # Implementation in language_comparison.py
    pass
```

### Path Generation
```python
def generate_learning_path(grammar_data):
    """
    Generate optimized grammar learning sequence
    Returns structured learning path
    """
    # Implementation in learning_path.py
    pass
```

## Additional Resources

- `scripts/grammar_analysis.py`: Grammar structure analysis tools
- `scripts/language_comparison.py`: Cross-linguistic comparison functions
- `scripts/learning_path.py`: Learning path generation
- `REFERENCE.md`: Detailed grammar reference
- `templates/`: Learning path templates

## Examples

1. Grammar Structure Analysis:
```json
{
  "query": "Analyze verb tense system",
  "response": {
    "tense_system": {
      "present": {
        "complexity": "basic",
        "prerequisites": ["verb_conjugation"],
        "related_concepts": ["aspect"]
      },
      "past": {
        "complexity": "intermediate",
        "prerequisites": ["present_tense", "aspect_understanding"],
        "related_concepts": ["participles"]
      }
    }
  }
}
```

2. Cross-linguistic Comparison:
```json
{
  "query": "Compare case systems",
  "response": {
    "comparison": {
      "bulgarian": {
        "cases": "limited",
        "main_features": ["vocative_case"],
        "complexity": "low"
      },
      "german": {
        "cases": "extensive",
        "main_features": ["nominative", "accusative", "dative", "genitive"],
        "complexity": "high"
      },
      "learning_implications": [
        "Focus on German case system",
        "Use Bulgarian prepositions as bridges"
      ]
    }
  }
}
```

3. Learning Path Generation:
```json
{
  "query": "Generate A1 grammar path",
  "response": {
    "learning_path": [
      {
        "stage": 1,
        "focus": "basic sentence structure",
        "concepts": ["word_order", "subject_verb_agreement"]
      },
      {
        "stage": 2,
        "focus": "present tense",
        "concepts": ["regular_verbs", "irregular_verbs"]
      }
    ]
  }
}
```

## Usage Guidelines

1. Follow CEFR progression principles
2. Consider both languages' unique features
3. Account for learner background
4. Build systematic progression
5. Include regular review points

## Error Handling

1. Invalid Grammar Data:
   - Validate structure before analysis
   - Report specific issues
   - Suggest corrections

2. Progression Conflicts:
   - Identify circular dependencies
   - Resolve concept ordering
   - Document decisions

3. Cross-linguistic Issues:
   - Note incompatible comparisons
   - Provide alternative approaches
   - Document limitations

## See Also

- `/vocabulary-analysis`: Related vocabulary patterns
- `/exercise-generation`: Grammar exercise creation
- `/bilingual-content`: Bilingual content analysis