import { ensureLocalChain, anchorManifest } from '../lib/local-chain.mjs';
import { demoTargetPath, restoreFromBackup, runTamperDemo, DEMO_TARGET_REL } from '../lib/tamper.mjs';
import { verify } from './verify.mjs';

const target = demoTargetPath();
console.log('Preparing the local chain and anchoring the manifest...');
const chain = await ensureLocalChain();
try {
  await restoreFromBackup(target);
  await anchorManifest();
  const output = await runTamperDemo({ target, verify, changedFile: DEMO_TARGET_REL });
  console.log(JSON.stringify(output, null, 2));
  const named = output.tampered.mismatches.some((item) => item.documentId === 'DOC-ENV-001-V2' && item.reason === 'source_hash_mismatch');
  const ok = output.before.status === 'verified'
    && output.tampered.status === 'failed'
    && named
    && output.restored.status === 'verified';
  if (!ok) {
    console.error('Tamper demo did not complete the verified → failed → verified cycle.');
    process.exitCode = 1;
  }
} finally {
  await restoreFromBackup(target);
  if (chain.started) await chain.stop();
}
