import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { approvedDocuments, buildManifest, manifestHash } from '../lib/hashing.mjs';
import { repoRoot } from '../lib/paths.mjs';
import { recordsFromCatalog, seed } from '../scripts/seed.mjs';

test('review status is taken from the catalog and is not defaulted', () => {
  const pending = recordsFromCatalog([
    { documentId: 'DOC-X', category: 'survey', version: '1', filename: 'a.txt', current: true, reviewStatus: 'pending_review' }
  ], { 'sample-data/documents/a.txt': 'sha256:abc' });
  assert.equal(pending[0].reviewStatus, 'pending_review');
  assert.deepEqual(approvedDocuments(pending), []);
  assert.throws(
    () => recordsFromCatalog([
      { documentId: 'DOC-X', category: 'survey', version: '1', filename: 'a.txt', current: true }
    ], { 'sample-data/documents/a.txt': 'sha256:abc' }),
    /reviewStatus/
  );
});

test('seed copies catalog review status and matches the committed document index', async () => {
  const catalog = JSON.parse(await readFile(join(repoRoot, 'sample-data/catalog.json'), 'utf8'));
  const seeded = await seed({ write: false });
  const committed = JSON.parse(await readFile(join(repoRoot, 'sample-data/documents.json'), 'utf8'));
  assert.deepEqual(seeded, committed);
  assert.deepEqual(seeded.map((doc) => doc.reviewStatus), catalog.map((entry) => entry.reviewStatus));
  const categories = [...new Set(seeded.map((doc) => doc.category))].sort();
  assert.deepEqual(categories, ['environmental', 'lease', 'operating_costs', 'rent_roll', 'survey', 'title', 'zoning']);
  assert.equal(seeded.filter((doc) => doc.category === 'environmental' && doc.current).length, 1);
  assert.equal(seeded.find((doc) => doc.documentId === 'DOC-ENV-001-V1').current, false);
});

test('the committed manifest is the approved-document commitment', async () => {
  const asset = JSON.parse(await readFile(join(repoRoot, 'sample-data/asset-profile.json'), 'utf8'));
  const documents = JSON.parse(await readFile(join(repoRoot, 'sample-data/documents.json'), 'utf8'));
  const manifest = buildManifest(asset, documents);
  const committed = JSON.parse(await readFile(join(repoRoot, 'sample-data/manifest-v1.json'), 'utf8'));
  assert.equal(committed.manifestHash, manifestHash(manifest));
  assert.deepEqual(committed.documents, manifest.documents);
  assert.equal(manifest.documents.some((doc) => doc.documentId === 'DOC-ENV-001-V1'), false);
  assert.equal(manifest.documents.some((doc) => doc.documentId === 'DOC-ENV-001-V2'), true);
});
