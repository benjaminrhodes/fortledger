import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { repoRoot } from '../lib/paths.mjs';

export const REQUIRED_HARDHAT_MAJOR = 2;

export function majorVersion(version) {
  const match = /^v?(\d+)\./.exec(String(version ?? '').trim());
  return match ? Number(match[1]) : null;
}

export function minimumNodeMajor(range) {
  const match = /^>=\s*v?(\d+)(?:\.\d+){0,2}$/.exec(String(range ?? '').trim());
  return match ? Number(match[1]) : null;
}

function shownVersion(version) {
  return String(version ?? '').replace(/^v/, '') || 'unknown';
}

export function nodeCheckMessage({ nodeVersion, minimum, nvmrc }) {
  const lines = [
    `FortLedger needs Node.js ${minimum} or newer.`,
    `This shell is Node v${shownVersion(nodeVersion)}. package.json sets engines.node to >=${minimum}.`
  ];
  if (nvmrc) {
    lines.push(`Install Node.js ${minimum} or newer. If you use nvm, run \`nvm use\` from the repository root (.nvmrc is ${nvmrc}).`);
  } else {
    lines.push(`Install Node.js ${minimum} or newer.`);
  }
  return lines.join('\n');
}

export function hardhatCheckMessage({ installed, pinned }) {
  const pin = pinned ? ` This repo pins ${pinned}.` : '';
  const expect = pinned || 'a 2.x version';
  if (!installed) {
    return [
      `FortLedger needs a local Hardhat 2.x install.${pin}`,
      'No local Hardhat install was found in node_modules.',
      'From the repository root, run:',
      '',
      '  npm run setup',
      '',
      `./node_modules/.bin/hardhat --version should print ${expect}.`
    ].join('\n');
  }
  return [
    `FortLedger needs Hardhat 2.x.${pin}`,
    `The local install is Hardhat ${installed}.`,
    'Only Hardhat 2.x reads this repo\'s hardhat.config.cjs. Hardhat 3 fails with Hardhat error HHE3, "No Hardhat config file found".',
    'Stay on Hardhat 2.x. From the repository root, put the lockfile back and reinstall:',
    '',
    '  git checkout -- package.json package-lock.json',
    '  rm -rf node_modules',
    '  npm ci',
    '',
    `./node_modules/.bin/hardhat --version should print ${expect}.`
  ].join('\n');
}

async function readNvmrc(root) {
  try {
    const text = (await readFile(join(root, '.nvmrc'), 'utf8')).trim();
    return text || null;
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function pinnedHardhatVersion(root) {
  try {
    const lock = JSON.parse(await readFile(join(root, 'package-lock.json'), 'utf8'));
    const version = lock?.packages?.['node_modules/hardhat']?.version;
    return typeof version === 'string' ? version : null;
  } catch {
    return null;
  }
}

async function installedHardhatVersion(root) {
  try {
    const pkg = JSON.parse(await readFile(join(root, 'node_modules', 'hardhat', 'package.json'), 'utf8'));
    return typeof pkg.version === 'string' ? pkg.version : null;
  } catch (error) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) return null;
    throw error;
  }
}

export async function checkEnvironment({
  root = repoRoot,
  nodeVersion = process.versions.node,
  hardhatVersion,
  nodeOnly = false
} = {}) {
  let pkg;
  try {
    pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      return { ok: false, message: 'FortLedger could not read package.json. Run this from the repository root.' };
    }
    throw error;
  }

  const minimum = minimumNodeMajor(pkg.engines?.node);
  if (minimum == null) {
    return {
      ok: false,
      message: 'FortLedger could not read package.json engines.node. It should be a range like >=20.'
    };
  }

  const nodeMajor = majorVersion(nodeVersion);
  if (nodeMajor == null || nodeMajor < minimum) {
    const nvmrc = await readNvmrc(root);
    return { ok: false, message: nodeCheckMessage({ nodeVersion, minimum, nvmrc }) };
  }

  const shown = shownVersion(nodeVersion);
  if (nodeOnly) {
    return { ok: true, message: `FortLedger preflight ok: Node v${shown}.` };
  }

  const pinned = await pinnedHardhatVersion(root);
  const installed = hardhatVersion === undefined ? await installedHardhatVersion(root) : hardhatVersion;
  if (!installed || majorVersion(installed) !== REQUIRED_HARDHAT_MAJOR) {
    return { ok: false, message: hardhatCheckMessage({ installed, pinned }) };
  }

  return { ok: true, message: `FortLedger preflight ok: Node v${shown}, Hardhat ${installed}.` };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const result = await checkEnvironment({ nodeOnly: process.argv.includes('--node-only') });
  if (!result.ok) {
    console.error(result.message);
    process.exitCode = 1;
  } else {
    console.log(result.message);
  }
}
