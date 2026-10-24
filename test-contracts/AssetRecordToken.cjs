const { ethers } = require('hardhat');
const assert = require('node:assert/strict');

function revertText(error) {
  return `${error.shortMessage || ''}\n${error.message || ''}\n${error.data || ''}`;
}

describe('AssetRecordToken', function () {
  const assetId = 'FL-TX-FW-0001';
  const version = '1.0';
  const manifestHash = `sha256:${'ab'.repeat(32)}`;
  const manifestUri = 'local://sample-data/manifest-v1.json';

  async function deploy() {
    const [issuer, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory('AssetRecordToken');
    const token = await Factory.deploy(issuer.address);
    await token.waitForDeployment();
    return { token, issuer, other };
  }

  it('lets the authorized issuer mint a record that disclaims ownership rights', async function () {
    const { token, issuer } = await deploy();
    const tx = await token.mint(issuer.address, assetId, version, manifestHash, manifestUri);
    await tx.wait();

    const record = await token.getRecord(1);
    assert.equal(record.assetId, assetId);
    assert.equal(record.recordVersion, version);
    assert.equal(record.manifestHash, manifestHash);
    assert.equal(record.manifestUri, manifestUri);
    assert.equal(record.legalTitle, false);
    assert.equal(record.investmentRights, false);
    assert.equal(record.transferPolicy, 'disabled');
    assert.equal(await token.LEGAL_TITLE(), false);
    assert.equal(await token.INVESTMENT_RIGHTS(), false);
    assert.equal(await token.TRANSFER_POLICY(), 'disabled');
    assert.equal(await token.ownerOf(1), issuer.address);
    assert.equal(await token.balanceOf(issuer.address), 1n);
  });

  it('rejects a mint from an unauthorized account', async function () {
    const { token, other } = await deploy();
    await assert.rejects(
      () => token.connect(other).mint(other.address, assetId, version, manifestHash, manifestUri),
      (error) => /UnauthorizedIssuer/.test(revertText(error))
    );
    assert.equal(await token.nextTokenId(), 1n);
  });

  it('rejects transfers', async function () {
    const { token, issuer, other } = await deploy();
    await (await token.mint(issuer.address, assetId, version, manifestHash, manifestUri)).wait();

    await assert.rejects(
      () => token.connect(issuer).transferFrom(issuer.address, other.address, 1),
      (error) => /TransfersDisabled/.test(revertText(error))
    );
    await assert.rejects(
      () => token.connect(issuer).safeTransferFrom(issuer.address, other.address, 1),
      (error) => /TransfersDisabled/.test(revertText(error))
    );
    await assert.rejects(
      () => token.approve(other.address, 1),
      (error) => /TransfersDisabled/.test(revertText(error))
    );

    assert.equal(await token.ownerOf(1), issuer.address);
    assert.equal(await token.balanceOf(other.address), 0n);
  });
});
