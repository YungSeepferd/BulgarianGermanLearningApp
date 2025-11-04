"""
Vocabulary Analysis Tool
Analyzes vocabulary entries for semantic relationships and learning patterns.
"""

import json
import numpy as np
import pandas as pd
from typing import Dict, List, Union, Optional
from dataclasses import dataclass
from collections import defaultdict

@dataclass
class VocabularyEntry:
    bg_term: str
    de_term: str
    level: str
    tags: List[str]
    examples: List[Dict[str, str]]

@dataclass
class SemanticGroup:
    theme: str
    core_concepts: List[str]
    derived_terms: List[List[str]]
    usage_contexts: List[str]
    progression: List[str]
    related_groups: List[str]
    false_friends: List[Dict[str, str]]
    memory_hooks: List[str]

class VocabularyAnalyzer:
    def __init__(self):
        self.entries: List[VocabularyEntry] = []
        self.semantic_groups: Dict[str, SemanticGroup] = {}
        
    def load_vocabulary(self, data_path: str) -> None:
        """Load vocabulary data from JSON file."""
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        self.entries = [
            VocabularyEntry(
                bg_term=entry['bg'],
                de_term=entry['de'],
                level=entry.get('level', 'A1'),
                tags=entry.get('tags', []),
                examples=entry.get('examples', [])
            )
            for entry in data['vocabulary']
        ]

    def analyze_semantic_groups(self) -> Dict[str, SemanticGroup]:
        """Group vocabulary items by semantic relationships."""
        # Group by primary tags first
        tag_groups = defaultdict(list)
        for entry in self.entries:
            for tag in entry.tags:
                tag_groups[tag].append(entry)

        # Create semantic groups based on tags and patterns
        semantic_groups = {}
        for tag, entries in tag_groups.items():
            # Skip tags that are too generic
            if tag in ['noun', 'verb', 'adjective']:
                continue
                
            # Find core concepts (high frequency, basic level)
            core_concepts = [
                f"{entry.bg_term}/{entry.de_term}"
                for entry in entries
                if entry.level == 'A1'
            ]

            # Group derived terms by complexity
            derived_terms = []
            for level in ['A1', 'A2', 'B1', 'B2']:
                level_terms = [
                    f"{entry.bg_term}/{entry.de_term}"
                    for entry in entries
                    if entry.level == level and f"{entry.bg_term}/{entry.de_term}" not in core_concepts
                ]
                if level_terms:
                    derived_terms.append(level_terms)

            # Extract usage contexts from examples
            contexts = {
                example.get('context', '')
                for entry in entries
                for example in entry.examples
                if 'context' in example
            }
            contexts = [c for c in contexts if c]  # Remove empty strings

            # Build progression path
            progression = [
                f"basic {tag} concepts",
                f"common {tag} vocabulary",
                f"advanced {tag} terms",
                f"specialized {tag} expressions"
            ]

            # Find related groups based on shared entries
            related_groups = set()
            for entry in entries:
                for other_tag in entry.tags:
                    if other_tag != tag and other_tag not in ['noun', 'verb', 'adjective']:
                        related_groups.add(other_tag)

            # TODO: Implement false friends detection
            false_friends = []

            # TODO: Generate memory hooks based on patterns
            memory_hooks = []

            semantic_groups[tag] = SemanticGroup(
                theme=tag,
                core_concepts=core_concepts[:5],  # Limit to top 5
                derived_terms=derived_terms,
                usage_contexts=list(contexts),
                progression=progression,
                related_groups=list(related_groups),
                false_friends=false_friends,
                memory_hooks=memory_hooks
            )

        self.semantic_groups = semantic_groups
        return semantic_groups

    def calculate_term_frequency(self) -> pd.DataFrame:
        """Calculate frequency statistics for terms."""
        frequencies = defaultdict(int)
        for entry in self.entries:
            for example in entry.examples:
                # Count occurrences in examples
                if 'bg' in example:
                    for word in example['bg'].split():
                        frequencies[word.lower()] += 1
                if 'de' in example:
                    for word in example['de'].split():
                        frequencies[word.lower()] += 1

        df = pd.DataFrame.from_dict(frequencies, orient='index', columns=['frequency'])
        df.sort_values('frequency', ascending=False, inplace=True)
        return df

    def suggest_memory_hooks(self, entry: VocabularyEntry) -> List[str]:
        """Generate memory hooks for vocabulary terms."""
        hooks = []
        
        # Sound similarity hooks
        bg_sounds = entry.bg_term.lower()
        de_sounds = entry.de_term.lower()
        
        # Look for shared sound patterns
        min_length = 2
        for i in range(len(bg_sounds) - min_length + 1):
            for j in range(i + min_length, len(bg_sounds) + 1):
                pattern = bg_sounds[i:j]
                if pattern in de_sounds and len(pattern) >= min_length:
                    hooks.append(f"Sound pattern '{pattern}' appears in both words")

        # TODO: Add more hook generation strategies:
        # - Word part analysis
        # - Cultural connections
        # - Common context patterns
        
        return hooks

    def export_analysis(self, output_path: str) -> None:
        """Export the complete analysis to JSON."""
        analysis = {
            "semantic_groups": {
                name: {
                    "theme": group.theme,
                    "core_concepts": group.core_concepts,
                    "derived_terms": group.derived_terms,
                    "usage_contexts": group.usage_contexts,
                    "progression": group.progression,
                    "related_groups": group.related_groups,
                    "false_friends": group.false_friends,
                    "memory_hooks": group.memory_hooks
                }
                for name, group in self.semantic_groups.items()
            }
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(analysis, f, ensure_ascii=False, indent=2)

def main(input_path: str, output_path: str):
    """Main function to run vocabulary analysis."""
    analyzer = VocabularyAnalyzer()
    analyzer.load_vocabulary(input_path)
    analyzer.analyze_semantic_groups()
    analyzer.export_analysis(output_path)

if __name__ == '__main__':
    import sys
    if len(sys.argv) != 3:
        print("Usage: python analyze_vocabulary.py input.json output.json")
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])