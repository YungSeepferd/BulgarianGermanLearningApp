/**
 * Redirect file for db.js to db.svelte.ts
 *
 * This file exists to maintain backward compatibility with code that imports from db.js
 * while the actual implementation is in db.svelte.ts
 */

// Import the actual implementation from db.svelte.ts
import { vocabularyDb } from './db.svelte.ts';

// Export the vocabulary database
export { vocabularyDb };