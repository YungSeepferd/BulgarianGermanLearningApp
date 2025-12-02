import { allPosts, type Post } from '$lib/utils/posts';

export function load(): { allPosts: Post[] } {
	return {
		allPosts
	};
}