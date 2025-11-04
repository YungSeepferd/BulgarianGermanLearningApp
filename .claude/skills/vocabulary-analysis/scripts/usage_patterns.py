"""
Usage Pattern Analysis Tool
Analyzes vocabulary usage patterns and collocations.
"""

import json
import pandas as pd
import numpy as np
from typing import Dict, List, Set, Tuple
from collections import defaultdict
from dataclasses import dataclass

@dataclass
class UsageContext:
    context: str
    frequency: int
    examples: List[Dict[str, str]]
    collocations: List[Tuple[str, int]]

class UsagePatternAnalyzer:
    def __init__(self):
        self.vocabulary_data = None
        self.contexts = defaultdict(lambda: defaultdict(list))
        self.collocations = defaultdict(lambda: defaultdict(int))
        
    def load_data(self, file_path: str) -> None:
        """Load vocabulary data from JSON file."""
        with open(file_path, 'r', encoding='utf-8') as f:
            self.vocabulary_data = json.load(f)

    def analyze_contexts(self) -> Dict[str, List[UsageContext]]:
        """Analyze usage contexts for each term."""
        term_contexts = defaultdict(list)
        
        for entry in self.vocabulary_data['vocabulary']:
            bg_term = entry['bg']
            de_term = entry['de']
            
            # Track contexts from examples
            for example in entry.get('examples', []):
                context = example.get('context', 'general')
                
                # Add example to context tracking
                self.contexts[bg_term][context].append(example)
                
                # Extract collocations from examples
                if 'bg' in example:
                    words = example['bg'].split()
                    for i in range(len(words)):
                        if words[i].lower() == bg_term.lower():
                            # Look at words before and after
                            if i > 0:
                                self.collocations[bg_term][words[i-1].lower()] += 1
                            if i < len(words) - 1:
                                self.collocations[bg_term][words[i+1].lower()] += 1

            # Create UsageContext objects for each context
            for context, examples in self.contexts[bg_term].items():
                # Get collocations for this term
                term_collocations = sorted(
                    self.collocations[bg_term].items(),
                    key=lambda x: x[1],
                    reverse=True
                )
                
                term_contexts[bg_term].append(UsageContext(
                    context=context,
                    frequency=len(examples),
                    examples=examples,
                    collocations=term_collocations[:5]  # Top 5 collocations
                ))

        return term_contexts

    def calculate_frequencies(self) -> pd.DataFrame:
        """Calculate usage frequencies and patterns."""
        frequencies = defaultdict(lambda: {
            'total_occurrences': 0,
            'contexts': defaultdict(int),
            'collocations': defaultdict(int)
        })
        
        for entry in self.vocabulary_data['vocabulary']:
            bg_term = entry['bg']
            stats = frequencies[bg_term]
            
            # Count examples
            for example in entry.get('examples', []):
                stats['total_occurrences'] += 1
                context = example.get('context', 'general')
                stats['contexts'][context] += 1
                
                # Analyze collocations in Bulgarian examples
                if 'bg' in example:
                    words = example['bg'].split()
                    for i, word in enumerate(words):
                        if word.lower() == bg_term.lower():
                            if i > 0:
                                stats['collocations'][words[i-1].lower()] += 1
                            if i < len(words) - 1:
                                stats['collocations'][words[i+1].lower()] += 1
        
        # Convert to DataFrame
        data = []
        for term, stats in frequencies.items():
            # Get top contexts and collocations
            top_contexts = sorted(
                stats['contexts'].items(),
                key=lambda x: x[1],
                reverse=True
            )[:3]
            
            top_collocations = sorted(
                stats['collocations'].items(),
                key=lambda x: x[1],
                reverse=True
            )[:3]
            
            data.append({
                'term': term,
                'total_occurrences': stats['total_occurrences'],
                'top_contexts': [f"{c}: {n}" for c, n in top_contexts],
                'top_collocations': [f"{c}: {n}" for c, n in top_collocations]
            })
            
        return pd.DataFrame(data)

    def analyze_patterns(self) -> Dict:
        """Analyze overall usage patterns."""
        contexts = self.analyze_contexts()
        frequencies = self.calculate_frequencies()
        
        patterns = {
            'term_patterns': {},
            'context_summary': defaultdict(int),
            'collocation_network': defaultdict(list)
        }
        
        # Analyze patterns for each term
        for term, term_contexts in contexts.items():
            patterns['term_patterns'][term] = {
                'primary_context': max(
                    term_contexts,
                    key=lambda x: x.frequency
                ).context,
                'context_distribution': {
                    ctx.context: ctx.frequency
                    for ctx in term_contexts
                },
                'common_collocations': [
                    coll for ctx in term_contexts
                    for coll, _ in ctx.collocations[:3]
                ]
            }
            
            # Update context summary
            for ctx in term_contexts:
                patterns['context_summary'][ctx.context] += ctx.frequency
                
            # Build collocation network
            for ctx in term_contexts:
                for coll, freq in ctx.collocations:
                    if freq > 1:  # Only include meaningful collocations
                        patterns['collocation_network'][term].append({
                            'collocate': coll,
                            'frequency': freq,
                            'context': ctx.context
                        })
        
        return patterns

    def export_analysis(self, output_path: str) -> None:
        """Export usage pattern analysis to JSON."""
        patterns = self.analyze_patterns()
        frequencies_df = self.calculate_frequencies()
        
        analysis = {
            'patterns': patterns,
            'frequency_data': frequencies_df.to_dict(orient='records')
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(analysis, f, ensure_ascii=False, indent=2)

def main(input_path: str, output_path: str):
    """Main function to run usage pattern analysis."""
    analyzer = UsagePatternAnalyzer()
    analyzer.load_data(input_path)
    analyzer.export_analysis(output_path)

if __name__ == '__main__':
    import sys
    if len(sys.argv) != 3:
        print("Usage: python usage_patterns.py input.json output.json")
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])