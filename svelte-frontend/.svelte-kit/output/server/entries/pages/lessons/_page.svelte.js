import { U as head, W as ensure_array_like, V as attr } from "../../../chunks/index2.js";
import { a as allPosts, p as practicePosts, v as vocabularyPosts, g as grammarPosts } from "../../../chunks/posts.js";
import { e as escape_html } from "../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const categorizedPosts = {
      grammar: grammarPosts,
      vocabulary: vocabularyPosts,
      practice: practicePosts,
      other: allPosts.filter((post) => !["grammar", "vocabulary", "practice"].includes(post.metadata.type || ""))
    };
    function formatDate(dateString) {
      return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    }
    head("1vg779e", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Lessons - Bulgarian German Learning App</title>`);
      });
      $$renderer3.push(`<meta name="description" content="Comprehensive collection of grammar, vocabulary, and practice lessons for Bulgarian-German language learning"/>`);
    });
    $$renderer2.push(`<div class="lessons-page svelte-1vg779e"><header class="page-header svelte-1vg779e"><h1 class="svelte-1vg779e">Language Learning Lessons</h1> <p class="svelte-1vg779e">Explore our comprehensive collection of grammar, vocabulary, and practice materials</p></header> <!--[-->`);
    const each_array = ensure_array_like(Object.entries(categorizedPosts));
    for (let $$index_2 = 0, $$length = each_array.length; $$index_2 < $$length; $$index_2++) {
      let [category, posts] = each_array[$$index_2];
      if (posts.length > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<section class="category-section svelte-1vg779e"><h2 class="svelte-1vg779e">${escape_html(category.charAt(0).toUpperCase() + category.slice(1))} Lessons (${escape_html(posts.length)})</h2> <div class="posts-grid svelte-1vg779e"><!--[-->`);
        const each_array_1 = ensure_array_like(posts);
        for (let $$index_1 = 0, $$length2 = each_array_1.length; $$index_1 < $$length2; $$index_1++) {
          let post = each_array_1[$$index_1];
          $$renderer2.push(`<article class="post-card svelte-1vg779e"><a${attr("href", `/lessons/${post.slug}`)} class="post-link svelte-1vg779e"><div class="post-header svelte-1vg779e"><h3 class="svelte-1vg779e">${escape_html(post.title)}</h3> `);
          if (post.metadata.level) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<span class="level-badge svelte-1vg779e">${escape_html(post.metadata.level)}</span>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--></div> `);
          if (post.metadata.description) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<p class="description svelte-1vg779e">${escape_html(post.metadata.description)}</p>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--> <div class="post-meta svelte-1vg779e"><time${attr("datetime", post.date)} class="svelte-1vg779e">${escape_html(formatDate(post.date))}</time> `);
          if (post.metadata.tags && post.metadata.tags.length > 0) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div class="tags svelte-1vg779e"><!--[-->`);
            const each_array_2 = ensure_array_like(post.metadata.tags.slice(0, 3));
            for (let $$index = 0, $$length3 = each_array_2.length; $$index < $$length3; $$index++) {
              let tag = each_array_2[$$index];
              $$renderer2.push(`<span class="tag svelte-1vg779e">${escape_html(tag)}</span>`);
            }
            $$renderer2.push(`<!--]--></div>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--></div></a></article>`);
        }
        $$renderer2.push(`<!--]--></div></section>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--> `);
    if (allPosts.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="empty-state svelte-1vg779e"><h3 class="svelte-1vg779e">No lessons available yet</h3> <p>Check back soon for new learning materials!</p></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
