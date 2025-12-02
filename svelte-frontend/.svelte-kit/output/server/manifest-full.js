export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "BulgarianGermanLearningApp/_app",
	assets: new Set(["robots.txt"]),
	mimeTypes: {".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.lHX8e0Wc.js",app:"_app/immutable/entry/app.CbLUciDS.js",imports:["_app/immutable/entry/start.lHX8e0Wc.js","_app/immutable/chunks/DdO5P3Vs.js","_app/immutable/chunks/Bmx5pU3t.js","_app/immutable/chunks/CBZPD5OT.js","_app/immutable/chunks/BUApaBEI.js","_app/immutable/entry/app.CbLUciDS.js","_app/immutable/chunks/Bmx5pU3t.js","_app/immutable/chunks/CoboNz3U.js","_app/immutable/chunks/76fBDrus.js","_app/immutable/chunks/CBZPD5OT.js","_app/immutable/chunks/BzQl2ZWv.js","_app/immutable/chunks/BxoTbtd5.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/vocabulary",
				pattern: /^\/api\/vocabulary\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/vocabulary/_server.ts.js'))
			},
			{
				id: "/api/vocabulary/chunk/[chunkName]",
				pattern: /^\/api\/vocabulary\/chunk\/([^/]+?)\/?$/,
				params: [{"name":"chunkName","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/vocabulary/chunk/_chunkName_/_server.ts.js'))
			},
			{
				id: "/api/vocabulary/due",
				pattern: /^\/api\/vocabulary\/due\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/vocabulary/due/_server.ts.js'))
			},
			{
				id: "/api/vocabulary/filtered",
				pattern: /^\/api\/vocabulary\/filtered\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/vocabulary/filtered/_server.ts.js'))
			},
			{
				id: "/api/vocabulary/metadata",
				pattern: /^\/api\/vocabulary\/metadata\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/vocabulary/metadata/_server.ts.js'))
			},
			{
				id: "/api/vocabulary/search",
				pattern: /^\/api\/vocabulary\/search\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/vocabulary/search/_server.ts.js'))
			},
			{
				id: "/lessons",
				pattern: /^\/lessons\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/lessons/[slug]",
				pattern: /^\/lessons\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/practice",
				pattern: /^\/practice\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
