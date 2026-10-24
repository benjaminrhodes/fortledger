import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildManifest, manifestHash } from '../lib/hashing.mjs';
import { readChainAnchor } from '../lib/chain.mjs';
import { repoRoot } from '../lib/paths.mjs';
import { compareVersions, verify } from '../scripts/verify.mjs';
import { readFile } from 'node:fs/promises';

async function fixture() {
  const asset = JSON.parse(await readFile(join(repoRoot, 'sample-data/asset-profile.json'), 'utf8'));
  const documents = JSON.parse(await readFile(join(repoRoot, 'sample-data/documents.json'), 'utf8'));
  return { asset, documents };
}

function anchorFor(asset, documents, overrides = {}) {
  const manifest = buildManifest(asset, documents);
  return {
    assetId: asset.assetId,
    recordVersion: asset.recordVersion,
    manifestHash: manifestHash(manifest),
    manifest,
    legalTitle: false,
    investmentRights: false,
    transferPolicy: 'disabled',
    contractAddress: '0x0000000000000000000000000000000000000001',
    tokenId: '1',
    ...overrides
  };
}

test('compareVersions orders dotted numeric versions', () => {
  assert.equal(compareVersions('1.0', '1.0'), 0);
  assert.equal(compareVersions('1.1', '1.0'), 1);
  assert.equal(compareVersions('1.9', '1.10'), -1);
});

test('a Phase I older than 180 days is stale without changing a matching hash status', async () => {
  const { asset, documents } = await fixture();
  const aged = documents.map((doc) => {
    if (doc.documentId === 'DOC-ENV-001-V2') return { ...doc, reportDate: '2025-01-15' };
    if (doc.documentId === 'DOC-ENV-001-V1') return { ...doc, reportDate: '2025-09-01' };
    return doc;
  });
  const result = await verify({
    asset,
    documents: aged,
    readAnchor: async () => anchorFor(asset, aged)
  });
  assert.equal(result.status, 'verified');
  const current = result.documents.find((doc) => doc.documentId === 'DOC-ENV-001-V2');
  const prior = result.documents.find((doc) => doc.documentId === 'DOC-ENV-001-V1');
  assert.equal(current.viability.status, 'stale');
  assert.equal(current.viability.rule, 'ASTM E1527-21 §4.6');
  assert.ok(current.viability.ageDays > 180);
  assert.equal(prior.viability.status, 'stale');
});

test('verify returns verified when the chain hash matches the approved files', async () => {
  const { asset, documents } = await fixture();
  const anchor = anchorFor(asset, documents);
  const result = await verify({ asset, documents, readAnchor: async () => anchor });
  assert.equal(result.status, 'verified');
  assert.equal(result.manifestHash, anchor.manifestHash);
  assert.equal(result.anchor.legalTitle, false);
  assert.equal(result.anchor.investmentRights, false);
  assert.equal(result.documents.find((doc) => doc.documentId === 'DOC-ENV-001-V1').status, 'superseded');
  assert.equal(result.documents.find((doc) => doc.documentId === 'DOC-ENV-001-V1').viability.status, 'stale');
  assert.equal(result.documents.find((doc) => doc.documentId === 'DOC-ENV-001-V2').status, 'verified');
  assert.equal(result.documents.find((doc) => doc.documentId === 'DOC-ENV-001-V2').viability.status, 'viable');
});

test('verify returns failed when an approved source hash does not match the file', async () => {
  const { asset, documents } = await fixture();
  const tampered = documents.map((doc) => doc.documentId === 'DOC-ENV-001-V2' ? { ...doc, sha256: `sha256:${'cd'.repeat(32)}` } : doc);
  const result = await verify({
    asset,
    documents: tampered,
    readAnchor: async () => anchorFor(asset, tampered)
  });
  assert.equal(result.status, 'failed');
  assert.ok(result.reasons.includes('source_hash_mismatch'));
  assert.ok(result.mismatches.some((item) => item.documentId === 'DOC-ENV-001-V2' && item.reason === 'source_hash_mismatch'));
});

test('a local manifest that no longer matches the chain is failed when the version did not advance', async () => {
  const { asset, documents } = await fixture();
  const result = await verify({
    asset,
    documents,
    readAnchor: async () => anchorFor(asset, documents, { manifestHash: `sha256:${'ab'.repeat(32)}`, manifest: null })
  });
  assert.equal(result.status, 'failed');
  assert.ok(result.mismatches.some((item) => item.reason === 'manifest_hash_mismatch'));
});

test('verify returns unable_to_verify when the chain cannot be read', async () => {
  const { asset, documents } = await fixture();
  const result = await verify({ asset, documents, readAnchor: async () => null });
  assert.equal(result.status, 'unable_to_verify');
  assert.ok(result.reasons.includes('chain_unreachable'));
  assert.notEqual(result.status, 'verified');
});

test('verify returns unable_to_verify when an approved source file is missing', async () => {
  const { asset, documents } = await fixture();
  const missing = documents.map((doc) => doc.documentId === 'DOC-TITLE-001'
    ? { ...doc, sourcePath: 'sample-data/documents/does-not-exist.txt' }
    : doc);
  const result = await verify({
    asset,
    documents: missing,
    readAnchor: async () => anchorFor(asset, documents)
  });
  assert.equal(result.status, 'unable_to_verify');
  assert.ok(result.reasons.includes('source_unavailable'));
  assert.ok(result.mismatches.some((item) => item.documentId === 'DOC-TITLE-001'));
});

test('verify returns outdated when a newer manifest supersedes an intact anchor', async () => {
  const { asset, documents } = await fixture();
  const previous = anchorFor(asset, documents);
  const nextAsset = { ...asset, recordVersion: '1.1' };
  const result = await verify({
    asset: nextAsset,
    documents,
    readAnchor: async () => previous
  });
  assert.equal(result.status, 'outdated');
  assert.ok(result.reasons.includes('newer_manifest'));
  assert.equal(result.anchoredRecordVersion, '1.0');
  assert.equal(result.recordVersion, '1.1');
  assert.notEqual(result.manifestHash, result.anchoredManifestHash);
});

test('a newer version does not become outdated when the anchored bytes changed', async () => {
  const { asset, documents } = await fixture();
  const previous = anchorFor(asset, documents);
  const broken = structuredClone(previous.manifest);
  broken.documents = broken.documents.map((doc, index) => index === 0 ? { ...doc, sha256: `sha256:${'11'.repeat(32)}` } : doc);
  const nextAsset = { ...asset, recordVersion: '1.1' };
  const result = await verify({
    asset: nextAsset,
    documents,
    readAnchor: async () => ({
      ...previous,
      manifest: broken,
      manifestHash: manifestHash(broken)
    })
  });
  assert.equal(result.status, 'failed');
  assert.ok(result.reasons.includes('anchored_source_mismatch'));
});

test('readChainAnchor returns null when the anchor file or RPC is unavailable', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'fortledger-anchor-'));
  const anchorPath = join(dir, 'anchor.json');
  await writeFile(anchorPath, JSON.stringify({
    contractAddress: '0x0000000000000000000000000000000000000001',
    tokenId: '1'
  }));
  const started = Date.now();
  const result = await readChainAnchor({
    rpcUrl: 'http://127.0.0.1:9',
    anchorPath,
    timeoutMs: 1000
  });
  assert.equal(result, null);
  assert.ok(Date.now() - started < 5000);
});
