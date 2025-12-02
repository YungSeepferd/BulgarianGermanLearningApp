<script lang="ts">
	import type { PageData } from './$types';
	import MarkdownLayout from '$lib/components/MarkdownLayout.svelte';
	import { page } from '$app/stores';
	import { marked } from 'marked';

	let { data } = $props<{ data: PageData }>();
	
	// Extract metadata for the layout
	const { post } = data;
	
	// Convert markdown to HTML
	const htmlContent = marked.parse(post.content);
	
	// Navigation helpers
	function getPreviousPost() {
		const allPosts = $page.data.allPosts || [];
		const currentIndex = allPosts.findIndex(p => p.slug === post.slug);
		return currentIndex > 0 ? allPosts[currentIndex - 1] : null;
	}
	
	function getNextPost() {
		const allPosts = $page.data.allPosts || [];
		const currentIndex = allPosts.findIndex(p => p.slug === post.slug);
		return currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
	}
</script>

<svelte:head>
	<title>{post.title} - Bulgarian German Learning App</title>
	<meta name="description" content={post.metadata.description || post.title} />
	{#if post.metadata.tags && post.metadata.tags.length > 0}
		<meta name="keywords" content={post.metadata.tags.join(', ')} />
	{/if}
</svelte:head>

<div class="lesson-page">
	<MarkdownLayout
		title={post.title}
		date={post.date}
		description={post.metadata.description}
		tags={post.metadata.tags}
		category={post.metadata.category}
		level={post.metadata.level}
		metadata={post.metadata}
	>
		{@html htmlContent}
	</MarkdownLayout>
	
	<nav class="lesson-navigation">
		{#if getPreviousPost()}
			<a href={`/lessons/${getPreviousPost().slug}`} class="nav-button prev">
				<span class="nav-label">Previous</span>
				<span class="nav-title">{getPreviousPost().title}</span>
			</a>
		{:else}
			<div class="nav-button disabled"></div>
		{/if}
		
		<a href="/lessons" class="nav-button back">
			<span class="nav-label">All Lessons</span>
		</a>
		
		{#if getNextPost()}
			<a href={`/lessons/${getNextPost().slug}`} class="nav-button next">
				<span class="nav-label">Next</span>
				<span class="nav-title">{getNextPost().title}</span>
			</a>
		{:else}
			<div class="nav-button disabled"></div>
		{/if}
	</nav>
</div>

<style>
	.lesson-page {
		min-height: 100vh;
		background-color: #f6f8fa;
	}
	
	.lesson-navigation {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 800px;
		margin: 2rem auto;
		padding: 0 2rem;
		gap: 1rem;
	}
	
	.nav-button {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem;
		background: white;
		border: 1px solid #e1e4e8;
		border-radius: 0.5rem;
		text-decoration: none;
		color: #0366d6;
		transition: all 0.2s ease;
		min-width: 120px;
		text-align: center;
	}
	
	.nav-button:hover {
		background-color: #0366d6;
		color: white;
		border-color: #0366d6;
		transform: translateY(-1px);
	}
	
	.nav-button.prev {
		align-items: flex-start;
	}
	
	.nav-button.next {
		align-items: flex-end;
	}
	
	.nav-button.back {
		align-items: center;
	}
	
	.nav-button.disabled {
		visibility: hidden;
	}
	
	.nav-label {
		font-size: 0.85rem;
		font-weight: 500;
		margin-bottom: 0.25rem;
	}
	
	.nav-title {
		font-size: 0.9rem;
		font-weight: 400;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		max-width: 200px;
	}
	
	@media (max-width: 768px) {
		.lesson-navigation {
			flex-direction: column;
			gap: 0.5rem;
		}
		
		.nav-button {
			width: 100%;
			min-width: auto;
		}
		
		.nav-button.prev,
		.nav-button.next {
			align-items: center;
		}
		
		.nav-title {
			max-width: none;
		}
	}
</style>