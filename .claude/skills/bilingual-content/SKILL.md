---
name: bilingual-content
description: Process and validate bilingual content for Bulgarian and German language pairs, ensuring accuracy, consistency, and appropriate cultural context. Use for content creation, translation verification, and cultural adaptation.
---

# Bilingual Content Processing Skill

## Core Capabilities

1. Content Validation
   - Translation accuracy check
   - Cultural context verification
   - Register alignment

2. Cultural Adaptation
   - Cultural reference mapping
   - Pragmatic equivalence
   - Regional variation handling

3. Content Enhancement
   - Context addition
   - Usage examples
   - Cultural notes

## Instructions

### Content Validation
```python
def validate_content(bg_content, de_content):
    """
    Validate bilingual content pairs
    Returns validation results
    """
    # Implementation in content_validator.py
    pass
```

### Cultural Processing
```python
def process_cultural_elements(content_data):
    """
    Analyze and adapt cultural references
    Returns enhanced content
    """
    # Implementation in cultural_processor.py
    pass
```

### Content Enhancement
```python
def enhance_content(content_data):
    """
    Add context and examples to content
    Returns enriched content
    """
    # Implementation in content_enhancer.py
    pass
```

## Additional Resources

- `scripts/content_validator.py`: Validation tools
- `scripts/cultural_processor.py`: Cultural processing
- `scripts/content_enhancer.py`: Enhancement functions
- `REFERENCE.md`: Cultural reference guide
- `templates/`: Content templates

## Examples

1. Translation Validation:
```json
{
  "query": "Validate greeting translations",
  "response": {
    "validation": {
      "pair": {
        "bg": "Приятно ми е",
        "de": "Freut mich"
      },
      "accuracy": "high",
      "register": "neutral",
      "cultural_notes": "Common in first meetings"
    }
  }
}
```

2. Cultural Adaptation:
```json
{
  "query": "Process holiday references",
  "response": {
    "cultural_mapping": {
      "term": "Коледа/Weihnachten",
      "cultural_aspects": {
        "bulgarian": [
          "Orthodox calendar",
          "Different traditional foods"
        ],
        "german": [
          "Western calendar",
          "Specific traditions"
        ]
      },
      "adaptation_notes": "Note calendar differences"
    }
  }
}
```

3. Content Enhancement:
```json
{
  "query": "Enhance restaurant dialogue",
  "response": {
    "enhanced_content": {
      "dialogue": {
        "bg": "Бих искал да резервирам маса",
        "de": "Ich möchte einen Tisch reservieren",
        "context": "restaurant booking",
        "register": "formal",
        "cultural_notes": [
          "Common in both cultures",
          "Similar formality levels"
        ]
      }
    }
  }
}
```

## Usage Guidelines

1. Verify translation accuracy
2. Consider cultural context
3. Match register levels
4. Include usage notes
5. Document adaptations

## Error Handling

1. Translation Issues:
   - Flag inaccurate translations
   - Suggest corrections
   - Note ambiguities

2. Cultural Mismatches:
   - Identify cultural gaps
   - Provide adaptation suggestions
   - Document limitations

3. Context Problems:
   - Check contextual fit
   - Verify register appropriateness
   - Suggest improvements

## See Also

- `/vocabulary-analysis`: Vocabulary verification
- `/grammar-progression`: Grammar context
- `/exercise-generation`: Content application