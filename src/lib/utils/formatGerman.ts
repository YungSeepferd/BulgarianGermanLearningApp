import type { VocabularyItem } from '$lib/types/vocabulary';

function capitalizeNoun(term: string): string {
  if (!term) return term;
  return term.charAt(0).toUpperCase() + term.slice(1);
}

function chooseArticle(gender?: string, fallback?: string): string | null {
  if (fallback) return fallback;
  if (!gender) return null;
  const map: Record<string, string> = {
    masculine: 'der',
    feminine: 'die',
    neuter: 'das'
  };
  return map[gender] || null;
}

export function formatGermanTerm(item: VocabularyItem): string {
  const raw = (item.german || '').trim();
  if (!raw) return '';
  const hasArticlePrefix = /^(der|die|das|ein|eine|einen|einem|einer|eines)\s/i.test(raw);
  if (hasArticlePrefix) {
    const [articlePart, ...rest] = raw.split(/\s+/);
    const nounPart = rest.join(' ');
    const normalizedNoun = item.partOfSpeech === 'noun' ? capitalizeNoun(nounPart) : nounPart;
    return [articlePart, normalizedNoun].filter(Boolean).join(' ').trim();
  }
  const base = item.partOfSpeech === 'noun' ? capitalizeNoun(raw) : raw;
  
  // Only add article for NOUNS that have explicit gender data
  // Do NOT add default articles for non-nouns (conjunctions, interjections, prepositions, etc.)
  // Do NOT add default articles for nouns without gender data
  if (item.partOfSpeech !== 'noun') {
    return base;
  }
  
  const metadata = item.metadata as any;
  const gender = metadata?.gender || item.grammar?.gender;
  
  // Only return an article if gender is explicitly defined
  // No fallback to 'der' for missing gender data
  const article = chooseArticle(gender, metadata?.article);
  return article ? `${article} ${base}` : base;
}
