import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

const config = {
  preprocess: [
    vitePreprocess(),
    mdsvex({
      extensions: ['.md'],
      layout: false,
      highlight: {
        highlighter: (code, lang) => {
          return `<pre><code class="language-${lang}">${code}</code></pre>`;
        }
      }
    })
  ],
  extensions: ['.svelte', '.md'],
  compilerOptions: {
    runes: true
  },
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html',
      precompress: false,
      strict: false
    }),
    paths: {
      base: process.env.NODE_ENV === 'production' ? '/BulgarianGermanLearningApp' : ''
    }
  }
};

export default config;
