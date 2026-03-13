# CEFR Level Mapping Documentation

**Date**: January 28, 2026
**Purpose**: Documentation of CEFR (Common European Framework of Reference for Languages) level assignment for vocabulary items

## Overview

CEFR levels have been populated for all 1,681 vocabulary items using a difficulty-weighted inference algorithm.

## CEFR Levels

| Level | Name       | Description                        | Proficiency                               |
|-------|------------|------------------------------------|-------------------------------------------|
| A1    | Beginner   | Elementary (basic)                | Can understand and use familiar everyday expressions |
| A2    | Elementary | Post-beginner                     | Can communicate in simple, routine tasks requiring direct exchange of information |
| B1    | Intermediate | Threshold                       | Can understand the main points of clear standard input on familiar matters |
| B2    | Upper Intermediate | Vantage                       | Can understand the main ideas of complex text on both concrete and abstract topics |
| C1    | Advanced   | Effective Operational Proficiency | Can express ideas fluently and spontaneously without searching for expressions |

## Mapping Strategy

### Primary Factor: Difficulty Level

The difficulty field (1-5 scale) is the primary determinant:

| Difficulty | CEFR Level | Percentage | Description                      |
|------------|------------|------------|----------------------------------|
| 1          | A1         | 97.6%      | Beginner - basic vocabulary      |
| 2          | A2         | 2.4%       | Elementary - common vocabulary   |
| 3          | B1         | 0%         | Intermediate - topic-specific    |
| 4          | B2         | 0%         | Upper Intermediate - complex     |
| 5          | C1         | 0%         | Advanced - abstract concepts     |
| null       | A1         | -          | Defaulted to beginner level      |

### Secondary Factor: Word Length

Minor adjustments based on word/phrase length:

- **Long words** (> 15 characters, single word): bumped up one level
- **Long phrases** (> 5 words): bumped up one level

Example adjustments:
- "Haus" (4 chars, difficulty 1) → A1
- "Aufbewahrungsbehälter" (19 chars, difficulty 1) → A2 (bumped due to length)
- "Bitte geben Sie mir eine Cola" (27 chars, 5 words, difficulty 1) → A2 (bumped due to phrase length)

## Current Distribution

```
Total Items: 1,681

A1 (Beginner):             1,641 (97.6%)
A2 (Elementary):             40 (2.4%)
B1 (Intermediate):             0 (0.0%)
B2 (Upper Intermediate):      0 (0.0%)
C1 (Advanced):                0 (0.0%)
```

## Algorithm

### Version 3 (Current) - Difficulty-Weighted

**Script**: `scripts/populate-cefr-levels-v3.ts`

**Approach**:
1. Map difficulty 1 → A1, 2 → A2, 3 → B1, 4 → B2, 5 → C1
2. Apply minor adjustments for word/phrase length
3. Default to A1 for null difficulty

**Rationale**:
- Difficulty field is the most reliable indicator
- Most items in the dataset are beginner-level (difficulty 1)
- Simple, predictable mapping
- Easy to maintain and update

### Previous Versions

#### Version 2 - Multi-Factor Weighted (abandoned)
- Used weighted average of 5 factors
- Issue: Incorrect scoring produced 57.2% C1 assignments
- Factors: difficulty (5x), category (2x), part of speech (1.5x), word complexity (1x), source (1.5x)

#### Version 1 - Multi-Factor (abandoned)
- Similar to V2 with different weights
- Same issue with excessive C1 assignments

## Data Fields Added

Each vocabulary item now includes:

```typescript
{
  "cefrLevel": "A1" | "A2" | "B1" | "B2" | "C1",
  "cefrInference": {
    "inferredAt": "2026-01-28T11:55:19.115Z",
    "difficulty": 1,
    "method": "difficulty-weighted"
  }
}
```

## Usage

### In Components

```typescript
import { VocabularyItem } from '$lib/schemas/vocabulary';

function getCEFRLabel(level: string): string {
  const labels = {
    A1: 'Beginner',
    A2: 'Elementary',
    B1: 'Intermediate',
    B2: 'Upper Intermediate',
    C1: 'Advanced'
  };
  return labels[level] || level;
}

function getCEFRColor(level: string): string {
  const colors = {
    A1: 'bg-green-100 text-green-800',
    A2: 'bg-blue-100 text-blue-800',
    B1: 'bg-yellow-100 text-yellow-800',
    B2: 'bg-orange-100 text-orange-800',
    C1: 'bg-red-100 text-red-800'
  };
  return colors[level] || 'bg-gray-100 text-gray-800';
}
```

### In Learning Paths

- **A1 Level**: Greetings, numbers, basic food, family, colors, animals
- **A2 Level**: Time, weather, everyday phrases
- **B1 Level**: Nature, transport, professions, places
- **B2 Level**: Technology, grammar concepts
- **C1 Level**: Culture, abstract concepts

## Validation

### Manual Review Sample

| German         | Bulgarian       | Difficulty | CEFR | Reason                              |
|----------------|-----------------|------------|------|-------------------------------------|
| Abend          | вечер           | 1          | A1   | Basic word, difficulty 1            |
| Haus           | къща            | 1          | A1   | Basic word, difficulty 1            |
| Aufbewahrungsbehälter | чешмата     | 1          | A2   | Long word (>15 chars), bumped up |
| Bitte geben Sie mir eine Cola | Моля, дайте ми кола | 1 | A2 | Long phrase (5 words), bumped up |

### Future Improvements

1. **Difficulty Calibration**: If difficulty values are updated, re-run the script
2. **Human Review**: Manually verify items with edge cases
3. **Category-Based Adjustment**: Consider category-specific knowledge
4. **Frequency-Based Adjustment**: Use word frequency data for refinement
5. **Learning Path Integration**: Align CEFR levels with learning progression

## Maintenance

### Updating CEFR Levels

If CEFR levels need adjustment:

1. Update `scripts/populate-cefr-levels-v3.ts` with new mapping logic
2. Run: `npx tsx scripts/populate-cefr-levels-v3.ts data/unified-vocabulary.json data/output.json`
3. Review distribution and sample items
4. Backup original file
5. Replace with updated version

### Reverting Changes

Original file backed up as: `data/unified-vocabulary.backup-YYYYMMDD-HHMMSS.json`

## References

- [CEFR Official Levels](https://www.coe.int/en/web/common-european-framework-reference-languages/)
- [German CEFR Vocabulary Lists](https://www.goethe.de/en/spr/ueb/niv/a1.html)
- [Bulgarian CEFR Framework](https://www.britishcouncil.bg/en/exam/cefr)

## Scripts

- **v3 (current)**: `scripts/populate-cefr-levels-v3.ts` - Difficulty-weighted mapping
- **v2 (deprecated)**: `scripts/populate-cefr-levels.ts` - Multi-factor weighted
- **Test scripts**: `test-cefr.ts`, `test-cefr-2.ts` - Debugging and validation

## Changelog

**2026-01-28**:
- Initial CEFR level assignment for 1,681 vocabulary items
- 97.6% assigned to A1 (Beginner)
- 2.4% assigned to A2 (Elementary) based on word/phrase length
- Created documentation and backup

