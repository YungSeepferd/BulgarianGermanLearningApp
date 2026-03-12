import type { SvelteKitPWAOptions } from '@vite-pwa/sveltekit';

// Base path for GitHub Pages deployment
const isProduction = process.env['NODE_ENV'] === 'production';
const basePath = isProduction ? '/BulgarianGermanLearningApp/' : '/';

export const pwaOptions: Partial<SvelteKitPWAOptions> = {
	registerType: 'autoUpdate',
	includeAssets: ['favicon.ico', 'logo/logo-icon.svg', 'logo/logo-full.svg'],
	manifest: {
		name: 'Bulgarian-German Learning App',
		short_name: 'BG-DE Learn',
		description: 'Bilingual vocabulary learning application for Bulgarian and German',
		theme_color: '#3b82f6',
		background_color: '#ffffff',
		display: 'standalone',
		orientation: 'portrait',
		scope: basePath,
		start_url: basePath,
		icons: [
			{
				src: `${basePath}logo/logo-icon.svg`,
				sizes: '192x192',
				type: 'image/svg+xml'
			},
			{
				src: `${basePath}logo/logo-icon.svg`,
				sizes: '512x512',
				type: 'image/svg+xml'
			},
			{
				src: `${basePath}logo/logo-icon.svg`,
				sizes: '512x512',
				type: 'image/svg+xml',
				purpose: 'maskable'
			}
		]
	},
	workbox: {
		// Cache vocabulary data with CacheFirst strategy
		runtimeCaching: [
			{
				urlPattern: /\/data\/vocabulary\/.*\.json$/,
				handler: 'CacheFirst' as const,
				options: {
					cacheName: 'vocabulary-cache',
					expiration: {
						maxEntries: 50,
						maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
					},
					cacheableResponse: {
						statuses: [0, 200]
					}
				}
			},
			{
				urlPattern: /\/data\/.*\.json$/,
				handler: 'StaleWhileRevalidate' as const,
				options: {
					cacheName: 'data-cache',
					expiration: {
						maxEntries: 30,
						maxAgeSeconds: 60 * 60 * 24 // 24 hours
					},
					cacheableResponse: {
						statuses: [0, 200]
					}
				}
			},
			{
				urlPattern: /\.(?:js|css|html|svg|woff2?)$/,
				handler: 'StaleWhileRevalidate' as const,
				options: {
					cacheName: 'static-assets',
					expiration: {
						maxEntries: 100,
						maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
					}
				}
			},
			{
				urlPattern: /\.(?:png|jpg|jpeg|gif|webp|ico)$/,
				handler: 'CacheFirst' as const,
				options: {
					cacheName: 'image-cache',
					expiration: {
						maxEntries: 50,
						maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
					}
				}
			}
		],
		// Fallback to offline page for navigation requests
		navigateFallback: `${basePath}offline`,
		navigateFallbackDenylist: [/\/api\//]
	}
};