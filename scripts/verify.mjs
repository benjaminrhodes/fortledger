import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256File, buildManifest, manifestHash, manifestPreimage, isApprovedDocument } from '../lib/hashing.mjs';
import { readChainAnchor } from '../lib/chain.mjs';
import { repoRoot } from '../lib/paths.mjs';
import { phaseIViability } from '../lib/viability.mjs';

export function compareVersions(left, right) {
  const parse = (value) => String(value).split('.').map((part) => {
    const number = Number(part);
    return Number.isFinite(number) ? number : 0;
  });
  const a = parse(left);
  const b = parse(right);
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    const av = a[index] ?? 0;
    const bv = b[index] ?? 0;
    if (av > bv) return 1;
    if (av < bv) return -1;
  }
  return 0;
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

function displayStatus(raw, record, overall) {
  const approved = isApprovedDocument(record);
  if (!record.current) {
    if (raw === 'missing') return 'source_unavailable';
    if (raw === 'mismatch') return 'failed';
    return 'superseded';
  }
  if (!approved) {
    if (raw === 'missing') return 'source_unavailable';
    if (raw === 'mismatch') return 'failed';
    return 'excluded';
  }
  if (raw === 'missing') return 'unable_to_verify';
  if (raw === 'mismatch') return 'failed';
  if (overall === 'verified') return 'verified';
  if (overall === 'outdated' || overall === 'failed') return 'intact';
  return 'not_confirmed';
}

async function anchoredRecordIntact(anchor, rootDir) {
  if (!anchor.manifest || !Array.isArray(anchor.manifest.documents)) {
    return { ok: false, reason: 'anchored_manifest_unavailable' };
  }
  let preimage;
  try {
    preimage = manifestPreimage(anchor.manifest);
  } catch {
    return { ok: false, reason: 'anchored_manifest_unavailable' };
  }
  if (manifestHash(preimage) !== anchor.manifestHash) {
    return { ok: false, reason: 'anchored_manifest_mismatch' };
  }
  for (const doc of preimage.documents) {
    try {
      const actual = await sha256File(join(rootDir, doc.sourcePath));
      if (actual !== doc.sha256) {
        return { ok: false, reason: 'anchored_source_mismatch', documentId: doc.documentId, expected: doc.sha256, actual };
      }
    } catch {
      return { ok: false, reason: 'anchored_source_unavailable', documentId: doc.documentId, sourcePath: doc.sourcePath };
    }
  }
  return { ok: true };
}

function publicAnchor(anchor) {
  if (!anchor) return null;
  return {
    contractAddress: anchor.contractAddress || null,
    tokenId: anchor.tokenId || null,
    txHash: anchor.txHash || null,
    chainId: anchor.chainId ?? null,
    issuer: anchor.issuer || null,
    rpcUrl: anchor.rpcUrl || null,
    manifestUri: anchor.manifestUri || null,
    assetId: anchor.assetId,
    recordVersion: anchor.recordVersion,
    manifestHash: anchor.manifestHash,
    legalTitle: anchor.legalTitle === true,
    investmentRights: anchor.investmentRights === true,
    transferPolicy: anchor.transferPolicy || null
  };
}

export async function verify(options = {}) {
  const rootDir = options.rootDir || repoRoot;
  const asset = options.asset || await readJson(join(rootDir, 'sample-data', 'asset-profile.json'));
  const documents = options.documents || await readJson(join(rootDir, 'sample-data', 'documents.json'));
  const readAnchor = options.readAnchor || (() => readChainAnchor());

  let anchor = null;
  let chainUnreachable = false;
  try {
    anchor = await readAnchor();
  } catch {
    anchor = null;
  }
  if (!anchor?.manifestHash || !anchor.recordVersion || !anchor.assetId) {
    chainUnreachable = true;
    anchor = null;
  }

  const mismatches = [];
  const checked = [];
  for (const record of documents) {
    const approved = isApprovedDocument(record);
    let raw = 'ok';
    let actual = null;
    try {
      actual = await sha256File(join(rootDir, record.sourcePath));
      if (actual !== record.sha256) {
        raw = 'mismatch';
        if (approved) {
          mismatches.push({
            documentId: record.documentId,
            reason: 'source_hash_mismatch',
            expected: record.sha256,
            actual,
            sourcePath: record.sourcePath
          });
        }
      }
    } catch {
      raw = 'missing';
      if (approved) {
        mismatches.push({
          documentId: record.documentId,
          reason: 'source_unavailable',
          sourcePath: record.sourcePath
        });
      }
    }
    checked.push({ record, raw, actual });
  }

  const recalculated = buildManifest(asset, documents);
  const actualManifestHash = manifestHash(recalculated);
  const sourceUnavailable = mismatches.some((item) => item.reason === 'source_unavailable');
  const sourceMismatch = mismatches.some((item) => item.reason === 'source_hash_mismatch');
  const reasons = [];
  let status;

  if (sourceUnavailable || chainUnreachable) {
    status = 'unable_to_verify';
    if (chainUnreachable) reasons.push('chain_unreachable');
    if (sourceUnavailable) reasons.push('source_unavailable');
  } else if (anchor.assetId !== asset.assetId) {
    status = 'failed';
    reasons.push('anchor_asset_mismatch');
    mismatches.push({
      documentId: 'MANIFEST',
      reason: 'anchor_asset_mismatch',
      expected: asset.assetId,
      actual: anchor.assetId
    });
  } else if (sourceMismatch) {
    status = 'failed';
    reasons.push('source_hash_mismatch');
  } else if (actualManifestHash === anchor.manifestHash) {
    status = 'verified';
  } else if (compareVersions(asset.recordVersion, anchor.recordVersion) > 0) {
    const intact = await anchoredRecordIntact(anchor, rootDir);
    if (intact.ok) {
      status = 'outdated';
      reasons.push('newer_manifest');
      mismatches.push({
        documentId: 'MANIFEST',
        reason: 'manifest_hash_mismatch',
        expected: anchor.manifestHash,
        actual: actualManifestHash
      });
    } else if (intact.reason === 'anchored_source_mismatch') {
      status = 'failed';
      reasons.push(intact.reason);
      mismatches.push({
        documentId: intact.documentId || 'MANIFEST',
        reason: intact.reason,
        expected: intact.expected,
        actual: intact.actual
      });
    } else {
      status = 'unable_to_verify';
      reasons.push(intact.reason);
      if (intact.documentId) {
        mismatches.push({
          documentId: intact.documentId,
          reason: intact.reason,
          sourcePath: intact.sourcePath
        });
      }
    }
  } else {
    status = 'failed';
    reasons.push('manifest_hash_mismatch');
    mismatches.push({
      documentId: 'MANIFEST',
      reason: 'manifest_hash_mismatch',
      expected: anchor.manifestHash,
      actual: actualManifestHash
    });
  }

  return {
    status,
    reasons,
    manifestHash: actualManifestHash,
    anchoredManifestHash: anchor?.manifestHash || null,
    recordVersion: asset.recordVersion,
    anchoredRecordVersion: anchor?.recordVersion || null,
    assetId: asset.assetId,
    approvedDocuments: recalculated.documents.length,
    mismatches,
    documents: checked.map(({ record, raw, actual }) => {
      const row = {
        documentId: record.documentId,
        category: record.category,
        version: record.version,
        current: record.current === true,
        reviewStatus: record.reviewStatus,
        sourcePath: record.sourcePath,
        sha256: record.sha256,
        actualSha256: actual,
        status: displayStatus(raw, record, status)
      };
      if (record.category === 'environmental' && record.reportDate) {
        row.reportDate = record.reportDate;
        row.viability = phaseIViability(record.reportDate, asset.asOf);
      }
      return row;
    }),
    anchor: publicAnchor(anchor)
  };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const result = await verify();
  console.log(JSON.stringify(result, null, 2));
  if (result.status === 'unable_to_verify' && result.reasons.includes('chain_unreachable')) process.exitCode = 2;
}
