import * as universal from '../entries/pages/practice/_page.ts.js';

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/practice/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/practice/+page.ts";
export const imports = ["_app/immutable/nodes/5.BJGx9PYg.js","_app/immutable/chunks/CBbuBPfZ.js","_app/immutable/chunks/BUApaBEI.js","_app/immutable/chunks/76fBDrus.js","_app/immutable/chunks/Bmx5pU3t.js","_app/immutable/chunks/CoboNz3U.js","_app/immutable/chunks/BzQl2ZWv.js","_app/immutable/chunks/BOSCOPpl.js"];
export const stylesheets = ["_app/immutable/assets/5.EmQ-C8C5.css"];
export const fonts = [];
