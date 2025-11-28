<script lang="ts">
	import type { Snippet } from 'svelte';
	
	// Props using Svelte 5 $props
	let {
		title = '',
		date = '',
		author = '',
		description = '',
		tags = [],
		category = '',
		level = '',
		draft = false,
		metadata = {},
		content
	} = $props<{
		title?: string;
		date?: string;
		author?: string;
		description?: string;
		tags?: string[];
		category?: string;
		level?: string;
		draft?: boolean;
		metadata?: any;
		content?: Snippet;
	}>();
	
	// Derived values using $derived
	let pageTitle = $derived(metadata?.title || title);
	let pageDate = $derived(metadata?.date || date);
	let pageAuthor = $derived(metadata?.author || author);
	let pageDescription = $derived(metadata?.description || description);
	let pageTags = $derived(metadata?.tags || tags);
	let pageCategory = $derived(metadata?.category || category);
	let pageLevel = $derived(metadata?.level || level);
	let pageDraft = $derived(metadata?.draft || draft);
</script>

<svelte:head>
	<title>{pageTitle} - Bulgarian German Learning App</title>
	<meta name="description" content={pageDescription} />
	{#if pageTags.length > 0}
		<meta name="keywords" content={pageTags.join(', ')} />
	{/if}
	{#if pageAuthor}
		<meta name="author" content={pageAuthor} />
	{/if}
	{#if pageDate}
		<meta name="date" content={pageDate} />
	{/if}
</svelte:head>

<article class="markdown-content">
	{#if pageDraft}
		<div class="draft-notice">
			<strong>Draft:</strong> This content is not yet published.
		</div>
	{/if}
	
	<header class="markdown-header">
		<h1>{pageTitle}</h1>
		
		{#if pageDescription}
			<p class="description">{pageDescription}</p>
		{/if}
		
		<div class="metadata">
			{#if pageDate}
				<time datetime={pageDate}>
					{new Date(pageDate).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</time>
			{/if}
			
			{#if pageAuthor}
				<span class="author">by {pageAuthor}</span>
			{/if}
			
			{#if pageCategory}
				<span class="category">{pageCategory}</span>
			{/if}
			
			{#if pageLevel}
				<span class="level">{pageLevel}</span>
			{/if}
		</div>
		
		{#if pageTags.length > 0}
			<div class="tags">
				{#each pageTags as tag}
					<span class="tag">{tag}</span>
				{/each}
			</div>
		{/if}
	</header>
	
	<main class="markdown-body">
		{#if content}
			{@html content()}
		{/if}
	</main>
</article>

<style>
	.markdown-content {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		line-height: 1.6;
	}
	
	.draft-notice {
		background-color: #fff3cd;
		border: 1px solid #ffeaa7;
		color: #856404;
		padding: 0.75rem 1rem;
		border-radius: 0.25rem;
		margin-bottom: 1rem;
	}
	
	.markdown-header {
		margin-bottom: 2rem;
		border-bottom: 1px solid #e1e4e8;
		padding-bottom: 1rem;
	}
	
	.markdown-header h1 {
		margin: 0 0 0.5rem 0;
		font-size: 2.5rem;
		font-weight: 600;
		color: #24292e;
	}
	
	.description {
		font-size: 1.25rem;
		color: #586069;
		margin: 0 0 1rem 0;
	}
	
	.metadata {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		font-size: 0.9rem;
		color: #586069;
		margin-bottom: 1rem;
	}
	
	.metadata time,
	.metadata .author,
	.metadata .category,
	.metadata .level {
		background-color: #f6f8fa;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
	}
	
	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	
	.tag {
		background-color: #e1e4e8;
		color: #24292e;
		padding: 0.25rem 0.5rem;
		border-radius: 1rem;
		font-size: 0.8rem;
		text-decoration: none;
		transition: background-color 0.2s;
	}
	
	.tag:hover {
		background-color: #d1d5da;
	}
	
	.markdown-body {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
	}
	
	/* Basic markdown styling */
	.markdown-body h1,
	.markdown-body h2,
	.markdown-body h3,
	.markdown-body h4,
	.markdown-body h5,
	.markdown-body h6 {
		margin-top: 1.5rem;
		margin-bottom: 0.5rem;
		font-weight: 600;
		line-height: 1.25;
	}
	
	.markdown-body h1 { font-size: 2rem; }
	.markdown-body h2 { font-size: 1.5rem; }
	.markdown-body h3 { font-size: 1.25rem; }
	
	.markdown-body p {
		margin-bottom: 1rem;
	}
	
	.markdown-body ul,
	.markdown-body ol {
		margin-bottom: 1rem;
		padding-left: 2rem;
	}
	
	.markdown-body li {
		margin-bottom: 0.25rem;
	}
	
	.markdown-body blockquote {
		margin: 1rem 0;
		padding: 0 1rem;
		color: #6a737d;
		border-left: 0.25rem solid #dfe2e5;
	}
	
	.markdown-body code {
		background-color: rgba(175, 184, 193, 0.2);
		padding: 0.2rem 0.4rem;
		border-radius: 0.3rem;
		font-size: 0.85rem;
	}
	
	.markdown-body pre {
		background-color: #f6f8fa;
		border-radius: 0.3rem;
		padding: 1rem;
		overflow-x: auto;
		margin-bottom: 1rem;
	}
	
	.markdown-body pre code {
		background-color: transparent;
		padding: 0;
	}
	
	.markdown-body table {
		border-collapse: collapse;
		width: 100%;
		margin-bottom: 1rem;
	}
	
	.markdown-body th,
	.markdown-body td {
		padding: 0.5rem;
		border: 1px solid #dfe2e5;
		text-align: left;
	}
	
	.markdown-body th {
		background-color: #f6f8fa;
		font-weight: 600;
	}
</style>