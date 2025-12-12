<script lang="ts">
	/**
	 * EnrichmentBadge Component
	 * Displays enrichment status, confidence score, and link to Langenscheidt dictionary
	 */

	import type { VocabularyItem } from '$lib/types/vocabulary';

	interface Props {
		item: VocabularyItem & { enrichment?: any; definitions?: any[] };
		variant?: 'inline' | 'card' | 'detailed';
	}

	let { item, variant = 'inline' } = $props();

	// Determine confidence level for color coding
	const getConfidenceLevel = (score: number) => {
		if (score >= 0.85) return { level: 'high', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
		if (score >= 0.75) return { level: 'medium', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
		return { level: 'low', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
	};

	// Get source URL from enrichment data
	const getSourceURL = () => {
		if (item.enrichment?.sourceURL) return item.enrichment.sourceURL;
		if (item.definitions?.[0]?.url) return item.definitions[0].url;
		return null;
	};

	// Get confidence score
	const getConfidenceScore = () => {
		if (item.enrichment?.confidence) return item.enrichment.confidence;
		if (item.definitions?.[0]?.confidence) return item.definitions[0].confidence;
		return 0;
	};

	// Get enrichment timestamp
	const getEnrichmentDate = () => {
		if (item.enrichment?.enrichedAt) return new Date(item.enrichment.enrichedAt).toLocaleDateString();
		if (item.definitions?.[0]?.enrichedAt) return new Date(item.definitions[0].enrichedAt).toLocaleDateString();
		return null;
	};

	const sourceURL = getSourceURL();
	const confidence = getConfidenceScore();
	const enrichmentDate = getEnrichmentDate();
	const confidenceInfo = getConfidenceLevel(confidence);
</script>

{#if sourceURL}
	{#if variant === 'inline'}
		<!-- Inline badge (small, minimal) -->
		<div class="flex items-center gap-2 px-2 py-1 rounded-md {confidenceInfo.bg} border border-1 {confidenceInfo.border}">
			<span class="text-xs font-semibold text-gray-600">📖 Enriched</span>
			<a
				href={sourceURL}
				target="_blank"
				rel="noopener noreferrer"
				title="View definition in Langenscheidt dictionary"
				class="text-xs text-blue-600 hover:text-blue-800 hover:underline"
			>
				View
			</a>
		</div>
	{:else if variant === 'card'}
		<!-- Card variant (medium, informative) -->
		<div class="rounded-lg {confidenceInfo.bg} border border-1 {confidenceInfo.border} p-3 space-y-2">
			<div class="flex items-center justify-between">
				<span class="font-semibold text-gray-700">📖 Dictionary Link</span>
				<span class="text-xs font-bold {confidenceInfo.color}">
					{(confidence * 100).toFixed(0)}% confidence
				</span>
			</div>

			<p class="text-sm text-gray-600">
				This vocabulary item is enriched with official Langenscheidt dictionary definitions.
			</p>

			<a
				href={sourceURL}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors"
			>
				<span>🔗 Open Dictionary</span>
				<span class="text-xs">↗</span>
			</a>

			{#if enrichmentDate}
				<p class="text-xs text-gray-500">
					Enriched on {enrichmentDate}
				</p>
			{/if}
		</div>
	{:else if variant === 'detailed'}
		<!-- Detailed variant (large, comprehensive) -->
		<div class="rounded-lg border-2 {confidenceInfo.border} p-4 space-y-3">
			<!-- Header -->
			<div class="flex items-center justify-between border-b pb-2">
				<div class="flex items-center gap-2">
					<span class="text-lg">📚</span>
					<span class="font-bold text-gray-700">Enriched Vocabulary</span>
				</div>
				<span class="text-xs font-bold px-2 py-1 rounded {confidenceInfo.bg} {confidenceInfo.color}">
					{(confidence * 100).toFixed(0)}% Match
				</span>
			</div>

			<!-- Content -->
			<div class="space-y-2">
				<div>
					<p class="text-xs text-gray-500 uppercase font-semibold">Source</p>
					<p class="text-sm font-medium text-gray-700">Langenscheidt German-Bulgarian Dictionary</p>
				</div>

				<div>
					<p class="text-xs text-gray-500 uppercase font-semibold">Confidence Level</p>
					<div class="flex items-center gap-2">
						<div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
							<div
								class="h-full transition-all"
								class:bg-green-600={confidence >= 0.85}
								class:bg-yellow-600={confidence >= 0.75 && confidence < 0.85}
								class:bg-orange-600={confidence < 0.75}
								style="width: {confidence * 100}%"
							></div>
						</div>
						<span class="text-sm font-semibold text-gray-700">{(confidence * 100).toFixed(0)}%</span>
					</div>
				</div>

				{#if enrichmentDate}
					<div>
						<p class="text-xs text-gray-500 uppercase font-semibold">Last Updated</p>
						<p class="text-sm text-gray-700">{enrichmentDate}</p>
					</div>
				{/if}
			</div>

			<!-- Action -->
			<a
				href={sourceURL}
				target="_blank"
				rel="noopener noreferrer"
				class="block w-full text-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-colors"
			>
				View Full Definition →
			</a>

			<!-- Footer -->
			<p class="text-xs text-gray-500 text-center border-t pt-2">
				Click the link above to view complete dictionary entry with examples and usage
			</p>
		</div>
	{/if}
{/if}

<style>
	/* Enhance link hover states */
	:global(a[target="_blank"]) {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}

	/* Accessibility: focus visible states */
	:global(a:focus-visible) {
		outline: 2px solid currentColor;
		outline-offset: 2px;
		border-radius: 0.25rem;
	}
</style>
