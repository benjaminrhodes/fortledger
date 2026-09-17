import { cp, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verify } from './verify.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const target = join(root, 'sample-data/documents/phase_i_esa_v2.txt');
const backup = `${target}.clean-demo-backup`;
await cp(target, backup);
try {
  const before = await verify();
  await writeFile(target, `${await readFile(target, 'utf8')}\nTAMPER DEMO: unauthorized byte change.\n`);
  const after = await verify();
  await cp(backup, target);
  const restored = await verify();
  console.log(JSON.stringify({ before, tampered: after, restored, changedFile: 'sample-data/documents/phase_i_esa_v2.txt' }, null, 2));
} finally {
  await cp(backup, target);
}
