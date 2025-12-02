import * as universal from '../entries/pages/_layout.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.CF8MFL39.js","_app/immutable/chunks/76fBDrus.js","_app/immutable/chunks/Bmx5pU3t.js","_app/immutable/chunks/BzQl2ZWv.js","_app/immutable/chunks/BOSCOPpl.js","_app/immutable/chunks/3WwL-0a8.js"];
export const stylesheets = [];
export const fonts = [];
