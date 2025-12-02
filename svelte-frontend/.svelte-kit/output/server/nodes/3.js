import * as universal from '../entries/pages/lessons/_page.ts.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/lessons/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/lessons/+page.ts";
export const imports = ["_app/immutable/nodes/3.CqvLN2hS.js","_app/immutable/chunks/BX_Yd9Sp.js","_app/immutable/chunks/Bmx5pU3t.js","_app/immutable/chunks/76fBDrus.js","_app/immutable/chunks/CoboNz3U.js","_app/immutable/chunks/BzQl2ZWv.js","_app/immutable/chunks/BOSCOPpl.js","_app/immutable/chunks/3WwL-0a8.js"];
export const stylesheets = ["_app/immutable/assets/3.XaBW5d0d.css"];
export const fonts = [];
