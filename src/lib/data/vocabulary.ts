import type { VocabCard } from '$lib/schemas/voccard';

export const vocabulary: VocabCard[] = [
	{
		id: '1',
		bulgarian_text: 'Заедно',
		transliteration: 'Zaedno',
		german_meaning: 'Zusammen',
		literal_breakdown: [
			{ segment: 'За', literal: 'Für', grammar_tag: 'Preposition' },
			{ segment: 'едно', literal: 'eins', grammar_tag: 'Numeral' }
		],
		context_note: 'Wird verwendet, um anzuzeigen, dass etwas gemeinsam oder zur gleichen Zeit geschieht.',
		emoji_anchor: '🥡',
		difficulty_level: 1
	},
	{
		id: '2',
		bulgarian_text: 'Колко струва',
		transliteration: 'Kolko struva',
		german_meaning: 'Wie viel kostet das',
		literal_breakdown: [
			{ segment: 'Колко', literal: 'Wie viel', grammar_tag: 'Adverb' },
			{ segment: 'струва', literal: 'es/sie kostet', grammar_tag: 'Verb' }
		],
		context_note: 'Standardfrage nach dem Preis von etwas.',
		emoji_anchor: '💰',
		difficulty_level: 1
	},
	{
		id: '3',
		bulgarian_text: 'Може ли сметката',
		transliteration: 'Mozhe li smetkata',
		german_meaning: 'Kann ich bitte die Rechnung haben',
		literal_breakdown: [
			{ segment: 'Може', literal: 'Kann', grammar_tag: 'Verb' },
			{ segment: 'ли', literal: '(Fragepartikel)', grammar_tag: 'Particle' },
			{ segment: 'сметката', literal: 'die Rechnung', grammar_tag: 'Noun' }
		],
		context_note: 'Höfliche Art, in einem Restaurant nach der Rechnung zu fragen.',
		emoji_anchor: '🧾',
		difficulty_level: 2
	}
];