/**
 * db-setup.ts
 * Ensures the static vocabulary JSON is available for the frontend.
 * Copies data/unified-vocabulary.json to static/data/unified-vocabulary.json if missing.
 */
import { promises as fs } from 'fs';
import path from 'path';

async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {
    // ignore
  }
}

async function main() {
  const root = process.cwd();
  const source = path.join(root, 'data', 'unified-vocabulary.json');
  const targetDir = path.join(root, 'static', 'data');
  const target = path.join(targetDir, 'unified-vocabulary.json');

  // Verify source exists
  try {
    await fs.access(source);
  } catch {
    console.error('[db:setup] Source data/unified-vocabulary.json not found.');
    process.exit(1);
  }

  // Ensure target directory
  await ensureDir(targetDir);

  // Copy if target missing or outdated
  let shouldCopy = false;
  try {
    const [srcStat, tgtStat] = await Promise.all([fs.stat(source), fs.stat(target)]);
    if (srcStat.mtimeMs > tgtStat.mtimeMs) {
      shouldCopy = true;
    }
  } catch {
    // target missing
    shouldCopy = true;
  }

  if (shouldCopy) {
    await fs.copyFile(source, target);
    console.log('[db:setup] Copied unified-vocabulary.json to static/data.');
  } else {
    console.log('[db:setup] static/data/unified-vocabulary.json is up to date.');
  }
}

main().catch((err) => {
  console.error('[db:setup] Failed:', err);
  process.exit(1);
});
