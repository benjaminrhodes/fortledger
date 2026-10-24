import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { anchorManifest, ensureLocalChain } from '../lib/local-chain.mjs';
import { readChainAnchor } from '../lib/chain.mjs';
import { repoRoot } from '../lib/paths.mjs';
import { demoTargetPath, restoreFromBackup, tamperSource } from '../lib/tamper.mjs';
import { verify } from './verify.mjs';

const publicDir = resolve(repoRoot, 'public');
const port = Number(process.env.PORT || 4173);
const target = demoTargetPath();
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8'
};

function send(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(data)
  });
  res.end(data);
}

async function loadState() {
  const asset = JSON.parse(await readFile(join(repoRoot, 'sample-data', 'asset-profile.json'), 'utf8'));
  const documents = JSON.parse(await readFile(join(repoRoot, 'sample-data', 'documents.json'), 'utf8'));
  const anchor = await readChainAnchor();
  return { asset, documents, anchor };
}

async function serveStatic(pathname, res) {
  const rel = pathname === '/' ? 'index.html' : decodeURIComponent(pathname).replace(/^\/+/, '');
  if (!rel || rel.includes('\0')) return send(res, 400, { error: 'Bad path' });
  const full = resolve(publicDir, rel);
  if (full !== publicDir && !full.startsWith(publicDir + sep)) return send(res, 403, { error: 'Forbidden' });
  try {
    const body = await readFile(full);
    res.writeHead(200, {
      'content-type': types[extname(full)] || 'application/octet-stream',
      'cache-control': 'no-store'
    });
    res.end(body);
  } catch {
    send(res, 404, { error: 'Not found' });
  }
}

async function handle(req, res) {
  const url = new URL(req.url, 'http://127.0.0.1');
  if (req.method === 'GET' && url.pathname === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.method === 'GET' && url.pathname === '/api/state') {
    send(res, 200, await loadState());
    return;
  }
  if (req.method === 'POST' && url.pathname === '/api/verify') {
    send(res, 200, { action: 'verify', ...(await verify()) });
    return;
  }
  if (req.method === 'POST' && url.pathname === '/api/tamper') {
    await tamperSource(target);
    send(res, 200, {
      action: 'tampered',
      note: 'Appended a demo marker to the synthetic Phase I v2 file. Restore puts the clean copy back and deletes the backup.',
      ...(await verify())
    });
    return;
  }
  if (req.method === 'POST' && url.pathname === '/api/restore') {
    const restored = await restoreFromBackup(target);
    send(res, 200, {
      action: 'restore',
      restored,
      note: restored
        ? 'Restored the synthetic Phase I v2 file and removed the backup.'
        : 'No tamper backup was present. The synthetic file was left unchanged.',
      ...(await verify())
    });
    return;
  }
  if (req.method === 'GET') {
    await serveStatic(url.pathname, res);
    return;
  }
  send(res, 405, { error: 'Method not allowed' });
}

const server = createServer((req, res) => {
  handle(req, res).catch((error) => {
    if (!res.headersSent) send(res, 500, { error: error.message || 'Request failed' });
    else res.end();
  });
});

let chain;
let shuttingDown = false;

async function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  await new Promise((resolve) => server.close(() => resolve()));
  if (chain?.started) await chain.stop();
  process.exit(code);
}

process.on('SIGINT', () => { shutdown(0); });
process.on('SIGTERM', () => { shutdown(0); });

try {
  await restoreFromBackup(target);
  chain = await ensureLocalChain();
  await anchorManifest();
} catch (error) {
  console.error(error);
  if (chain?.started) await chain.stop();
  process.exit(1);
}
const anchor = await readChainAnchor();

try {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
} catch (error) {
  console.error(error);
  if (chain?.started) await chain.stop();
  process.exit(1);
}

console.log('');
console.log('FortLedger demo');
console.log(`UI:    http://127.0.0.1:${port}`);
console.log(`Chain: ${anchor?.rpcUrl || 'http://127.0.0.1:8545'} (chainId ${anchor?.chainId ?? 'unknown'})`);
console.log(`Token: ${anchor?.contractAddress || 'unavailable'}  id ${anchor?.tokenId || 'unavailable'}`);
console.log(`Hash:  ${anchor?.manifestHash || 'unavailable'}`);
console.log('The token records a manifest hash only. legal_title is false, investment_rights is false, and transfers are disabled.');
console.log('Press Ctrl+C to stop.');
