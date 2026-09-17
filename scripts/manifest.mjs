import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildManifest, manifestHash } from '../lib/hashing.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const asset = JSON.parse(await readFile(join(root, 'sample-data/asset-profile.json')));
const documents = JSON.parse(await readFile(join(root, 'sample-data/documents.json')));
const manifest = buildManifest(asset, documents);
manifest.manifestHash = manifestHash(manifest);
await writeFile(join(root, 'sample-data/manifest-v1.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ manifestHash: manifest.manifestHash, includedDocuments: manifest.documents.length }, null, 2));
