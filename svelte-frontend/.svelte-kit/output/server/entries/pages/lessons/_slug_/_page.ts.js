import { error } from "@sveltejs/kit";
import { b as getPostBySlug, a as allPosts } from "../../../../chunks/posts.js";
function load({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) {
    throw error(404, {
      message: "Lesson not found"
    });
  }
  return {
    post,
    allPosts
  };
}
export {
  load
};
