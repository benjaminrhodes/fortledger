import test from 'node:test';
import assert from 'node:assert/strict';
import { buildManifest, canonicalJson, manifestHash, approvedDocuments } from '../lib/hashing.mjs';

const asset = { assetId: 'FL-TX-FW-0001', recordVersion: '1.0' };
const docs = [
  { documentId: 'DOC-Z', category: 'zoning', version: '1', sourcePath: 'z', sha256: 'sha256:z', current: true, reviewStatus: 'human_verified' },
  { documentId: 'DOC-A', category: 'title', version: '2', sourcePath: 'a', sha256: 'sha256:a', current: true, reviewStatus: 'human_verified' },
  { documentId: 'DOC-OLD', category: 'environmental', version: '1', sourcePath: 'old', sha256: 'sha256:old', current: false, reviewStatus: 'human_verified' },
  { documentId: 'DOC-UNREVIEWED', category: 'survey', version: '1', sourcePath: 'u', sha256: 'sha256:u', current: true, reviewStatus: 'pending_review' }
];

test('manifest is deterministic regardless of input order', () => {
  assert.equal(manifestHash(buildManifest(asset, docs)), manifestHash(buildManifest(asset, [...docs].reverse())));
  assert.deepEqual(approvedDocuments(docs).map((d) => d.documentId), ['DOC-A', 'DOC-Z']);
});

test('canonical JSON sorts object keys', () => {
  assert.equal(canonicalJson({ z: 1, a: { y: 2, x: 3 } }), '{"a":{"x":3,"y":2},"z":1}');
});

test('one changed byte changes the manifest commitment', () => {
  const clean = buildManifest(asset, docs);
  const changed = buildManifest(asset, docs.map((d) => d.documentId === 'DOC-A' ? { ...d, sha256: 'sha256:changed' } : d));
  assert.notEqual(manifestHash(clean), manifestHash(changed));
});
