<script lang="ts">
	import { allPosts, grammarPosts, vocabularyPosts, practicePosts, type Post } from '$lib/utils/posts';

	let { data } = $props<{ data: { allPosts: Post[] } }>();

	// Group posts by category for better organization
	const categorizedPosts = {
		grammar: grammarPosts,
		vocabulary: vocabularyPosts,
		practice: practicePosts,
		other: allPosts.filter(post => !['grammar', 'vocabulary', 'practice'].includes(post.metadata.type || ''))
	};

	// Function to format date
	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Lessons - Bulgarian German Learning App</title>
	<meta name="description" content="Comprehensive collection of grammar, vocabulary, and practice lessons for Bulgarian-German language learning" />
</svelte:head>

<div class="lessons-page">
	<header class="page-header">
		<h1>Language Learning Lessons</h1>
		<p>Explore our comprehensive collection of grammar, vocabulary, and practice materials</p>
	</header>

	{#each Object.entries(categorizedPosts) as [category, posts]}
		{#if posts.length > 0}
			<section class="category-section">
				<h2>{category.charAt(0).toUpperCase() + category.slice(1)} Lessons ({posts.length})</h2>
				
				<div class="posts-grid">
					{#each posts as post}
						<article class="post-card">
							<a href={`/lessons/${post.slug}`} class="post-link">
								<div class="post-header">
									<h3>{post.title}</h3>
									{#if post.metadata.level}
										<span class="level-badge">{post.metadata.level}</span>
									{/if}
								</div>
								
								{#if post.metadata.description}
									<p class="description">{post.metadata.description}</p>
								{/if}
								
								<div class="post-meta">
									<time datetime={post.date}>{formatDate(post.date)}</time>
									
									{#if post.metadata.tags && post.metadata.tags.length > 0}
										<div class="tags">
											{#each post.metadata.tags.slice(0, 3) as tag}
												<span class="tag">{tag}</span>
											{/each}
										</div>
									{/if}
								</div>
							</a>
						</article>
					{/each}
				</div>
			</section>
		{/if}
	{/each}

	{#if allPosts.length === 0}
		<div class="empty-state">
			<h3>No lessons available yet</h3>
			<p>Check back soon for new learning materials!</p>
		</div>
	{/if}
</div>

<style>
	.lessons-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.page-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.page-header h1 {
		font-size: 2.5rem;
		font-weight: 600;
		color: #24292e;
		margin-bottom: 0.5rem;
	}

	.page-header p {
		font-size: 1.25rem;
		color: #586069;
	}

	.category-section {
		margin-bottom: 3rem;
	}

	.category-section h2 {
		font-size: 1.75rem;
		font-weight: 600;
		color: #24292e;
		margin-bottom: 1.5rem;
		border-bottom: 2px solid #e1e4e8;
		padding-bottom: 0.5rem;
	}

	.posts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 1.5rem;
	}

	.post-card {
		background: white;
		border: 1px solid #e1e4e8;
		border-radius: 0.5rem;
		padding: 1.5rem;
		transition: all 0.2s ease;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.post-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		border-color: #0366d6;
	}

	.post-link {
		text-decoration: none;
		color: inherit;
		display: block;
		height: 100%;
	}

	.post-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
		gap: 1rem;
	}

	.post-header h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: #0366d6;
		margin: 0;
		flex: 1;
	}

	.level-badge {
		background-color: #0366d6;
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 1rem;
		font-size: 0.8rem;
		font-weight: 500;
		white-space: nowrap;
	}

	.description {
		color: #586069;
		font-size: 0.95rem;
		line-height: 1.4;
		margin-bottom: 1rem;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.post-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.85rem;
		color: #6a737d;
	}

	.post-meta time {
		font-weight: 500;
	}

	.tags {
		display: flex;
		gap: 0.25rem;
		flex-wrap: wrap;
	}

	.tag {
		background-color: #f6f8fa;
		color: #24292e;
		padding: 0.2rem 0.4rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
	}

	.empty-state {
		text-align: center;
		padding: 3rem;
		color: #6a737d;
	}

	.empty-state h3 {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}

	@media (max-width: 768px) {
		.lessons-page {
			padding: 1rem;
		}

		.posts-grid {
			grid-template-columns: 1fr;
		}

		.page-header h1 {
			font-size: 2rem;
		}

		.page-header p {
			font-size: 1.1rem;
		}
	}
</style>