/**
 * Vite plugin for handling translation file imports
 *
 * This plugin allows importing JSON translation files from the virtual
 * /translations/ path and maps them to the actual file system location.
 */

import type { Plugin } from 'vite';
import path from 'path';

export function translationPlugin(): Plugin {
    return {
        name: 'translation-plugin',

        resolveId(source) {
            // Handle virtual translation imports
            if (source.startsWith('/translations/')) {
                return source;
            }
            return null;
        },

        load(id) {
            // Handle virtual translation file loading
            if (id.startsWith('/translations/')) {
                const lang = id.replace('/translations/', '').replace('.json', '');
                const filePath = path.resolve(__dirname, `../../data/translations/${lang}.json`);

                // Return a dynamic import that will be handled by Vite
                return `export default import('${filePath}?raw').then(m => JSON.parse(m.default));`;
            }
            return null;
        }
    };
}