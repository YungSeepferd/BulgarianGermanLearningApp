
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/api" | "/api/vocabulary" | "/api/vocabulary/chunk" | "/api/vocabulary/chunk/[chunkName]" | "/api/vocabulary/due" | "/api/vocabulary/filtered" | "/api/vocabulary/metadata" | "/api/vocabulary/search" | "/lessons" | "/lessons/[slug]" | "/practice";
		RouteParams(): {
			"/api/vocabulary/chunk/[chunkName]": { chunkName: string };
			"/lessons/[slug]": { slug: string }
		};
		LayoutParams(): {
			"/": { chunkName?: string; slug?: string };
			"/api": { chunkName?: string };
			"/api/vocabulary": { chunkName?: string };
			"/api/vocabulary/chunk": { chunkName?: string };
			"/api/vocabulary/chunk/[chunkName]": { chunkName: string };
			"/api/vocabulary/due": Record<string, never>;
			"/api/vocabulary/filtered": Record<string, never>;
			"/api/vocabulary/metadata": Record<string, never>;
			"/api/vocabulary/search": Record<string, never>;
			"/lessons": { slug?: string };
			"/lessons/[slug]": { slug: string };
			"/practice": Record<string, never>
		};
		Pathname(): "/" | "/api" | "/api/" | "/api/vocabulary" | "/api/vocabulary/" | "/api/vocabulary/chunk" | "/api/vocabulary/chunk/" | `/api/vocabulary/chunk/${string}` & {} | `/api/vocabulary/chunk/${string}/` & {} | "/api/vocabulary/due" | "/api/vocabulary/due/" | "/api/vocabulary/filtered" | "/api/vocabulary/filtered/" | "/api/vocabulary/metadata" | "/api/vocabulary/metadata/" | "/api/vocabulary/search" | "/api/vocabulary/search/" | "/lessons" | "/lessons/" | `/lessons/${string}` & {} | `/lessons/${string}/` & {} | "/practice" | "/practice/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/robots.txt" | string & {};
	}
}