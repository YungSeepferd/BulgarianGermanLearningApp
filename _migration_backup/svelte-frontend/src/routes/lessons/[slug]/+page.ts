import { error } from '@sveltejs/kit';
import { getPostBySlug, allPosts, type Post } from '$lib/utils/posts';

export function load({ params }): { post: Post; allPosts: Post[] } {
	const post = getPostBySlug(params.slug);
	
	if (!post) {
		throw error(404, {
			message: 'Lesson not found'
		});
	}

	return {
		post,
		allPosts
	};
}