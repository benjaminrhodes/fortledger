import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const required = [
  'README.md',
  'PROJECT_STATUS.md',
  'hardhat.config.cjs',
  'contracts/AssetRecordToken.sol',
  'scripts/dev-server.mjs',
  'scripts/anchor.cjs',
  'scripts/bench.mjs',
  'scripts/verify.mjs',
  'public/index.html',
  'public/app.js',
  'public/styles.css',
  'sample-data/asset-profile.json',
  'sample-data/catalog.json',
  'sample-data/documents.json',
  'sample-data/manifest-v1.json'
];
for (const path of required) await access(join(root, path));
for (const name of ['test', 'seed', 'dev', 'bench', 'anchor']) {
  if (!pkg.scripts[name]) throw new Error(`Missing npm script: ${name}`);
}
console.log('Build check passed: demo artifacts and scripts are present.');
