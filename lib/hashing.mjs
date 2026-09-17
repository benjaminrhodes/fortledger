import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

export async function sha256File(path) {
  const bytes = await readFile(path);
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

export function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

export function manifestHash(manifest) {
  return `sha256:${createHash('sha256').update(canonicalJson(manifest), 'utf8').digest('hex')}`;
}

export function approvedDocuments(documents) {
  return documents
    .filter((doc) => doc.current === true && doc.reviewStatus === 'human_verified')
    .sort((a, b) => a.documentId.localeCompare(b.documentId) || a.version.localeCompare(b.version));
}

export function buildManifest(asset, documents) {
  return {
    schemaVersion: '1.0',
    assetId: asset.assetId,
    recordVersion: asset.recordVersion,
    documents: approvedDocuments(documents).map(({ documentId, category, version, sourcePath, sha256 }) => ({ documentId, category, version, sourcePath, sha256 }))
  };
}
