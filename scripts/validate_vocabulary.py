#!/usr/bin/env python3
"""
Vocabulary Validator & Statistics Generator
For Bulgarian-German Learning App

This script validates vocabulary entries and generates statistics.
"""

import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

class VocabularyValidator:
    """Validates vocabulary entries against CEFR standards"""
    
    REQUIRED_FIELDS = ['id', 'word', 'translation', 'source_lang', 'target_lang', 'category', 'level']
    OPTIONAL_FIELDS = ['notes', 'notes_bg_to_de', 'notes_de_to_bg', 'etymology', 
                      'cultural_note', 'linguistic_note', 'difficulty', 'frequency', 'examples']
    VALID_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    VALID_LANGS = ['bg', 'de']
    
    def __init__(self, vocab_file):
        self.vocab_file = vocab_file
        self.vocab = []
        self.errors = []
        self.warnings = []
        
    def load_vocabulary(self):
        """Load vocabulary from JSON file"""
        try:
            with open(self.vocab_file, 'r', encoding='utf-8') as f:
                self.vocab = json.load(f)
            print(f"✓ Loaded {len(self.vocab)} vocabulary entries")
            return True
        except json.JSONDecodeError as e:
            self.errors.append(f"Invalid JSON: {e}")
            return False
        except FileNotFoundError:
            self.errors.append(f"File not found: {self.vocab_file}")
            return False
    
    def validate_entry(self, entry, index):
        """Validate a single vocabulary entry"""
        entry_errors = []
        entry_warnings = []
        
        # Check required fields
        for field in self.REQUIRED_FIELDS:
            if field not in entry or entry[field] is None or entry[field] == "":
                entry_errors.append(f"Missing required field: {field}")
        
        # Validate level
        if 'level' in entry and entry['level'] not in self.VALID_LEVELS:
            entry_errors.append(f"Invalid level: {entry['level']}")
        
        # Validate languages
        if 'source_lang' in entry and entry['source_lang'] not in self.VALID_LANGS:
            entry_errors.append(f"Invalid source_lang: {entry['source_lang']}")
        if 'target_lang' in entry and entry['target_lang'] not in self.VALID_LANGS:
            entry_errors.append(f"Invalid target_lang: {entry['target_lang']}")
        
        # Validate difficulty (1-6)
        if 'difficulty' in entry and entry['difficulty']:
            if not isinstance(entry['difficulty'], int) or entry['difficulty'] < 1 or entry['difficulty'] > 6:
                entry_errors.append(f"Difficulty must be 1-6, got: {entry['difficulty']}")
        
        # Validate frequency (0-100)
        if 'frequency' in entry and entry['frequency']:
            if not isinstance(entry['frequency'], (int, float)) or entry['frequency'] < 0 or entry['frequency'] > 100:
                entry_errors.append(f"Frequency must be 0-100, got: {entry['frequency']}")
        
        # Check for recommended fields based on level
        level = entry.get('level', '')
        if level in ['B1', 'B2', 'C1', 'C2']:
            if not entry.get('examples') or len(entry.get('examples', [])) == 0:
                entry_warnings.append(f"B1+ entries should have examples")
        
        if not entry.get('etymology'):
            entry_warnings.append("Missing etymology")
        
        if not entry.get('cultural_note'):
            entry_warnings.append("Missing cultural_note")
        
        if not entry.get('linguistic_note'):
            entry_warnings.append("Missing linguistic_note")
        
        return entry_errors, entry_warnings
    
    def check_duplicates(self):
        """Check for duplicate IDs and words"""
        ids = [e.get('id') for e in self.vocab if e.get('id')]
        words = [e.get('word') for e in self.vocab if e.get('word')]
        
        id_counts = Counter(ids)
        word_counts = Counter(words)
        
        duplicates = []
        for id_val, count in id_counts.items():
            if count > 1:
                duplicates.append(f"Duplicate ID: {id_val} (appears {count} times)")
        
        for word, count in word_counts.items():
            if count > 1:
                duplicates.append(f"Duplicate word: {word} (appears {count} times)")
        
        return duplicates
    
    def generate_statistics(self):
        """Generate statistics about vocabulary"""
        stats = {
            'total': len(self.vocab),
            'by_level': Counter(),
            'by_category': Counter(),
            'by_difficulty': Counter(),
            'with_examples': 0,
            'with_etymology': 0,
            'with_cultural_notes': 0,
            'avg_frequency': 0
        }
        
        frequencies = []
        
        for entry in self.vocab:
            level = entry.get('level')
            if level:
                stats['by_level'][level] += 1
            
            category = entry.get('category')
            if category:
                stats['by_category'][category] += 1
            
            difficulty = entry.get('difficulty')
            if difficulty:
                stats['by_difficulty'][difficulty] += 1
            
            if entry.get('examples'):
                stats['with_examples'] += 1
            
            if entry.get('etymology'):
                stats['with_etymology'] += 1
            
            if entry.get('cultural_note'):
                stats['with_cultural_notes'] += 1
            
            if entry.get('frequency'):
                frequencies.append(entry['frequency'])
        
        if frequencies:
            stats['avg_frequency'] = sum(frequencies) / len(frequencies)
        
        return stats
    
    def print_statistics(self, stats):
        """Print formatted statistics"""
        print("\n" + "="*60)
        print("VOCABULARY STATISTICS")
        print("="*60)
        
        print(f"\nTotal entries: {stats['total']}")
        
        print("\nBy CEFR Level:")
        for level in ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']:
            count = stats['by_level'].get(level, 0)
            target = {
                'A1': 750, 'A2': 1500, 'B1': 2500,
                'B2': 4000, 'C1': 4500, 'C2': 5000
            }[level]
            percentage = (count / target * 100) if count > 0 else 0
            bar = '█' * int(percentage / 5) + '░' * (20 - int(percentage / 5))
            print(f"  {level}: {count:4d} / {target} [{bar}] {percentage:.1f}%")
        
        print(f"\nTop 10 Categories:")
        for category, count in stats['by_category'].most_common(10):
            print(f"  {category:20s}: {count:3d}")
        
        print(f"\nMetadata Completeness:")
        print(f"  With examples:        {stats['with_examples']:3d} ({stats['with_examples']/stats['total']*100:.1f}%)")
        print(f"  With etymology:       {stats['with_etymology']:3d} ({stats['with_etymology']/stats['total']*100:.1f}%)")
        print(f"  With cultural notes:  {stats['with_cultural_notes']:3d} ({stats['with_cultural_notes']/stats['total']*100:.1f}%)")
        
        if stats['avg_frequency'] > 0:
            print(f"\nAverage frequency: {stats['avg_frequency']:.1f}")
    
    def validate_all(self):
        """Validate all entries and generate report"""
        print("\nValidating vocabulary entries...")
        
        all_errors = []
        all_warnings = []
        
        for i, entry in enumerate(self.vocab):
            entry_id = entry.get('id', f'entry_{i}')
            errors, warnings = self.validate_entry(entry, i)
            
            if errors:
                all_errors.append(f"\nEntry {entry_id}:")
                all_errors.extend([f"  ✗ {err}" for err in errors])
            
            if warnings:
                all_warnings.append(f"\nEntry {entry_id}:")
                all_warnings.extend([f"  ⚠ {warn}" for warn in warnings])
        
        # Check for duplicates
        duplicates = self.check_duplicates()
        if duplicates:
            all_errors.append("\nDuplicate entries found:")
            all_errors.extend([f"  ✗ {dup}" for dup in duplicates])
        
        # Print results
        print("\n" + "="*60)
        print("VALIDATION RESULTS")
        print("="*60)
        
        if all_errors:
            print(f"\n❌ ERRORS ({len(all_errors)} issues):")
            for error in all_errors[:20]:  # Show first 20
                print(error)
            if len(all_errors) > 20:
                print(f"\n... and {len(all_errors) - 20} more errors")
        else:
            print("\n✅ No errors found!")
        
        if all_warnings:
            print(f"\n⚠️  WARNINGS ({len(all_warnings)} issues):")
            for warning in all_warnings[:20]:  # Show first 20
                print(warning)
            if len(all_warnings) > 20:
                print(f"\n... and {len(all_warnings) - 20} more warnings")
        else:
            print("\n✅ No warnings!")
        
        return len(all_errors) == 0


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 validate_vocabulary.py <vocabulary_file.json>")
        print("\nExample:")
        print("  python3 validate_vocabulary.py data/vocabulary.json")
        sys.exit(1)
    
    vocab_file = sys.argv[1]
    
    print("="*60)
    print("BULGARIAN-GERMAN VOCABULARY VALIDATOR")
    print("="*60)
    print(f"\nValidating: {vocab_file}")
    
    validator = VocabularyValidator(vocab_file)
    
    if not validator.load_vocabulary():
        print("\n❌ Failed to load vocabulary file")
        for error in validator.errors:
            print(f"  {error}")
        sys.exit(1)
    
    # Generate and print statistics
    stats = validator.generate_statistics()
    validator.print_statistics(stats)
    
    # Validate all entries
    success = validator.validate_all()
    
    print("\n" + "="*60)
    if success:
        print("✅ VALIDATION PASSED")
    else:
        print("❌ VALIDATION FAILED - Please fix errors above")
    print("="*60 + "\n")
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
