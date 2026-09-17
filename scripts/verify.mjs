import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256File, buildManifest, manifestHash } from '../lib/hashing.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const anchored = JSON.parse(await readFile(join(root, 'sample-data/manifest-v1.json')));
const asset = JSON.parse(await readFile(join(root, 'sample-data/asset-profile.json')));
const records = JSON.parse(await readFile(join(root, 'sample-data/documents.json')));

export async function verify({ manifest = anchored, documents = records } = {}) {
  const mismatches = [];
  for (const record of documents.filter((d) => d.current && d.reviewStatus === 'human_verified')) {
    try {
      const actual = await sha256File(join(root, record.sourcePath));
      if (actual !== record.sha256) mismatches.push({ documentId: record.documentId, reason: 'source_hash_mismatch', expected: record.sha256, actual });
    } catch { mismatches.push({ documentId: record.documentId, reason: 'source_unavailable' }); }
  }
  const recalculated = buildManifest(asset, documents);
  const actualManifestHash = manifestHash(recalculated);
  if (actualManifestHash !== manifest.manifestHash) mismatches.push({ documentId: 'MANIFEST', reason: 'manifest_hash_mismatch', expected: manifest.manifestHash, actual: actualManifestHash });
  if (mismatches.some((m) => m.reason === 'source_unavailable')) return { status: 'unable_to_verify', mismatches };
  if (mismatches.length) return { status: 'failed', mismatches };
  return { status: 'verified', manifestHash: actualManifestHash, documents: recalculated.documents.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(JSON.stringify(await verify(), null, 2));
