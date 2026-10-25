import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { access, mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { HARDHAT_CHAIN_ID } from './chain.mjs';
import { repoRoot } from './paths.mjs';

export const RPC_URL = process.env.CHAIN_RPC_URL || 'http://127.0.0.1:8545';

function hardhatBin() {
  return join(repoRoot, 'node_modules', '.bin', 'hardhat');
}

export async function rpcChainId(rpcUrl = RPC_URL, timeoutMs = 800) {
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] }),
      signal: AbortSignal.timeout(timeoutMs)
    });
    const payload = await response.json();
    return payload.result || null;
  } catch {
    return null;
  }
}

function hardhatEnv() {
  return { ...process.env, HARDHAT_DISABLE_TELEMETRY_PROMPT: 'true' };
}

function runHardhat(args, { stdio = 'inherit' } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(hardhatBin(), args, { cwd: repoRoot, stdio, env: hardhatEnv() });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`hardhat ${args.join(' ')} exited ${code}`));
    });
  });
}

export async function compileContracts() {
  try {
    await access(hardhatBin());
  } catch {
    throw new Error('Hardhat is not installed. Run npm install from the repository root.');
  }
  await runHardhat(['compile']);
}

async function assertExpectedChain(chainId) {
  if (chainId !== HARDHAT_CHAIN_ID) {
    throw new Error(`Refusing ${RPC_URL}: chain id ${chainId}, expected local Hardhat ${HARDHAT_CHAIN_ID} (31337).`);
  }
}

export async function ensureLocalChain({ log = console.log } = {}) {
  const existing = await rpcChainId();
  if (existing) {
    await assertExpectedChain(existing);
    log(`Using the Hardhat node already running at ${RPC_URL}`);
    return { started: false, rpcUrl: RPC_URL, async stop() {} };
  }

  log('Compiling the asset-record contract...');
  await compileContracts();
  await mkdir(join(repoRoot, 'artifacts'), { recursive: true });
  const logPath = join(repoRoot, 'artifacts', 'hardhat-node.log');
  const logStream = createWriteStream(logPath, { flags: 'w' });
  log('Starting a local Hardhat node...');
  const child = spawn(hardhatBin(), ['node'], {
    cwd: repoRoot,
    env: hardhatEnv(),
    stdio: ['ignore', 'pipe', 'pipe']
  });
  child.stdout.pipe(logStream);
  child.stderr.pipe(logStream);

  let settled = false;
  const exitBeforeReady = new Promise((_, reject) => {
    child.once('exit', (code) => {
      if (!settled) reject(new Error(`Hardhat node exited ${code} before it was ready. See ${logPath}`));
    });
  });
  const ready = (async () => {
    const startedAt = Date.now();
    while (Date.now() - startedAt < 45000) {
      const chainId = await rpcChainId();
      if (chainId) {
        await assertExpectedChain(chainId);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error(`Timed out waiting for the Hardhat node. See ${logPath}`);
  })();

  try {
    await Promise.race([ready, exitBeforeReady]);
    settled = true;
  } catch (error) {
    settled = true;
    child.kill('SIGTERM');
    const tail = await readFile(logPath, 'utf8').catch(() => '');
    const detail = tail ? `\n${tail.slice(-1500)}` : '';
    throw new Error(`${error.message}${detail}`);
  }

  log(`Local chain ready at ${RPC_URL}`);
  return {
    started: true,
    rpcUrl: RPC_URL,
    async stop() {
      if (child.exitCode != null || child.signalCode != null) return;
      child.kill('SIGTERM');
      await new Promise((resolve) => {
        const timer = setTimeout(() => {
          child.kill('SIGKILL');
          resolve();
        }, 3000);
        child.once('exit', () => {
          clearTimeout(timer);
          resolve();
        });
      });
    }
  };
}

export async function anchorManifest() {
  await runHardhat(['run', 'scripts/anchor.cjs', '--network', 'localhost']);
}
