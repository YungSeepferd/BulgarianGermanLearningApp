#!/usr/bin/env python3
"""
Vocabulary Entry Generator
Interactive tool to create new vocabulary entries with proper formatting
"""

import json
import sys
from datetime import datetime

class VocabularyGenerator:
    """Interactive vocabulary entry generator"""
    
    LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    CATEGORIES = {
        'A1': ['Begrüßung', 'Substantiv', 'Verb', 'Adjektiv', 'Adverb', 'Zahl', 
               'Lebensmittel', 'Familie', 'Transport', 'Zeit', 'Farben'],
        'A2': ['Einkaufen', 'Gesundheit', 'Kleidung', 'Beruf', 'Freizeit', 
               'Richtungen', 'Wetter', 'Gefühle'],
        'B1': ['Bildung', 'Technologie', 'Umwelt', 'Reisen', 'Kultur', 
               'Dienstleistungen', 'Unterhaltung'],
        'B2': ['Geschäft', 'Politik', 'Wissenschaft', 'Literatur', 'Gesellschaft'],
        'C1': ['Akademisch', 'Professionell', 'Idiomatisch', 'Philosophie'],
        'C2': ['Literarisch', 'Selten', 'Nuanciert']
    }
    
    def __init__(self):
        self.entry = {}
    
    def input_with_default(self, prompt, default=None):
        """Get input with optional default value"""
        if default:
            user_input = input(f"{prompt} [{default}]: ").strip()
            return user_input if user_input else default
        return input(f"{prompt}: ").strip()
    
    def get_level(self):
        """Get CEFR level from user"""
        print("\nSelect CEFR Level:")
        for i, level in enumerate(self.LEVELS, 1):
            print(f"  {i}. {level}")
        
        while True:
            choice = input("Enter number (1-6): ").strip()
            try:
                idx = int(choice) - 1
                if 0 <= idx < len(self.LEVELS):
                    return self.LEVELS[idx]
            except ValueError:
                pass
            print("Invalid choice. Please enter 1-6.")
    
    def get_category(self, level):
        """Get category from user"""
        categories = self.CATEGORIES.get(level, self.CATEGORIES['A1'])
        
        print(f"\nCommon categories for {level}:")
        for i, cat in enumerate(categories, 1):
            print(f"  {i}. {cat}")
        print(f"  {len(categories) + 1}. Other (custom)")
        
        while True:
            choice = input(f"Enter number (1-{len(categories) + 1}): ").strip()
            try:
                idx = int(choice) - 1
                if 0 <= idx < len(categories):
                    return categories[idx]
                elif idx == len(categories):
                    return input("Enter custom category: ").strip()
            except ValueError:
                pass
            print(f"Invalid choice. Please enter 1-{len(categories) + 1}.")
    
    def generate_id(self, level, word):
        """Generate a unique ID"""
        # Get last used number for this level
        prefix = level.lower().replace('-', '')
        timestamp = datetime.now().strftime('%m%d%H%M')
        clean_word = ''.join(c for c in word if c.isalnum())[:10].lower()
        return f"{prefix}_{clean_word}_{timestamp}"
    
    def get_difficulty(self, level):
        """Suggest difficulty based on level"""
        difficulty_map = {
            'A1': 1, 'A2': 2, 'B1': 3, 
            'B2': 4, 'C1': 5, 'C2': 6
        }
        suggested = difficulty_map.get(level, 3)
        
        while True:
            diff = input(f"Difficulty (1-6) [suggested: {suggested}]: ").strip()
            if not diff:
                return suggested
            try:
                d = int(diff)
                if 1 <= d <= 6:
                    return d
            except ValueError:
                pass
            print("Please enter a number between 1 and 6.")
    
    def get_frequency(self):
        """Get frequency rating"""
        while True:
            freq = input("Frequency (0-100, or press Enter to skip): ").strip()
            if not freq:
                return None
            try:
                f = int(freq)
                if 0 <= f <= 100:
                    return f
            except ValueError:
                pass
            print("Please enter a number between 0 and 100.")
    
    def get_examples(self):
        """Get example sentences"""
        examples = []
        print("\nAdd example sentences (press Enter on sentence to finish):")
        
        while True:
            sentence = input("  Bulgarian sentence: ").strip()
            if not sentence:
                break
            
            translation = input("  German translation: ").strip()
            if not translation:
                break
            
            context = self.input_with_default("  Context", "informal")
            
            examples.append({
                "sentence": sentence,
                "translation": translation,
                "context": context
            })
            
            more = input("Add another example? (y/n): ").strip().lower()
            if more != 'y':
                break
        
        return examples if examples else None
    
    def create_entry(self):
        """Interactive entry creation"""
        print("\n" + "="*60)
        print("CREATE NEW VOCABULARY ENTRY")
        print("="*60)
        
        # Required fields
        print("\n=== REQUIRED FIELDS ===")
        word = input("Bulgarian word (Cyrillic): ").strip()
        translation = input("German translation: ").strip()
        
        level = self.get_level()
        category = self.get_category(level)
        
        entry_id = self.generate_id(level, word)
        
        # Build basic entry
        self.entry = {
            "id": entry_id,
            "word": word,
            "translation": translation,
            "source_lang": "bg",
            "target_lang": "de",
            "category": category,
            "level": level
        }
        
        # Optional but recommended
        print("\n=== OPTIONAL FIELDS ===")
        
        notes = input("General notes (press Enter to skip): ").strip()
        if notes:
            self.entry["notes"] = notes
        
        notes_bg_de = input("Notes for BG→DE learners: ").strip()
        if notes_bg_de:
            self.entry["notes_bg_to_de"] = notes_bg_de
        
        notes_de_bg = input("Notes for DE→BG learners: ").strip()
        if notes_de_bg:
            self.entry["notes_de_to_bg"] = notes_de_bg
        
        etymology = input("Etymology: ").strip()
        if etymology:
            self.entry["etymology"] = etymology
        
        cultural_note = input("Cultural note: ").strip()
        if cultural_note:
            self.entry["cultural_note"] = cultural_note
        
        linguistic_note = input("Linguistic note (pronunciation, grammar): ").strip()
        if linguistic_note:
            self.entry["linguistic_note"] = linguistic_note
        
        # Difficulty and frequency
        self.entry["difficulty"] = self.get_difficulty(level)
        
        freq = self.get_frequency()
        if freq is not None:
            self.entry["frequency"] = freq
        
        # Examples (recommended for B1+)
        if level in ['B1', 'B2', 'C1', 'C2']:
            add_examples = input("\nAdd examples? (y/n): ").strip().lower()
            if add_examples == 'y':
                examples = self.get_examples()
                if examples:
                    self.entry["examples"] = examples
        
        return self.entry
    
    def preview_entry(self):
        """Show preview of the entry"""
        print("\n" + "="*60)
        print("ENTRY PREVIEW")
        print("="*60)
        print(json.dumps(self.entry, indent=2, ensure_ascii=False))
        print("="*60)
    
    def save_entry(self, filename):
        """Save entry to file"""
        try:
            # Try to load existing data
            try:
                with open(filename, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if not isinstance(data, list):
                        data = [data]
            except FileNotFoundError:
                data = []
            
            # Append new entry
            data.append(self.entry)
            
            # Save back
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            print(f"\n✓ Entry saved to {filename}")
            return True
        except Exception as e:
            print(f"\n✗ Error saving entry: {e}")
            return False


def main():
    print("="*60)
    print("BULGARIAN-GERMAN VOCABULARY GENERATOR")
    print("="*60)
    print("\nThis tool helps you create properly formatted vocabulary entries.")
    print("Press Ctrl+C at any time to exit.\n")
    
    generator = VocabularyGenerator()
    
    while True:
        try:
            entry = generator.create_entry()
            generator.preview_entry()
            
            # Confirm
            confirm = input("\nSave this entry? (y/n): ").strip().lower()
            if confirm == 'y':
                filename = input("Save to file [data/new-vocabulary.json]: ").strip()
                if not filename:
                    filename = "data/new-vocabulary.json"
                
                generator.save_entry(filename)
            
            # Continue?
            another = input("\nCreate another entry? (y/n): ").strip().lower()
            if another != 'y':
                break
        
        except KeyboardInterrupt:
            print("\n\nExiting...")
            break
        except Exception as e:
            print(f"\nError: {e}")
            continue
    
    print("\nGoodbye!")


if __name__ == "__main__":
    main()
