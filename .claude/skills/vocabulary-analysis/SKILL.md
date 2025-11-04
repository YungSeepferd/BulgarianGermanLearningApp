---
name: vocabulary-analysis
description: Analyze vocabulary entries for semantic relationships, usage patterns, and learning progression optimization. Use when processing vocabulary data, generating study materials, or analyzing language learning content.
---

# Vocabulary Analysis Skill

## Core Capabilities

1. Semantic Analysis
   - Group vocabulary by themes and concepts
   - Identify word relationships and patterns
   - Map semantic fields across languages

2. Usage Pattern Analysis
   - Track word frequency and importance
   - Analyze contextual usage
   - Identify common collocations

3. Learning Progression
   - Assess CEFR level alignment
   - Map prerequisite relationships
   - Optimize introduction order

## Instructions

### Semantic Analysis
```python
def analyze_semantic_groups(vocabulary_data):
    """
    Group vocabulary items by semantic relationships
    Returns structured semantic groupings
    """
    # Implementation in analyze_vocabulary.py
    pass
```

### Usage Pattern Analysis
```python
def analyze_usage_patterns(vocabulary_data):
    """
    Analyze word frequency and usage contexts
    Returns usage statistics and patterns
    """
    # Implementation in usage_patterns.py
    pass
```

### Learning Progression
```python
def optimize_progression(vocabulary_data):
    """
    Optimize vocabulary introduction sequence
    Returns ordered learning path
    """
    # Implementation in progression.py
    pass
```

## Additional Resources

- `scripts/analyze_vocabulary.py`: Core semantic analysis functions
- `scripts/usage_patterns.py`: Usage pattern analysis tools
- `scripts/progression.py`: Learning progression optimization
- `REFERENCE.md`: Detailed API documentation
- `templates/`: Analysis report templates

## Examples

1. Basic Semantic Analysis:
```json
{
  "query": "Analyze semantic groups for food vocabulary",
  "response": {
    "semantic_groups": [
      {
        "theme": "food-preparation",
        "core_concepts": ["готвя/kochen", "пека/backen"],
        "derived_terms": ["рецепта/Rezept", "съставки/Zutaten"]
      }
    ]
  }
}
```

2. Usage Pattern Analysis:
```json
{
  "query": "Analyze usage patterns for verbs of motion",
  "response": {
    "usage_patterns": [
      {
        "verb": "отивам/gehen",
        "frequency": "high",
        "common_contexts": ["daily routines", "travel"],
        "collocations": ["на работа/zur Arbeit", "в града/in die Stadt"]
      }
    ]
  }
}
```

3. Learning Progression:
```json
{
  "query": "Optimize progression for A1 vocabulary",
  "response": {
    "learning_path": [
      {
        "stage": 1,
        "focus": "essential verbs",
        "items": ["съм/sein", "имам/haben"]
      },
      {
        "stage": 2,
        "focus": "basic nouns",
        "items": ["дом/Haus", "храна/Essen"]
      }
    ]
  }
}
```

## Usage Guidelines

1. Always consider both Bulgarian and German contexts
2. Maintain CEFR level alignment
3. Consider bidirectional learning challenges
4. Use frequency data to inform grouping
5. Document semantic relationships clearly

## Error Handling

1. Invalid Vocabulary Data:
   - Check data structure before analysis
   - Report specific validation errors
   - Suggest data corrections

2. Missing Prerequisites:
   - Identify missing dependencies
   - Suggest alternative paths
   - Document gaps for future content

3. Conflicting Patterns:
   - Note ambiguous cases
   - Provide multiple interpretations
   - Recommend best practices

## See Also

- `/grammar-progression`: Related grammar analysis
- `/exercise-generation`: Exercise creation using analyzed patterns
- `/bilingual-content`: Content processing for both languages