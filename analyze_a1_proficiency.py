#!/usr/bin/env python3
"""
A1 Proficiency Analysis for Bulgarian-German Vocabulary
Analyzes 750 vocabulary entries against CEFR A1 standards
"""

import json
from collections import defaultdict, Counter

def analyze_a1_compliance(vocab_file='data/vocabulary.json'):
    """Analyze vocabulary entries for A1 proficiency compliance"""

    with open(vocab_file, 'r', encoding='utf-8') as f:
        entries = json.load(f)

    print(f"🔍 Analyzing {len(entries)} vocabulary entries for A1 proficiency...\n")

    # A1 Proficiency Criteria (CEFR Standards)
    A1_MAX_DIFFICULTY = 3  # A1 should be difficulty 1-3, A2 is 4-5, B1+ is 6
    A1_MIN_FREQUENCY = 30  # A1 words should be common (frequency ≥30 out of 100)

    # Analysis containers
    issues = []
    stats = {
        'total': len(entries),
        'by_category': Counter(),
        'by_difficulty': Counter(),
        'by_frequency_range': Counter(),
        'avg_difficulty': 0,
        'avg_frequency': 0,
        'missing_fields': defaultdict(list),
        'quality_issues': []
    }

    difficulty_sum = 0
    frequency_sum = 0

    for idx, entry in enumerate(entries):
        eid = entry.get('id', f'entry_{idx}')
        word = entry.get('word', 'MISSING')
        category = entry.get('category', 'UNCATEGORIZED')
        level = entry.get('level', 'UNKNOWN')
        difficulty = entry.get('difficulty', 0)
        frequency = entry.get('frequency', 0)

        # Count by category
        stats['by_category'][category] += 1

        # Count by difficulty
        stats['by_difficulty'][difficulty] += 1

        # Count by frequency range
        if frequency >= 80:
            freq_range = '80-100 (Very High)'
        elif frequency >= 60:
            freq_range = '60-79 (High)'
        elif frequency >= 40:
            freq_range = '40-59 (Medium)'
        elif frequency >= 20:
            freq_range = '20-39 (Low)'
        else:
            freq_range = '0-19 (Very Low)'
        stats['by_frequency_range'][freq_range] += 1

        difficulty_sum += difficulty
        frequency_sum += frequency

        # Check level assignment
        if level != 'A1':
            issues.append({
                'id': eid,
                'word': word,
                'issue': f"Level mismatch: marked as '{level}' instead of 'A1'",
                'severity': 'HIGH'
            })

        # Check difficulty rating (A1 should be 1-3)
        if difficulty > A1_MAX_DIFFICULTY:
            issues.append({
                'id': eid,
                'word': word,
                'issue': f"Difficulty too high: {difficulty} (A1 should be 1-3)",
                'severity': 'MEDIUM',
                'suggestion': 'Review if this word is appropriate for A1 or adjust difficulty'
            })

        # Check frequency (A1 words should be common)
        if frequency < A1_MIN_FREQUENCY:
            issues.append({
                'id': eid,
                'word': word,
                'issue': f"Frequency too low: {frequency} (A1 should be ≥30)",
                'severity': 'LOW',
                'suggestion': 'Verify if this word is common enough for A1 learners'
            })

        # Check required fields for completeness
        required_fields = [
            'word', 'translation', 'source_lang', 'target_lang',
            'category', 'level', 'notes', 'etymology', 'cultural_note',
            'difficulty', 'frequency', 'examples'
        ]

        for field in required_fields:
            if field not in entry or not entry[field]:
                stats['missing_fields'][field].append(eid)

        # Check bidirectional notes
        if 'notes_bg_to_de' not in entry or not entry['notes_bg_to_de']:
            stats['missing_fields']['notes_bg_to_de'].append(eid)
        if 'notes_de_to_bg' not in entry or not entry['notes_de_to_bg']:
            stats['missing_fields']['notes_de_to_bg'].append(eid)

        # Check examples quality (should have at least 2-3 examples for A1)
        examples = entry.get('examples', [])
        if len(examples) < 2:
            stats['quality_issues'].append({
                'id': eid,
                'word': word,
                'issue': f"Only {len(examples)} example(s) - A1 should have 2-3 examples"
            })

    # Calculate averages
    stats['avg_difficulty'] = difficulty_sum / len(entries) if entries else 0
    stats['avg_frequency'] = frequency_sum / len(entries) if entries else 0

    # Print report
    print("="*80)
    print("📊 A1 PROFICIENCY COMPLIANCE REPORT")
    print("="*80)
    print(f"\n✅ Total entries analyzed: {stats['total']}")
    print(f"📈 Average difficulty: {stats['avg_difficulty']:.2f} (A1 target: 1-3)")
    print(f"📈 Average frequency: {stats['avg_frequency']:.1f} (A1 target: ≥30)")

    print(f"\n📚 Distribution by Category:")
    for cat, count in sorted(stats['by_category'].items(), key=lambda x: -x[1])[:15]:
        print(f"  • {cat}: {count} entries")

    print(f"\n🎚️  Distribution by Difficulty:")
    for diff in sorted(stats['by_difficulty'].keys()):
        count = stats['by_difficulty'][diff]
        percentage = (count / stats['total']) * 100
        marker = "✅" if diff <= A1_MAX_DIFFICULTY else "⚠️"
        print(f"  {marker} Difficulty {diff}: {count} entries ({percentage:.1f}%)")

    print(f"\n📊 Distribution by Frequency Range:")
    for freq_range in ['80-100 (Very High)', '60-79 (High)', '40-59 (Medium)', '20-39 (Low)', '0-19 (Very Low)']:
        count = stats['by_frequency_range'][freq_range]
        percentage = (count / stats['total']) * 100
        print(f"  • {freq_range}: {count} entries ({percentage:.1f}%)")

    # Issues report
    print(f"\n⚠️  PROFICIENCY ISSUES FOUND: {len(issues)}")

    if issues:
        # Group by severity
        high = [i for i in issues if i.get('severity') == 'HIGH']
        medium = [i for i in issues if i.get('severity') == 'MEDIUM']
        low = [i for i in issues if i.get('severity') == 'LOW']

        if high:
            print(f"\n🔴 HIGH SEVERITY ({len(high)} issues):")
            for issue in high[:10]:  # Show first 10
                print(f"  • {issue['id']} ({issue['word']}): {issue['issue']}")
            if len(high) > 10:
                print(f"  ... and {len(high)-10} more")

        if medium:
            print(f"\n🟡 MEDIUM SEVERITY ({len(medium)} issues):")
            for issue in medium[:10]:
                print(f"  • {issue['id']} ({issue['word']}): {issue['issue']}")
            if len(medium) > 10:
                print(f"  ... and {len(medium)-10} more")

        if low:
            print(f"\n🟢 LOW SEVERITY ({len(low)} issues):")
            print(f"  Total: {len(low)} entries with low frequency (<30)")
            print(f"  Note: Low frequency doesn't disqualify A1, but verify these are essential")

    # Missing fields report
    if stats['missing_fields']:
        print(f"\n📝 MISSING FIELD ANALYSIS:")
        for field, entry_ids in stats['missing_fields'].items():
            if entry_ids:
                print(f"  ⚠️  {field}: {len(entry_ids)} entries missing")
    else:
        print(f"\n✅ ALL REQUIRED FIELDS COMPLETE!")

    # Quality issues
    if stats['quality_issues']:
        print(f"\n📋 QUALITY RECOMMENDATIONS:")
        insufficient_examples = [q for q in stats['quality_issues'] if 'example' in q['issue'].lower()]
        if insufficient_examples:
            print(f"  • {len(insufficient_examples)} entries have fewer than 2 examples")

    # Final verdict
    print(f"\n" + "="*80)
    print("🎯 FINAL VERDICT")
    print("="*80)

    high_severity_count = len([i for i in issues if i.get('severity') == 'HIGH'])
    medium_severity_count = len([i for i in issues if i.get('severity') == 'MEDIUM'])

    compliance_percentage = ((stats['total'] - high_severity_count - medium_severity_count) / stats['total']) * 100

    if high_severity_count == 0 and medium_severity_count < 10:
        print("✅ EXCELLENT: All vocabulary entries are A1-compliant!")
        print(f"   Compliance rate: {compliance_percentage:.1f}%")
    elif high_severity_count == 0 and medium_severity_count < 50:
        print("✅ GOOD: Minor adjustments recommended for optimal A1 compliance")
        print(f"   Compliance rate: {compliance_percentage:.1f}%")
    else:
        print("⚠️  NEEDS REVIEW: Some entries may need difficulty/frequency adjustment")
        print(f"   Compliance rate: {compliance_percentage:.1f}%")

    print(f"\n📖 Overall Assessment:")
    print(f"   • Average difficulty of {stats['avg_difficulty']:.2f} is {'✅ appropriate' if stats['avg_difficulty'] <= A1_MAX_DIFFICULTY else '⚠️ slightly high'} for A1")
    print(f"   • Average frequency of {stats['avg_frequency']:.1f} is {'✅ good' if stats['avg_frequency'] >= 40 else '⚠️ acceptable'} for A1")
    print(f"   • Category distribution: {'✅ balanced' if len(stats['by_category']) >= 15 else '⚠️ limited'}")
    print(f"   • Bidirectional support: {'✅ complete' if 'notes_bg_to_de' not in stats['missing_fields'] else '⚠️ incomplete'}")

    print("\n" + "="*80)

    return stats, issues

if __name__ == '__main__':
    analyze_a1_compliance()
