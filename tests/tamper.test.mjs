import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runTamperDemo } from '../lib/tamper.mjs';

async function tempFile(contents) {
  const dir = await mkdtemp(join(tmpdir(), 'fortledger-tamper-'));
  const target = join(dir, 'phase_i_esa_v2.txt');
  await writeFile(target, contents);
  return target;
}

test('tamper demo restores the source and deletes the backup', async () => {
  const target = await tempFile('clean contents\n');
  const output = await runTamperDemo({
    target,
    verify: async () => {
      const text = await readFile(target, 'utf8');
      const tampered = text.includes('TAMPER DEMO:');
      return {
        status: tampered ? 'failed' : 'verified',
        mismatches: tampered ? [{ documentId: 'DOC-ENV-001-V2', reason: 'source_hash_mismatch' }] : []
      };
    }
  });
  assert.equal(output.before.status, 'verified');
  assert.equal(output.tampered.status, 'failed');
  assert.equal(output.restored.status, 'verified');
  assert.equal(await readFile(target, 'utf8'), 'clean contents\n');
  await assert.rejects(() => access(`${target}.clean-demo-backup`));
});

test('tamper demo deletes the backup when verify throws after the edit', async () => {
  const target = await tempFile('clean contents\n');
  let calls = 0;
  await assert.rejects(() => runTamperDemo({
    target,
    verify: async () => {
      calls += 1;
      if (calls === 2) throw new Error('boom');
      return { status: 'verified', mismatches: [] };
    }
  }));
  assert.equal(await readFile(target, 'utf8'), 'clean contents\n');
  await assert.rejects(() => access(`${target}.clean-demo-backup`));
});
