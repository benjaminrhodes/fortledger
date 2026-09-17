import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const pkg = JSON.parse(await readFile(join(root, 'package.json')));
for (const path of ['README.md','PROJECT_STATUS.md','sample-data/asset-profile.json','sample-data/documents.json','sample-data/manifest-v1.json']) await access(join(root, path));
if (!pkg.scripts.test || !pkg.scripts.seed) throw new Error('Missing required scripts');
console.log('Build check passed: required checkpoint artifacts are present.');
