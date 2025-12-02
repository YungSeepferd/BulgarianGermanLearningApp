export interface Post {
	slug: string;
	title: string;
	date: string;
	content: string;
	metadata: {
		description?: string;
		level?: string;
		type?: string;
		weight?: number;
		category?: string;
		tags?: string[];
		notes_bg_to_de?: string;
		notes_de_to_bg?: string;
		themes?: string[];
		word_count?: number;
		[key: string]: any;
	};
}

// Import all markdown files using import.meta.glob
const markdownModules = import.meta.glob('/src/lib/content/**/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
});

export function loadPosts(): Post[] {
	const posts: Post[] = [];

	for (const [path, content] of Object.entries(markdownModules)) {
		// Extract slug from file path
		const slug = path
			.replace('/src/lib/content/', '')
			.replace('.md', '')
			.replace(/\/index$/, ''); // Remove index from directory index files

		// Parse frontmatter manually
		const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
		let metadata: Record<string, any> = {};
		let markdownContent = content;

		if (frontmatterMatch) {
			const frontmatter = frontmatterMatch[1];
			markdownContent = content.slice(frontmatterMatch[0].length);
			
			// Simple YAML parsing for basic key-value pairs
			frontmatter.split('\n').forEach(line => {
				const match = line.match(/^(\w+):\s*(.*)$/);
				if (match) {
					const key = match[1];
					let value = match[2].trim();
					
					// Handle quoted strings
					if (value.startsWith('"') && value.endsWith('"')) {
						value = value.slice(1, -1);
					} else if (value.startsWith("'") && value.endsWith("'")) {
						value = value.slice(1, -1);
					}
					
					// Handle arrays
					if (value.startsWith('[') && value.endsWith(']')) {
						value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
					}
					
					// Handle numbers
					if (/^-?\d+(\.\d+)?$/.test(value)) {
						value = parseFloat(value);
					}
					
					metadata[key] = value;
				}
			});
		}

		// Ensure required fields exist with fallbacks
		if (!metadata.title) {
			// Use filename as fallback title
			const filename = path.split('/').pop()?.replace('.md', '') || slug;
			metadata.title = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
		}

		if (!metadata.date) {
			// Use current date as fallback
			metadata.date = new Date().toISOString().split('T')[0];
		}

		posts.push({
			slug,
			title: metadata.title,
			date: metadata.date,
			content: markdownContent,
			metadata
		});
	}

	// Sort posts by weight (if available) or date
	return posts.sort((a, b) => {
		// First try to sort by weight (lower weight = higher priority)
		if (a.metadata.weight !== undefined && b.metadata.weight !== undefined) {
			return a.metadata.weight - b.metadata.weight;
		}
		
		// Fall back to date sorting (newest first)
		return new Date(b.date).getTime() - new Date(a.date).getTime();
	});
}

// Helper function to get posts by type/category
export function getPostsByType(type: string): Post[] {
	return loadPosts().filter(post => post.metadata.type === type);
}

export function getPostsByCategory(category: string): Post[] {
	return loadPosts().filter(post => post.metadata.category === category);
}

// Helper function to get a single post by slug
export function getPostBySlug(slug: string): Post | undefined {
	return loadPosts().find(post => post.slug === slug);
}

// Export all posts for easy access
export const allPosts = loadPosts();
export const grammarPosts = getPostsByType('grammar');
export const vocabularyPosts = getPostsByType('vocabulary');
export const practicePosts = getPostsByType('practice');