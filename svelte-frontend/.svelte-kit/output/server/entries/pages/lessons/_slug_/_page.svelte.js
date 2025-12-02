import { U as head, V as attr, W as ensure_array_like, X as unsubscribe_stores, Y as store_get } from "../../../../chunks/index2.js";
import { e as escape_html, g as getContext } from "../../../../chunks/context.js";
import "clsx";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
import { marked } from "marked";
function html(value) {
  var html2 = String(value ?? "");
  var open = "<!---->";
  return open + html2 + "<!---->";
}
function MarkdownLayout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      title = "",
      date = "",
      author = "",
      description = "",
      tags = [],
      category = "",
      level = "",
      draft = false,
      metadata = {},
      content
    } = $$props;
    let pageTitle = metadata?.title || title;
    let pageDate = metadata?.date || date;
    let pageAuthor = metadata?.author || author;
    let pageDescription = metadata?.description || description;
    let pageTags = metadata?.tags || tags;
    let pageCategory = metadata?.category || category;
    let pageLevel = metadata?.level || level;
    let pageDraft = metadata?.draft || draft;
    head("jvrgll", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(pageTitle)} - Bulgarian German Learning App</title>`);
      });
      $$renderer3.push(`<meta name="description"${attr("content", pageDescription)}/> `);
      if (pageTags.length > 0) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<meta name="keywords"${attr("content", pageTags.join(", "))}/>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> `);
      if (pageAuthor) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<meta name="author"${attr("content", pageAuthor)}/>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> `);
      if (pageDate) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<meta name="date"${attr("content", pageDate)}/>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]-->`);
    });
    $$renderer2.push(`<article class="markdown-content svelte-jvrgll">`);
    if (pageDraft) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="draft-notice svelte-jvrgll"><strong>Draft:</strong> This content is not yet published.</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <header class="markdown-header svelte-jvrgll"><h1 class="svelte-jvrgll">${escape_html(pageTitle)}</h1> `);
    if (pageDescription) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="description svelte-jvrgll">${escape_html(pageDescription)}</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="metadata svelte-jvrgll">`);
    if (pageDate) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<time${attr("datetime", pageDate)} class="svelte-jvrgll">${escape_html(new Date(pageDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }))}</time>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (pageAuthor) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span class="author svelte-jvrgll">by ${escape_html(pageAuthor)}</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (pageCategory) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span class="category svelte-jvrgll">${escape_html(pageCategory)}</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (pageLevel) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span class="level svelte-jvrgll">${escape_html(pageLevel)}</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    if (pageTags.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="tags svelte-jvrgll"><!--[-->`);
      const each_array = ensure_array_like(pageTags);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let tag = each_array[$$index];
        $$renderer2.push(`<span class="tag svelte-jvrgll">${escape_html(tag)}</span>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></header> <main class="markdown-body svelte-jvrgll">`);
    if (content) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`${html(content())}`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></main></article>`);
  });
}
const getStores = () => {
  const stores$1 = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores$1.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores$1.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores$1.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { data } = $$props;
    const { post } = data;
    marked.parse(post.content);
    function getPreviousPost() {
      const allPosts = store_get($$store_subs ??= {}, "$page", page).data.allPosts || [];
      const currentIndex = allPosts.findIndex((p) => p.slug === post.slug);
      return currentIndex > 0 ? allPosts[currentIndex - 1] : null;
    }
    function getNextPost() {
      const allPosts = store_get($$store_subs ??= {}, "$page", page).data.allPosts || [];
      const currentIndex = allPosts.findIndex((p) => p.slug === post.slug);
      return currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
    }
    head("1k66zg4", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(post.title)} - Bulgarian German Learning App</title>`);
      });
      $$renderer3.push(`<meta name="description"${attr("content", post.metadata.description || post.title)}/> `);
      if (post.metadata.tags && post.metadata.tags.length > 0) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<meta name="keywords"${attr("content", post.metadata.tags.join(", "))}/>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]-->`);
    });
    $$renderer2.push(`<div class="lesson-page svelte-1k66zg4">`);
    MarkdownLayout($$renderer2, {
      title: post.title,
      date: post.date,
      description: post.metadata.description,
      tags: post.metadata.tags,
      category: post.metadata.category,
      level: post.metadata.level,
      metadata: post.metadata
    });
    $$renderer2.push(`<!----> <nav class="lesson-navigation svelte-1k66zg4">`);
    if (getPreviousPost()) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<a${attr("href", `/lessons/${getPreviousPost().slug}`)} class="nav-button prev svelte-1k66zg4"><span class="nav-label svelte-1k66zg4">Previous</span> <span class="nav-title svelte-1k66zg4">${escape_html(getPreviousPost().title)}</span></a>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="nav-button disabled svelte-1k66zg4"></div>`);
    }
    $$renderer2.push(`<!--]--> <a href="/lessons" class="nav-button back svelte-1k66zg4"><span class="nav-label svelte-1k66zg4">All Lessons</span></a> `);
    if (getNextPost()) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<a${attr("href", `/lessons/${getNextPost().slug}`)} class="nav-button next svelte-1k66zg4"><span class="nav-label svelte-1k66zg4">Next</span> <span class="nav-title svelte-1k66zg4">${escape_html(getNextPost().title)}</span></a>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="nav-button disabled svelte-1k66zg4"></div>`);
    }
    $$renderer2.push(`<!--]--></nav></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
