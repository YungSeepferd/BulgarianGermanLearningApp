<script lang="ts">
	/**
	 * DefinitionLink Component
	 * Displays clickable links to external dictionary definitions
	 */

	import type { VocabularyItem } from '$lib/types/vocabulary';

	interface Props {
		item: VocabularyItem & { enrichment?: any; definitions?: any[] };
		showIcon?: boolean;
		showLabel?: boolean;
		compact?: boolean;
	}

	let { item, showIcon = true, showLabel = true, compact = false } = $props();

	// Get all definition links from item
	const getDefinitionLinks = () => {
		const links: Array<{ url: string; source: string; confidence: number; language?: string }> = [];

		// Add enrichment link
		if (item.enrichment?.sourceURL) {
			links.push({
				url: item.enrichment.sourceURL,
				source: 'langenscheidt',
				confidence: item.enrichment.confidence || 0,
				language: 'DE-BG',
			});
		}

		// Add definition links
		if (item.definitions && Array.isArray(item.definitions)) {
			item.definitions.forEach((def: any) => {
				if (def.url && !links.some(l => l.url === def.url)) {
					links.push({
						url: def.url,
						source: def.source || 'unknown',
						confidence: def.confidence || 0,
						language: def.language,
					});
				}
			});
		}

		return links;
	};

	// Format source name
	const getSourceLabel = (source: string) => {
		const labels: Record<string, string> = {
			langenscheidt: 'Langenscheidt',
			collins: 'Collins Dictionary',
			cambridge: 'Cambridge Dictionary',
			oxford: 'Oxford Dictionary',
			duden: 'Duden',
			unknown: 'Dictionary Link',
		};
		return labels[source.toLowerCase()] || source;
	};

	// Get icon for source
	const getSourceIcon = (source: string) => {
		const icons: Record<string, string> = {
			langenscheidt: '📚',
			collins: '📖',
			cambridge: '📕',
			oxford: '📗',
			duden: '📘',
			unknown: '🔗',
		};
		return icons[source.toLowerCase()] || '🔗';
	};

	// Get confidence color
	const getConfidenceColor = (score: number) => {
		if (score >= 0.85) return 'text-green-600';
		if (score >= 0.75) return 'text-yellow-600';
		return 'text-orange-600';
	};

	const links = getDefinitionLinks();
</script>

{#if links.length > 0}
	<div class="definition-links space-y-1">
		{#each links as link, index}
			<a
				href={link.url}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-2 px-2 py-1 rounded hover:bg-blue-50 transition-colors group"
				aria-label="Open {getSourceLabel(link.source)} definition"
				title="View definition in {getSourceLabel(link.source)}"
			>
				{#if showIcon}
					<span class="text-lg">{getSourceIcon(link.source)}</span>
				{/if}

				{#if showLabel}
					<span class="text-sm font-medium text-blue-600 group-hover:text-blue-800 group-hover:underline">
						{getSourceLabel(link.source)}
					</span>
				{/if}

				{#if !compact && link.confidence}
					<span class="text-xs font-semibold {getConfidenceColor(link.confidence)}">
						({(link.confidence * 100).toFixed(0)}%)
					</span>
				{/if}

				{#if !compact}
					<span class="text-blue-600 group-hover:text-blue-800">↗</span>
				{/if}
			</a>
		{/each}
	</div>
{/if}

<style>
	.definition-links {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	:global(a) {
		text-decoration: none;
	}

	:global(a:focus-visible) {
		outline: 2px solid currentColor;
		outline-offset: 2px;
	}
</style>
