#!/usr/bin/env tsx
import { promises as fs } from 'fs';
import path from 'path';

async function main() {
  const root = process.cwd();
  const candidates = [
    path.join(root, 'data', 'unified-vocabulary.json'),
    path.join(root, 'src', 'lib', 'data', 'unified-vocabulary.json')
  ];
  let sourcePath: string | null = null;
  for (const p of candidates) {
    try {
      await fs.access(p);
      sourcePath = p;
      break;
    } catch {}
  }
  if (!sourcePath) {
    console.error('❌ No unified-vocabulary.json found in data/ or src/lib/data/.');
    process.exit(1);
  }

  const targetStatic = path.join(root, 'static', 'data', 'unified-vocabulary.json');
  const targetSrc = path.join(root, 'src', 'lib', 'data', 'unified-vocabulary.json');

  const raw = await fs.readFile(sourcePath, 'utf-8');
  // Basic validation: ensure JSON parses and has items[]
  const json = JSON.parse(raw);
  if (!json || typeof json !== 'object' || !Array.isArray(json.items)) {
    console.error('❌ Invalid unified-vocabulary.json structure: missing items array');
    process.exit(1);
  }

  await fs.mkdir(path.dirname(targetStatic), { recursive: true });
  await fs.writeFile(targetStatic, JSON.stringify(json, null, 2));
  await fs.mkdir(path.dirname(targetSrc), { recursive: true });
  await fs.writeFile(targetSrc, JSON.stringify(json, null, 2));

  console.log('✅ Wrote collection to:');
  console.log(`   • ${targetSrc}`);
  console.log(`   • ${targetStatic}`);
}

main().catch((err) => {
  console.error('❌ build-vocabulary failed:', err);
  process.exit(1);
});
