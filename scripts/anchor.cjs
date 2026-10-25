const { readFile, writeFile } = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const MANIFEST_URI = 'local://sample-data/manifest-v1.json';

async function main() {
  const hre = require('hardhat');
  const root = path.join(__dirname, '..');
  const hashing = await import(pathToFileURL(path.join(root, 'lib/hashing.mjs')).href);
  const asset = JSON.parse(await readFile(path.join(root, 'sample-data/asset-profile.json'), 'utf8'));
  const documents = JSON.parse(await readFile(path.join(root, 'sample-data/documents.json'), 'utf8'));
  const manifest = hashing.buildManifest(asset, documents);
  const hash = hashing.manifestHash(manifest);

  for (const doc of manifest.documents) {
    const actual = await hashing.sha256File(path.join(root, doc.sourcePath));
    if (actual !== doc.sha256) {
      throw new Error(`Refusing to anchor. ${doc.documentId} does not match its recorded hash. Restore the synthetic file or re-seed on purpose before anchoring.`);
    }
  }

  const materialized = { ...manifest, manifestHash: hash };
  await writeFile(path.join(root, 'sample-data/manifest-v1.json'), `${JSON.stringify(materialized, null, 2)}\n`);

  const [issuer] = await hre.ethers.getSigners();
  const factory = await hre.ethers.getContractFactory('AssetRecordToken');
  const anchorPath = path.join(root, 'sample-data/anchor.json');
  let saved = null;
  try {
    saved = JSON.parse(await readFile(anchorPath, 'utf8'));
  } catch {
    saved = null;
  }

  let contract = null;
  let contractAddress = null;
  let tokenId = null;
  let txHash = null;
  if (saved?.contractAddress) {
    const code = await hre.ethers.provider.getCode(saved.contractAddress);
    if (code && code !== '0x') {
      contract = factory.attach(saved.contractAddress);
      contractAddress = saved.contractAddress;
      tokenId = saved.tokenId == null ? null : String(saved.tokenId);
      txHash = saved.txHash || null;
    }
  }

  if (!contract) {
    contract = await factory.deploy(issuer.address);
    await contract.waitForDeployment();
    contractAddress = await contract.getAddress();
    tokenId = null;
    txHash = null;
  }

  let reused = false;
  if (tokenId) {
    try {
      const record = await contract.getRecord(tokenId);
      reused = record.assetId === asset.assetId
        && record.recordVersion === String(asset.recordVersion)
        && record.manifestHash === hash;
    } catch {
      reused = false;
    }
  }

  if (!reused) {
    const tx = await contract.mint(
      issuer.address,
      asset.assetId,
      String(asset.recordVersion),
      hash,
      MANIFEST_URI
    );
    const receipt = await tx.wait();
    txHash = receipt.hash;
    const next = await contract.nextTokenId();
    tokenId = (next - 1n).toString();
  }

  const network = await hre.ethers.provider.getNetwork();
  const anchor = {
    contractAddress,
    tokenId,
    txHash,
    chainId: Number(network.chainId),
    rpcUrl: process.env.CHAIN_RPC_URL || 'http://127.0.0.1:8545',
    issuer: issuer.address,
    assetId: asset.assetId,
    recordVersion: String(asset.recordVersion),
    manifestHash: hash,
    manifestUri: MANIFEST_URI,
    legalTitle: false,
    investmentRights: false,
    transferPolicy: 'disabled',
    manifest
  };
  await writeFile(anchorPath, `${JSON.stringify(anchor, null, 2)}\n`);
  console.log(JSON.stringify({
    contractAddress,
    tokenId,
    manifestHash: hash,
    recordVersion: anchor.recordVersion,
    reused,
    legalTitle: false,
    investmentRights: false,
    transferPolicy: 'disabled'
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
