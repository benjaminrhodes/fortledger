import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { repoRoot } from '../lib/paths.mjs';

const child = spawn(join(repoRoot, 'node_modules', '.bin', 'hardhat'), process.argv.slice(2), {
  cwd: repoRoot,
  stdio: 'inherit',
  env: { ...process.env, HARDHAT_DISABLE_TELEMETRY_PROMPT: 'true' }
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
