export type VocabCard = {
  id: string;
  bulgarian_text: string;      // e.g., "За едно"
  transliteration: string;     // e.g., "Za edno"
  german_meaning: string;      // e.g., "Zum Mitnehmen"
  literal_breakdown: {
    segment: string;           // e.g., "Za"
    literal: string;           // e.g., "Für"
    grammar_tag: string;       // e.g., "Preposition"
  }[];
  context_note: string;        // e.g., "Used specifically when ordering food."
  emoji_anchor: string;        // e.g., "🥡"
  difficulty_level: 1 | 2 | 3;
};