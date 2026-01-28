#!/usr/bin/env python3
"""Deduplicate vocabulary entries, keeping the most complete version of each."""

import json
from datetime import datetime
from pathlib import Path

def completeness_score(item):
    """Score an item by how complete it is - prefer items with more data"""
    score = 0
    if item.get('examples'): score += len(item['examples']) * 2
    if item.get('definition'): score += len(str(item['definition'])) // 50
    if item.get('culturalNotes'): score += 3
    if item.get('ipa'): score += 2
    if item.get('tags'): score += len(item['tags'])
    if item.get('relatedWords'): score += len(item['relatedWords'])
    if item.get('contextualUsage'): score += 2
    if item.get('etymology'): score += 2
    return score

def main():
    data_dir = Path(__file__).parent.parent / 'data'
    vocab_file = data_dir / 'unified-vocabulary.json'
    
    # Load vocabulary
    with open(vocab_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    vocab = data.get('vocabulary', data) if isinstance(data, dict) else data
    print(f"Total items before: {len(vocab)}")
    
    # Deduplicate, keeping the most complete version
    seen = {}
    for item in vocab:
        key = (item.get('german', '').strip().lower(), item.get('bulgarian', '').strip().lower())
        if key not in seen:
            seen[key] = item
        else:
            # Keep the more complete version
            if completeness_score(item) > completeness_score(seen[key]):
                seen[key] = item
    
    unique = list(seen.values())
    removed_count = len(vocab) - len(unique)
    print(f"Unique items after: {len(unique)}")
    print(f"Removed: {removed_count} duplicates")
    
    if removed_count == 0:
        print("No duplicates found. Exiting.")
        return
    
    # Create backup
    backup_name = data_dir / f"unified-vocabulary.backup-{datetime.now().strftime('%Y-%m-%d-%H%M')}.json"
    with open(backup_name, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Backup saved to: {backup_name}")
    
    # Save deduplicated data
    output = {'vocabulary': unique} if isinstance(data, dict) and 'vocabulary' in data else unique
    with open(vocab_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Deduplication complete! Saved {len(unique)} unique items.")

if __name__ == '__main__':
    main()
