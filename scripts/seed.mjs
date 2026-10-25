import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256File } from '../lib/hashing.mjs';
import { repoRoot } from '../lib/paths.mjs';

export function sourcePathFor(filename) {
  return `sample-data/documents/${filename}`;
}

export function recordsFromCatalog(catalog, hashesBySourcePath) {
  if (!Array.isArray(catalog)) throw new Error('Catalog must be an array');
  return catalog.map((entry) => {
    if (!entry || typeof entry.reviewStatus !== 'string' || entry.reviewStatus.length === 0) {
      throw new Error(`reviewStatus is required for ${entry?.documentId || entry?.filename || 'a catalog entry'}`);
    }
    const sourcePath = sourcePathFor(entry.filename);
    const sha256 = hashesBySourcePath[sourcePath];
    if (!sha256) throw new Error(`Missing hash for ${sourcePath}`);
    const record = {
      documentId: entry.documentId,
      category: entry.category,
      version: String(entry.version),
      sourcePath,
      sha256,
      current: entry.current === true,
      reviewStatus: entry.reviewStatus
    };
    if (typeof entry.reportDate === 'string' && entry.reportDate.length > 0) record.reportDate = entry.reportDate;
    return record;
  });
}

export async function seed({ root = repoRoot, catalog, write = true } = {}) {
  const dir = join(root, 'sample-data');
  const entries = catalog || JSON.parse(await readFile(join(dir, 'catalog.json'), 'utf8'));
  const hashes = {};
  for (const entry of entries) {
    const sourcePath = sourcePathFor(entry.filename);
    hashes[sourcePath] = await sha256File(join(root, sourcePath));
  }
  const documents = recordsFromCatalog(entries, hashes);
  if (write) {
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'documents.json'), `${JSON.stringify(documents, null, 2)}\n`);
  }
  return documents;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const documents = await seed();
  const categories = new Set(documents.map((doc) => doc.category));
  console.log(`Seeded ${documents.length} source-backed document versions across ${categories.size} categories.`);
}
