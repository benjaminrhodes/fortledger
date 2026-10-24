import { access, cp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { repoRoot } from './paths.mjs';

export const TAMPER_MARKER = '\nTAMPER DEMO: unauthorized byte change.\n';
export const DEMO_TARGET_REL = 'sample-data/documents/phase_i_esa_v2.txt';

export function demoTargetPath(root = repoRoot) {
  return join(root, DEMO_TARGET_REL);
}

export function backupPath(target) {
  return `${target}.clean-demo-backup`;
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function ensureCleanBackup(target) {
  const backup = backupPath(target);
  if (!(await exists(backup))) await cp(target, backup);
  return backup;
}

export async function restoreFromBackup(target) {
  const backup = backupPath(target);
  if (!(await exists(backup))) return false;
  await cp(backup, target);
  await rm(backup, { force: true });
  return true;
}

export async function tamperSource(target, { once = true } = {}) {
  await ensureCleanBackup(target);
  const bytes = await readFile(target);
  const already = bytes.includes(Buffer.from('TAMPER DEMO: unauthorized byte change.'));
  if (once && already) return { target, tampered: false, alreadyTampered: true };
  await writeFile(target, Buffer.concat([bytes, Buffer.from(TAMPER_MARKER)]));
  return { target, tampered: true, alreadyTampered: false };
}

function summarize(result) {
  return {
    status: result.status,
    reasons: result.reasons || [],
    manifestHash: result.manifestHash,
    anchoredManifestHash: result.anchoredManifestHash,
    recordVersion: result.recordVersion,
    anchoredRecordVersion: result.anchoredRecordVersion,
    mismatches: result.mismatches || []
  };
}

export async function runTamperDemo({ target, verify, changedFile }) {
  await ensureCleanBackup(target);
  try {
    const before = await verify();
    await tamperSource(target, { once: false });
    const tampered = await verify();
    await restoreFromBackup(target);
    const restored = await verify();
    return {
      before: summarize(before),
      tampered: summarize(tampered),
      restored: summarize(restored),
      changedFile: changedFile || target
    };
  } finally {
    await restoreFromBackup(target);
  }
}
