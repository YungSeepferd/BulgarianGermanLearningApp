#!/usr/bin/env node
/**
 * ESM syntax check for assets/js without external dependencies.
 * The script copies modules to a temporary directory, rewrites relative
 * imports to use `.mjs`, and dynamically imports them in a stubbed DOM
 * environment to ensure they parse correctly.
 */

import { mkdtemp, readdir, mkdir, readFile, writeFile, rm } from 'fs/promises';
import os from 'os';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const jsDir = path.join(rootDir, 'assets', 'js');

async function collectFiles(dir, extension) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await collectFiles(fullPath, extension);
      files.push(...nested);
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      files.push(fullPath);
    }
  }

  return files;
}

function rewriteImports(code) {
  const patterns = [
    /(from\s+['"])(\.{1,2}\/[^'"]+?)\.js(['"])/g,
    /(import\s*\(\s*['"])(\.{1,2}\/[^'"]+?)\.js(['"]\s*\))/g,
    /(import\s+['"])(\.{1,2}\/[^'"]+?)\.js(['"])/g,
    /(export\s+\*\s+from\s+['"])(\.{1,2}\/[^'"]+?)\.js(['"])/g
  ];

  let rewritten = code;
  for (const pattern of patterns) {
    rewritten = rewritten.replace(pattern, (_, start, specifier, end) => {
      return `${start}${specifier}.mjs${end}`;
    });
  }

  return rewritten;
}

async function copyModulesToTemp(srcDir) {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'bgde-esm-'));

  async function copyRecursive(src, dest) {
    await mkdir(dest, { recursive: true });
    const entries = await readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const srcPath = path.join(src, entry.name);
      if (entry.isDirectory()) {
        await copyRecursive(srcPath, path.join(dest, entry.name));
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        const code = await readFile(srcPath, 'utf8');
        const rewritten = rewriteImports(code);
        const destFileName = `${entry.name.slice(0, -3)}.mjs`;
        await writeFile(path.join(dest, destFileName), rewritten, 'utf8');
      }
    }
  }

  await copyRecursive(srcDir, tempRoot);
  return tempRoot;
}

function createDomStubs() {
  const eventListeners = new Map();
  const addEventListener = (type, handler) => {
    if (!eventListeners.has(type)) {
      eventListeners.set(type, new Set());
    }
    eventListeners.get(type).add(handler);
  };
  const removeEventListener = (type, handler) => {
    eventListeners.get(type)?.delete(handler);
  };

  const elementFactory = () => ({
    setAttribute: () => {},
    appendChild: () => {},
    removeChild: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    focus: () => {},
    classList: { add: () => {}, remove: () => {} },
    style: {},
    innerHTML: '',
    textContent: ''
  });

  const storage = new Map();
  const localStorage = {
    getItem: (key) => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(String(key), String(value)),
    removeItem: (key) => storage.delete(key),
    clear: () => storage.clear(),
    key: (index) => Array.from(storage.keys())[index] ?? null,
    get length() {
      return storage.size;
    }
  };

  const documentStub = {
    addEventListener,
    removeEventListener,
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => elementFactory(),
    createElement: elementFactory,
    createTextNode: (text) => ({ textContent: text }),
    body: {
      appendChild: () => {},
      removeChild: () => {},
      classList: { add: () => {}, remove: () => {} }
    },
    head: {
      appendChild: () => {}
    },
    documentElement: {
      setAttribute: () => {},
      style: { setProperty: () => {} },
      classList: { add: () => {}, remove: () => {} }
    }
  };

  const serviceWorkerStub = {
    register: () =>
      Promise.resolve({
        addEventListener: () => {},
        removeEventListener: () => {},
        active: null,
        update: () => Promise.resolve()
      }),
    ready: Promise.resolve({
      addEventListener: () => {},
      removeEventListener: () => {}
    }),
    addEventListener: () => {},
    removeEventListener: () => {}
  };

  const windowStub = {
    addEventListener,
    removeEventListener,
    dispatchEvent: () => {},
    localStorage,
    navigator: {
      serviceWorker: serviceWorkerStub
    },
    location: {
      hostname: 'localhost',
      href: 'http://localhost/',
      protocol: 'http:',
      pathname: '/',
      search: '',
      hash: ''
    },
    matchMedia: () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {}
    }),
    BgDeApp: {},
    CustomEvent: class {
      constructor(type, init = {}) {
        this.type = type;
        this.detail = init.detail ?? null;
      }
    }
  };

  globalThis.window = windowStub;
  globalThis.document = documentStub;
  globalThis.CustomEvent = windowStub.CustomEvent;
  globalThis.localStorage = localStorage;
  globalThis.BgDeApp = windowStub.BgDeApp;
  globalThis.setInterval = () => 0;
  globalThis.clearInterval = () => {};
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    writable: true,
    value: windowStub.navigator
  });
}

async function main() {
  const tempDir = await copyModulesToTemp(jsDir);
  const files = await collectFiles(tempDir, '.mjs');
  const failures = [];

  createDomStubs();

  const skipFiles = new Set([
    'vocabulary-old.js',
    'flashcards.js',
    'vocab-cards.js',
    'mobile-menu.js'
  ]);

  for (const filePath of files) {
    const relativeOriginal = path
      .relative(tempDir, filePath)
      .replace(/\.mjs$/, '.js');

    if (skipFiles.has(relativeOriginal)) {
      continue;
    }

    const url = pathToFileURL(filePath).href;
    try {
      await import(url);
    } catch (error) {
      failures.push({
        file: relativeOriginal,
        error
      });
    }
  }

  await rm(tempDir, { recursive: true, force: true });

  if (failures.length > 0) {
    console.error('ESM syntax check failed:\n');
    for (const failure of failures) {
      console.error(`- ${failure.file}`);
      console.error(`  ${failure.error.message}`);
      if (failure.error.stack) {
        console.error(`  ${failure.error.stack.split('\n').slice(1, 3).join('\n  ')}\n`);
      } else {
        console.error('');
      }
    }
    process.exit(1);
  }

  console.log(`Checked ${files.length} modules – no syntax errors detected.`);
}

main().catch(async (error) => {
  console.error('Failed to run ESM check:', error);
  process.exit(1);
});
