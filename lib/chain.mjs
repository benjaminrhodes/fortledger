import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ethers } from 'ethers';
import { repoRoot } from './paths.mjs';

export const ANCHOR_FILE = join(repoRoot, 'sample-data', 'anchor.json');
export const DEFAULT_RPC_URL = process.env.CHAIN_RPC_URL || 'http://127.0.0.1:8545';
export const HARDHAT_CHAIN_ID = '0x7a69';

export const assetRecordAbi = [
  'function getRecord(uint256 tokenId) view returns (string assetId, string recordVersion, string manifestHash, string manifestUri, bool legalTitle, bool investmentRights, string transferPolicy)'
];

export async function readChainAnchor({
  rpcUrl = DEFAULT_RPC_URL,
  anchorPath = ANCHOR_FILE,
  timeoutMs = 2000
} = {}) {
  let file;
  try {
    file = JSON.parse(await readFile(anchorPath, 'utf8'));
  } catch {
    return null;
  }
  if (!file?.contractAddress || file.tokenId == null || file.tokenId === '') return null;

  try {
    const iface = new ethers.Interface(assetRecordAbi);
    const data = iface.encodeFunctionData('getRecord', [BigInt(file.tokenId)]);
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [{ to: file.contractAddress, data }, 'latest']
      }),
      signal: AbortSignal.timeout(timeoutMs)
    });
    if (!response.ok) return null;
    const payload = await response.json();
    if (payload.error || !payload.result || payload.result === '0x') return null;
    const decoded = iface.decodeFunctionResult('getRecord', payload.result);
    if (!decoded.manifestHash || !decoded.assetId || !decoded.recordVersion) return null;
    return {
      assetId: decoded.assetId,
      recordVersion: decoded.recordVersion,
      manifestHash: decoded.manifestHash,
      manifestUri: decoded.manifestUri,
      legalTitle: decoded.legalTitle === true,
      investmentRights: decoded.investmentRights === true,
      transferPolicy: decoded.transferPolicy,
      contractAddress: file.contractAddress,
      tokenId: String(file.tokenId),
      txHash: file.txHash || null,
      chainId: file.chainId ?? null,
      issuer: file.issuer || null,
      rpcUrl,
      manifest: file.manifest || null
    };
  } catch {
    return null;
  }
}
