import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { repoRoot } from '../lib/paths.mjs';
import {
  checkEnvironment,
  hardhatCheckMessage,
  majorVersion,
  minimumNodeMajor,
  nodeCheckMessage
} from '../scripts/preflight.mjs';

test('version helpers read engines.node and dotted versions', () => {
  assert.equal(minimumNodeMajor('>=20'), 20);
  assert.equal(minimumNodeMajor('>=22.0.0'), 22);
  assert.equal(minimumNodeMajor('20'), null);
  assert.equal(majorVersion('2.29.1'), 2);
  assert.equal(majorVersion('v22.23.4'), 22);
  assert.equal(majorVersion('nope'), null);
});

test('node check names the running version and .nvmrc', () => {
  const message = nodeCheckMessage({ nodeVersion: '18.20.4', minimum: 20, nvmrc: '22' });
  assert.match(message, /Node\.js 20 or newer/);
  assert.match(message, /v18\.20\.4/);
  assert.match(message, /engines\.node to >=20/);
  assert.match(message, /nvm use/);
  assert.match(message, /\.nvmrc is 22/);
});

test('Hardhat 3 message includes the pin and the HHE3 recovery', () => {
  const message = hardhatCheckMessage({ installed: '3.0.0', pinned: '2.29.1' });
  assert.match(message, /Hardhat 2\.x/);
  assert.match(message, /pins 2\.29\.1/);
  assert.match(message, /The local install is Hardhat 3\.0\.0/);
  assert.match(message, /hardhat\.config\.cjs/);
  assert.match(message, /HHE3/);
  assert.match(message, /git checkout -- package\.json package-lock\.json/);
  assert.match(message, /npm ci/);
});

test('.nvmrc is Node 22, inside engines.node >=20', async () => {
  const nvmrc = (await readFile(join(repoRoot, '.nvmrc'), 'utf8')).trim();
  const pkg = JSON.parse(await readFile(join(repoRoot, 'package.json'), 'utf8'));
  assert.equal(nvmrc, '22');
  assert.ok(Number(nvmrc) >= minimumNodeMajor(pkg.engines.node));
});

test('Node 20, 22, and 24 pass when Hardhat is 2.x', async () => {
  for (const nodeVersion of ['20.0.0', '22.23.4', '24.11.0']) {
    const result = await checkEnvironment({ nodeVersion, hardhatVersion: '2.29.1' });
    assert.equal(result.ok, true, `${nodeVersion}: ${result.message}`);
  }
  assert.equal((await checkEnvironment({ hardhatVersion: '2.22.0' })).ok, true);
});

test('Node older than 20 fails before install, including node-only', async () => {
  const result = await checkEnvironment({ nodeVersion: '18.20.4', hardhatVersion: null, nodeOnly: true });
  assert.equal(result.ok, false);
  assert.match(result.message, /v18\.20\.4/);
  assert.match(result.message, /\.nvmrc is 22/);
});

test('a non-2.x Hardhat fails and a missing install points at setup', async () => {
  const lock = JSON.parse(await readFile(join(repoRoot, 'package-lock.json'), 'utf8'));
  const pinned = lock.packages['node_modules/hardhat'].version;
  assert.equal(majorVersion(pinned), 2);

  const hardhat3 = await checkEnvironment({ hardhatVersion: '3.0.0' });
  assert.equal(hardhat3.ok, false);
  assert.match(hardhat3.message, new RegExp(pinned.replace(/\./g, '\\.')));
  assert.match(hardhat3.message, /HHE3/);

  const hardhat1 = await checkEnvironment({ hardhatVersion: '1.9.0' });
  assert.equal(hardhat1.ok, false);

  const missing = await checkEnvironment({ hardhatVersion: null });
  assert.equal(missing.ok, false);
  assert.match(missing.message, /npm run setup/);

  const nodeOnly = await checkEnvironment({ nodeVersion: '20.18.0', hardhatVersion: null, nodeOnly: true });
  assert.equal(nodeOnly.ok, true);
  assert.match(nodeOnly.message, /Node v20\.18\.0/);
});

test('a package.json without an engines range fails closed', async () => {
  const root = await mkdtemp(join(tmpdir(), 'fortledger-preflight-'));
  try {
    await writeFile(join(root, 'package.json'), JSON.stringify({ engines: {} }));
    const result = await checkEnvironment({ root, nodeVersion: '22.23.4', nodeOnly: true });
    assert.equal(result.ok, false);
    assert.match(result.message, /engines\.node/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('setup, dev, demo, and test run the preflight without dropping the old commands', async () => {
  const pkg = JSON.parse(await readFile(join(repoRoot, 'package.json'), 'utf8'));
  const setup = pkg.scripts.setup;
  const nodeOnly = setup.indexOf('--node-only');
  const ci = setup.indexOf('npm ci');
  const afterInstall = setup.indexOf('node scripts/preflight.mjs &&');
  const compile = setup.indexOf('node scripts/hardhat.mjs compile');
  assert.ok(nodeOnly !== -1 && nodeOnly < ci && ci < afterInstall && afterInstall < compile);
  assert.match(pkg.scripts.preflight, /^node scripts\/preflight\.mjs$/);
  assert.match(pkg.scripts.dev, /^node scripts\/preflight\.mjs && node scripts\/dev-server\.mjs$/);
  assert.match(pkg.scripts.demo, /^node scripts\/preflight\.mjs && node scripts\/dev-server\.mjs$/);
  assert.match(pkg.scripts.test, /^node scripts\/preflight\.mjs && node --test && node scripts\/hardhat\.mjs test$/);
  assert.equal(pkg.scripts['test:node'], 'node --test');
  assert.equal(pkg.scripts.chain, 'node scripts/hardhat.mjs node');
});

test('CI installs and tests on Node 20 and 22', async () => {
  const yaml = await readFile(join(repoRoot, '.github/workflows/ci.yml'), 'utf8');
  assert.match(yaml, /push:/);
  assert.match(yaml, /pull_request:/);
  assert.match(yaml, /npm ci/);
  assert.match(yaml, /npm test/);
  assert.match(yaml, /cache:\s*npm/);
  assert.match(yaml, /node:\s*\[20,\s*22\]/);
});

async function localHardhatInstalled() {
  try {
    await access(join(repoRoot, 'node_modules', 'hardhat', 'package.json'));
    return true;
  } catch {
    return false;
  }
}

test('this checkout passes preflight on the pinned Hardhat 2.x', async (t) => {
  if (!(await localHardhatInstalled())) {
    t.skip('local Hardhat is not installed');
    return;
  }
  const result = await checkEnvironment();
  assert.equal(result.ok, true, result.message);
  const lock = JSON.parse(await readFile(join(repoRoot, 'package-lock.json'), 'utf8'));
  const pinned = lock.packages['node_modules/hardhat'].version;
  assert.match(result.message, new RegExp(`Hardhat ${pinned.replace(/\./g, '\\.')}`));
});

test('preflight CLI exits 0 on this machine', async (t) => {
  if (!(await localHardhatInstalled())) {
    t.skip('local Hardhat is not installed');
    return;
  }
  const full = spawnSync(process.execPath, ['scripts/preflight.mjs'], { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(full.status, 0, full.stderr);
  assert.match(full.stdout, /preflight ok/);
  assert.match(full.stdout, /Hardhat 2\./);

  const nodeOnly = spawnSync(process.execPath, ['scripts/preflight.mjs', '--node-only'], {
    cwd: repoRoot,
    encoding: 'utf8'
  });
  assert.equal(nodeOnly.status, 0, nodeOnly.stderr);
  assert.match(nodeOnly.stdout, /preflight ok: Node v/);
  assert.doesNotMatch(nodeOnly.stdout, /Hardhat/);
});
