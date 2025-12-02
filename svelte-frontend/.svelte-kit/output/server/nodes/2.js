

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.BbYhksZn.js","_app/immutable/chunks/76fBDrus.js","_app/immutable/chunks/Bmx5pU3t.js"];
export const stylesheets = [];
export const fonts = [];
