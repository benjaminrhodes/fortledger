import { mkdir, writeFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { join } from 'node:path';
import { ensureLocalChain, anchorManifest } from '../lib/local-chain.mjs';
import { repoRoot } from '../lib/paths.mjs';
import { demoTargetPath, restoreFromBackup, tamperSource } from '../lib/tamper.mjs';
import { publishedBaseline } from '../lib/baseline.mjs';
import { verify } from './verify.mjs';

const WARMUP = 1;
const ITERATIONS = 50;
const TRIALS = 20;
const TARGET_DOCUMENT = 'DOC-ENV-001-V2';
const target = demoTargetPath();
const outputPath = join(repoRoot, 'results', 'bench.json');

function round(value) {
  return Math.round(value * 1000) / 1000;
}

function quantile(sorted, p) {
  if (!sorted.length) return null;
  const index = (sorted.length - 1) * p;
  const low = Math.floor(index);
  const high = Math.ceil(index);
  if (low === high) return sorted[low];
  return sorted[low] * (high - index) + sorted[high] * (index - low);
}

const chain = await ensureLocalChain();
try {
  await restoreFromBackup(target);
  await anchorManifest();
  const clean = await verify();
  for (let index = 0; index < WARMUP; index += 1) await verify();

  const samples = [];
  for (let index = 0; index < ITERATIONS; index += 1) {
    const started = performance.now();
    await verify();
    samples.push(performance.now() - started);
  }
  const sorted = [...samples].sort((a, b) => a - b);
  const mean = samples.reduce((sum, value) => sum + value, 0) / samples.length;

  let detected = 0;
  let identified = 0;
  for (let index = 0; index < TRIALS; index += 1) {
    await tamperSource(target, { once: false });
    const result = await verify();
    const sourceMismatches = (result.mismatches || []).filter((item) => item.reason === 'source_hash_mismatch');
    if (result.status === 'failed') detected += 1;
    if (result.status === 'failed' && sourceMismatches.length === 1 && sourceMismatches[0].documentId === TARGET_DOCUMENT) {
      identified += 1;
    }
    await restoreFromBackup(target);
  }

  const results = {
    label: 'Single-run measurement of this demo on one machine. Not a published benchmark.',
    generatedAt: new Date().toISOString(),
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch
    },
    method: 'verify() reads the manifest hash from the local Hardhat anchor and SHA-256 hashes the approved source files. Tamper trials append a marker to the synthetic Phase I v2 file and then restore it.',
    cleanStatus: clean.status,
    warmupIterations: WARMUP,
    verifyLatencyMs: {
      iterations: ITERATIONS,
      min: round(sorted[0]),
      mean: round(mean),
      p50: round(quantile(sorted, 0.5)),
      p95: round(quantile(sorted, 0.95)),
      max: round(sorted[sorted.length - 1])
    },
    tamperTrials: TRIALS,
    targetDocumentId: TARGET_DOCUMENT,
    tamperDetectionRate: detected / TRIALS,
    correctDocumentIdentificationRate: identified / TRIALS,
    baseline: publishedBaseline
  };

  await mkdir(join(repoRoot, 'results'), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(results, null, 2)}\n`);
  console.log(JSON.stringify(results, null, 2));
  console.log(`Wrote ${outputPath}`);
  if (clean.status !== 'verified' || detected !== TRIALS || identified !== TRIALS) process.exitCode = 1;
} finally {
  await restoreFromBackup(target);
  if (chain.started) await chain.stop();
}
